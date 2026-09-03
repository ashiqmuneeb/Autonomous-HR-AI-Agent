import React, { useState } from 'react';
import axios from 'axios';
import { X, UserPlus, CheckCircle2, Car, Mail, Phone, Briefcase, ShieldCheck } from 'lucide-react';

export default function AddEmployeeModal({ isOpen, onClose, onEmployeeAdded, onShowToast }) {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('AI Research');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [reliabilityScore, setReliabilityScore] = useState('98.0');
  const [avatarColor, setAvatarColor] = useState('#2563eb');
  const [loading, setLoading] = useState(false);

  const colors = ['#2563eb', '#10b981', '#f59e0b', '#7c3aed', '#f43f5e', '#06b6d4'];

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

      if (onShowToast) {
        onShowToast({
          type: 'success',
          title: 'Employee Registered',
          message: `${name} (${role}) added to active workforce.`
        });
      }
    } catch (error) {
      if (onShowToast) {
        onShowToast({
          type: 'error',
          title: 'Registration Error',
          message: error.message
        });
      } else {
        alert('Failed to add employee: ' + error.message);
      }
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
              background: 'var(--primary-light)', 
              color: 'var(--primary)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <UserPlus size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Onboard New Team Member
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                Register employee details, vehicle license plate, and attendance parameters.
              </p>
            </div>
          </div>

          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-scrollable-body" style={{ gap: '1.25rem' }}>
          {/* Full Name */}
          <div>
            <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>
              Full Name *
            </label>
            <input 
              type="text"
              className="global-search-input"
              placeholder="e.g. Marcus Vance"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Department & Role */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>
                Department *
              </label>
              <select 
                className="global-search-input" 
                value={department} 
                onChange={(e) => setDepartment(e.target.value)}
                style={{ padding: '0.65rem 0.85rem' }}
              >
                <option value="AI Research">AI Research</option>
                <option value="Product Design">Product Design</option>
                <option value="Cloud Platform">Cloud Platform</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Global Sales">Global Sales</option>
                <option value="Engineering">Engineering</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>
                Job Role / Title *
              </label>
              <input 
                type="text"
                className="global-search-input"
                placeholder="e.g. Lead Robotics Engineer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>
                Corporate Email
              </label>
              <input 
                type="email"
                className="global-search-input"
                placeholder="marcus.v@company.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>
                Phone Number
              </label>
              <input 
                type="text"
                className="global-search-input"
                placeholder="+1 (555) 234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* License Plate & Reliability */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>
                Vehicle License Plate (LPR OCR)
              </label>
              <input 
                type="text"
                className="global-search-input"
                placeholder="e.g. KA-04-MB-9921"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                style={{ fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>
                Initial Reliability Score (%)
              </label>
              <input 
                type="number"
                step="0.5"
                min="50"
                max="100"
                className="global-search-input"
                value={reliabilityScore}
                onChange={(e) => setReliabilityScore(e.target.value)}
                style={{ fontFamily: 'var(--font-mono)' }}
              />
            </div>
          </div>

          {/* Avatar Color Picker */}
          <div>
            <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>
              Badge Color Accent
            </label>
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              {colors.map(c => (
                <div 
                  key={c} 
                  onClick={() => setAvatarColor(c)}
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '8px', 
                    background: c, 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: avatarColor === c ? `0 0 0 3px var(--bg-modal), 0 0 0 5px ${c}` : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {avatarColor === c && <CheckCircle2 size={16} color="#ffffff" />}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
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
              <UserPlus size={15} />
              <span>{loading ? 'Creating Record...' : 'Register Employee'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
