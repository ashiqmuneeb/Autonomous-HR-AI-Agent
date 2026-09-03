import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  X, 
  MapPin, 
  Car, 
  Clock, 
  BookOpen, 
  User, 
  FileText, 
  AlertTriangle, 
  Sparkles,
  Lock,
  FileCheck,
  Shield,
  Layers,
  ArrowRight,
  Printer
} from 'lucide-react';
import { formatLabel } from '../utils';
import GeofenceRadar from './GeofenceRadar';

export default function AnomalyDetailModal({ 
  isOpen, 
  onClose, 
  anomaly, 
  onHitlDecision,
  activeRole = 'HR_ADMIN',
  maskPII = false
}) {
  const [managerNotes, setManagerNotes] = useState('');
  const [consequenceType, setConsequenceType] = useState('UNEXCUSED_ABSENCE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !anomaly) return null;

  const handleSubmit = async (action) => {
    setIsSubmitting(true);
    try {
      const fullNotes = action === 'REJECT' 
        ? `[Consequence: ${consequenceType}] ${managerNotes}`
        : managerNotes;
      await onHitlDecision(anomaly.id, action, fullNotes);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const maskText = (text, visibleLen = 3) => {
    if (!maskPII || !text) return text;
    if (text.length <= visibleLen) return '***';
    return text.slice(0, visibleLen) + '•'.repeat(Math.max(3, text.length - visibleLen));
  };

  const isReadOnlyRole = activeRole === 'AUDITOR' || activeRole === 'EMPLOYEE';

  return (
    <div className="clean-modal-backdrop" onClick={onClose}>
      <div className="clean-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="clean-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '38px', 
              height: '38px', 
              borderRadius: '8px', 
              background: 'var(--accent-amber-bg)', 
              color: 'var(--accent-amber)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Evidence Dossier & Governance Review
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                Case ID: #{anomaly.id} • Immutable Audit Checksum: <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>sha256:7f3b...9a12</code>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button 
              className="header-icon-btn" 
              onClick={() => window.print()}
              title="Print HR Compliance Memorandum"
            >
              <Printer size={15} />
            </button>
            <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-scrollable-body">
          {/* Employee Profile Header */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '1rem',
            background: 'var(--bg-card-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div className="user-avatar" style={{ background: 'var(--primary)', width: 44, height: 44 }}>
                {anomaly.employee_name ? anomaly.employee_name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'EM'}
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{anomaly.employee_name}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                  ID: {anomaly.employee_id} • {anomaly.department || 'Engineering'} • Reliability: {anomaly.reliability_score || 98.5}%
                </p>
              </div>
            </div>

            <span className={`status-pill ${anomaly.status}`}>
              {anomaly.status === 'escalated_to_human' ? 'Needs Review' : formatLabel(anomaly.status)}
            </span>
          </div>

          {/* Interactive Radar & Shift Timeline Widget */}
          <GeofenceRadar 
            distanceMeters={anomaly.simulated_distance_m || 450}
            isInside={!anomaly.simulated_distance_m}
            employeeName={anomaly.employee_name}
            plateMatched={!!anomaly.gate_event_simulated}
            plateNumber={anomaly.simulated_plate || 'NY-99-DC-1099'}
            shiftStartTime="08:30 AM"
            gateEntryTime="08:30 AM"
            punchTime={anomaly.timestamp || '08:30 AM'}
          />

          {/* Immutable Audit Diff View */}
          <div className="clean-card" style={{ padding: '1rem', background: 'var(--bg-card-subtle)' }}>
            <h4 style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
              Immutable Attendance State Diff (Audit Log)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--accent-rose)', fontWeight: 700, textTransform: 'uppercase' }}>Original Terminal Raw Punch</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-rose)', marginTop: '0.35rem' }}>
                  ABSENT (Geofence Breach Flagged)
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                  Punched via Mobile Client at {anomaly.timestamp || '08:30 AM'}
                </div>
              </div>

              <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--accent-green)', fontWeight: 700, textTransform: 'uppercase' }}>Overridden Corporate State</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-green)', marginTop: '0.35rem' }}>
                  {anomaly.status === 'resolved' ? 'PRESENT (AI Excused Override)' : 'PENDING HUMAN GOVERNANCE'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                  Multi-signal correlated against Gate OCR
                </div>
              </div>
            </div>
          </div>

          {/* Human in the loop decision form if escalated */}
          {anomaly.status === 'escalated_to_human' && !isReadOnlyRole && (
            <div className="clean-card" style={{ border: '1px solid var(--accent-amber-border)', background: 'var(--accent-amber-bg)' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent-amber)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertTriangle size={15} />
                <span>Executive Decision Required</span>
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                The automated quota for auto-resolving geofence breaches has been reached for this quarter. Please record your governance determination.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>If Rejecting, Select Consequence Path:</label>
                  <select 
                    value={consequenceType} 
                    onChange={(e) => setConsequenceType(e.target.value)}
                    className="global-search-input"
                    style={{ marginTop: '0.35rem' }}
                  >
                    <option value="PAYROLL_DEDUCTION">1. Payroll Deduction (Mark as Unexcused Absence)</option>
                    <option value="DISCIPLINARY_TICKET">2. Issue Written Attendance Ticket (HR Compliance)</option>
                    <option value="EMPLOYEE_APPEAL">3. Request Formal Appeal Evidence from Employee</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Executive Audit Notes:</label>
                  <textarea 
                    value={managerNotes} 
                    onChange={(e) => setManagerNotes(e.target.value)}
                    placeholder="Enter reason for approval or rejection..."
                    className="global-search-input"
                    style={{ minHeight: '70px', marginTop: '0.35rem' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button 
                    className="card-btn" 
                    style={{ background: 'var(--accent-green)', color: '#ffffff' }}
                    onClick={() => handleSubmit('APPROVE')}
                    disabled={isSubmitting}
                  >
                    <CheckCircle2 size={16} />
                    <span>Authorize Override (Mark Present)</span>
                  </button>

                  <button 
                    className="card-btn" 
                    style={{ background: 'var(--accent-rose)', color: '#ffffff' }}
                    onClick={() => handleSubmit('REJECT')}
                    disabled={isSubmitting}
                  >
                    <XCircle size={16} />
                    <span>Reject Override & Apply Consequence</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
