// Human-friendly label helpers for real-world clarity

export const LABEL_MAP = {
  // Anomaly Types
  'GEOFENCE_BREACH': 'Location Mismatch',
  'LATE_ARRIVAL': 'Late Arrival',
  'UNREGISTERED_DEVICE': 'Unrecognized Device',
  'MISSING_PUNCH': 'Missing Punch-Out',
  'GATE_MISMATCH': 'Gate Sensor Mismatch',

  // Categories
  'GEOFENCE': 'Location & GPS',
  'REMOTE_WORK': 'Remote Work',
  'HARDWARE_FAIL': 'Scanner Issue',
  'EMERGENCY': 'Emergency',

  // Methods
  'BIOMETRIC_KIOSK': 'Biometric Scanner',
  'RFID_GATE': 'Badge Scanner',
  'REMOTE_PORTAL': 'Web Portal',
  'AI_AUTONOMOUS_OVERRIDE': 'AI Verified',

  // Statuses
  'PRESENT': 'Present',
  'ABSENT': 'Absent',
  'LATE': 'Late',
  'ON_LEAVE': 'On Leave',
  'OVERRIDDEN_BY_AI': 'AI Approved',
  'PENDING_INVESTIGATION': 'Under Review',
  'escalated_to_human': 'Needs Review',
  'pending': 'Pending',
  'investigating': 'Analyzing...',
  'resolved': 'Resolved'
};

export function formatLabel(raw) {
  if (!raw) return '';
  return LABEL_MAP[raw] || raw.replace(/_/g, ' ');
}

export function formatSeverity(sev) {
  if (!sev) return 'Normal';
  const map = {
    'HIGH': 'High Priority',
    'CRITICAL': 'Urgent',
    'MEDIUM': 'Medium',
    'LOW': 'Low'
  };
  return map[sev] || sev;
}
