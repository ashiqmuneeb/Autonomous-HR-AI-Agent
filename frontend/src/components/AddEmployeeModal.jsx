import React, { useState } from 'react';
import axios from 'axios';
import { X, UserPlus, CheckCircle2, Car, Mail, Phone, Briefcase } from 'lucide-react';

export default function AddEmployeeModal({ isOpen, onClose, onEmployeeAdded }) {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('AI Research');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [reliabilityScore, setReliabilityScore] = useState('98.0');
  const [avatarColor, setAvatarColor] = useState('#2563eb');
  const [loading, setLoading] = useState(false);

  const colors = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#e11d48', '#0284c7'];

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !department || !role) return;
    setLoading(true);

    try {
      await axios.post('http://localhost:5000/api/employees', {
        name,
        department,
        role,
        email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@company.ai`,
        phone: phone || '+1 (555) 000-0000',
        license_plate: licensePlate.toUpperCase() || 'None',
        reliability_score: parseFloat(reliabilityScore),
        avatar_color: avatarColor
      });

      setName('');
      setRole('');
      setEmail('');
      setPhone('');
      setLicensePlate('');
      onClose();
      onEmployeeAdded();
    } catch (error) {
      alert('Failed to add employee: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="clean-modal-backdrop" onClick={onClose}>
      <div className="clean-modal-card" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
        <div className="clean-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <UserPlus size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Add Team Member
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
            {/* Full Name */}
            <div className="form-field">
              <label>Full Name *</label>
              <input 
                type="text"
                className="clean-input"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Department & Role */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-field">
                <label>Department *</label>
                <select 
                  className="clean-select" 
                  value={department} 
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="AI Research">AI Research</option>
                  <option value="Product Design">Product Design</option>
                  <option value="Cloud Platform">Cloud Platform</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Global Sales">Global Sales</option>
                  <option value="Engineering">Engineering</option>
                </select>
              </div>

              <div className="form-field">
                <label>Job Title / Role *</label>
                <input 
                  type="text"
                  className="clean-input"
                  placeholder="e.g. Frontend Engineer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-field">
                <label>Work Email</label>
                <input 
                  type="email"
                  className="clean-input"
                  placeholder="name@company.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Phone Number</label>
                <input 
                  type="text"
                  className="clean-input"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {/* License Plate & Reliability */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-field">
                <label>Vehicle License Plate (Gate LPR)</label>
                <input 
                  type="text"
                  className="clean-input"
                  placeholder="e.g. KA-01-AB-1234"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Initial Attendance Score (%)</label>
                <input 
                  type="number"
                  min="0"
                  max="100"
                  className="clean-input"
                  value={reliabilityScore}
                  onChange={(e) => setReliabilityScore(e.target.value)}
                />
              </div>
            </div>

            {/* Avatar Color Picker */}
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label>Profile Accent Color</label>
              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.35rem' }}>
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setAvatarColor(c)}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: c,
                      border: avatarColor === c ? '3px solid var(--text-primary)' : '2px solid transparent',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>
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
              onClick={handleSubmit}
              className="btn-solid-primary" 
              disabled={loading}
              style={{ width: 'auto' }}
            >
              <CheckCircle2 size={16} />
              <span>{loading ? 'Adding...' : 'Save Employee'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
