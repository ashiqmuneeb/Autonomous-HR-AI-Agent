import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Shield, 
  Sparkles, 
  ArrowRight, 
  Lock, 
  Mail, 
  KeyRound, 
  CheckCircle2, 
  UserCheck,
  Eye,
  ShieldCheck,
  Users
} from 'lucide-react';

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('admin@pulsehr.ai');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedPreset, setSelectedPreset] = useState('admin@pulsehr.ai');

  const demoAccounts = [
    {
      role: 'HR_ADMIN',
      roleLabel: 'HR Administrator',
      name: 'Sarah Chen',
      email: 'admin@pulsehr.ai',
      badge: 'Full Governance & Override Rights',
      color: 'linear-gradient(135deg, #2563eb, #6366f1)',
      icon: <ShieldCheck size={18} />
    },
    {
      role: 'SUPERVISOR',
      roleLabel: 'Shift Supervisor',
      name: 'Marcus Vance',
      email: 'supervisor@pulsehr.ai',
      badge: 'Anomaly Review & Kiosk Access',
      color: 'linear-gradient(135deg, #059669, #10b981)',
      icon: <Users size={18} />
    },
    {
      role: 'AUDITOR',
      roleLabel: 'Compliance Auditor',
      name: 'Elena Rostova',
      email: 'auditor@pulsehr.ai',
      badge: 'Read-Only Audit & PII Masking',
      color: 'linear-gradient(135deg, #d97706, #f59e0b)',
      icon: <Eye size={18} />
    },
    {
      role: 'EMPLOYEE',
      roleLabel: 'Staff Member',
      name: 'Alex Mercer',
      email: 'alex@pulsehr.ai',
      badge: 'Self-Service Attendance View',
      color: 'linear-gradient(135deg, #7c3aed, #a855f7)',
      icon: <UserCheck size={18} />
    }
  ];

  const handleSelectPreset = (acc) => {
    setSelectedPreset(acc.email);
    setEmail(acc.email);
    setPassword('••••••••••••');
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const matchedAccount = demoAccounts.find(a => a.email.toLowerCase() === email.toLowerCase()) || {
      role: 'HR_ADMIN',
      roleLabel: 'HR Administrator',
      name: email.split('@')[0] || 'Executive User',
      email: email,
      badge: 'Custom Authenticated Session',
      color: 'linear-gradient(135deg, #2563eb, #6366f1)'
    };

    onLogin(matchedAccount);
  };

  return (
    <div className="login-screen-wrapper">
      <div className="login-card-container">
        {/* Brand Header */}
        <div className="login-brand-header">
          <div className="brand-logo-icon" style={{ width: 54, height: 54, background: 'transparent', boxShadow: 'none' }}>
            <img src="/logo.svg" alt="PulseHR" style={{ width: 54, height: 54, borderRadius: 14 }} />
          </div>
          <div className="login-titles">
            <h2>PulseHR</h2>
            <span className="brand-badge">AUTONOMOUS WORKFORCE AI</span>
          </div>
          <p className="login-subtitle">
            Sign in to access the multi-signal workforce intelligence & attendance platform.
          </p>
        </div>

        {/* 1-Click Demo User Presets */}
        <div className="login-presets-section">
          <div className="login-section-label">
            <span>Select Demo Persona (1-Click Login):</span>
          </div>

          <div className="presets-grid">
            {demoAccounts.map((acc) => {
              const isSelected = selectedPreset === acc.email;
              const initials = acc.name ? acc.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'EM';

              return (
                <div 
                  key={acc.email}
                  className={`preset-user-card ${isSelected ? 'active' : ''}`}
                  onClick={() => handleSelectPreset(acc)}
                >
                  <div className="preset-user-avatar" style={{ background: acc.color }}>
                    {initials}
                  </div>
                  <div className="preset-user-details">
                    <div className="preset-name-row">
                      <span className="preset-user-name">{acc.name}</span>
                      <span className="preset-role-pill">{acc.roleLabel}</span>
                    </div>
                    <div className="preset-user-email">{acc.email}</div>
                    <div className="preset-user-badge">{acc.badge}</div>
                  </div>
                  {isSelected && (
                    <div className="preset-selected-check">
                      <CheckCircle2 size={16} color="var(--primary)" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Traditional Credentials Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-input-group">
            <label>Corporate Email Address</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSelectedPreset(e.target.value);
                }}
                placeholder="name@company.ai"
                className="global-search-input"
                required
              />
            </div>
          </div>

          <div className="form-input-group">
            <label>Security Key / Password</label>
            <div className="input-with-icon">
              <KeyRound size={16} className="input-icon" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="global-search-input"
                required
              />
            </div>
          </div>

          <button type="submit" className="login-submit-btn">
            <span>Authenticate & Launch Workspace</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Footer Security Badges */}
        <div className="login-footer">
          <div className="system-health-pill" style={{ justifyContent: 'center' }}>
            <span className="pulse-indicator"></span>
            <Sparkles size={13} />
            <span>LangGraph Reasoning Engine • SQLite WAL Mode Secure</span>
          </div>
        </div>
      </div>
    </div>
  );
}
