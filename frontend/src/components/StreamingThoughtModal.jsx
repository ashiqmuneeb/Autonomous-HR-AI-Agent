import React, { useEffect, useRef, useState } from 'react';
import { 
  BrainCircuit, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Database, 
  Search, 
  MessageSquare, 
  ShieldCheck, 
  Loader2, 
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { formatLabel } from '../utils';

export default function StreamingThoughtModal({ isOpen, onClose, anomaly, streamEvents, isStreaming, onComplete }) {
  const terminalEndRef = useRef(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [streamEvents]);

  if (!isOpen || !anomaly) return null;

  const finalDecision = streamEvents.find(e => e.type === 'decision')?.decision;

  const getFriendlyStepDescription = (evt) => {
    if (evt.type === 'thought') {
      return evt.content || 'Analyzing situation...';
    }
    if (evt.type === 'tool_call') {
      switch (evt.tool_name) {
        case 'fetch_attendance_history': return 'Checking employee past attendance and reliability record...';
        case 'check_geofence_logs': return 'Reviewing GPS coordinates and mobile location logs...';
        case 'query_lpr_events': return 'Checking parking gate camera logs for vehicle entry...';
        case 'search_hr_policy': return 'Consulting company policy rulebook...';
        case 'contact_employee': return 'Sending message to employee for clarification...';
        case 'override_attendance_record': return 'Updating attendance record in database...';
        case 'create_hr_ticket': return 'Creating ticket for manager review...';
        default: return `Running check: ${evt.tool_name}...`;
      }
    }
    if (evt.type === 'tool_result') {
      switch (evt.tool_name) {
        case 'fetch_attendance_history': return 'Found attendance track record.';
        case 'check_geofence_logs': return 'Location discrepancy confirmed by GPS logs.';
        case 'query_lpr_events': return 'Vehicle arrival confirmed by gate camera.';
        case 'search_hr_policy': return 'Relevant company policy identified.';
        case 'contact_employee': return 'Employee provided explanation.';
        case 'override_attendance_record': return 'Database updated successfully.';
        case 'create_hr_ticket': return 'Escalation ticket submitted to manager.';
        default: return 'Check completed.';
      }
    }
    return evt.content || 'Processing...';
  };

  const getStepIcon = (evt) => {
    if (evt.type === 'tool_result') {
      return <CheckCircle2 size={16} color="#10b981" />;
    }
    if (evt.type === 'tool_call') {
      switch (evt.tool_name) {
        case 'fetch_attendance_history': return <Database size={16} color="#6366f1" />;
        case 'check_geofence_logs': return <Search size={16} color="#06b6d4" />;
        case 'query_lpr_events': return <ShieldCheck size={16} color="#f59e0b" />;
        case 'search_hr_policy': return <Search size={16} color="#a855f7" />;
        case 'contact_employee': return <MessageSquare size={16} color="#ec4899" />;
        case 'override_attendance_record': return <CheckCircle2 size={16} color="#10b981" />;
        default: return <BrainCircuit size={16} color="#818cf8" />;
      }
    }
    return <BrainCircuit size={16} color="#818cf8" />;
  };

  return (
    <div className="clean-modal-backdrop" onClick={onClose}>
      <div className="clean-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="clean-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '8px', 
              background: 'var(--primary-light)', 
              color: '#818cf8', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                AI Investigation in Progress
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                Resolving {formatLabel(anomaly.anomaly_type)} for {anomaly.employee_name || anomaly.employee_id}
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
          {/* Status banner while streaming */}
          {isStreaming && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              background: 'var(--accent-cyan-bg)', 
              border: '1px solid var(--accent-cyan-border)', 
              borderRadius: '8px', 
              padding: '0.65rem 0.9rem',
              color: 'var(--accent-cyan)',
              fontSize: '0.82rem',
              fontWeight: 500
            }}>
              <Loader2 size={16} className="spinner" />
              <span>AI is actively cross-referencing camera feeds, GPS telemetry, and company policies...</span>
            </div>
          )}

          {/* Clean Step Timeline */}
          <div className="step-timeline">
            {streamEvents.length === 0 && (
              <div style={{ color: 'var(--text-tertiary)', fontStyle: 'italic', padding: '1rem 0', textAlign: 'center' }}>
                Connecting to AI agent...
              </div>
            )}

            {streamEvents.map((evt, idx) => (
              <div key={idx} className="timeline-step">
                <div className="timeline-icon-col">
                  {getStepIcon(evt)}
                  <div className="timeline-line"></div>
                </div>

                <div className="timeline-content">
                  <div className="timeline-step-title">
                    {getFriendlyStepDescription(evt)}
                  </div>

                  {/* Optional Technical Details view */}
                  {showTechnicalDetails && evt.type === 'tool_result' && (
                    <div className="timeline-step-detail">
                      <code style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{evt.tool_output}</code>
                    </div>
                  )}

                  {evt.type === 'error' && (
                    <div style={{ color: 'var(--accent-rose)', background: 'var(--accent-rose-bg)', border: '1px solid var(--accent-rose-border)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      <AlertTriangle size={14} style={{ display: 'inline', marginRight: '4px' }} />
                      {evt.content}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>

          {/* Technical Details Toggle */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-tertiary)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              {showTechnicalDetails ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {showTechnicalDetails ? 'Hide technical logs' : 'Show technical logs'}
            </button>
          </div>

          {/* Final Decision Box */}
          {finalDecision && (
            <div className="resolution-result-card" style={{ marginTop: '0.5rem' }}>
              <div className="resolution-result-header">
                <div className="resolution-tag" style={{ fontSize: '0.9rem' }}>
                  <CheckCircle2 size={18} color="#059669" />
                  <span>Resolution Completed</span>
                </div>
                <span className="status-pill resolved" style={{ background: 'rgba(5, 150, 105, 0.15)' }}>
                  Confidence: {((finalDecision.confidence_score || 0.95) * 100).toFixed(0)}%
                </span>
              </div>

              <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                {finalDecision.action_taken}
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                {finalDecision.reasoning}
              </div>

              <button 
                className="btn-solid-primary" 
                onClick={() => {
                  onComplete();
                  onClose();
                }}
                style={{ marginTop: '1rem', background: '#10b981' }}
              >
                <CheckCircle2 size={16} />
                <span>Done</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
