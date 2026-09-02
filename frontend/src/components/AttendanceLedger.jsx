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
  UserPlus
} from 'lucide-react';
import { formatLabel } from '../utils';

export default function AttendanceLedger({ records, employees, onOpenAddEmployeeModal }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedEmpFilter, setSelectedEmpFilter] = useState('ALL');

  const filteredRecords = records.filter(r => {
    const matchesSearch = 
      r.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.notes?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesEmp = selectedEmpFilter === 'ALL' || r.employee_id === selectedEmpFilter;

    return matchesSearch && matchesStatus && matchesEmp;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PRESENT':
        return <span className="status-pill resolved"><CheckCircle2 size={12} /> Present</span>;
      case 'OVERRIDDEN_BY_AI':
        return <span className="status-pill resolved" style={{ background: 'var(--primary-light)', color: 'var(--primary)', borderColor: 'var(--primary-border)' }}><Sparkles size={12} /> AI Approved</span>;
      case 'PENDING_INVESTIGATION':
        return <span className="status-pill pending"><AlertTriangle size={12} /> Under Review</span>;
      case 'LATE':
        return <span className="status-pill pending" style={{ background: 'var(--accent-rose-bg)', color: 'var(--accent-rose)' }}><Clock size={12} /> Late</span>;
      case 'ABSENT':
        return <span className="status-pill escalated_to_human">Absent</span>;
      default:
        return <span className="status-pill">{formatLabel(status)}</span>;
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'GEOFENCE': return <Smartphone size={14} color="var(--primary)" />;
      case 'BIOMETRIC_KIOSK': return <Fingerprint size={14} color="var(--accent-green)" />;
      case 'RFID_GATE': return <CreditCard size={14} color="var(--accent-amber)" />;
      case 'REMOTE_PORTAL': return <Globe size={14} color="var(--primary)" />;
      case 'AI_AUTONOMOUS_OVERRIDE': return <Sparkles size={14} color="var(--primary)" />;
      default: return <Clock size={14} color="var(--text-tertiary)" />;
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-titles">
          <h1>Team & Attendance Log</h1>
          <p>Daily check-in records for all team members ({employees.length} registered employees).</p>
        </div>

        <button 
          className="btn-solid-primary"
          onClick={onOpenAddEmployeeModal}
          style={{ width: 'auto' }}
        >
          <UserPlus size={16} />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="clean-card" style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', alignItems: 'center' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-tertiary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text"
              className="clean-input"
              style={{ paddingLeft: '2.25rem' }}
              placeholder="Search by name, ID, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select 
            className="clean-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="PRESENT">Present</option>
            <option value="OVERRIDDEN_BY_AI">AI Approved</option>
            <option value="PENDING_INVESTIGATION">Under Review</option>
            <option value="LATE">Late</option>
            <option value="ABSENT">Absent</option>
          </select>

          {/* Employee Filter */}
          <select 
            className="clean-select"
            value={selectedEmpFilter}
            onChange={(e) => setSelectedEmpFilter(e.target.value)}
          >
            <option value="ALL">All Team Members ({employees.length})</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Punch Method</th>
              <th>Notes / AI Verification</th>
              <th>On-Time Record</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-tertiary)' }}>
                  No attendance records found matching filters.
                </td>
              </tr>
            ) : (
              filteredRecords.map((rec) => (
                <tr key={rec.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div 
                        className="user-avatar" 
                        style={{ background: rec.avatar_color || '#2563eb', width: '34px', height: '34px', fontSize: '0.8rem' }}
                      >
                        {rec.employee_name ? rec.employee_name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'EM'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{rec.employee_name || rec.employee_id}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{rec.employee_id} • {rec.department || 'Staff'}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                      <Calendar size={13} color="var(--text-tertiary)" />
                      {rec.date}
                    </div>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      <Clock size={13} color="var(--primary)" />
                      {rec.check_in_time}
                    </div>
                  </td>

                  <td>{getStatusBadge(rec.status)}</td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {getMethodIcon(rec.method)}
                      <span>{formatLabel(rec.method)}</span>
                    </div>
                  </td>

                  <td style={{ maxWidth: '320px', color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.4 }}>
                    {rec.notes || 'Normal check-in'}
                  </td>

                  <td>
                    <span style={{ 
                      fontWeight: 600, 
                      fontSize: '0.82rem',
                      color: (rec.reliability_score || 95) >= 90 ? 'var(--accent-green)' : 'var(--accent-rose)' 
                    }}>
                      {rec.reliability_score || 95}%
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
