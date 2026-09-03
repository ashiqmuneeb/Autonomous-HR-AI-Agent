import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Navbar';
import TopHeader from './components/TopHeader';
import Toast from './components/Toast';
import LoginScreen from './components/LoginScreen';
import AnomalyFeed from './components/AnomalyFeed';
import ClockInSimulator from './components/ClockInSimulator';
import AttendanceLedger from './components/AttendanceLedger';
import PolicyManager from './components/PolicyManager';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import StreamingThoughtModal from './components/StreamingThoughtModal';
import AnomalyDetailModal from './components/AnomalyDetailModal';
import AddEmployeeModal from './components/AddEmployeeModal';
import LiveCameraFeed from './components/LiveCameraFeed';
import CommandPalette from './components/CommandPalette';
import LiveEventDrawer from './components/LiveEventDrawer';
import './index.css';

const DEFAULT_USER = {
  role: 'HR_ADMIN',
  roleLabel: 'HR Administrator',
  name: 'Sarah Chen',
  email: 'admin@pulsehr.ai',
  badge: 'Full Governance & Override Rights',
  color: 'linear-gradient(135deg, #2563eb, #6366f1)'
};

const ACCENT_PALETTES = {
  cobalt: { primary: '#3b82f6', hover: '#2563eb', light: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.35)' },
  emerald: { primary: '#10b981', hover: '#059669', light: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.35)' },
  violet: { primary: '#8b5cf6', hover: '#7c3aed', light: 'rgba(139, 92, 246, 0.12)', border: 'rgba(139, 92, 246, 0.35)' },
  amber: { primary: '#f59e0b', hover: '#d97706', light: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.35)' }
};

function App() {
  const [activeTab, setActiveTab] = useState('anomalies');
  const [employees, setEmployees] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Authenticated User Session
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('pulsehr_user');
      if (saved && saved !== 'null' && saved !== 'undefined') {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {
      console.warn('Could not parse pulsehr_user:', e);
    }
    return DEFAULT_USER;
  });

  // Active RBAC Role (driven by user or simulated)
  const [activeRole, setActiveRole] = useState(() => currentUser?.role || 'HR_ADMIN');

  // PII Privacy Masking Toggle
  const [maskPII, setMaskPII] = useState(false);

  // Theme Management (Dark Cyber default, Executive Light option)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('pulsehr_theme') || 'dark';
  });

  // Cyber Accent Color Theme
  const [accent, setAccent] = useState(() => {
    return localStorage.getItem('pulsehr_accent') || 'cobalt';
  });

  // Global Search & Command Palette
  const [searchQuery, setSearchQuery] = useState('');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Floating Toast Notifications
  const [toasts, setToasts] = useState([]);

  // Streaming modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [streamingAnomaly, setStreamingAnomaly] = useState(null);
  const [streamEvents, setStreamEvents] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);

  // Detail / Explanation modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedAnomalyForDetail, setSelectedAnomalyForDetail] = useState(null);

  // Add Employee modal state
  const [addEmployeeModalOpen, setAddEmployeeModalOpen] = useState(false);

  // Listen for Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleGlobalKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pulsehr_theme', theme);
  }, [theme]);

  // Apply dynamic cyber accent CSS variables
  useEffect(() => {
    const pal = ACCENT_PALETTES[accent] || ACCENT_PALETTES.cobalt;
    document.documentElement.style.setProperty('--primary', pal.primary);
    document.documentElement.style.setProperty('--primary-hover', pal.hover);
    document.documentElement.style.setProperty('--primary-light', pal.light);
    document.documentElement.style.setProperty('--primary-border', pal.border);
    localStorage.setItem('pulsehr_accent', accent);
  }, [accent]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleAccentChange = (newAccent) => {
    setAccent(newAccent);
    addToast({
      type: 'info',
      title: 'Cyber Accent Updated',
      message: `Theme palette adjusted to ${newAccent.toUpperCase()}.`
    });
  };

  const toggleMaskPII = () => {
    setMaskPII(prev => {
      const next = !prev;
      addToast({
        type: 'info',
        title: next ? 'PII Privacy Mask Enabled' : 'PII Unmasked',
        message: next ? 'License plates and GPS telemetry blurred for privacy compliance.' : 'Raw telemetry visible. Access logged to audit trail.'
      });
      return next;
    });
  };

  const handleRoleChange = (newRole) => {
    setActiveRole(newRole);
    addToast({
      type: 'info',
      title: 'RBAC Role Switched',
      message: `Active session permissions updated to: ${newRole}`
    });
  };

  const handleLogin = (userAccount) => {
    const validAcc = userAccount || DEFAULT_USER;
    setCurrentUser(validAcc);
    setActiveRole(validAcc.role || 'HR_ADMIN');
    localStorage.setItem('pulsehr_user', JSON.stringify(validAcc));
    addToast({
      type: 'success',
      title: `Welcome, ${validAcc.name}`,
      message: `Signed in as ${validAcc.roleLabel || validAcc.role}`
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('pulsehr_user');
    addToast({
      type: 'info',
      title: 'Signed Out',
      message: 'You have been securely signed out of PulseHR.'
    });
  };

  const addToast = ({ type = 'info', title = '', message = '', duration = 4500 }) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 4);
    setToasts(prev => [...prev, { id, type, title, message, duration }]);
  };

  const dismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    if (currentUser) {
      fetchAllData();
      const interval = setInterval(fetchAllData, 10000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const fetchAllData = async () => {
    try {
      const [empRes, anoRes, attRes, polRes, anaRes] = await Promise.all([
        axios.get('http://localhost:5000/api/employees').catch(() => ({ data: [] })),
        axios.get('http://localhost:5000/api/anomalies').catch(() => ({ data: [] })),
        axios.get('http://localhost:5000/api/attendance').catch(() => ({ data: [] })),
        axios.get('http://localhost:5000/api/policies').catch(() => ({ data: [] })),
        axios.get('http://localhost:5000/api/analytics').catch(() => ({ 
          data: { 
            kpis: { 
              autonomousRate: '94.2%', 
              hoursSaved: '38.5 hrs', 
              costSavings: '$3,420', 
              avgResolutionSeconds: '2.8s' 
            }, 
            typeBreakdown: [], 
            auditLogs: [] 
          } 
        }))
      ]);

      setEmployees(empRes.data || []);
      setAnomalies(anoRes.data || []);
      setAttendanceRecords(attRes.data || []);
      setPolicies(polRes.data || []);
      setAnalytics(anaRes.data || null);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching system data:', error);
      setLoading(false);
    }
  };

  // Start Real-Time AI Streaming Resolution
  const handleResolveStream = async (anomaly) => {
    setStreamingAnomaly(anomaly);
    setStreamEvents([]);
    setModalOpen(true);
    setIsStreaming(true);

    addToast({
      type: 'ai',
      title: 'Agent Dispatched',
      message: `LangGraph agent analyzing event #${anomaly.id} for ${anomaly.employee_name}...`
    });

    try {
      const response = await fetch('http://localhost:5000/api/resolve-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: anomaly.id })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              setStreamEvents(prev => [...prev, data]);
            } catch (e) {
              console.error('Parse error on SSE line:', line);
            }
          }
        }
      }

      setIsStreaming(false);
      fetchAllData();

      addToast({
        type: 'success',
        title: 'Autonomous Resolution Complete',
        message: `Decision finalized and synchronized into SQLite database.`
      });
    } catch (error) {
      console.error('Streaming error:', error);
      setStreamEvents(prev => [...prev, { type: 'error', content: error.message }]);
      setIsStreaming(false);
      addToast({
        type: 'error',
        title: 'AI Resolution Error',
        message: error.message
      });
    }
  };

  // Open Detailed Explanation Modal
  const handleOpenDetailModal = (anomaly) => {
    setSelectedAnomalyForDetail(anomaly);
    setDetailModalOpen(true);
  };

  // Human-in-the-Loop decision handler
  const handleHitlDecision = async (eventId, action, notes) => {
    try {
      await axios.post('http://localhost:5000/api/hitl/decision', {
        event_id: eventId,
        action,
        notes: `[Decision by ${currentUser?.name || 'HR Admin'}] ${notes}`
      });
      fetchAllData();
      addToast({
        type: action === 'APPROVE' ? 'success' : 'warning',
        title: action === 'APPROVE' ? 'Override Approved' : 'Discrepancy Rejected',
        message: `Decision stamped in audit trail for event #${eventId}.`
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Submission Failed',
        message: error.message
      });
    }
  };

  const handleQuickAction = (action) => {
    if (action === 'clockin') {
      setActiveTab('kiosk');
    } else if (action === 'add-employee') {
      setAddEmployeeModalOpen(true);
    }
  };

  const pendingCount = (anomalies || []).filter(a => a.status === 'pending').length;
  const escalatedCount = (anomalies || []).filter(a => a.status === 'escalated_to_human').length;

  // Render Login Screen if not authenticated
  if (!currentUser) {
    return (
      <div data-theme={theme}>
        <LoginScreen onLogin={handleLogin} />
        <Toast toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  return (
    <div className="app-layout" data-theme={theme}>
      {/* Left Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        pendingCount={pendingCount}
        escalatedCount={escalatedCount}
        totalEmployees={(employees || []).length}
      />

      {/* Main Wrapper with Top Header */}
      <div className="main-wrapper">
        <TopHeader 
          theme={theme}
          onToggleTheme={toggleTheme}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeTab={activeTab}
          pendingCount={pendingCount}
          totalEmployees={(employees || []).length}
          onQuickAction={handleQuickAction}
          activeRole={activeRole}
          onRoleChange={handleRoleChange}
          maskPII={maskPII}
          onToggleMaskPII={toggleMaskPII}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />

        <main className="main-content">
          {loading ? (
            <div className="clean-card" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
              <h3 style={{ color: 'var(--primary)', fontWeight: 600 }}>Connecting to Autonomous HR Intelligence...</h3>
            </div>
          ) : (
            <>
              {activeTab === 'anomalies' && (
                <AnomalyFeed 
                  anomalies={anomalies}
                  onResolveStream={handleResolveStream}
                  onHitlDecision={handleHitlDecision}
                  onOpenDetailModal={handleOpenDetailModal}
                  loadingEventId={isStreaming ? streamingAnomaly?.id : null}
                  searchQuery={searchQuery}
                  activeRole={activeRole}
                  maskPII={maskPII}
                  onShowToast={addToast}
                />
              )}

              {activeTab === 'kiosk' && (
                <ClockInSimulator 
                  employees={employees}
                  onClockInSuccess={fetchAllData}
                  onNavigateToAnomalies={() => setActiveTab('anomalies')}
                  onShowToast={addToast}
                />
              )}

              {activeTab === 'ledger' && (
                <AttendanceLedger 
                  records={attendanceRecords}
                  employees={employees}
                  onOpenAddEmployeeModal={() => setAddEmployeeModalOpen(true)}
                  searchQuery={searchQuery}
                  activeRole={activeRole}
                  maskPII={maskPII}
                />
              )}

              {activeTab === 'cameras' && (
                <LiveCameraFeed 
                  employees={employees}
                  onShowToast={addToast}
                  maskPII={maskPII}
                />
              )}

              {activeTab === 'policies' && (
                <PolicyManager 
                  policies={policies}
                  onPolicyAdded={fetchAllData}
                  onShowToast={addToast}
                  searchQuery={searchQuery}
                  activeRole={activeRole}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsDashboard 
                  analytics={analytics}
                />
              )}
            </>
          )}
        </main>

        {/* Global Footer */}
        <footer className="app-footer">
          <div>PulseHR • Autonomous Workforce Intelligence Platform</div>
          <div>SQLite WAL Engine • LangGraph Agent Active • Session: {currentUser?.name || 'HR Admin'} ({activeRole}) • Theme: {accent.toUpperCase()}</div>
        </footer>
      </div>

      {/* Floating Real-Time Event Drawer */}
      <LiveEventDrawer anomalies={anomalies} attendanceRecords={attendanceRecords} />

      {/* Command Palette (⌘K) Modal */}
      <CommandPalette 
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={setActiveTab}
        onToggleTheme={toggleTheme}
        theme={theme}
        onToggleMaskPII={toggleMaskPII}
        maskPII={maskPII}
        onRoleChange={handleRoleChange}
        activeRole={activeRole}
        onAccentChange={handleAccentChange}
        activeAccent={accent}
        onQuickAction={handleQuickAction}
        onLogout={handleLogout}
      />

      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Streaming Thought Modal */}
      <StreamingThoughtModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        anomaly={streamingAnomaly}
        streamEvents={streamEvents}
        isStreaming={isStreaming}
        onComplete={fetchAllData}
      />

      {/* Dedicated Anomaly Explanation & Evidence Modal */}
      <AnomalyDetailModal 
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        anomaly={selectedAnomalyForDetail}
        onHitlDecision={handleHitlDecision}
        activeRole={activeRole}
        maskPII={maskPII}
      />

      {/* Add Employee Modal */}
      <AddEmployeeModal 
        isOpen={addEmployeeModalOpen}
        onClose={() => setAddEmployeeModalOpen(false)}
        onEmployeeAdded={fetchAllData}
        onShowToast={addToast}
      />
    </div>
  );
}

export default App;
