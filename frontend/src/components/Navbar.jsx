import React from 'react';
import { 
  BrainCircuit, 
  Clock, 
  Users, 
  ShieldAlert, 
  BookOpen, 
  BarChart3, 
  Camera
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, pendingCount, escalatedCount, totalEmployees }) {
  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-logo-icon">
          <BrainCircuit size={22} color="#ffffff" />
        </div>
        <div className="brand-titles">
          <h2>PulseHR</h2>
          <span className="brand-badge">AI AGENT</span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="sidebar-section">
        <div className="sidebar-label">WORKFORCE OPERATIONS</div>
        <nav className="sidebar-nav">
          <button 
            className={`sidebar-nav-item ${activeTab === 'anomalies' ? 'active' : ''}`}
            onClick={() => setActiveTab('anomalies')}
          >
            <div className="nav-icon-label">
              <ShieldAlert size={18} />
              <span>Attendance Issues</span>
            </div>
            {pendingCount > 0 && <span className="badge-pill count-alert">{pendingCount}</span>}
          </button>

          <button 
            className={`sidebar-nav-item ${activeTab === 'kiosk' ? 'active' : ''}`}
            onClick={() => setActiveTab('kiosk')}
          >
            <div className="nav-icon-label">
              <Clock size={18} />
              <span>Clock In Terminal</span>
            </div>
          </button>

          <button 
            className={`sidebar-nav-item ${activeTab === 'ledger' ? 'active' : ''}`}
            onClick={() => setActiveTab('ledger')}
          >
            <div className="nav-icon-label">
              <Users size={18} />
              <span>Team & Attendance</span>
            </div>
          </button>

          <button 
            className={`sidebar-nav-item ${activeTab === 'cameras' ? 'active' : ''}`}
            onClick={() => setActiveTab('cameras')}
          >
            <div className="nav-icon-label">
              <Camera size={18} />
              <span>Gate Cameras & Vision</span>
            </div>
          </button>
        </nav>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label">GOVERNANCE & INSIGHTS</div>
        <nav className="sidebar-nav">
          <button 
            className={`sidebar-nav-item ${activeTab === 'policies' ? 'active' : ''}`}
            onClick={() => setActiveTab('policies')}
          >
            <div className="nav-icon-label">
              <BookOpen size={18} />
              <span>Company Policies</span>
            </div>
          </button>

          <button 
            className={`sidebar-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <div className="nav-icon-label">
              <BarChart3 size={18} />
              <span>Performance</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Sidebar Footer Status */}
      <div className="sidebar-footer">
        <div className="ai-status-card">
          <div className="ai-status-indicator">
            <span className="status-dot-pulse"></span>
            <span className="ai-status-text">AI Agent Active</span>
          </div>
          <p className="ai-status-sub">Listening for check-in & gate events</p>
        </div>
      </div>
    </aside>
  );
}
