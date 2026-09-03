import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Command, 
  ArrowRight, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  Camera, 
  FileText, 
  BarChart3, 
  Shield, 
  Eye, 
  EyeOff, 
  Sun, 
  Moon, 
  Palette, 
  UserPlus, 
  LogOut,
  Users
} from 'lucide-react';

export default function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  onToggleTheme,
  theme,
  onToggleMaskPII,
  maskPII,
  onRoleChange,
  activeRole,
  onAccentChange,
  activeAccent,
  onQuickAction,
  onLogout
}) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const actions = [
    // Navigation
    { id: 'nav-anomalies', category: 'Navigation', icon: <ShieldAlert size={16} color="var(--accent-rose)" />, title: 'Go to Attendance Discrepancies', shortcut: 'G A', perform: () => onNavigate('anomalies') },
    { id: 'nav-kiosk', category: 'Navigation', icon: <Clock size={16} color="var(--primary)" />, title: 'Go to Clock-In Terminal & Simulator', shortcut: 'G K', perform: () => onNavigate('kiosk') },
    { id: 'nav-ledger', category: 'Navigation', icon: <Users size={16} color="var(--accent-green)" />, title: 'Go to Attendance Ledger & Roster', shortcut: 'G L', perform: () => onNavigate('ledger') },
    { id: 'nav-cameras', category: 'Navigation', icon: <Camera size={16} color="var(--accent-cyan)" />, title: 'Go to Gate Vision & LPR Feeds', shortcut: 'G C', perform: () => onNavigate('cameras') },
    { id: 'nav-policies', category: 'Navigation', icon: <FileText size={16} color="var(--ai-indigo)" />, title: 'Go to Company Policies & Guardrails', shortcut: 'G P', perform: () => onNavigate('policies') },
    { id: 'nav-analytics', category: 'Navigation', icon: <BarChart3 size={16} color="var(--accent-amber)" />, title: 'Go to Executive Performance & Parity', shortcut: 'G E', perform: () => onNavigate('analytics') },

    // Quick Actions
    { id: 'act-clockin', category: 'Quick Action', icon: <Clock size={16} color="var(--primary)" />, title: 'Simulate Staff Clock-In Punch', shortcut: 'N C', perform: () => onQuickAction('clockin') },
    { id: 'act-addemp', category: 'Quick Action', icon: <UserPlus size={16} color="var(--accent-green)" />, title: 'Register New Employee Dossier', shortcut: 'N E', perform: () => onQuickAction('add-employee') },
    { id: 'act-mask', category: 'Privacy & Security', icon: maskPII ? <Eye size={16} color="var(--accent-cyan)" /> : <EyeOff size={16} color="var(--accent-amber)" />, title: maskPII ? 'Unmask PII (Show raw plates & GPS)' : 'Mask PII (Blur plates & GPS for compliance)', shortcut: '⌘ P', perform: onToggleMaskPII },
    { id: 'act-theme', category: 'System Appearance', icon: theme === 'dark' ? <Sun size={16} color="#f59e0b" /> : <Moon size={16} color="#818cf8" />, title: `Switch to ${theme === 'dark' ? 'Executive Light' : 'Cyber Dark'} Mode`, shortcut: '⌘ T', perform: onToggleTheme },

    // Cyber Accents
    { id: 'acc-cobalt', category: 'Cyber Accents', icon: <Palette size={16} color="#3b82f6" />, title: 'Theme Accent: Cyber Cobalt (Blue)', perform: () => onAccentChange('cobalt') },
    { id: 'acc-emerald', category: 'Cyber Accents', icon: <Palette size={16} color="#10b981" />, title: 'Theme Accent: Emerald SOC (Green)', perform: () => onAccentChange('emerald') },
    { id: 'acc-violet', category: 'Cyber Accents', icon: <Palette size={16} color="#8b5cf6" />, title: 'Theme Accent: Quantum Violet (Purple)', perform: () => onAccentChange('violet') },
    { id: 'acc-amber', category: 'Cyber Accents', icon: <Palette size={16} color="#f59e0b" />, title: 'Theme Accent: Amber Industrial (Orange)', perform: () => onAccentChange('amber') },

    // RBAC Roles
    { id: 'role-admin', category: 'RBAC Persona', icon: <Shield size={16} color="#3b82f6" />, title: 'Switch Session to: 👑 HR Administrator (Full)', perform: () => onRoleChange('HR_ADMIN') },
    { id: 'role-sup', category: 'RBAC Persona', icon: <Shield size={16} color="#10b981" />, title: 'Switch Session to: 🛡️ Shift Supervisor', perform: () => onRoleChange('SUPERVISOR') },
    { id: 'role-auditor', category: 'RBAC Persona', icon: <Eye size={16} color="#f59e0b" />, title: 'Switch Session to: 👁️ Compliance Auditor (Read-Only)', perform: () => onRoleChange('AUDITOR') },
    { id: 'role-staff', category: 'RBAC Persona', icon: <Users size={16} color="#8b5cf6" />, title: 'Switch Session to: 👤 Staff Member (Self-Service)', perform: () => onRoleChange('EMPLOYEE') },

    // Auth
    { id: 'act-logout', category: 'Account Session', icon: <LogOut size={16} color="var(--accent-rose)" />, title: 'Sign Out of PulseHR Workspace', perform: onLogout }
  ];

  const filteredActions = actions.filter(item => {
    if (!search) return true;
    const q = search.toLowerCase();
    return item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filteredActions.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredActions.length) % (filteredActions.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredActions[selectedIndex]) {
          filteredActions[selectedIndex].perform();
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredActions]);

  if (!isOpen) return null;

  return (
    <div className="clean-modal-backdrop" onClick={onClose}>
      <div className="command-palette-card" onClick={(e) => e.stopPropagation()}>
        {/* Search Header */}
        <div className="command-search-header">
          <Search size={18} className="command-search-icon" />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Type a command, jump to tab, or switch cyber theme... (Esc to close)" 
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            className="command-search-input"
          />
          <span className="command-esc-badge">ESC</span>
        </div>

        {/* Results List */}
        <div className="command-results-list">
          {filteredActions.length === 0 ? (
            <div className="command-empty-state">
              No matching commands or actions found for "{search}".
            </div>
          ) : (
            filteredActions.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div 
                  key={item.id}
                  className={`command-item-row ${isSelected ? 'active' : ''}`}
                  onClick={() => {
                    item.perform();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="command-item-icon">{item.icon}</div>
                  <div className="command-item-details">
                    <span className="command-item-title">{item.title}</span>
                    <span className="command-item-cat">{item.category}</span>
                  </div>
                  {item.shortcut && (
                    <span className="command-item-shortcut">{item.shortcut}</span>
                  )}
                  {isSelected && (
                    <ArrowRight size={14} className="command-select-arrow" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Palette Footer */}
        <div className="command-footer-bar">
          <div className="command-footer-tips">
            <span>Use <strong>↑↓</strong> to navigate</span>
            <span>•</span>
            <span><strong>Enter</strong> to select</span>
            <span>•</span>
            <span><strong>Esc</strong> to dismiss</span>
          </div>
          <div className="command-footer-brand">
            <span>PulseHR Command Palette</span>
          </div>
        </div>
      </div>
    </div>
  );
}
