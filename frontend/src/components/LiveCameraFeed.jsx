import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Camera, 
  Car, 
  ShieldCheck, 
  Radio, 
  Play, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Layers, 
  ArrowRight,
  RefreshCw,
  Eye
} from 'lucide-react';

export default function LiveCameraFeed({ employees }) {
  const [activeCam, setActiveCam] = useState('North Perimeter Gate');
  const [gateLogs, setGateLogs] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || 'EMP-101');
  const [customPlate, setCustomPlate] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    fetchGateLogs();
    const interval = setInterval(fetchGateLogs, 6000);
    return () => clearInterval(interval);
  }, []);

  const fetchGateLogs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/gate-feed');
      setGateLogs(res.data);
    } catch (error) {
      console.error('Failed to load gate logs:', error);
    }
  };

  const selectedEmployee = employees.find(e => e.id === selectedEmpId) || employees[0];

  const handleSimulateScan = async (e) => {
    e.preventDefault();
    const plate = customPlate || selectedEmployee?.license_plate || 'KA-01-MJ-4040';
    setIsScanning(true);
    setScanResult(null);

    setTimeout(async () => {
      try {
        const res = await axios.post('http://localhost:5000/api/gate-feed/simulate', {
          license_plate: plate,
          employee_id: selectedEmployee?.id,
          gate_name: activeCam,
          direction: 'ENTRY'
        });

        setScanResult({
          plate,
          employee: selectedEmployee,
          confidence: (98.5 + Math.random() * 1.4).toFixed(1),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });
        fetchGateLogs();
      } catch (error) {
        console.error('Scan error:', error);
      } finally {
        setIsScanning(false);
      }
    }, 1200);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-titles">
          <h1>Live Gate Cameras & OCR Vision</h1>
          <p>Real-time optical License Plate Recognition (LPR) and access turnstile monitoring feeds.</p>
        </div>
      </div>

      {/* Main Vision Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.75rem', marginBottom: '2rem' }}>
        {/* CCTV Monitor Card */}
        <div className="clean-card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Camera Selector Bar */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '0.85rem 1.25rem', 
            background: 'var(--bg-app)', 
            borderBottom: '1px solid var(--border-subtle)' 
          }}>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {['North Perimeter Gate', 'Main Parking Turnstile', 'Tech Park Gate'].map((cam) => (
                <button
                  key={cam}
                  className={`filter-btn ${activeCam === cam ? 'active' : ''}`}
                  onClick={() => setActiveCam(cam)}
                  style={{ fontSize: '0.78rem' }}
                >
                  <Camera size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  {cam}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 600 }}>
              <Radio size={12} className="status-dot-pulse" />
              <span>LIVE FEED</span>
            </div>
          </div>

          {/* Camera Viewport Canvas */}
          <div style={{ 
            position: 'relative', 
            background: '#090d16', 
            height: '320px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
            {/* Grid Lines Overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }} />

            {/* Camera Metadata Overlay */}
            <div style={{ 
              position: 'absolute', 
              top: '12px', 
              left: '16px', 
              color: '#38bdf8', 
              fontFamily: 'var(--font-mono)', 
              fontSize: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}>
              <span>CAM-01 • {activeCam.toUpperCase()}</span>
              <span style={{ color: '#94a3b8' }}>REC • 1080P @ 60FPS</span>
            </div>

            <div style={{ 
              position: 'absolute', 
              top: '12px', 
              right: '16px', 
              color: '#38bdf8', 
              fontFamily: 'var(--font-mono)', 
              fontSize: '0.75rem' 
            }}>
              {new Date().toLocaleTimeString()}
            </div>

            {/* Simulated Car & Optical Bounding Box */}
            <div style={{ 
              position: 'relative', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              zIndex: 10 
            }}>
              <Car size={84} color="#64748b" style={{ opacity: 0.85 }} />

              {/* License Plate Detection Box */}
              <div style={{
                marginTop: '10px',
                border: isScanning ? '2px dashed #38bdf8' : '2px solid #10b981',
                borderRadius: '6px',
                padding: '6px 14px',
                background: 'rgba(0, 0, 0, 0.65)',
                color: '#ffffff',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.95rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                boxShadow: isScanning ? '0 0 15px rgba(56, 189, 248, 0.5)' : '0 0 15px rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>{scanResult ? scanResult.plate : selectedEmployee?.license_plate || 'KA-01-MJ-4040'}</span>
                <span style={{ 
                  fontSize: '0.65rem', 
                  color: '#10b981', 
                  background: 'rgba(16, 185, 129, 0.2)', 
                  padding: '2px 4px', 
                  borderRadius: '3px' 
                }}>
                  {scanResult ? `${scanResult.confidence}% OCR` : '99.4% OCR'}
                </span>
              </div>
            </div>

            {/* Scanning Scanline Animation */}
            {isScanning && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: '#38bdf8',
                boxShadow: '0 0 15px #38bdf8',
                animation: 'pulse-ring 1.2s infinite'
              }} />
            )}
          </div>

          {/* Camera Info Footer */}
          <div style={{ padding: '0.9rem 1.25rem', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Optical Sensor: <strong>Sony IMX LPR Vision Sensor</strong> • AI Edge Processing Active
            </div>
            <span className="status-pill resolved">
              <CheckCircle2 size={12} /> Camera Verified
            </span>
          </div>
        </div>

        {/* Scan Simulator & Trigger Panel */}
        <div className="clean-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Play size={16} color="var(--primary)" />
            Simulate Live Gate Entry
          </h3>

          <form onSubmit={handleSimulateScan}>
            <div className="form-field">
              <label>Select Arriving Employee</label>
              <select 
                className="clean-select"
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.license_plate})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Custom License Plate (Optional)</label>
              <input 
                type="text"
                className="clean-input"
                placeholder="e.g. KA-01-MJ-4040"
                value={customPlate}
                onChange={(e) => setCustomPlate(e.target.value)}
              />
            </div>

            <button 
              type="button" 
              onClick={handleSimulateScan}
              className="btn-solid-primary"
              disabled={isScanning}
            >
              <Camera size={16} />
              <span>{isScanning ? 'Scanning License Plate...' : 'Trigger Optical Gate Scan'}</span>
            </button>
          </form>

          {/* Scan Result Feedback */}
          {scanResult && (
            <div style={{ 
              marginTop: '1.25rem', 
              background: 'var(--accent-green-bg)', 
              border: '1px solid var(--accent-green-border)', 
              borderRadius: '8px', 
              padding: '0.85rem' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-green)', fontWeight: 600, fontSize: '0.84rem' }}>
                <CheckCircle2 size={15} />
                <span>Vehicle Entry Recognized!</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginTop: '0.3rem' }}>
                Plate <strong>{scanResult.plate}</strong> verified at {scanResult.timestamp} with {scanResult.confidence}% confidence.
              </div>
              {scanResult.employee && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Matched to: {scanResult.employee.name} ({scanResult.employee.role})
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Optical Recognition Event Ledger Table */}
      <div className="clean-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Eye size={16} color="var(--primary)" />
            Live Gate Camera Log History (SQLite)
          </h3>
          <button 
            className="filter-btn" 
            onClick={fetchGateLogs}
            style={{ border: '1px solid var(--border-subtle)', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <RefreshCw size={12} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Gate Location</th>
                <th>Detected License Plate</th>
                <th>Matched Employee</th>
                <th>Direction</th>
                <th>OCR Confidence</th>
              </tr>
            </thead>
            <tbody>
              {gateLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>
                    No camera gate events logged yet.
                  </td>
                </tr>
              ) : (
                gateLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 500 }}>
                      {log.timestamp}
                    </td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{log.gate_name}</span>
                    </td>
                    <td>
                      <code style={{ 
                        background: 'var(--bg-app)', 
                        padding: '2px 6px', 
                        borderRadius: '4px', 
                        border: '1px solid var(--border-subtle)',
                        fontWeight: 700,
                        color: 'var(--primary)' 
                      }}>
                        {log.license_plate}
                      </code>
                    </td>
                    <td>
                      {log.employee_name ? (
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {log.employee_name}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>Visitor / Unregistered</span>
                      )}
                    </td>
                    <td>
                      <span className="status-pill resolved" style={{ fontSize: '0.7rem' }}>
                        {log.direction}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--accent-green)', fontWeight: 600, fontSize: '0.82rem' }}>
                        {((log.confidence_score || 0.99) * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* How the Vision & AI System Works (Explainer) */}
      <div className="clean-card" style={{ background: 'var(--primary-light)', border: '1px solid var(--primary-border)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.6rem' }}>
          💡 How Optical Gate Cameras Assist the Autonomous AI Agent
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
              1. Employee Checks In
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              If an employee's phone GPS reports they are 2km away due to mapping lag, a "Location Mismatch" is queued.
            </p>
          </div>

          <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
              2. AI Checks Gate Vision
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              The AI Agent runs <code>query_lpr_events</code> against this gate camera table to see if their car entered campus on time.
            </p>
          </div>

          <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
              3. Autonomous Override
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              If gate entry is verified, company policy authorizes the AI to override the record to <strong>Present</strong> automatically!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
