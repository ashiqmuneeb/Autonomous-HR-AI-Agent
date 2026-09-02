import React from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  MapPin, 
  Car, 
  FileText, 
  MessageSquare, 
  UserCheck, 
  XCircle,
  Database,
  ArrowRight
} from 'lucide-react';
import { formatLabel } from '../utils';

export default function AnomalyDetailModal({ isOpen, onClose, anomaly, onHitlDecision }) {
  if (!isOpen || !anomaly) return null;

  const resolution = anomaly.agent_resolution;
  const isEscalated = anomaly.status === 'escalated_to_human';

  return (
    <div className="clean-modal-backdrop" onClick={onClose}>
      <div className="clean-modal-card" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="clean-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div 
              className="user-avatar" 
              style={{ background: anomaly.avatar_color || '#2563eb', width: '38px', height: '38px', fontSize: '0.9rem' }}
            >
              {anomaly.employee_name ? anomaly.employee_name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'EM'}
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {anomaly.employee_name || anomaly.employee_id}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                {anomaly.role || 'Staff'} • {anomaly.department || 'Operations'} • {formatLabel(anomaly.anomaly_type)}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="clean-modal-body">
          {/* Status & Summary */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            background: 'var(--bg-app)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '0.75rem 1rem'
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>
                Event Status
              </div>
              <div style={{ marginTop: '0.2rem' }}>
                <span className={`status-pill ${anomaly.status}`}>
                  {formatLabel(anomaly.status)}
                </span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>
                Punch Timestamp
              </div>
              <div style={{ fontSize: '0.86rem', fontWeight: 500, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                {anomaly.timestamp} ({anomaly.date})
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>
                Attendance Rate
              </div>
              <div style={{ fontSize: '0.86rem', fontWeight: 600, color: (anomaly.reliability_score || 95) >= 90 ? 'var(--accent-green)' : 'var(--accent-rose)', marginTop: '0.2rem' }}>
                {anomaly.reliability_score || 95}%
              </div>
            </div>
          </div>

          {/* Action Taken if resolved */}
          {resolution?.action_taken && (
            <div style={{ 
              background: 'var(--accent-green-bg)', 
              border: '1px solid var(--accent-green-border)', 
              borderRadius: '8px', 
              padding: '0.85rem 1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-green)', fontWeight: 600, fontSize: '0.84rem' }}>
                <CheckCircle2 size={16} />
                <span>Action Executed</span>
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                {resolution.action_taken}
              </div>
            </div>
          )}

          {/* Deep AI Reasoning Explanation */}
          {resolution?.reasoning ? (
            <div>
              <h4 style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileText size={15} color="var(--primary)" />
                AI Investigation & Evidence Rationale
              </h4>
              <div style={{ 
                background: 'var(--bg-app)', 
                border: '1px solid var(--border-subtle)', 
                borderRadius: '8px', 
                padding: '0.9rem', 
                fontSize: '0.82rem', 
                color: 'var(--text-secondary)', 
                lineHeight: 1.6,
                whiteSpace: 'pre-line'
              }}>
                {resolution.reasoning}
              </div>
            </div>
          ) : isEscalated ? (
            <div className="hitl-box" style={{ margin: 0 }}>
              <div className="hitl-box-header">
                <ShieldAlert size={16} />
                <span>Manager Decision Required</span>
              </div>
              <p>
                The AI Agent analyzed this check-in and found that company policy requires manager approval before an override can be applied.
              </p>
              <div className="hitl-actions-row">
                <button 
                  className="btn-approve-clean"
                  onClick={() => {
                    onHitlDecision(anomaly.id, 'APPROVED', 'Manager approved override');
                    onClose();
                  }}
                >
                  <UserCheck size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Approve (Mark Present)
                </button>
                <button 
                  className="btn-reject-clean"
                  onClick={() => {
                    onHitlDecision(anomaly.id, 'REJECTED', 'Marked as unexcused absence');
                    onClose();
                  }}
                >
                  <XCircle size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Reject (Mark Absent)
                </button>
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem', fontStyle: 'italic', padding: '1rem', textAlign: 'center' }}>
              No automated resolution has been executed yet for this issue.
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '0.9rem 1.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', background: 'var(--bg-app)' }}>
          <button 
            className="filter-btn" 
            onClick={onClose}
            style={{ border: '1px solid var(--border-subtle)', padding: '0.45rem 1rem' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
