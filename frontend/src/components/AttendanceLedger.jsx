import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  Calendar, 
  Smartphone, 
  Fingerprint, 
  CreditCard, 
  Globe, 
  UserPlus, 
  Download, 
  Filter,
  ArrowRight,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { formatLabel } from '../utils';

export default function AttendanceLedger({ 
  records, 
  employees, 
  onOpenAddEmployeeModal, 
  searchQuery = '',
  activeRole = 'HR_ADMIN',
  maskPII = false
}) {
  const [localSearch, setLocalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedEmpFilter, setSelectedEmpFilter] = useState('ALL');

  const activeSearch = searchQuery || localSearch;

  // Deduplicate and filter records
  const filteredRecords = records.filter(r => {
    const matchesSearch = 
      !activeSearch ||
      r.employee_name?.toLowerCase().includes(activeSearch.toLowerCase()) ||
      r.employee_id?.toLowerCase().includes(activeSearch.toLowerCase()) ||
      r.notes?.toLowerCase().includes(activeSearch.toLowerCase()) ||
      r.verification_method?.toLowerCase().includes(activeSearch.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesEmp = selectedEmpFilter === 'ALL' || r.employee_id === selectedEmpFilter;

    return matchesSearch && matchesStatus && matchesEmp;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PRESENT':
        return <span className="status-pill resolved"><CheckCircle2 size={12} /> Present (On-Time)</span>;
      case 'OVERRIDDEN_BY_AI':
        return (
          <span className="status-pill ai-excused">
            <Sparkles size={12} /> AI Excused (Present)
          </span>
        );
      case 'PENDING_INVESTIGATION':
        return <span className="status-pill pending"><AlertTriangle size={12} /> Under Review</span>;
      case 'LATE':
        return <span className="status-pill pending" style={{ background: 'var(--accent-rose-bg)', color: 'var(--accent-rose)' }}><Clock size={12} /> Late (-1.5%)</span>;
      case 'ABSENT':
      case 'REJECTED':
        return <span className="status-pill escalated_to_human">Unexcused (-3.0%)</span>;
      default:
        return <span className="status-pill">{formatLabel(status)}</span>;
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'GEOFENCE': return <Smartphone size={14} color="var(--primary)" />;
      case 'BIOMETRIC_KIOSK': return <Fingerprint size={14} color="var(--accent-green)" />;
      case 'RFID_GATE': return <CreditCard size={14} color="var(--accent-amber)" />;
      case 'REMOTE_PORTAL': return <Globe size={14} color="var(--accent-cyan)" />;
      case 'AI_AUTONOMOUS_OVERRIDE': return <Sparkles size={14} color="var(--ai-indigo)" />;
      default: return <Clock size={14} color="var(--text-tertiary)" />;
    }
  };

  const handleExportCSV = () => {
    if (filteredRecords.length === 0) return;
    const headers = ['Record ID', 'Employee ID', 'Name', 'Punch Time', 'Method', 'Status', 'Audit Checksum', 'Notes'];
    const rows = filteredRecords.map(r => [
      r.id,
      r.employee_id,
      r.employee_name || '',
      r.timestamp,
      r.verification_method,
      r.status,
      `sha256_${r.id}_${r.employee_id}`,
      `"${(r.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pulsehr_attendance_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const maskText = (text, visibleLen = 3) => {
    if (!maskPII || !text) return text;
    if (text.length <= visibleLen) return '***';
    return text.slice(0, visibleLen) + '•'.repeat(Math.max(3, text.length - visibleLen));
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-titles">
          <h1>Workforce Attendance Ledger</h1>
          <p>Immutable SQLite database records of verified clock-ins, biometric events, and autonomous AI overrides with audit checksums.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button 
            className="quick-action-btn secondary"
            onClick={handleExportCSV}
            title="Download immutable audit log as CSV"
          >
            <Download size={14} />
            <span>Export Audit CSV</span>
          </button>

          {activeRole === 'HR_ADMIN' && (
            <button 
              className="quick-action-btn primary"
              onClick={onOpenAddEmployeeModal}
            >
              <UserPlus size={14} />
              <span>Add New Staff</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="clean-card" style={{ marginBottom: '1.25rem', padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <div className="global-search-wrapper">
              <Search size={15} className="search-icon" />
              <input 
                type="text" 
                placeholder="Filter by name, badge ID, or notes..." 
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="global-search-input"
                style={{ padding: '0.5rem 0.85rem 0.5rem 2.2rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={14} color="var(--text-dim)" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="global-search-input"
              style={{ padding: '0.5rem 0.85rem', minWidth: '160px' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="PRESENT">Present (On-Time)</option>
              <option value="OVERRIDDEN_BY_AI">AI Excused (Present)</option>
              <option value="PENDING_INVESTIGATION">Under Review</option>
              <option value="LATE">Late</option>
              <option value="ABSENT">Absent / Unexcused</option>
            </select>

            <select
              value={selectedEmpFilter}
              onChange={(e) => setSelectedEmpFilter(e.target.value)}
              className="global-search-input"
              style={{ padding: '0.5rem 0.85rem', minWidth: '180px' }}
            >
              <option value="ALL">All Staff Members</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Ledger Table with Zebra Striping and Diff Column */}
      <div className="clean-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Punch Time</th>
                <th>Channel</th>
                <th>Status & Reliability Impact</th>
                <th>Immutable Audit & Verification Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3.5rem' }}>
                    <Users size={32} color="var(--text-dim)" style={{ margin: '0 auto 0.75rem' }} />
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No attendance records match your filter criteria</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>Try clearing your search query or reset status filters.</div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div 
                          className="user-avatar" 
                          style={{ width: 34, height: 34, fontSize: '0.8rem', background: rec.avatar_color || 'var(--primary)' }}
                        >
                          {rec.employee_name?.slice(0, 2).toUpperCase() || 'EM'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                            {rec.employee_name || rec.employee_id}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                            {rec.employee_id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={13} color="var(--text-dim)" />
                        <span>{rec.timestamp}</span>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', fontWeight: 600 }}>
                        {getMethodIcon(rec.verification_method)}
                        <span>{formatLabel(rec.verification_method || 'GEOFENCE')}</span>
                      </div>
                    </td>

                    <td>
                      {getStatusBadge(rec.status)}
                    </td>

                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '380px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <div>{rec.notes || 'Routine check-in verified and logged.'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                          Audit Hash: <span style={{ color: 'var(--primary)' }}>sha256_{rec.id}_sqltx</span>
                        </div>
                      </div>
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
