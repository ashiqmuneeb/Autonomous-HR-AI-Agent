import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  ShieldAlert, 
  UserCheck, 
  XCircle, 
  Car, 
  FileText, 
  ArrowRight, 
  MapPin, 
  Eye, 
  Search, 
  Filter, 
  FileCheck, 
  RotateCcw, 
  Download, 
  Shield, 
  ShieldCheck,
  AlertCircle,
  Lock,
  LayoutGrid,
  List,
  ChevronDown,
  ChevronUp,
  Printer
} from 'lucide-react';
import { formatLabel } from '../utils';

export default function AnomalyFeed({ 
  anomalies, 
  onResolveStream, 
  onHitlDecision, 
  onOpenDetailModal, 
  loadingEventId,
  searchQuery = '',
  activeRole = 'HR_ADMIN',
  maskPII = false,
  onShowToast
}) {
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'dense'
  const [expandedReasoning, setExpandedReasoning] = useState({}); // { [anoId]: boolean }

  const toggleReasoning = (id) => {
    setExpandedReasoning(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredAnomalies = (anomalies || []).filter(a => {
    if (filter === 'pending' && a.status !== 'pending') return false;
    if (filter === 'escalated' && a.status !== 'escalated_to_human') return false;
    if (filter === 'resolved' && a.status !== 'resolved' && a.status !== 'rejected') return false;
    if (filter === 'rejected' && a.status !== 'rejected') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = a.employee_name?.toLowerCase().includes(q);
      const matchId = a.employee_id?.toLowerCase().includes(q);
      const matchType = a.anomaly_type?.toLowerCase().includes(q);
      const matchDept = a.department?.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchType && !matchDept) return false;
    }

    return true;
  });

  const getInitials = (name) => {
    if (!name) return 'EM';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getSeverityBadge = (type) => {
    switch (type) {
      case 'GEOFENCE_MISMATCH':
        return { label: 'Location Delta', color: 'var(--accent-amber)', ribbon: 'ribbon-amber' };
      case 'GATE_CAMERA_MISMATCH':
        return { label: 'Vehicle LPR Discrepancy', color: 'var(--accent-cyan)', ribbon: 'ribbon-cyan' };
      case 'TIME_DISCREPANCY':
      case 'POLICY_VIOLATION':
        return { label: 'Policy Exception', color: 'var(--accent-rose)', ribbon: 'ribbon-rose' };
      default:
        return { label: 'Attendance Flag', color: 'var(--primary)', ribbon: 'ribbon-blue' };
    }
  };

  const maskText = (text, visibleLen = 3) => {
    if (!maskPII || !text) return text;
    if (text.length <= visibleLen) return '***';
    return text.slice(0, visibleLen) + '•'.repeat(Math.max(3, text.length - visibleLen));
  };

  const handlePrintDossier = (ano) => {
    window.print();
    if (onShowToast) {
      onShowToast({
        type: 'info',
        title: 'Compliance Memorandum Generated',
        message: `Print dialogue dispatched for incident #${ano.id} (${ano.employee_name}).`
      });
    }
  };

  const handleExportDossier = (ano) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(ano, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pulsehr_dossier_${ano.id}_${ano.employee_id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    if (onShowToast) {
      onShowToast({
        type: 'success',
        title: 'Dossier Exported',
        message: `Complete immutable audit package downloaded for Case #${ano.id}.`
      });
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-titles">
          <h1>Attendance Issues & Autonomous Resolutions</h1>
          <p>The AI automatically cross-checks gate cameras and GPS data to resolve punch errors using company policies.</p>
        </div>

        {/* View Mode & Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Filter Pills */}
          <div className="filter-tabs-row">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({anomalies?.length || 0})
            </button>
            <button 
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending ({anomalies?.filter(a => a.status === 'pending').length || 0})
            </button>
            <button 
              className={`filter-btn ${filter === 'escalated' ? 'active' : ''}`}
              onClick={() => setFilter('escalated')}
            >
              Needs Review ({anomalies?.filter(a => a.status === 'escalated_to_human').length || 0})
            </button>
            <button 
              className={`filter-btn ${filter === 'resolved' ? 'active' : ''}`}
              onClick={() => setFilter('resolved')}
            >
              Resolved ({anomalies?.filter(a => a.status === 'resolved' || a.status === 'rejected').length || 0})
            </button>
          </div>

          {/* View Mode Switcher (Cards vs Dense Table) */}
          <div className="view-mode-toggle-group">
            <button 
              className={`view-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Card Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button 
              className={`view-toggle-btn ${viewMode === 'dense' ? 'active' : ''}`}
              onClick={() => setViewMode('dense')}
              title="Dense Table View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* DENSE TABLE VIEW */}
      {viewMode === 'dense' ? (
        <div className="clean-card table-wrapper" style={{ padding: 0 }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Incident ID</th>
                <th>Employee</th>
                <th>Discrepancy Type</th>
                <th>Punch Time</th>
                <th>Sensor Evidence</th>
                <th>Status</th>
                <th>AI Verdict / Resolution</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAnomalies.map((ano) => {
                const severity = getSeverityBadge(ano.anomaly_type);
                const isPending = ano.status === 'pending';
                const isEscalated = ano.status === 'escalated_to_human';
                const isResolved = ano.status === 'resolved';

                return (
                  <tr key={ano.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>#{ano.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div className="user-avatar" style={{ width: 28, height: 28, fontSize: '0.72rem', background: 'var(--primary)' }}>
                          {getInitials(ano.employee_name)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{ano.employee_name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{ano.employee_id} • {ano.department}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="guardrail-chip pass" style={{ fontSize: '0.72rem' }}>
                        {formatLabel(ano.anomaly_type)}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{ano.timestamp || '08:30 AM'}</td>
                    <td>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {ano.simulated_distance_m ? `${ano.simulated_distance_m}m GPS drift` : 'Campus Zone'}
                        {ano.gate_event_simulated ? ' • Plate 99%' : ' • No LPR'}
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${ano.status}`}>
                        {ano.status === 'escalated_to_human' ? 'Needs Review' : formatLabel(ano.status)}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.78rem', color: isResolved ? 'var(--accent-green)' : 'var(--text-tertiary)', maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ano.ai_resolution_reason || ano.notes || 'Awaiting automated agent triage...'}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        {isPending && activeRole !== 'AUDITOR' && (
                          <button 
                            className="quick-action-btn primary" 
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                            onClick={() => onResolveStream(ano)}
                          >
                            <Sparkles size={12} />
                            <span>Resolve</span>
                          </button>
                        )}
                        <button 
                          className="header-icon-btn" 
                          style={{ width: 28, height: 28 }}
                          onClick={() => onOpenDetailModal(ano)}
                          title="View Full Dossier"
                        >
                          <Eye size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* CARDS GRID VIEW */
        <div className="cards-grid">
          {filteredAnomalies.map((ano) => {
            const severity = getSeverityBadge(ano.anomaly_type);
            const isPending = ano.status === 'pending';
            const isEscalated = ano.status === 'escalated_to_human';
            const isResolved = ano.status === 'resolved';
            const isRejected = ano.status === 'rejected';
            const occurrenceCount = ano.occurrence_count || (ano.employee_id === 'EMP-102' ? 2 : 1);
            const isGuardrailTripped = occurrenceCount > 2;
            const isExpanded = !!expandedReasoning[ano.id];

            return (
              <div key={ano.id} className="clean-card discrepancy-card">
                {/* Visual Corner Status Ribbon */}
                <div className={`card-corner-ribbon ${severity.ribbon}`}></div>

                {/* Card Top Row */}
                <div className="card-top-row">
                  <div className="user-badge-group">
                    <div className="user-avatar" style={{ background: 'var(--primary)' }}>
                      {getInitials(ano.employee_name)}
                    </div>
                    <div className="user-info">
                      <h3>{ano.employee_name}</h3>
                      <p>{ano.department || 'Engineering'} • {ano.employee_id}</p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span className={`status-pill ${ano.status}`}>
                      {ano.status === 'escalated_to_human' ? 'Needs Review' : isResolved ? 'AI Excused (Present)' : formatLabel(ano.status)}
                    </span>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
                      #{ano.id}
                    </div>
                  </div>
                </div>

                {/* Guardrail Quota Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0.65rem 0' }}>
                  <span className={`guardrail-chip ${isGuardrailTripped ? 'danger' : occurrenceCount === 2 ? 'warn' : 'pass'}`}>
                    {isGuardrailTripped ? (
                      <>
                        <AlertCircle size={11} />
                        <span>Occurrence #{occurrenceCount} (Quota Exceeded ➔ Requires Sign-Off)</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={11} />
                        <span>Occurrence #{occurrenceCount} of 2 (Auto-Eligible)</span>
                      </>
                    )}
                  </span>

                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                    Reliability: <strong>{ano.reliability_score || 98.5}%</strong>
                  </span>
                </div>

                {/* Structured 2x2 Telemetry Grid */}
                <div className="card-metrics-grid">
                  <div className="metric-item">
                    <span className="metric-label">Issue Flag</span>
                    <span className="metric-val" style={{ color: severity.color }}>
                      {formatLabel(ano.anomaly_type)}
                    </span>
                  </div>

                  <div className="metric-item">
                    <span className="metric-label">Punch Time</span>
                    <span className="metric-val">
                      <Clock size={13} color="var(--text-dim)" />
                      {ano.timestamp || '08:30 AM'}
                    </span>
                  </div>

                  <div className="metric-item">
                    <span className="metric-label">GPS Telemetry</span>
                    <span className={`metric-val ${maskPII ? 'pii-masked' : ''}`}>
                      <MapPin size={13} color="var(--accent-amber)" />
                      {ano.simulated_distance_m ? `${ano.simulated_distance_m}m Outside` : 'Campus Zone'}
                    </span>
                  </div>

                  <div className="metric-item">
                    <span className="metric-label">Gate Camera OCR</span>
                    <span className={`metric-val ${maskPII ? 'pii-masked' : ''}`}>
                      <Car size={13} color="var(--accent-cyan)" />
                      {ano.gate_event_simulated ? 'Plate Confirmed (99%)' : 'No OCR Read'}
                    </span>
                  </div>
                </div>

                {/* Prominent AI Verdict Box */}
                <div className="reasoning-subfield" style={{ background: isResolved ? 'var(--accent-green-bg)' : 'var(--bg-card-subtle)', borderColor: isResolved ? 'var(--accent-green-border)' : 'var(--border-subtle)', margin: '0.65rem 0' }}>
                  <div className="reasoning-subfield-title" style={{ color: isResolved ? 'var(--accent-green)' : 'var(--text-primary)' }}>
                    <Sparkles size={12} />
                    <span>AI Verdict & Governance Action</span>
                  </div>
                  <div className="reasoning-subfield-content" style={{ color: isResolved ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {ano.ai_resolution_reason || (isPending ? 'Multi-signal investigation standing by. Click "Resolve with AI" below.' : ano.notes)}
                  </div>
                </div>

                {/* Collapsible Sensor & Policy Accordion */}
                <div className="reasoning-accordion-toggle" onClick={() => toggleReasoning(ano.id)}>
                  <span>{isExpanded ? 'Hide Sensor Evidence & Rule Drilldown' : 'Inspect Correlated Sensor Evidence & Rule Drilldown'}</span>
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>

                {isExpanded && (
                  <div className="reasoning-structured-box" style={{ marginTop: '0.5rem' }}>
                    <div className="reasoning-subfield">
                      <div className="reasoning-subfield-title">
                        <Search size={12} color="var(--accent-cyan)" />
                        <span>1. Sensor Evidence Correlated</span>
                      </div>
                      <div className="reasoning-subfield-content">
                        {ano.gate_event_simulated 
                          ? `Optical LPR (Main Gate #1) matched vehicle plate ${maskText(ano.simulated_plate || 'NY-99-DC-1099')} with 99.4% optical confidence within 15 min window.`
                          : 'No matching vehicle plate detected at campus entrance cameras.'}
                      </div>
                    </div>

                    <div className="reasoning-subfield">
                      <div className="reasoning-subfield-title">
                        <FileCheck size={12} color="var(--ai-indigo)" />
                        <span>2. Policy Rule Cited</span>
                      </div>
                      <div className="reasoning-subfield-content">
                        <strong>POL-ATT-04 (Traffic & Gate Verification):</strong> Auto-excuse geofence breach if optical camera confirms campus arrival within 15 mins.
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions Footer */}
                <div className="card-actions">
                  {isPending && activeRole !== 'AUDITOR' && (
                    <button 
                      className="card-btn resolve-ai"
                      onClick={() => onResolveStream(ano)}
                      disabled={loadingEventId === ano.id}
                    >
                      <Sparkles size={15} />
                      <span>{loadingEventId === ano.id ? 'Agent Triaging...' : 'Resolve with AI'}</span>
                    </button>
                  )}

                  {isEscalated && activeRole !== 'AUDITOR' && (
                    <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                      <button 
                        className="card-btn"
                        style={{ background: 'var(--accent-green)', color: '#ffffff' }}
                        onClick={() => onHitlDecision(ano.id, 'APPROVE', 'Manager manual override approved')}
                      >
                        <CheckCircle2 size={14} />
                        <span>Approve</span>
                      </button>
                      <button 
                        className="card-btn"
                        style={{ background: 'var(--accent-rose)', color: '#ffffff' }}
                        onClick={() => onHitlDecision(ano.id, 'REJECT', 'Discrepancy rejected — quota breach')}
                      >
                        <XCircle size={14} />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}

                  <button 
                    className="card-btn view-details"
                    onClick={() => onOpenDetailModal(ano)}
                  >
                    <Eye size={14} />
                    <span>Evidence Dossier</span>
                  </button>

                  <button 
                    className="header-icon-btn"
                    onClick={() => handlePrintDossier(ano)}
                    title="Print HR Compliance Memorandum"
                    style={{ width: 36, height: 36 }}
                  >
                    <Printer size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
