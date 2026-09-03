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
  ChevronUp,
  Clock,
  Terminal,
  Code,
  Layers,
  Check
} from 'lucide-react';
import { formatLabel } from '../utils';

export default function StreamingThoughtModal({ 
  isOpen, 
  onClose, 
  anomaly, 
  streamEvents, 
  isStreaming, 
  onComplete 
}) {
  const terminalEndRef = useRef(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let timer;
    if (isOpen && isStreaming) {
      setElapsedSeconds(0);
      timer = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, isStreaming]);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [streamEvents]);

  if (!isOpen || !anomaly) return null;

  const finalDecision = streamEvents.find(e => e.type === 'decision')?.decision;
  const toolCallsCount = streamEvents.filter(e => e.type === 'tool_call').length;

  // Determine stage progress for the visual graph
  const hasCheckedGps = streamEvents.some(e => e.tool_name === 'check_geofence_logs');
  const hasCheckedGate = streamEvents.some(e => e.tool_name === 'query_lpr_events');
  const hasCheckedPolicy = streamEvents.some(e => e.tool_name === 'search_hr_policy');
  const hasCompleted = !isStreaming && (finalDecision || streamEvents.length > 0);

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
        case 'override_attendance_record': return 'Executing autonomous attendance override in SQLite...';
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
              width: '38px', 
              height: '38px', 
              borderRadius: '8px', 
              background: 'var(--ai-indigo-bg)', 
              border: '1px solid var(--ai-indigo-border)',
              color: 'var(--ai-indigo)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <BrainCircuit size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  LangGraph Agent Investigation
                </h3>
                {isStreaming ? (
                  <span className="status-pill pending" style={{ fontSize: '0.68rem' }}>
                    <Loader2 size={11} className="animate-spin" /> Live Stream
                  </span>
                ) : (
                  <span className="status-pill resolved" style={{ fontSize: '0.68rem' }}>
                    Completed
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '0.1rem' }}>
                Investigating: <strong>{anomaly.employee_name || anomaly.employee_id}</strong> • Issue: <strong>{formatLabel(anomaly.anomaly_type)}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              background: 'var(--bg-card-subtle)', 
              padding: '0.3rem 0.65rem', 
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-secondary)'
            }}>
              <Clock size={13} />
              <span>{elapsedSeconds}s</span>
              <span style={{ color: 'var(--border-strong)' }}>|</span>
              <span style={{ color: 'var(--primary)' }}>{toolCallsCount} Tools</span>
            </div>

            <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="modal-scrollable-body">
          {/* Visual Agent Reasoning Graph Stepper */}
          <div>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              Agent Reasoning Pipeline
            </div>
            <div className="agent-graph-stepper">
              <div className="graph-step-node completed">
                <div className="graph-node-icon"><AlertTriangle size={15} color="var(--accent-amber)" /></div>
                <div className="graph-node-label">1. Anomaly Trigger</div>
              </div>

              <div className={`graph-step-node ${hasCheckedGps ? 'completed' : isStreaming ? 'active' : ''}`}>
                <div className="graph-node-icon"><Search size={15} /></div>
                <div className="graph-node-label">2. GPS Geofence</div>
              </div>

              <div className={`graph-step-node ${hasCheckedGate ? 'completed' : hasCheckedGps && isStreaming ? 'active' : ''}`}>
                <div className="graph-node-icon"><ShieldCheck size={15} /></div>
                <div className="graph-node-label">3. Gate LPR OCR</div>
              </div>

              <div className={`graph-step-node ${hasCheckedPolicy ? 'completed' : hasCheckedGate && isStreaming ? 'active' : ''}`}>
                <div className="graph-node-icon"><Database size={15} /></div>
                <div className="graph-node-label">4. Policy RAG</div>
              </div>

              <div className={`graph-step-node ${hasCompleted ? 'completed' : ''}`}>
                <div className="graph-node-icon"><Sparkles size={15} color="#10b981" /></div>
                <div className="graph-node-label">5. Autonomous Decision</div>
              </div>
            </div>
          </div>

          {/* Terminal & Stream Events */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
                <Terminal size={14} />
                <span>Live Agent Execution Log</span>
              </div>

              <button 
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  fontSize: '0.75rem', 
                  color: 'var(--primary)', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontWeight: 600
                }}
              >
                <Code size={13} />
                <span>{showTechnicalDetails ? 'Hide JSON/SQL Payloads' : 'Inspect JSON/SQL Payloads'}</span>
                {showTechnicalDetails ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>

            <div className="streaming-terminal-box">
              {streamEvents.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-tertiary)', padding: '1rem' }}>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Connecting to LangGraph agent brain...</span>
                </div>
              ) : (
                streamEvents.map((evt, idx) => (
                  <div key={idx} className="terminal-event-row">
                    <span className={`terminal-badge ${evt.type}`}>
                      {evt.type === 'tool_call' ? evt.tool_name : evt.type}
                    </span>
                    <div className="terminal-text">
                      <div>{getFriendlyStepDescription(evt)}</div>
                      {showTechnicalDetails && (evt.arguments || evt.result) && (
                        <pre className="json-inspector-box">
                          {JSON.stringify(evt.arguments || evt.result, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={terminalEndRef} />
            </div>
          </div>

          {/* Final Decision Card */}
          {finalDecision && (
            <div style={{ 
              padding: '1.25rem', 
              borderRadius: 'var(--radius-lg)', 
              background: finalDecision.action === 'OVERRIDE_RECORD' ? 'var(--accent-green-bg)' : 'var(--accent-amber-bg)',
              border: `1px solid ${finalDecision.action === 'OVERRIDE_RECORD' ? 'var(--accent-green-border)' : 'var(--accent-amber-border)'}` 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Sparkles size={18} color={finalDecision.action === 'OVERRIDE_RECORD' ? 'var(--accent-green)' : 'var(--accent-amber)'} />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Autonomous Agent Verdict: {finalDecision.action === 'OVERRIDE_RECORD' ? 'Approved & Record Overridden' : 'Escalated for Human Review'}
                </h4>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {finalDecision.reasoning || finalDecision.explanation || 'The LangGraph agent verified all sensor evidence, correlated gate telemetry, and updated the attendance database.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
