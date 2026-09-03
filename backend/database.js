const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists in root
const dataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'hr_agent.db');
const db = new Database(dbPath);

// Enable WAL mode for high concurrency
db.pragma('journal_mode = WAL');

// Initialize Tables
db.exec(`
CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    role TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    license_plate TEXT,
    reliability_score REAL DEFAULT 95.0,
    total_shifts INTEGER DEFAULT 50,
    on_time_shifts INTEGER DEFAULT 48,
    avatar_color TEXT DEFAULT '#3b82f6'
);

CREATE TABLE IF NOT EXISTS attendance_records (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL,
    date TEXT NOT NULL,
    check_in_time TEXT NOT NULL,
    check_out_time TEXT,
    status TEXT NOT NULL, -- 'PRESENT', 'ABSENT', 'LATE', 'ON_LEAVE', 'OVERRIDDEN_BY_AI', 'PENDING_INVESTIGATION'
    method TEXT NOT NULL, -- 'GEOFENCE', 'BIOMETRIC_KIOSK', 'RFID_GATE', 'AI_AUTONOMOUS_OVERRIDE'
    location_lat REAL,
    location_lng REAL,
    notes TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE IF NOT EXISTS anomalies (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    date TEXT NOT NULL,
    anomaly_type TEXT NOT NULL, -- 'GEOFENCE_BREACH', 'LATE_ARRIVAL', 'UNREGISTERED_DEVICE', 'MISSING_PUNCH', 'GATE_MISMATCH'
    severity TEXT NOT NULL,     -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    status TEXT NOT NULL,       -- 'pending', 'investigating', 'resolved', 'escalated_to_human'
    agent_resolution TEXT,      -- JSON
    human_action TEXT,          -- 'APPROVED', 'REJECTED', 'MEETING_SCHEDULED'
    created_at TEXT NOT NULL,
    resolved_at TEXT,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE IF NOT EXISTS gate_logs (
    id TEXT PRIMARY KEY,
    license_plate TEXT NOT NULL,
    employee_id TEXT,
    timestamp TEXT NOT NULL,
    gate_name TEXT NOT NULL,
    direction TEXT NOT NULL,    -- 'ENTRY', 'EXIT'
    confidence_score REAL DEFAULT 0.98
);

CREATE TABLE IF NOT EXISTS geofence_logs (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    recorded_lat REAL NOT NULL,
    recorded_lng REAL NOT NULL,
    distance_from_perimeter_m REAL NOT NULL,
    status TEXT NOT NULL,       -- 'INSIDE', 'BREACH', 'OUT_OF_RANGE'
    device_fingerprint TEXT,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE IF NOT EXISTS hr_policies (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    policy_text TEXT NOT NULL,
    action_guidance TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    anomaly_id TEXT,
    employee_id TEXT NOT NULL,
    action_taken TEXT NOT NULL,
    reasoning TEXT NOT NULL,
    tool_sequence TEXT,         -- JSON
    requires_human_followup INTEGER DEFAULT 0,
    timestamp TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS employee_messages (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL,
    sender TEXT NOT NULL,       -- 'AI_AGENT', 'EMPLOYEE', 'HR_ADMIN'
    message TEXT NOT NULL,
    timestamp TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS camera_settings (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    rtsp_url TEXT NOT NULL,
    camera_model TEXT DEFAULT 'Hikvision DS-2CD2043G2',
    protocol TEXT DEFAULT 'RTSP_TCP',
    location TEXT NOT NULL,
    status TEXT DEFAULT 'ONLINE',
    ocr_enabled INTEGER DEFAULT 1,
    fps INTEGER DEFAULT 30,
    resolution TEXT DEFAULT '1080p',
    created_at TEXT NOT NULL
);
`);

// Pre-seed default RTSP camera endpoints if empty
const countCameras = db.prepare('SELECT COUNT(*) as count FROM camera_settings').get().count;
if (countCameras === 0) {
    const insertCam = db.prepare(`
        INSERT INTO camera_settings (id, name, rtsp_url, camera_model, protocol, location, status, ocr_enabled, fps, resolution, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const now = new Date().toISOString();
    insertCam.run('CAM_01_NORTH', 'Main North Gate LPR', 'rtsp://admin:SecurityPass99@192.168.1.101:554/Streaming/Channels/101', 'Hikvision Pro LPR (DS-2CD7A26G0/P-IZS)', 'RTSP_TCP', 'North Campus Entrance', 'ONLINE', 1, 30, '1920x1080', now);
    insertCam.run('CAM_02_SOUTH', 'South Commercial Gate', 'rtsp://admin:SecurityPass99@192.168.1.102:554/cam/realmonitor?channel=1&subtype=0', 'Dahua ANPR Bullet (ITC237-PW6M-IRLZF1050)', 'RTSP_TCP', 'South Logistics Bay', 'ONLINE', 1, 25, '1920x1080', now);
    insertCam.run('CAM_03_PARKING', 'Executive Parking West', 'rtsp://admin:SecurityPass99@192.168.1.103:554/live/ch0', 'Axis Q1700-E License Plate Camera', 'RTSP_TCP', 'West Parking Boom Barrier', 'ONLINE', 1, 30, '1920x1080', now);
    insertCam.run('CAM_04_WEBCAM', 'Local Terminal USB Cam', 'webcam://0', 'Logitech Brio 4K / USB WebCam', 'DIRECT_WEBCAM', 'HR Check-In Kiosk 01', 'ONLINE', 1, 60, '1920x1080', now);
}


// Seed Data Initialization if empty
const countEmployees = db.prepare('SELECT COUNT(*) as count FROM employees').get().count;

if (countEmployees === 0) {
    console.log('[DATABASE] Seeding fresh enterprise data into SQLite...');

    // 1. Seed Employees
    const insertEmp = db.prepare(`
        INSERT INTO employees (id, name, department, role, email, phone, license_plate, reliability_score, total_shifts, on_time_shifts, avatar_color)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertEmp.run('EMP-101', 'Ashiq Muneeb', 'AI Research', 'Lead AI Engineer', 'ashiq@company.ai', '+1 (555) 234-5678', 'KA-01-MJ-4040', 98.5, 60, 59, '#6366f1');
    insertEmp.run('EMP-102', 'Sarah Jenkins', 'Product Design', 'Staff UI/UX Designer', 'sarah.j@company.ai', '+1 (555) 345-6789', 'CA-77-SJ-8812', 91.0, 55, 50, '#ec4899');
    insertEmp.run('EMP-103', 'David Chen', 'Cloud Platform', 'Principal DevOps Architect', 'david.c@company.ai', '+1 (555) 456-7890', 'NY-99-DC-1099', 99.0, 70, 69, '#10b981');
    insertEmp.run('EMP-104', 'Priya Sharma', 'Human Resources', 'HR Operations Specialist', 'priya.s@company.ai', '+1 (555) 567-8901', 'TX-44-PS-3021', 96.0, 50, 48, '#f59e0b');
    insertEmp.run('EMP-105', 'Marcus Vance', 'Global Sales', 'Enterprise Account Exec', 'marcus.v@company.ai', '+1 (555) 678-9012', 'WA-21-MV-5544', 74.5, 45, 33, '#ef4444');

    // 2. Seed HR Policies
    const insertPolicy = db.prepare(`
        INSERT INTO hr_policies (id, category, title, policy_text, action_guidance, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertPolicy.run(
        'POL-001',
        'GEOFENCE',
        'GPS Geofence Discrepancy & Gate LPR Verification',
        'If an employee mobile punch-in triggers a geofence breach (device detected outside the 100m perimeter) but optical License Plate Recognition (LPR) or gate turnstile logs prove physical presence on campus prior to shift start, the AI Agent is authorized to automatically override the record to PRESENT without requiring human escalation.',
        'Verify LPR gate timestamp within 15 minutes of shift start. If verified, execute database override to PRESENT.',
        new Date().toISOString()
    );

    insertPolicy.run(
        'POL-002',
        'LATE_ARRIVAL',
        'Grace Period & Reliable Employee Tardiness',
        'Employees with a reliability score above 90% who arrive less than 30 minutes late due to transit disruptions are eligible for an autonomous one-time grace period override, provided they notify via chat or acknowledge the automated prompt.',
        'Check employee reliability score. If >= 90%, contact employee, log reasoning, and override to EXCUSED_LATE. If < 85%, escalate to direct manager.',
        new Date().toISOString()
    );

    insertPolicy.run(
        'POL-003',
        'REMOTE_WORK',
        'Unscheduled Remote Location Protocol',
        'If an employee attempts to punch in from a location greater than 10km away without a pre-approved Remote Work permit, the system must NOT auto-override. The AI Agent must contact the employee, create a formal HR review ticket, and request supervisor sign-off.',
        'Escalate to Human-in-the-Loop review. Mark status as ESCALATED_TO_HUMAN.',
        new Date().toISOString()
    );

    insertPolicy.run(
        'POL-004',
        'HARDWARE_FAIL',
        'Biometric & Network Scanner Malfunctions',
        'In the event of hardware biometric sensor timeouts or office Wi-Fi outages, cross-reference badge swipe logs with peer presence detection to validate working hours.',
        'Confirm secondary badge event. Override to PRESENT if secondary evidence confirms attendance.',
        new Date().toISOString()
    );

    // 3. Seed Gate Logs (LPR)
    const insertGate = db.prepare(`
        INSERT INTO gate_logs (id, license_plate, employee_id, timestamp, gate_name, direction, confidence_score)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertGate.run('GATE-901', 'KA-01-MJ-4040', 'EMP-101', '08:28 AM', 'North Perimeter Gate', 'ENTRY', 0.99);
    insertGate.run('GATE-902', 'CA-77-SJ-8812', 'EMP-102', '08:42 AM', 'Main Parking Turnstile', 'ENTRY', 0.98);
    insertGate.run('GATE-903', 'NY-99-DC-1099', 'EMP-103', '08:15 AM', 'Tech Park North Gate', 'ENTRY', 0.99);

    // 4. Seed Geofence Logs
    const insertGeo = db.prepare(`
        INSERT INTO geofence_logs (id, employee_id, timestamp, recorded_lat, recorded_lng, distance_from_perimeter_m, status, device_fingerprint)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertGeo.run('GEO-801', 'EMP-101', '08:30 AM', 12.9716, 77.5946, 2150.0, 'BREACH', 'iPhone 15 Pro (iOS 18.1)');
    insertGeo.run('GEO-802', 'EMP-102', '09:15 AM', 12.9720, 77.5950, 450.0, 'BREACH', 'Pixel 9 (Android 15)');
    insertGeo.run('GEO-803', 'EMP-105', '09:45 AM', 13.0827, 80.2707, 18500.0, 'OUT_OF_RANGE', 'Samsung Galaxy S24');

    // 5. Seed Historical Attendance Records
    const insertAtt = db.prepare(`
        INSERT INTO attendance_records (id, employee_id, date, check_in_time, check_out_time, status, method, location_lat, location_lng, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    insertAtt.run('ATT-001', 'EMP-103', today, '08:15 AM', null, 'PRESENT', 'RFID_GATE', 12.9716, 77.5946, 'Verified on-time check in', new Date().toISOString());
    insertAtt.run('ATT-002', 'EMP-104', today, '08:25 AM', null, 'PRESENT', 'BIOMETRIC_KIOSK', 12.9716, 77.5946, 'Verified on-time check in', new Date().toISOString());
    insertAtt.run('ATT-003', 'EMP-101', today, '08:30 AM', null, 'PENDING_INVESTIGATION', 'GEOFENCE', 12.9716, 77.5946, 'Flagged by Geofence anomaly detector', new Date().toISOString());
    insertAtt.run('ATT-004', 'EMP-102', today, '09:15 AM', null, 'PENDING_INVESTIGATION', 'GEOFENCE', 12.9720, 77.5950, 'Late punch-in with location offset', new Date().toISOString());
    insertAtt.run('ATT-005', 'EMP-105', today, '09:45 AM', null, 'PENDING_INVESTIGATION', 'GEOFENCE', 13.0827, 80.2707, 'Remote location without permit', new Date().toISOString());

    // Historical records for yesterday
    insertAtt.run('ATT-010', 'EMP-101', yesterday, '08:29 AM', '05:45 PM', 'PRESENT', 'GEOFENCE', 12.9716, 77.5946, 'Regular shift', yesterday);
    insertAtt.run('ATT-011', 'EMP-102', yesterday, '08:35 AM', '05:30 PM', 'PRESENT', 'GEOFENCE', 12.9716, 77.5946, 'Regular shift', yesterday);
    insertAtt.run('ATT-012', 'EMP-103', yesterday, '08:10 AM', '05:50 PM', 'PRESENT', 'RFID_GATE', 12.9716, 77.5946, 'Regular shift', yesterday);
    insertAtt.run('ATT-013', 'EMP-104', yesterday, '08:20 AM', '05:15 PM', 'PRESENT', 'BIOMETRIC_KIOSK', 12.9716, 77.5946, 'Regular shift', yesterday);
    insertAtt.run('ATT-014', 'EMP-105', yesterday, '09:50 AM', '04:30 PM', 'LATE', 'GEOFENCE', 12.9716, 77.5946, 'Late arrival', yesterday);

    // 6. Seed Pending Anomalies
    const insertAno = db.prepare(`
        INSERT INTO anomalies (id, employee_id, timestamp, date, anomaly_type, severity, status, agent_resolution, human_action, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertAno.run('ANO-101', 'EMP-101', '08:30 AM', today, 'GEOFENCE_BREACH', 'MEDIUM', 'pending', null, null, new Date().toISOString());
    insertAno.run('ANO-102', 'EMP-102', '09:15 AM', today, 'LATE_ARRIVAL', 'LOW', 'pending', null, null, new Date().toISOString());
    insertAno.run('ANO-103', 'EMP-105', '09:45 AM', today, 'UNREGISTERED_DEVICE', 'HIGH', 'pending', null, null, new Date().toISOString());

    console.log('[DATABASE] Seed data complete! SQLite database ready at', dbPath);
}

module.exports = db;
