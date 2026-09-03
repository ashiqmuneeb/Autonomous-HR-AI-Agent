import React from 'react';
import { 
  Search, 
  Sun, 
  Moon, 
  Clock, 
  UserPlus, 
  Eye, 
  EyeOff, 
  LogOut 
} from 'lucide-react';

export default function TopHeader({ 
  theme, 
  onToggleTheme, 
  searchQuery, 
  onSearchChange,
  activeTab,
  pendingCount,
  totalEmployees,
  onQuickAction,
  activeRole,
  onRoleChange,
  maskPII,
  onToggleMaskPII,
  currentUser,
  onLogout,
  onOpenCommandPalette
}) {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'anomalies': return { title: 'Attendance Issues', subtitle: 'AI checks gate cameras & GPS to fix punch errors' };
      case 'kiosk': return { title: 'Clock-In Terminal', subtitle: 'Face scan, mobile GPS & badge check-in' };
      case 'ledger': return { title: 'Team Attendance', subtitle: 'Official daily presence & verified records' };
      case 'cameras': return { title: 'Gate Cameras', subtitle: 'Live car plate reader & camera setup' };
      case 'policies': return { title: 'HR Rules & Policies', subtitle: 'Company rules that guide AI decisions' };
      case 'analytics': return { title: 'Insights & Reports', subtitle: 'Time saved and attendance accuracy' };
      default: return { title: 'HR Assistant', subtitle: 'Smart Workforce Management' };
    }
  };

  const { title, subtitle } = getTabTitle();

  const userInitial = currentUser?.name 
    ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() 
    : 'HR';

  return (
    <header className="top-header">
      {/* Title & Subtitle */}
      <div className="header-left">
        <h1 className="header-page-title">{title}</h1>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0 }}>{subtitle}</p>
      </div>

      {/* Simple Search */}
      <div className="header-center">
        <div className="global-search-wrapper" onClick={onOpenCommandPalette} style={{ cursor: 'pointer' }}>
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search employees, badge IDs, plates... (⌘K)" 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="global-search-input"
            onClick={(e) => {
              if (onOpenCommandPalette) {
                e.stopPropagation();
                onOpenCommandPalette();
              }
            }}
          />
          <button 
            className="search-shortcut-badge"
            onClick={(e) => {
              e.stopPropagation();
              onOpenCommandPalette && onOpenCommandPalette();
            }}
            title="Press ⌘K or Ctrl+K to open menu"
          >
            ⌘K
          </button>
        </div>
      </div>

      {/* Right User Controls */}
      <div className="header-right">
        {currentUser && (
          <div className="user-profile-header-pill">
            <div className="profile-avatar-small" style={{ background: currentUser.color || 'var(--primary)' }}>
              {userInitial}
            </div>
            <div className="profile-info-small">
              <span className="profile-name">{currentUser.name || 'HR User'}</span>
              <select 
                value={activeRole} 
                onChange={(e) => onRoleChange(e.target.value)}
                className="profile-role-select"
                title="Change Role"
              >
                <option value="HR_ADMIN">👑 HR Admin</option>
                <option value="SUPERVISOR">🛡️ Supervisor</option>
                <option value="AUDITOR">👁️ Auditor</option>
                <option value="EMPLOYEE">👤 Staff</option>
              </select>
            </div>
          </div>
        )}

        {/* Privacy Toggle */}
        <button 
          className={`header-icon-btn ${maskPII ? 'active-mask' : ''}`}
          onClick={onToggleMaskPII}
          title={maskPII ? "Privacy Mode ON (Plates hidden). Click to show." : "Privacy Mode OFF. Click to hide plates."}
        >
          {maskPII ? <EyeOff size={16} color="var(--accent-amber)" /> : <Eye size={16} color="var(--accent-cyan)" />}
        </button>

        {/* Theme Toggle */}
        <button 
          className="header-icon-btn theme-toggle-btn"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Quick Actions */}
        {activeRole !== 'AUDITOR' && activeRole !== 'EMPLOYEE' && (
          <div className="quick-actions-group">
            <button 
              className="quick-action-btn primary"
              onClick={() => onQuickAction('clockin')}
            >
              <Clock size={15} />
              <span>Clock In</span>
            </button>
            
            <button 
              className="quick-action-btn secondary"
              onClick={() => onQuickAction('add-employee')}
            >
              <UserPlus size={15} />
              <span>Add Staff</span>
            </button>
          </div>
        )}

        {/* Log Out */}
        {onLogout && (
          <button 
            className="header-icon-btn" 
            onClick={onLogout}
            title="Log Out"
            style={{ color: 'var(--accent-rose)' }}
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </header>
  );
}
