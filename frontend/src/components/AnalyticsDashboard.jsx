import React from 'react';
import { 
  BarChart3, 
  Sparkles, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  TrendingUp
} from 'lucide-react';
import { formatLabel } from '../utils';

export default function AnalyticsDashboard({ analytics }) {
  if (!analytics || !analytics.kpis) {
    return (
      <div className="clean-card" style={{ textAlign: 'center', padding: '3rem' }}>
        Loading dashboard metrics...
      </div>
    );
  }

  const { kpis, typeBreakdown, auditLogs } = analytics;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-titles">
          <h1>Overview & Performance</h1>
          <p>Key metrics showing how the AI agent is managing attendance discrepancies and saving administrative time.</p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-row">
        <div className="kpi-box">
          <div className="kpi-icon" style={{ background: 'var(--accent-green-bg)', color: '#10b981' }}>
            <Sparkles size={24} />
          </div>
          <div>
            <div className="kpi-number" style={{ color: '#10b981' }}>{kpis.autonomousRate}</div>
            <div className="kpi-desc">Resolved Automatically</div>
          </div>
        </div>

        <div className="kpi-box">
          <div className="kpi-icon" style={{ background: 'var(--primary-light)', color: '#818cf8' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="kpi-number" style={{ color: '#818cf8' }}>{kpis.hoursSaved}</div>
            <div className="kpi-desc">Admin Hours Saved</div>
          </div>
        </div>

        <div className="kpi-box">
          <div className="kpi-icon" style={{ background: 'rgba(6, 182, 212, 0.12)', color: '#06b6d4' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div className="kpi-number" style={{ color: '#06b6d4' }}>{kpis.costSavings}</div>
            <div className="kpi-desc">Est. Cost Savings</div>
          </div>
        </div>

        <div className="kpi-box">
          <div className="kpi-icon" style={{ background: 'var(--accent-amber-bg)', color: '#f59e0b' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="kpi-number">{kpis.avgResolutionSeconds}</div>
            <div className="kpi-desc">Avg. Response Time</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem', marginBottom: '1.75rem' }}>
        {/* Issue Breakdown */}
        <div className="clean-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={16} color="#f59e0b" />
            Issues by Category
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {typeBreakdown.map((item) => {
              const total = kpis.totalAnomalies || 1;
              const pct = ((item.count / total) * 100).toFixed(0);

              return (
                <div key={item.anomaly_type}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                      {formatLabel(item.anomaly_type)}
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.count} ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        width: `${pct}%`, 
                        height: '100%', 
                        background: 'linear-gradient(90deg, #2563eb, #0284c7)',
                        borderRadius: '3px'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Breakdown Box */}
        <div className="clean-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.6rem', color: 'var(--primary)' }}>
              How the AI Agent Works
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              When an employee clocks in with a discrepancy (such as a GPS offset or missing punch), the AI agent cross-checks gate cameras, historical attendance, and company policy rules to verify presence without human intervention.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', padding: '0.85rem', borderRadius: '8px', borderLeft: '3px solid #059669' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Auto-Resolved</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#059669', marginTop: '0.2rem' }}>{kpis.resolvedAnomalies}</div>
            </div>
            <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', padding: '0.85rem', borderRadius: '8px', borderLeft: '3px solid #d97706' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Pending Check</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#d97706', marginTop: '0.2rem' }}>{kpis.pendingAnomalies}</div>
            </div>
            <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', padding: '0.85rem', borderRadius: '8px', borderLeft: '3px solid #e11d48' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Sent to Manager</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#e11d48', marginTop: '0.2rem' }}>{kpis.escalatedAnomalies}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="clean-card">
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} color="var(--primary)" />
          Recent Activity & AI Actions
        </h3>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Employee</th>
                <th>Action Taken</th>
                <th>Evidence / Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    No recent activity logged yet.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                      {log.timestamp?.replace('T', ' ').slice(0, 19)}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{log.employee_name || log.employee_id}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--primary)' }}>{log.department || 'Operations'}</div>
                    </td>
                    <td>
                      <span className="status-pill resolved" style={{ background: 'var(--primary-light)', color: 'var(--primary)', borderColor: 'var(--primary-border)' }}>
                        {log.action_taken}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '380px', lineHeight: 1.4 }}>
                      {log.reasoning}
                    </td>
                    <td>
                      {log.requires_human_followup ? (
                        <span className="status-pill escalated_to_human">Manager Review</span>
                      ) : (
                        <span className="status-pill resolved">Automatic</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
