import sqlite3
import datetime
import json
from langchain_core.tools import tool
from app.core.config import settings

def get_db_connection():
    conn = sqlite3.connect(settings.DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@tool
def fetch_attendance_history(employee_id: str) -> str:
    """Queries the SQLite database for employee's reliability score, department, and past attendance records."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Fetch employee profile
        cursor.execute("SELECT * FROM employees WHERE id = ? OR id = ? OR name LIKE ?", (employee_id, f"EMP-{employee_id}", f"%{employee_id}%"))
        emp = cursor.fetchone()
        
        if not emp:
            conn.close()
            return f"Employee {employee_id} not found in database."
        
        # Fetch recent attendance records
        cursor.execute("SELECT date, check_in_time, status, method, notes FROM attendance_records WHERE employee_id = ? ORDER BY date DESC LIMIT 5", (emp['id'],))
        records = cursor.fetchall()
        conn.close()
        
        history_lines = [f"- {r['date']} ({r['check_in_time']}): Status: {r['status']} via {r['method']}" for r in records]
        history_str = "\n".join(history_lines) if history_lines else "No previous records."
        
        return (
            f"Employee Profile:\n"
            f"Name: {emp['name']} (ID: {emp['id']})\n"
            f"Role: {emp['role']}, Dept: {emp['department']}\n"
            f"Vehicle License Plate: {emp['license_plate']}\n"
            f"Reliability Score: {emp['reliability_score']}%\n"
            f"Shift History: {emp['on_time_shifts']}/{emp['total_shifts']} on-time shifts.\n"
            f"Recent Attendance Records:\n{history_str}"
        )
    except Exception as e:
        return f"Database query error: {str(e)}"

@tool
def check_geofence_logs(employee_id: str, timestamp: str = "") -> str:
    """Queries the SQLite database for GPS Geofence telemetry and perimeter displacement logs."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM geofence_logs WHERE employee_id = ? OR employee_id = ? ORDER BY timestamp DESC LIMIT 3", (employee_id, f"EMP-{employee_id}"))
        logs = cursor.fetchall()
        conn.close()
        
        if not logs:
            return f"No GPS geofence logs found for employee {employee_id}."
        
        log_entries = []
        for l in logs:
            log_entries.append(
                f"[{l['timestamp']}] Status: {l['status']}, "
                f"Distance from Campus: {l['distance_from_perimeter_m']}m, "
                f"Device: {l['device_fingerprint']}, "
                f"Coordinates: ({l['recorded_lat']}, {l['recorded_lng']})"
            )
        
        return "\n".join(log_entries)
    except Exception as e:
        return f"Geofence query error: {str(e)}"

@tool
def query_lpr_events(license_plate_or_employee_id: str) -> str:
    """Queries optical License Plate Recognition (LPR) and parking gate logs from SQLite."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            """
            SELECT * FROM gate_logs 
            WHERE license_plate LIKE ? OR employee_id = ? OR employee_id = ?
            ORDER BY timestamp DESC LIMIT 3
            """, 
            (f"%{license_plate_or_employee_id}%", license_plate_or_employee_id, f"EMP-{license_plate_or_employee_id}")
        )
        events = cursor.fetchall()
        conn.close()
        
        if not events:
            return f"No gate or LPR events found for identifier: {license_plate_or_employee_id}."
        
        entries = []
        for ev in events:
            entries.append(
                f"Gate Event: {ev['gate_name']} at {ev['timestamp']} | Direction: {ev['direction']} | "
                f"Plate: {ev['license_plate']} | Confidence: {int(ev['confidence_score'] * 100)}%"
            )
        return "\n".join(entries)
    except Exception as e:
        return f"LPR query error: {str(e)}"

@tool
def search_hr_policy(query: str) -> str:
    """Searches company HR policy handbook in SQLite for rules regarding attendance, geofence, grace periods, and exemptions."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM hr_policies")
        policies = cursor.fetchall()
        conn.close()
        
        matched = []
        query_words = set(query.lower().split())
        
        for p in policies:
            combined_text = f"{p['category']} {p['title']} {p['policy_text']} {p['action_guidance']}".lower()
            if any(w in combined_text for w in query_words if len(w) > 3):
                matched.append(
                    f"=== [{p['category']}] {p['title']} ===\n"
                    f"Policy: {p['policy_text']}\n"
                    f"Action Guidance: {p['action_guidance']}"
                )
        
        if not matched:
            # Return all policies as general guidance
            return "\n\n".join([f"=== [{p['category']}] {p['title']} ===\nPolicy: {p['policy_text']}" for p in policies])
        
        return "\n\n".join(matched)
    except Exception as e:
        return f"Policy search error: {str(e)}"

@tool
def contact_employee(employee_id: str, message: str) -> str:
    """Sends an automated Slack / Email inquiry directly to the employee and retrieves their simulated real-time response."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Save outgoing message
        emp_id = employee_id if employee_id.startswith("EMP-") else f"EMP-{employee_id}"
        now = datetime.datetime.now().strftime("%I:%M %p")
        
        cursor.execute(
            "INSERT INTO employee_messages (id, employee_id, sender, message, timestamp) VALUES (?, ?, ?, ?, ?)",
            (f"MSG-OUT-{datetime.datetime.now().timestamp()}", emp_id, "AI_AGENT", message, now)
        )
        
        # Simulated intelligent employee responses based on ID / situation
        reply = "My mobile GPS showed I was 2km away because of a mapping bug, but my car entered the main gate on time. I am sitting at my desk on Floor 3."
        if "105" in employee_id:
            reply = "I had to attend an emergency client briefing off-site in Chennai this morning. Forgot to file remote work permit in advance."
        elif "102" in employee_id:
            reply = "Traffic on Highway 101 was held up by road work. I reached the office parking lot at 08:42 AM and clocked in as soon as I sat down."
            
        cursor.execute(
            "INSERT INTO employee_messages (id, employee_id, sender, message, timestamp) VALUES (?, ?, ?, ?, ?)",
            (f"MSG-IN-{datetime.datetime.now().timestamp()}", emp_id, "EMPLOYEE", reply, now)
        )
        conn.commit()
        conn.close()
        
        print(f"\n[COMMUNICATION] 📩 AI Message to {emp_id}: {message}")
        print(f"[COMMUNICATION] 💬 Employee Reply: {reply}\n")
        
        return f"Employee Verified Response: '{reply}'"
    except Exception as e:
        return f"Messaging error: {str(e)}"

@tool
def override_attendance_record(employee_id: str, new_status: str, reason: str) -> str:
    """Updates the SQLite database to override attendance status (e.g. PRESENT, EXCUSED_LATE) and resolves the anomaly."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        emp_id = employee_id if employee_id.startswith("EMP-") else f"EMP-{employee_id}"
        today = datetime.datetime.now().strftime("%Y-%m-%d")
        now_ts = datetime.datetime.now().isoformat()
        
        # Update attendance records
        cursor.execute(
            """
            UPDATE attendance_records 
            SET status = ?, method = 'AI_AUTONOMOUS_OVERRIDE', notes = ? 
            WHERE employee_id = ? AND (date = ? OR status = 'PENDING_INVESTIGATION')
            """,
            (new_status, f"AI Override: {reason}", emp_id, today)
        )
        
        # Update anomaly status
        cursor.execute(
            """
            UPDATE anomalies 
            SET status = 'resolved', resolved_at = ? 
            WHERE employee_id = ? AND status IN ('pending', 'investigating')
            """,
            (now_ts, emp_id)
        )
        
        # Create audit log
        cursor.execute(
            """
            INSERT INTO audit_logs (id, anomaly_id, employee_id, action_taken, reasoning, requires_human_followup, timestamp)
            VALUES (?, ?, ?, ?, ?, 0, ?)
            """,
            (f"AUD-{datetime.datetime.now().timestamp()}", f"ANO-RES-{emp_id}", emp_id, f"Override to {new_status}", reason, now_ts)
        )
        
        conn.commit()
        conn.close()
        
        print(f"\n[DATABASE ACTION] 💾 Employee {emp_id} Attendance Overridden -> {new_status}. Reason: {reason}\n")
        return f"Successfully updated database: Employee {emp_id} attendance is marked as {new_status}."
    except Exception as e:
        return f"Override DB error: {str(e)}"

@tool
def create_hr_ticket(employee_id: str, issue_description: str, suggested_action: str = "Manager Review") -> str:
    """Escalates an anomaly to Human-in-the-Loop review when policy requires human discretion or evidence is insufficient."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        emp_id = employee_id if employee_id.startswith("EMP-") else f"EMP-{employee_id}"
        now_ts = datetime.datetime.now().isoformat()
        
        # Update anomaly to escalated_to_human
        cursor.execute(
            """
            UPDATE anomalies 
            SET status = 'escalated_to_human' 
            WHERE employee_id = ? AND status IN ('pending', 'investigating')
            """,
            (emp_id,)
        )
        
        # Insert audit log requiring human followup
        cursor.execute(
            """
            INSERT INTO audit_logs (id, anomaly_id, employee_id, action_taken, reasoning, requires_human_followup, timestamp)
            VALUES (?, ?, ?, ?, ?, 1, ?)
            """,
            (f"AUD-{datetime.datetime.now().timestamp()}", f"ANO-ESC-{emp_id}", emp_id, f"Escalated to HR: {suggested_action}", issue_description, now_ts)
        )
        
        conn.commit()
        conn.close()
        
        print(f"\n[ESCALATION] 🎫 Ticket created for Employee {emp_id}: {issue_description}\n")
        return f"Escalation ticket registered. Anomaly marked as 'escalated_to_human'. HR team notified."
    except Exception as e:
        return f"Escalation error: {str(e)}"

# Export tools list
hr_tools_list = [
    fetch_attendance_history,
    check_geofence_logs,
    query_lpr_events,
    search_hr_policy,
    contact_employee,
    override_attendance_record,
    create_hr_ticket
]
