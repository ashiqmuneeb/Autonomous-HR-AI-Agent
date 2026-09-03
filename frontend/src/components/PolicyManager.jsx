import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  ShieldCheck, 
  AlertCircle, 
  FileText, 
  Sparkles, 
  Layers, 
  ChevronRight,
  Shield,
  Sliders,
  Lock
} from 'lucide-react';
import PolicyModal from './PolicyModal';

export default function PolicyManager({ policies, onPolicyAdded, onShowToast, searchQuery = '', activeRole = 'HR_ADMIN' }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const [expandedPolicyId, setExpandedPolicyId] = useState(null);

  const activeSearch = searchQuery || localSearch;

  // Default baseline policies if database has only sample data
  const defaultPolicies = [
    {
      id: 'pol-1',
      policy_code: 'POL-ATT-01',
      category: 'GEOFENCE',
      title: 'GPS Geofence Breach Quota & Guardrail',
      description: 'Permits autonomous override for up to 2 geofence discrepancies per employee per quarter. Repeat offenses (3+) automatically trip guardrail and require human manager review.',
      action_rule: 'Auto-resolve if breaches <= 2 this quarter. If breach >= 3, flag as REPEAT_ANOMALY and route to Shift Supervisor.'
    },
    {
      id: 'pol-2',
      policy_code: 'POL-OCR-01',
      category: 'VISION_LPR',
      title: 'Optical LPR Confidence Floor Policy',
      description: 'Enforces a strict minimum confidence threshold of 95.0% on vehicle license plate optical recognition before allowing multi-signal autonomous attendance overrides.',
      action_rule: 'If OCR confidence >= 95.0%, verify plate match. If OCR confidence < 95.0%, suppress automated override and route to SOC security desk.'
    },
    {
      id: 'pol-3',
      policy_code: 'POL-PRIV-01',
      category: 'PRIVACY',
      title: 'Telemetry Retention & Employee Privacy',
      description: 'Mandates 30-day automatic purge of high-resolution GPS breadcrumbs and 90-day irreversible hashing of CCTV gate footage in compliance with GDPR, CCPA, and labor privacy laws.',
      action_rule: 'Auto-mask license plates and precise coordinates for non-admin viewers. Auto-purge telemetry tables on 30-day cron.'
    },
    {
      id: 'pol-4',
      policy_code: 'POL-ATT-04',
      category: 'LATE_ARRIVAL',
      title: 'Traffic & Perimeter Gate Transit Grace',
      description: 'Allows late check-in overrides if the optical perimeter camera verifies the employee vehicle entered campus gates within 15 minutes of shift start.',
      action_rule: 'Cross-reference CCTV gate log with shift schedule. If delta <= 15m, auto-override punch to Present (Excused).'
    }
  ];

  const mergedPolicies = policies && policies.length > 0 ? policies : defaultPolicies;

  const filteredPolicies = mergedPolicies.filter(p => {
    if (!activeSearch) return true;
    const q = activeSearch.toLowerCase();
    return (
      p.policy_code?.toLowerCase().includes(q) ||
      p.title?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  });

  const canEditPolicy = activeRole === 'HR_ADMIN';

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-titles">
          <h1>Company Governance Policies & Guardrails</h1>
          <p>Rulebooks, confidence thresholds, and quota guardrails referenced by the LangGraph agent to ensure fair and legally auditable decisions.</p>
        </div>

        {canEditPolicy ? (
          <button 
            className="quick-action-btn primary"
            onClick={() => setModalOpen(true)}
          >
            <Plus size={15} />
            <span>Add Corporate Policy</span>
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-dim)', background: 'var(--bg-card-subtle)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <Lock size={13} />
            <span>Policy Editing Restricted to HR Administrator</span>
          </div>
        )}
      </div>

      {/* Policy Grid with Consistent Card Heights */}
      <div className="cards-grid">
        {filteredPolicies.map((pol) => {
          const isExpanded = expandedPolicyId === pol.id;

          return (
            <div key={pol.id} className="clean-card" style={{ display: 'flex', flexDirection: 'column', minHeight: '300px' }}>
              <div className="card-top-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ 
                    width: '34px', 
                    height: '34px', 
                    borderRadius: '8px', 
                    background: 'var(--ai-indigo-bg)', 
                    color: 'var(--ai-indigo)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <BookOpen size={17} />
                  </div>
                  <div>
                    <span style={{ 
                      fontFamily: 'var(--font-mono)', 
                      fontSize: '0.74rem', 
                      fontWeight: 700, 
                      color: 'var(--primary)',
                      background: 'var(--primary-light)',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '4px',
                      border: '1px solid var(--primary-border)'
                    }}>
                      {pol.policy_code || `POL-ATT-${pol.id}`}
                    </span>
                  </div>
                </div>

                <span className="status-pill resolved" style={{ fontSize: '0.7rem' }}>
                  Enforced
                </span>
              </div>

              <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {pol.title}
              </h3>

              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem', flex: 1 }}>
                {pol.description}
              </p>

              <div style={{ 
                padding: '0.75rem', 
                background: 'var(--bg-card-subtle)', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--border-subtle)',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                marginTop: 'auto'
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--ai-indigo)', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Sparkles size={12} />
                  <span>AI Agent Action Rule:</span>
                </div>
                <div>{pol.action_rule || pol.rule_details || 'Cross-reference optical gate camera telemetry and waive up to 15m delay.'}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Policy Creation Modal */}
      <PolicyModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onPolicyAdded={(newPol) => {
          onPolicyAdded();
          if (onShowToast) {
            onShowToast({
              type: 'success',
              title: 'Policy Registered',
              message: `Added rule ${newPol?.policy_code || 'Corporate Policy'} to AI rulebook.`
            });
          }
        }} 
      />
    </div>
  );
}
