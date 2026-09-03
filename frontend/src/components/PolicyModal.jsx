import React, { useState } from 'react';
import axios from 'axios';
import { X, FileText, CheckCircle2, BookOpen, Sparkles } from 'lucide-react';

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
      const res = await axios.post('http://localhost:5000/api/policies', {
        category,
        title,
        policy_text: policyText,
        action_guidance: actionGuidance
      });

      setTitle('');
      setPolicyText('');
      setActionGuidance('');
      onClose();
      onPolicyAdded(res.data);
    } catch (error) {
      alert('Failed to save policy: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="clean-modal-backdrop" onClick={onClose}>
      <div className="clean-modal-card" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        <div className="clean-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '8px', 
              background: 'var(--ai-indigo-bg)', 
              color: 'var(--ai-indigo)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <BookOpen size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Add Corporate Attendance Policy
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                Create a rule that the AI agent will query during anomaly investigations.
              </p>
            </div>
          </div>

          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-scrollable-body" style={{ gap: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>
              Policy Category
            </label>
            <select 
              className="global-search-input" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              style={{ padding: '0.65rem 0.85rem' }}
            >
              <option value="GEOFENCE">GPS & Location Exceptions</option>
              <option value="LATE_ARRIVAL">Traffic & Transit Grace Periods</option>
              <option value="REMOTE_WORK">Remote & Field Work Approvals</option>
              <option value="HARDWARE_FAIL">Gate Camera / Scanner Outage</option>
              <option value="EMERGENCY">Severe Weather & Force Majeure</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>
              Policy Title
            </label>
            <input 
              type="text"
              className="global-search-input"
              placeholder="e.g. Inclement Weather Grace Period"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ padding: '0.65rem 0.85rem' }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>
              Rule Description & Criteria
            </label>
            <textarea 
              className="global-search-input"
              rows="3"
              placeholder="Describe the condition (e.g. 'Employees delayed due to highway construction are excused if vehicle arrives at gate before 09:30 AM')..."
              value={policyText}
              onChange={(e) => setPolicyText(e.target.value)}
              style={{ padding: '0.65rem 0.85rem', minHeight: '80px', resize: 'vertical' }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>
              AI Agent Action Guidance
            </label>
            <input 
              type="text"
              className="global-search-input"
              placeholder="e.g. If gate camera verifies vehicle, auto-override late arrival to Present."
              value={actionGuidance}
              onChange={(e) => setActionGuidance(e.target.value)}
              style={{ padding: '0.65rem 0.85rem' }}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button 
              type="button" 
              className="card-btn view-details" 
              onClick={onClose}
              style={{ flex: 'none', padding: '0.6rem 1.25rem' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className={`card-btn resolve-ai ${loading ? 'btn-shimmer' : ''}`}
              style={{ flex: 'none', padding: '0.6rem 1.5rem' }}
            >
              <Sparkles size={15} />
              <span>{loading ? 'Saving Policy...' : 'Save & Publish Rule'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
