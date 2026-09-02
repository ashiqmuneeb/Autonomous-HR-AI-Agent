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
  ArrowRight
} from 'lucide-react';
import { formatLabel } from '../utils';

export default function AnomalyFeed({ anomalies, onResolveStream, onHitlDecision, onOpenDetailModal, loadingEventId }) {
  const [filter, setFilter] = useState('all');

  const filteredAnomalies = anomalies.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'pending') return a.status === 'pending';
    if (filter === 'escalated') return a.status === 'escalated_to_human';
    if (filter === 'resolved') return a.status === 'resolved';
    return true;
  });

  const getInitials = (name) => {
    if (!name) return 'EM';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-titles">
          <h1>Attendance Issues</h1>
          <p>Review check-in discrepancies and let the AI agent investigate and resolve them.</p>
        </div>

        {/* Filter Pills */}
        <div className="filter-tabs-row">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({anomalies.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({anomalies.filter(a => a.status === 'pending').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'escalated' ? 'active' : ''}`}
            onClick={() => setFilter('escalated')}
          >
            Needs Review ({anomalies.filter(a => a.status === 'escalated_to_human').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'resolved' ? 'active' : ''}`}
            onClick={() => setFilter('resolved')}
          >
            Resolved ({anomalies.filter(a => a.status === 'resolved').length})
          </button>
        </div>
      </div>

      {filteredAnomalies.length === 0 ? (
        <div className="clean-card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <CheckCircle2 size={40} color="var(--accent-green)" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>No issues in this queue</h3>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            All attendance punches are verified and on time.
          </p>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredAnomalies.map((ano) => (
            <div key={ano.id} className="clean-card">
              {/* Card Top Row */}
              <div className="card-top-row">
                <div className="user-badge-group">
                  <div 
                    className="user-avatar" 
                    style={{ background: ano.avatar_color || '#2563eb' }}
                  >
                    {getInitials(ano.employee_name)}
                  </div>
                  <div className="user-info">
                    <h3>{ano.employee_name || ano.employee_id}</h3>
                    <p>{ano.role || 'Staff'} • {ano.department || 'Operations'}</p>
                  </div>
                </div>

                <span className={`status-pill ${ano.status}`}>
                  {formatLabel(ano.status)}
                </span>
              </div>

              {/* Clean Data Strip */}
              <div className="info-strip">
                <div className="info-item">
                  <span className="info-label">Issue Type</span>
                  <span className="info-val" style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>
                    <AlertTriangle size={14} />
                    {formatLabel(ano.anomaly_type)}
                  </span>
                </div>

                <div className="info-item">
                  <span className="info-label">Punch Time</span>
                  <span className="info-val">
                    <Clock size={14} color="var(--text-tertiary)" />
                    {ano.timestamp}
                  </span>
                </div>

                <div className="info-item">
                  <span className="info-label">Vehicle Plate</span>
                  <span className="info-val">
                    <Car size={14} color="var(--text-tertiary)" />
                    {ano.license_plate || 'Not registered'}
                  </span>
                </div>

                <div className="info-item">
                  <span className="info-label">Attendance Rate</span>
                  <span className="info-val" style={{ color: (ano.reliability_score || 95) >= 90 ? 'var(--accent-green)' : 'var(--accent-rose)', fontWeight: 600 }}>
                    {ano.reliability_score || 95}%
                  </span>
                </div>
              </div>

              {/* Status Action Cards */}
              {ano.status === 'pending' && (
                <button 
                  className="btn-solid-primary"
                  onClick={() => onResolveStream(ano)}
                  disabled={loadingEventId === ano.id}
                >
                  <Sparkles size={16} />
                  <span>Fix with AI</span>
                </button>
              )}

              {ano.status === 'escalated_to_human' && (
                <div>
                  <div style={{ 
                    background: 'var(--accent-rose-bg)', 
                    border: '1px solid var(--accent-rose-border)', 
                    borderRadius: '8px', 
                    padding: '0.75rem',
                    marginBottom: '0.75rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-rose)', fontWeight: 600, fontSize: '0.82rem' }}>
                      <ShieldAlert size={15} />
                      <span>Manager Approval Needed</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.6rem' }}>
                    <button 
                      className="btn-approve-clean"
                      onClick={() => onHitlDecision(ano.id, 'APPROVED', 'Manager approved check-in override')}
                    >
                      <UserCheck size={14} style={{ display: 'inline', marginRight: '4px' }} />
                      Approve
                    </button>
                    <button 
                      className="btn-reject-clean"
                      onClick={() => onHitlDecision(ano.id, 'REJECTED', 'Marked as unexcused absence')}
                    >
                      <XCircle size={14} style={{ display: 'inline', marginRight: '4px' }} />
                      Reject
                    </button>
                  </div>

                  <button 
                    onClick={() => onOpenDetailModal(ano)}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      padding: '0.45rem',
                      color: 'var(--primary)',
                      fontSize: '0.78rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <FileText size={14} />
                    <span>View Evidence & Policy</span>
                  </button>
                </div>
              )}

              {ano.status === 'resolved' && (
                <div className="resolution-result-card">
                  <div className="resolution-result-header">
                    <div className="resolution-tag">
                      <CheckCircle2 size={16} color="var(--accent-green)" />
                      <span>{ano.human_action ? `Manager: ${ano.human_action}` : 'Resolved by AI'}</span>
                    </div>
                  </div>

                  {ano.agent_resolution && (
                    <>
                      <div style={{ fontSize: '0.84rem', color: 'var(--text-primary)', fontWeight: 500, marginTop: '0.25rem' }}>
                        {ano.agent_resolution.action_taken}
                      </div>

                      <button 
                        onClick={() => onOpenDetailModal(ano)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--primary)',
                          fontWeight: 500,
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          marginTop: '0.5rem',
                          padding: 0
                        }}
                      >
                        <span>View Investigation Details</span>
                        <ArrowRight size={13} />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
