from langchain_core.tools import tool

@tool
def fetch_attendance_history(employee_id: str) -> str:
    """Queries DB for employee's attendance history and reliability score."""
    if employee_id == "40":
        return "100% adherence. Very reliable."
    return "Frequent late arrivals."

@tool
def check_geofence_logs(employee_id: str, timestamp: str) -> str:
    """Checks exactly where the employee was during the failed punch-in."""
    return "User was 2km outside the permitted zone."

@tool
def query_lpr_events(time_window: str) -> str:
    """Checks License Plate Recognition logs at the office gates."""
    return "Vehicle recognized entering parking lot at 08:28 AM."

@tool
def search_hr_policy(query: str) -> str:
    """Searches the company handbook for rules regarding attendance and geofence."""
    if "geofence" in query.lower() or "location" in query.lower():
        return "Policy: If geofence fails but LPR proves physical presence, override and mark as PRESENT. Otherwise, contact employee for justification before making a decision."
    return "Standard attendance policy applies."

@tool
def contact_employee(employee_id: str, message: str) -> str:
    """Sends a Slack/Email message directly to the employee to ask for clarification."""
    print(f"\n[ACTION TRIGGERED] 📩 Messaging Employee {employee_id}: {message}\n")
    return f"Message sent successfully. (Simulated Employee Reply: 'My GPS was glitching, but I am at my desk! Check the cameras.')"

@tool
def override_attendance_record(employee_id: str, new_status: str, reason: str) -> str:
    """Updates the MySQL database to override the attendance record (e.g., PRESENT, ABSENT)."""
    print(f"\n[ACTION TRIGGERED] 💾 DB UPDATE: Employee {employee_id} -> {new_status}. Reason: {reason}\n")
    return f"Successfully updated DB: Employee {employee_id} is now {new_status}."

@tool
def create_hr_ticket(employee_id: str, issue_description: str) -> str:
    """Creates a Jira/ServiceNow ticket for manual HR review if the AI cannot legally decide."""
    print(f"\n[ACTION TRIGGERED] 🎫 TICKET CREATED for Employee {employee_id}: {issue_description}\n")
    return "Ticket created successfully. HR team notified."

# Export a list of all tools for the agent to bind
hr_tools_list = [
    fetch_attendance_history, 
    check_geofence_logs, 
    query_lpr_events, 
    search_hr_policy, 
    contact_employee, 
    override_attendance_record, 
    create_hr_ticket
]
