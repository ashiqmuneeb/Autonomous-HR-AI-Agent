import React, { useState } from 'react';
import axios from 'axios';
import { 
  Clock, 
  MapPin, 
  Car, 
  Smartphone, 
  Fingerprint, 
  CreditCard, 
  Globe, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { formatLabel } from '../utils';

export default function ClockInSimulator({ employees, onClockInSuccess, onNavigateToAnomalies }) {
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || 'EMP-101');
  const [method, setMethod] = useState('GEOFENCE');
  const [distance, setDistance] = useState('0');
  const [time, setTime] = useState('08:30 AM');
  const [gateSimulated, setGateSimulated] = useState(true);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const selectedEmployee = employees.find(e => e.id === selectedEmpId) || employees[0];

  const handleClockIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await axios.post('http://localhost:5000/api/kiosk/clock-in', {
        employee_id: selectedEmpId,
        method,
        simulated_distance_m: parseFloat(distance),
        gate_event_simulated: gateSimulated,
        timestamp: time,
        notes: notes || `Method: ${method}`
      });

      setResult(res.data);
      onClockInSuccess();
    } catch (error) {
      setResult({
        success: false,
        message: error.response?.data?.error || error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-titles">
          <h1>Clock In</h1>
          <p>Record a test check-in or simulate real-world situations (like GPS glitches or late arrivals).</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.75rem' }}>
        {/* Form */}
        <div className="clean-card">
          <form onSubmit={handleClockIn}>
            {/* Employee Selection */}
            <div className="form-field">
              <label>Select Employee</label>
              <select 
                className="clean-select"
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.id}) — {emp.role} [{emp.department}]
                  </option>
                ))}
              </select>
            </div>

            {/* Check-In Method */}
            <div className="form-field">
              <label>How are they clocking in?</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  className={`filter-btn ${method === 'GEOFENCE' ? 'active' : ''}`}
                  onClick={() => setMethod('GEOFENCE')}
                  style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border-subtle)' }}
                >
                  <Smartphone size={15} style={{ display: 'inline', marginRight: '6px' }} />
                  Mobile App
                </button>
                <button
                  type="button"
                  className={`filter-btn ${method === 'BIOMETRIC_KIOSK' ? 'active' : ''}`}
                  onClick={() => setMethod('BIOMETRIC_KIOSK')}
                  style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border-subtle)' }}
                >
                  <Fingerprint size={15} style={{ display: 'inline', marginRight: '6px' }} />
                  Fingerprint
                </button>
                <button
                  type="button"
                  className={`filter-btn ${method === 'RFID_GATE' ? 'active' : ''}`}
                  onClick={() => setMethod('RFID_GATE')}
                  style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border-subtle)' }}
                >
                  <CreditCard size={15} style={{ display: 'inline', marginRight: '6px' }} />
                  Office Badge
                </button>
                <button
                  type="button"
                  className={`filter-btn ${method === 'REMOTE_PORTAL' ? 'active' : ''}`}
                  onClick={() => setMethod('REMOTE_PORTAL')}
                  style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border-subtle)' }}
                >
                  <Globe size={15} style={{ display: 'inline', marginRight: '6px' }} />
                  Web Portal
                </button>
              </div>
            </div>

            {/* GPS Distance preset */}
            <div className="form-field">
              <label>GPS Location</label>
              <select 
                className="clean-select"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
              >
                <option value="0">At Office Desk (Inside office)</option>
                <option value="50">Office Parking Lot (50m away)</option>
                <option value="450">Coffee Shop (450m away — Slight delay)</option>
                <option value="2150">GPS Error (2.1 km away — Triggers Location Check)</option>
                <option value="18500">Working from Home (18.5 km away — Needs Policy Check)</option>
              </select>
            </div>

            {/* Parking Gate Camera */}
            <div className="form-field">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 500 }}>
                <input 
                  type="checkbox"
                  checked={gateSimulated}
                  onChange={(e) => setGateSimulated(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#2563eb' }}
                />
                <span>Car entered office gate on time (Plate: {selectedEmployee?.license_plate || 'KA-01-MJ-4040'})</span>
              </label>
            </div>

            {/* Punch Time */}
            <div className="form-field">
              <label>Check-in Time</label>
              <input 
                type="text"
                className="clean-input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 08:30 AM or 09:15 AM"
              />
            </div>

            <button 
              type="submit" 
              className="btn-solid-primary"
              disabled={loading}
              style={{ marginTop: '0.5rem' }}
            >
              <Clock size={16} />
              <span>{loading ? 'Submitting...' : 'Clock In Employee'}</span>
            </button>
          </form>
        </div>

        {/* Live Feedback & Employee Profile */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Employee Card */}
          {selectedEmployee && (
            <div className="clean-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                <div 
                  className="user-avatar" 
                  style={{ background: selectedEmployee.avatar_color || '#6366f1', width: '48px', height: '48px', fontSize: '1.1rem' }}
                >
                  {selectedEmployee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{selectedEmployee.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{selectedEmployee.role} • {selectedEmployee.department}</p>
                </div>
              </div>

              <div className="info-strip" style={{ margin: 0 }}>
                <div className="info-item">
                  <span className="info-label">Employee ID</span>
                  <span className="info-val">{selectedEmployee.id}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">License Plate</span>
                  <span className="info-val">
                    <Car size={14} /> {selectedEmployee.license_plate}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Attendance Record</span>
                  <span className="info-val" style={{ color: selectedEmployee.reliability_score >= 90 ? '#10b981' : '#f43f5e' }}>
                    {selectedEmployee.reliability_score}% on-time
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email</span>
                  <span className="info-val" style={{ fontSize: '0.78rem' }}>{selectedEmployee.email}</span>
                </div>
              </div>
            </div>
          )}

          {/* Clock-In Result Message */}
          {result && (
            <div 
              className="clean-card" 
              style={{ 
                borderLeft: `4px solid ${result.anomaly_triggered ? '#f59e0b' : '#10b981'}`,
                background: result.anomaly_triggered ? 'var(--accent-amber-bg)' : 'var(--accent-green-bg)' 
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                {result.anomaly_triggered ? (
                  <AlertCircle size={20} color="#f59e0b" />
                ) : (
                  <CheckCircle2 size={20} color="#10b981" />
                )}
                <h4 style={{ color: result.anomaly_triggered ? '#d97706' : '#059669', fontWeight: 600, fontSize: '0.95rem' }}>
                  {result.anomaly_triggered ? 'Issue Flagged by System' : 'Check-In Recorded Successfully'}
                </h4>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                {result.message}
              </p>

              {result.anomaly_triggered && (
                <button 
                  className="btn-solid-primary"
                  onClick={onNavigateToAnomalies}
                  style={{ marginTop: '0.85rem', background: '#f59e0b' }}
                >
                  <Sparkles size={16} />
                  <span>View in Issues Queue</span>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
