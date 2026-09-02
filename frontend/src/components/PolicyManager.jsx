import React, { useState } from 'react';
import { 
  BookOpen, 
  PlusCircle, 
  Tag, 
  CheckCircle2, 
  FileText
} from 'lucide-react';
import PolicyModal from './PolicyModal';
import { formatLabel } from '../utils';

export default function PolicyManager({ policies, onPolicyAdded }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);

  const categories = [
    { id: 'ALL', label: 'All Rules' },
    { id: 'GEOFENCE', label: 'Location & GPS' },
    { id: 'LATE_ARRIVAL', label: 'Late Arrival' },
    { id: 'REMOTE_WORK', label: 'Remote Work' },
    { id: 'HARDWARE_FAIL', label: 'Scanner Issues' },
    { id: 'EMERGENCY', label: 'Emergency' }
  ];

  const filteredPolicies = policies.filter(p => 
    selectedCategory === 'ALL' || p.category === selectedCategory
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-header-titles">
          <h1>Company Policies</h1>
          <p>Rules and guidelines that the AI agent references when resolving attendance discrepancies.</p>
        </div>

        <button 
          className="btn-solid-primary"
          onClick={() => setModalOpen(true)}
          style={{ width: 'auto' }}
        >
          <PlusCircle size={16} />
          <span>Add Policy</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="filter-tabs-row" style={{ marginBottom: '1.5rem', width: 'fit-content' }}>
        {categories.map((cat) => (
          <button 
            key={cat.id}
            className={`filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Policies Grid */}
      <div className="cards-grid">
        {filteredPolicies.map((p) => (
          <div key={p.id} className="clean-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span className="status-pill resolved" style={{ background: 'var(--primary-light)', color: 'var(--primary)', borderColor: 'var(--primary-border)' }}>
                <Tag size={11} /> {formatLabel(p.category)}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{p.id}</span>
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              {p.title}
            </h3>

            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
              {p.policy_text}
            </p>

            <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderLeft: '3px solid var(--primary)', padding: '0.65rem 0.8rem', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                AI Action Rule:
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                {p.action_guidance}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Policy Modal */}
      <PolicyModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onPolicyAdded={onPolicyAdded}
      />
    </div>
  );
}
