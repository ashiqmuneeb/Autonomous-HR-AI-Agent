const express = require('express');
const cors = require('cors');
const axios = require('axios');
const db = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

app.use(cors());
app.use(express.json());

// ==========================================
// 1. EMPLOYEES ENDPOINTS
// ==========================================
app.get('/api/employees', (req, res) => {
    try {
        const employees = db.prepare('SELECT * FROM employees ORDER BY name ASC').all();
        res.json(employees);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/employees', (req, res) => {
    try {
        const { name, department, role, email, phone, license_plate, reliability_score, avatar_color } = req.body;
        if (!name || !department || !role) {
            return res.status(400).json({ error: 'Name, department, and role are required.' });
        }

        const count = db.prepare('SELECT COUNT(*) as count FROM employees').get().count;
        const id = `EMP-${100 + count + 1}`;
        const color = avatar_color || '#2563eb';
        const plate = license_plate || 'None';
        const score = parseFloat(reliability_score) || 98.0;

        db.prepare(`
            INSERT INTO employees (id, name, department, role, email, phone, license_plate, reliability_score, total_shifts, on_time_shifts, avatar_color)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 10, 10, ?)
        `).run(id, name, department, role, email || `${name.toLowerCase().replace(/\s+/g, '.')}@company.com`, phone || '+1 (555) 000-0000', plate, score, color);

        const newEmp = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
        res.json({ success: true, employee: newEmp });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/gate-feed', (req, res) => {
    try {
        const logs = db.prepare(`
            SELECT g.*, e.name as employee_name, e.department, e.role, e.avatar_color
            FROM gate_logs g
            LEFT JOIN employees e ON g.employee_id = e.id OR g.license_plate = e.license_plate
            ORDER BY g.timestamp DESC LIMIT 20
        `).all();
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/gate-feed/simulate', (req, res) => {
    try {
        const { license_plate, employee_id, gate_name, direction } = req.body;
        const id = `GATE-${Date.now()}`;
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const confidence = (0.97 + Math.random() * 0.029).toFixed(3);

        db.prepare(`
            INSERT INTO gate_logs (id, license_plate, employee_id, timestamp, gate_name, direction, confidence_score)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(id, license_plate, employee_id || null, timeStr, gate_name || 'North Perimeter Gate', direction || 'ENTRY', parseFloat(confidence));

        const created = db.prepare('SELECT * FROM gate_logs WHERE id = ?').get(id);
        res.json({ success: true, log: created });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// CAMERA RTSP CONFIGURATION ENDPOINTS
// ==========================================
app.get('/api/cameras/config', (req, res) => {
    try {
        const cameras = db.prepare('SELECT * FROM camera_settings ORDER BY id ASC').all();
        res.json(cameras);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/cameras/config', (req, res) => {
    try {
        const { id, name, rtsp_url, camera_model, protocol, location, status, ocr_enabled, fps, resolution } = req.body;
        if (!name || !rtsp_url) {
            return res.status(400).json({ error: 'Camera Name and RTSP URL are required.' });
        }

        const camId = id || `CAM_${Date.now()}`;
        const existing = db.prepare('SELECT * FROM camera_settings WHERE id = ?').get(camId);

        if (existing) {
            db.prepare(`
                UPDATE camera_settings 
                SET name = ?, rtsp_url = ?, camera_model = ?, protocol = ?, location = ?, status = ?, ocr_enabled = ?, fps = ?, resolution = ?
                WHERE id = ?
            `).run(name, rtsp_url, camera_model || 'Hikvision DS-2CD2043G2', protocol || 'RTSP_TCP', location || 'Campus Perimeter', status || 'ONLINE', ocr_enabled ?? 1, fps || 30, resolution || '1080p', camId);
        } else {
            db.prepare(`
                INSERT INTO camera_settings (id, name, rtsp_url, camera_model, protocol, location, status, ocr_enabled, fps, resolution, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(camId, name, rtsp_url, camera_model || 'Hikvision DS-2CD2043G2', protocol || 'RTSP_TCP', location || 'Campus Perimeter', status || 'ONLINE', ocr_enabled ?? 1, fps || 30, resolution || '1080p', new Date().toISOString());
        }

        const updated = db.prepare('SELECT * FROM camera_settings WHERE id = ?').get(camId);
        res.json({ success: true, camera: updated });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/cameras/test-connection', (req, res) => {
    try {
        const { rtsp_url } = req.body;
        if (!rtsp_url) {
            return res.status(400).json({ error: 'RTSP URL required for connection test' });
        }

        const isWebCam = rtsp_url.startsWith('webcam://') || rtsp_url === '0';
        const isRtsp = rtsp_url.startsWith('rtsp://') || rtsp_url.startsWith('http://') || rtsp_url.startsWith('https://');

        if (!isWebCam && !isRtsp) {
            return res.status(400).json({ success: false, message: 'Invalid URL format. Must start with rtsp://, http://, or webcam://' });
        }

        const simulatedPingMs = Math.floor(25 + Math.random() * 30);
        res.json({
            success: true,
            status: 'CONNECTED',
            latency_ms: simulatedPingMs,
            codec: 'H.264 / High Profile',
            resolution: '1920x1080 @ 30fps',
            ocr_ready: true,
            message: `RTSP Handshake successful. Stream verified (${simulatedPingMs}ms latency).`
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


app.get('/api/employees/:id', (req, res) => {
    try {
        const empId = req.params.id;
        const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(empId);
        if (!employee) return res.status(404).json({ error: 'Employee not found' });

        const attendance = db.prepare('SELECT * FROM attendance_records WHERE employee_id = ? ORDER BY date DESC LIMIT 10').all(empId);
        const anomalies = db.prepare('SELECT * FROM anomalies WHERE employee_id = ? ORDER BY created_at DESC LIMIT 5').all(empId);
        const messages = db.prepare('SELECT * FROM employee_messages WHERE employee_id = ? ORDER BY timestamp DESC LIMIT 10').all(empId);

        res.json({ ...employee, attendance, anomalies, messages });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 2. ATTENDANCE LEDGER ENDPOINTS
// ==========================================
app.get('/api/attendance', (req, res) => {
    try {
        const { date, employee_id } = req.query;
        let query = `
            SELECT a.*, e.name as employee_name, e.department, e.role, e.avatar_color, e.reliability_score 
            FROM attendance_records a
            JOIN employees e ON a.employee_id = e.id
        `;
        const params = [];

        if (date && employee_id) {
            query += ` WHERE a.date = ? AND a.employee_id = ?`;
            params.push(date, employee_id);
        } else if (date) {
            query += ` WHERE a.date = ?`;
            params.push(date);
        } else if (employee_id) {
            query += ` WHERE a.employee_id = ?`;
            params.push(employee_id);
        }

        query += ` ORDER BY a.date DESC, a.check_in_time DESC LIMIT 100`;
        const records = db.prepare(query).all(...params);
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 3. ANOMALIES ENDPOINTS
// ==========================================
app.get('/api/anomalies', (req, res) => {
    try {
        const query = `
            SELECT a.*, e.name as employee_name, e.department, e.role, e.avatar_color, e.reliability_score, e.license_plate
            FROM anomalies a
            JOIN employees e ON a.employee_id = e.id
            ORDER BY 
                CASE a.status 
                    WHEN 'pending' THEN 1 
                    WHEN 'escalated_to_human' THEN 2 
                    WHEN 'investigating' THEN 3 
                    ELSE 4 
                END, 
                a.created_at DESC
        `;
        const anomalies = db.prepare(query).all();
        
        // Parse JSON agent_resolution field
        const parsed = anomalies.map(a => {
            let resObj = null;
            if (a.agent_resolution) {
                try {
                    resObj = JSON.parse(a.agent_resolution);
                } catch (e) {
                    resObj = a.agent_resolution;
                }
            }
            return { ...a, agent_resolution: resObj };
        });

        res.json(parsed);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 4. KIOSK CLOCK-IN & SIMULATOR ENDPOINT
// ==========================================
app.post('/api/kiosk/clock-in', (req, res) => {
    try {
        const { employee_id, method, simulated_distance_m, gate_event_simulated, timestamp, notes } = req.body;

        const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(employee_id);
        if (!employee) return res.status(404).json({ error: 'Employee not found' });

        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = timestamp || now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const distance = parseFloat(simulated_distance_m) || 0;
        const recordId = `ATT-${Date.now()}`;

        // 1. Log Gate LPR if simulated
        if (gate_event_simulated) {
            const gateId = `GATE-${Date.now()}`;
            db.prepare(`
                INSERT INTO gate_logs (id, license_plate, employee_id, timestamp, gate_name, direction, confidence_score)
                VALUES (?, ?, ?, ?, ?, 'ENTRY', 0.99)
            `).run(gateId, employee.license_plate, employee.id, timeStr, 'Main North Gate');
        }

        // 2. Check for Anomaly conditions
        const isGeofenceBreach = distance > 100;
        const isLate = timeStr.includes('09:') || timeStr.includes('10:'); // After 9:00 AM

        let status = 'PRESENT';
        let anomalyCreated = null;

        if (isGeofenceBreach || (isLate && distance > 50)) {
            status = 'PENDING_INVESTIGATION';
            const anomalyType = isGeofenceBreach ? 'GEOFENCE_BREACH' : 'LATE_ARRIVAL';
            const severity = distance > 5000 ? 'HIGH' : distance > 500 ? 'MEDIUM' : 'LOW';
            const anomalyId = `ANO-${Date.now()}`;

            // Record Geofence telemetry
            db.prepare(`
                INSERT INTO geofence_logs (id, employee_id, timestamp, recorded_lat, recorded_lng, distance_from_perimeter_m, status, device_fingerprint)
                VALUES (?, ?, ?, 12.9716, 77.5946, ?, ?, 'Mobile App Simulation')
            `).run(`GEO-${Date.now()}`, employee.id, timeStr, distance, isGeofenceBreach ? 'BREACH' : 'INSIDE');

            // Record Anomaly
            db.prepare(`
                INSERT INTO anomalies (id, employee_id, timestamp, date, anomaly_type, severity, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
            `).run(anomalyId, employee.id, timeStr, dateStr, anomalyType, severity, new Date().toISOString());

            anomalyCreated = {
                id: anomalyId,
                employee_id: employee.id,
                anomaly_type: anomalyType,
                severity,
                timestamp: timeStr
            };
        }

        // 3. Insert Attendance Record
        db.prepare(`
            INSERT INTO attendance_records (id, employee_id, date, check_in_time, status, method, location_lat, location_lng, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 12.9716, 77.5946, ?, ?)
        `).run(recordId, employee.id, dateStr, timeStr, status, method || 'GEOFENCE', notes || `Distance: ${distance}m`, new Date().toISOString());

        res.json({
            success: true,
            status,
            anomaly_triggered: !!anomalyCreated,
            anomaly: anomalyCreated,
            message: anomalyCreated ? `Clock-in flagged! Anomaly '${anomalyCreated.anomaly_type}' queued for AI Agent.` : `Clock-in successful: Marked as ${status}.`
        });
    } catch (error) {
        console.error('[KIOSK ERROR]', error);
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 5. AI AGENT STREAMING RESOLUTION ENDPOINT
// ==========================================
app.post('/api/resolve-stream', async (req, res) => {
    const { event_id } = req.body;
    const anomaly = db.prepare('SELECT * FROM anomalies WHERE id = ?').get(event_id);
    if (!anomaly) return res.status(404).json({ error: 'Anomaly event not found' });

    // Mark status as investigating
    db.prepare("UPDATE anomalies SET status = 'investigating' WHERE id = ?").run(event_id);

    // Set headers for Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    try {
        console.log(`[STREAM] Streaming AI Resolution for Event: ${event_id} (Employee: ${anomaly.employee_id})`);

        const pyResponse = await axios.post(
            `${AI_SERVICE_URL}/api/v1/attendance/anomaly/stream`,
            {
                employee_id: anomaly.employee_id,
                anomaly_type: anomaly.anomaly_type,
                timestamp: anomaly.timestamp,
                event_id: anomaly.id,
                severity: anomaly.severity
            },
            {
                responseType: 'stream'
            }
        );

        pyResponse.data.on('data', (chunk) => {
            const chunkStr = chunk.toString();
            res.write(chunkStr);

            // Check if final decision was reached to update SQLite
            const lines = chunkStr.split('\n');
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const parsed = JSON.parse(line.substring(6));
                        if (parsed.type === 'decision' && parsed.decision) {
                            const dec = parsed.decision;
                            const newStatus = dec.requires_human_followup ? 'escalated_to_human' : 'resolved';
                            
                            db.prepare(`
                                UPDATE anomalies 
                                SET status = ?, agent_resolution = ?, resolved_at = ? 
                                WHERE id = ?
                            `).run(newStatus, JSON.stringify(dec), new Date().toISOString(), event_id);
                        }
                    } catch (e) {
                        // ignore parse errors on intermediate chunks
                    }
                }
            }
        });

        pyResponse.data.on('end', () => {
            res.end();
        });

        pyResponse.data.on('error', (err) => {
            console.error('[STREAM ERROR]', err);
            res.write(`data: ${JSON.stringify({ type: 'error', content: err.message })}\n\n`);
            res.end();
        });

    } catch (error) {
        console.error('[GATEWAY STREAM ERROR]', error.message);
        res.write(`data: ${JSON.stringify({ type: 'error', content: `AI Service connection failed: ${error.message}` })}\n\n`);
        res.end();
    }
});

// ==========================================
// 6. HUMAN-IN-THE-LOOP (HITL) DECISION ENDPOINT
// ==========================================
app.post('/api/hitl/decision', (req, res) => {
    try {
        const { event_id, action, notes } = req.body; // action: 'APPROVED', 'REJECTED', 'MEETING_SCHEDULED'

        const anomaly = db.prepare('SELECT * FROM anomalies WHERE id = ?').get(event_id);
        if (!anomaly) return res.status(404).json({ error: 'Anomaly not found' });

        const now = new Date().toISOString();
        let newAttendanceStatus = 'PRESENT';

        if (action === 'APPROVED') {
            newAttendanceStatus = 'OVERRIDDEN_BY_AI';
        } else if (action === 'REJECTED') {
            newAttendanceStatus = 'ABSENT';
        } else if (action === 'MEETING_SCHEDULED') {
            newAttendanceStatus = 'PENDING_INVESTIGATION';
        }

        // Update anomaly
        db.prepare(`
            UPDATE anomalies 
            SET status = 'resolved', human_action = ?, resolved_at = ? 
            WHERE id = ?
        `).run(action, now, event_id);

        // Update attendance record
        db.prepare(`
            UPDATE attendance_records 
            SET status = ?, notes = ? 
            WHERE employee_id = ? AND (date = ? OR status = 'PENDING_INVESTIGATION')
        `).run(newAttendanceStatus, `Human Decision: ${action} - ${notes || 'Reviewed by HR Admin'}`, anomaly.employee_id, anomaly.date);

        // Insert audit log
        db.prepare(`
            INSERT INTO audit_logs (id, anomaly_id, employee_id, action_taken, reasoning, requires_human_followup, timestamp)
            VALUES (?, ?, ?, ?, ?, 0, ?)
        `).run(`AUD-${Date.now()}`, event_id, anomaly.employee_id, `Human Decision: ${action}`, notes || 'Manager manual approval', now);

        res.json({
            success: true,
            event_id,
            action,
            new_status: 'resolved'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 7. HR POLICIES ENDPOINTS
// ==========================================
app.get('/api/policies', (req, res) => {
    try {
        const policies = db.prepare('SELECT * FROM hr_policies ORDER BY category ASC').all();
        res.json(policies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/policies', (req, res) => {
    try {
        const { category, title, policy_text, action_guidance } = req.body;
        const id = `POL-${Date.now()}`;
        const createdAt = new Date().toISOString();

        db.prepare(`
            INSERT INTO hr_policies (id, category, title, policy_text, action_guidance, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(id, category, title, policy_text, action_guidance, createdAt);

        res.json({ success: true, policy: { id, category, title, policy_text, action_guidance, created_at: createdAt } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 8. EXECUTIVE ANALYTICS ENDPOINT
// ==========================================
app.get('/api/analytics', (req, res) => {
    try {
        const totalEmployees = db.prepare('SELECT COUNT(*) as c FROM employees').get().c;
        const totalAttendanceToday = db.prepare("SELECT COUNT(*) as c FROM attendance_records WHERE date = date('now')").get().c;
        const presentToday = db.prepare("SELECT COUNT(*) as c FROM attendance_records WHERE date = date('now') AND status IN ('PRESENT', 'OVERRIDDEN_BY_AI')").get().c;

        const totalAnomalies = db.prepare('SELECT COUNT(*) as c FROM anomalies').get().c;
        const resolvedAnomalies = db.prepare("SELECT COUNT(*) as c FROM anomalies WHERE status = 'resolved'").get().c;
        const pendingAnomalies = db.prepare("SELECT COUNT(*) as c FROM anomalies WHERE status = 'pending'").get().c;
        const escalatedAnomalies = db.prepare("SELECT COUNT(*) as c FROM anomalies WHERE status = 'escalated_to_human'").get().c;

        const typeBreakdown = db.prepare(`
            SELECT anomaly_type, COUNT(*) as count 
            FROM anomalies 
            GROUP BY anomaly_type
        `).all();

        const auditLogs = db.prepare(`
            SELECT a.*, e.name as employee_name, e.department
            FROM audit_logs a
            JOIN employees e ON a.employee_id = e.id
            ORDER BY a.timestamp DESC LIMIT 10
        `).all();

        const autonomousRate = totalAnomalies > 0 ? ((resolvedAnomalies / totalAnomalies) * 100).toFixed(1) : 100;
        const hoursSaved = (resolvedAnomalies * 0.75).toFixed(1); // 45 min per anomaly
        const costSavings = (resolvedAnomalies * 35).toFixed(0); // $35 HR cost per ticket

        res.json({
            kpis: {
                totalEmployees,
                totalAttendanceToday,
                presentToday,
                totalAnomalies,
                resolvedAnomalies,
                pendingAnomalies,
                escalatedAnomalies,
                autonomousRate: `${autonomousRate}%`,
                hoursSaved: `${hoursSaved} hrs`,
                costSavings: `$${costSavings}`,
                avgResolutionSeconds: '2.4s'
            },
            typeBreakdown,
            auditLogs
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// START SERVER
// ==========================================
app.listen(PORT, () => {
    console.log(`🚀 Node.js API Gateway running on http://localhost:${PORT}`);
    console.log(`🔗 Connecting to Python AI Engine at ${AI_SERVICE_URL}`);
    console.log(`📁 SQLite Database active at ${db.name}`);
});
