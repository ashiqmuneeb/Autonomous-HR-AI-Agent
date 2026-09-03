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
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Sliders, 
  Send,
  Shield,
  SmartphoneNfc,
  Check,
  Lock
} from 'lucide-react';
import { formatLabel } from '../utils';

export default function ClockInSimulator({ employees, onClockInSuccess, onNavigateToAnomalies, onShowToast }) {
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || 'EMP-101');
  const [method, setMethod] = useState('GEOFENCE');
  const [distance, setDistance] = useState('0');
  const [time, setTime] = useState('08:30 AM');
  const [gateSimulated, setGateSimulated] = useState(true);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const selectedEmployee = employees.find(e => e.id === selectedEmpId) || employees[0];

  const applyPreset = (presetType) => {
    switch (presetType) {
      case 'on_time':
        setTime('08:45 AM');
        setDistance('0');
        setGateSimulated(true);
        setMethod('BIOMETRIC_KIOSK');
        setNotes('Routine on-time campus arrival.');
        break;
      case 'traffic_with_gate':
        setTime('09:12 AM');
        setDistance('140');
        setGateSimulated(true);
        setMethod('GEOFENCE');
        setNotes('Heavy traffic delay near North Gate perimeter.');
        break;
      case 'spoofed_fraud':
        setTime('08:55 AM');
        setDistance('850');
        setGateSimulated(false);
        setMethod('GEOFENCE');
        setNotes('Remote punch attempted from residential WiFi.');
        break;
      default:
        break;
    }
  };

  const handleClockIn = async (e) => {
    if (e) e.preventDefault();
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

      if (onShowToast) {
        if (res.data.is_anomaly) {
          onShowToast({
            type: 'warning',
            title: 'Attendance Discrepancy Flagged',
            message: `Event for ${selectedEmployee?.name} sent to AI Agent queue.`
          });
        } else {
          onShowToast({
            type: 'success',
            title: 'Clock-In Verified',
            message: `${selectedEmployee?.name} punched in successfully.`
          });
        }
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      setResult({
        success: false,
        message: errorMsg
      });
      if (onShowToast) {
        onShowToast({
          type: 'error',
          title: 'Clock-In Failed',
          message: errorMsg
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-titles">
          <h1>Clock-In Terminal Simulator</h1>
          <p>Multi-factor authentication terminal featuring hardware biometric verification, GPS geofence tracking, and anti-spoofing liveness checks.</p>
        </div>

        {/* Quick Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
            Test Scenarios:
          </span>
          <button 
            type="button"
            className="filter-btn active"
            onClick={() => applyPreset('on_time')}
          >
            <CheckCircle2 size={13} color="var(--accent-green)" />
            <span>1. Normal On-Time</span>
          </button>
          <button 
            type="button"
            className="filter-btn"
            onClick={() => applyPreset('traffic_with_gate')}
          >
            <Zap size={13} color="var(--accent-amber)" />
            <span>2. Gate OCR + GPS Delta</span>
          </button>
          <button 
            type="button"
            className="filter-btn"
            onClick={() => applyPreset('spoofed_fraud')}
          >
            <AlertCircle size={13} color="var(--accent-rose)" />
            <span>3. Remote Fraud Punch</span>
          </button>
        </div>
      </div>

      <div className="kiosk-grid">
        {/* Left Form */}
        <div className="clean-card">
          <form onSubmit={handleClockIn} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Staff Member Selector */}
            <div>
              <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>
                Employee Identification
              </label>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="global-search-input"
                style={{ padding: '0.65rem 0.85rem' }}
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.id}) — {emp.role} • {emp.department}
                  </option>
                ))}
              </select>
            </div>

            {/* Check-In Verification Channel */}
            <div>
              <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>
                Verification Channel (Selected: <strong>{formatLabel(method)}</strong>)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                {[
                  { id: 'GEOFENCE', label: 'Mobile Geofence', icon: <Smartphone size={16} /> },
                  { id: 'BIOMETRIC_KIOSK', label: 'Biometric Kiosk', icon: <Fingerprint size={16} /> },
                  { id: 'RFID_GATE', label: 'RFID Gate Badge', icon: <CreditCard size={16} /> },
                  { id: 'REMOTE_PORTAL', label: 'Remote Portal', icon: <Globe size={16} /> }
                ].map(item => {
                  const isSelected = method === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`sidebar-nav-item ${isSelected ? 'active' : ''}`}
                      style={{ 
                        padding: '0.65rem 0.85rem', 
                        justifyContent: 'space-between', 
                        border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                        background: isSelected ? 'var(--primary-light)' : 'transparent'
                      }}
                      onClick={() => setMethod(item.id)}
                    >
                      <div className="nav-icon-label">
                        {item.icon}
                        <span style={{ fontWeight: isSelected ? 700 : 500 }}>{item.label}</span>
                      </div>
                      {isSelected && <Check size={14} color="var(--primary)" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Distance & Time Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>
                  GPS Distance from Gate ({distance}m)
                </label>
                <input 
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                  <span>0m (Campus)</span>
                  <span>50m Geofence</span>
                  <span>1000m (Remote)</span>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>
                  Simulated Punch Time
                </label>
                <input 
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="e.g. 08:30 AM"
                  className="global-search-input"
                  style={{ padding: '0.65rem 0.85rem', fontFamily: 'var(--font-mono)' }}
                />
              </div>
            </div>

            {/* Gate Camera Correlation Checkbox */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.65rem', 
              padding: '0.75rem', 
              background: 'var(--bg-card-subtle)', 
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <input 
                type="checkbox"
                id="gateCheck"
                checked={gateSimulated}
                onChange={(e) => setGateSimulated(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              <label htmlFor="gateCheck" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}>
                Simulate <strong>Vehicle Plate OCR Detection</strong> at North Perimeter Gate
              </label>
            </div>

            {/* Custom Notes */}
            <div>
              <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>
                Optional Check-In Notes / Excuse
              </label>
              <input 
                type="text"
                placeholder="e.g. Stuck at security gate queue..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="global-search-input"
                style={{ padding: '0.65rem 0.85rem' }}
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={loading}
              className={`card-btn resolve-ai ${loading ? 'btn-shimmer' : ''}`}
              style={{ padding: '0.85rem', fontSize: '0.9rem' }}
            >
              <Send size={16} />
              <span>{loading ? 'Transmitting Telemetry to SQLite...' : 'Transmit Attendance Punch'}</span>
            </button>
          </form>
        </div>

        {/* Right Anti-Spoofing & Liveness Shield + Biometrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Anti-Spoofing & Liveness Shield Panel */}
          <div className="clean-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--accent-green-bg)', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700 }}>Anti-Spoofing & Identity Shield</h4>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Hardware-rooted biometric and device telemetry</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: 'var(--bg-card-subtle)', borderRadius: 4 }}>
                <span style={{ color: 'var(--text-dim)' }}>Device Fingerprint:</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>iPhone 15 (ID: d9f2...a8b1)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: 'var(--bg-card-subtle)', borderRadius: 4 }}>
                <span style={{ color: 'var(--text-dim)' }}>Optical Liveness Scan:</span>
                <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>99.8% (Anti-Deepfake Pass)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: 'var(--bg-card-subtle)', borderRadius: 4 }}>
                <span style={{ color: 'var(--text-dim)' }}>Mock GPS / VPN Status:</span>
                <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>None Detected (Secure)</span>
              </div>
            </div>
          </div>

          {/* Biometric Visualizer Pad */}
          <div 
            className="biometric-scanner-pad"
            onClick={handleClockIn}
            title="Click to trigger biometric quick-punch"
          >
            <div style={{ 
              width: '68px', 
              height: '68px', 
              borderRadius: '50%', 
              background: 'var(--primary-light)', 
              border: '1px solid var(--primary-border)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <Fingerprint size={38} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ fontSize: '1.02rem', fontWeight: 700 }}>Instant Biometric Touch</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
                Touch sensor to authenticate {selectedEmployee?.name}
              </p>
            </div>
          </div>

          {/* Result Card */}
          {result && (
            <div className="clean-card" style={{ 
              background: result.is_anomaly ? 'var(--accent-amber-bg)' : 'var(--accent-green-bg)',
              borderColor: result.is_anomaly ? 'var(--accent-amber-border)' : 'var(--accent-green-border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {result.is_anomaly ? (
                  <AlertCircle size={20} color="var(--accent-amber)" />
                ) : (
                  <CheckCircle2 size={20} color="var(--accent-green)" />
                )}
                <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {result.is_anomaly ? 'Discrepancy Detected by System' : 'Punch Verified & Synchronized'}
                </h4>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                {result.message || (result.is_anomaly 
                  ? `Distance delta of ${distance}m exceeded threshold. Event flagged in autonomous triage feed.` 
                  : 'Punch verified against geofence parameters and recorded into the persistent SQLite ledger.')}
              </p>

              {result.is_anomaly && (
                <button
                  type="button"
                  className="card-btn resolve-ai"
                  onClick={onNavigateToAnomalies}
                  style={{ width: '100%' }}
                >
                  <Sparkles size={15} />
                  <span>Open Anomaly Feed & Run AI Resolution</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
