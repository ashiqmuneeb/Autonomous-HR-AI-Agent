import React, { useState } from 'react';
import axios from 'axios';
import { X, FileText, CheckCircle2 } from 'lucide-react';

export default function PolicyModal({ isOpen, onClose, onPolicyAdded }) {
  const [category, setCategory] = useState('GEOFENCE');
  const [title, setTitle] = useState('');
  const [policyText, setPolicyText] = useState('');
  const [actionGuidance, setActionGuidance] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !policyText || !actionGuidance) return;
    setLoading(true);

    try {
      await axios.post('http://localhost:5000/api/policies', {
        category,
        title,
        policy_text: policyText,
        action_guidance: actionGuidance
      });

      setTitle('');
      setPolicyText('');
      setActionGuidance('');
      onClose();
      onPolicyAdded();
    } catch (error) {
      alert('Failed to save policy: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="clean-modal-backdrop" onClick={onClose}>
      <div className="clean-modal-card" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        <div className="clean-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileText size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Add Company Policy
            </h3>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="clean-modal-body">
            <div className="form-field">
              <label>Category</label>
              <select className="clean-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="GEOFENCE">Location & GPS</option>
                <option value="LATE_ARRIVAL">Late Arrival</option>
                <option value="REMOTE_WORK">Remote Work</option>
                <option value="HARDWARE_FAIL">Scanner Issues</option>
                <option value="EMERGENCY">Emergency</option>
              </select>
            </div>

            <div className="form-field">
              <label>Policy Title</label>
              <input 
                type="text"
                className="clean-input"
                placeholder="e.g. Inclement Weather Grace Period"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label>Policy Description</label>
              <textarea 
                className="clean-textarea"
                rows="3"
                placeholder="Describe the rule and conditions..."
                value={policyText}
                onChange={(e) => setPolicyText(e.target.value)}
                required
              />
            </div>

            <div className="form-field" style={{ marginBottom: 0 }}>
              <label>AI Action Rule</label>
              <input 
                type="text"
                className="clean-input"
                placeholder="e.g. If weather emergency confirmed, auto-override late arrival to Present."
                value={actionGuidance}
                onChange={(e) => setActionGuidance(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', background: 'var(--bg-app)' }}>
            <button 
              type="button" 
              className="filter-btn" 
              onClick={onClose}
              style={{ border: '1px solid var(--border-subtle)' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-solid-primary" 
              disabled={loading}
              style={{ width: 'auto' }}
            >
              <CheckCircle2 size={16} />
              <span>{loading ? 'Saving...' : 'Save Policy'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
