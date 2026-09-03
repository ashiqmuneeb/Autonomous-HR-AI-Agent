import React, { useState } from 'react';
import axios from 'axios';
import { 
  Camera, 
  Settings, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Wifi, 
  Video, 
  Cpu, 
  SlidersHorizontal, 
  Radio, 
  Save, 
  RefreshCw,
  Sparkles,
  Layers,
  MapPin
} from 'lucide-react';

export default function CameraConfigModal({ isOpen, onClose, onSaveSuccess, onShowToast }) {
  const [selectedPreset, setSelectedPreset] = useState('hikvision');
  const [cameraId, setCameraId] = useState('CAM_01_NORTH');
  const [cameraName, setCameraName] = useState('Main North Gate LPR');
  const [rtspUrl, setRtspUrl] = useState('rtsp://admin:SecurityPass99@192.168.1.101:554/Streaming/Channels/101');
  const [cameraModel, setCameraModel] = useState('Hikvision Pro LPR (DS-2CD7A26G0/P-IZS)');
  const [protocol, setProtocol] = useState('RTSP_TCP');
  const [location, setLocation] = useState('North Campus Entrance Gate');
  const [fps, setFps] = useState(30);
  const [resolution, setResolution] = useState('1920x1080');

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const presets = [
    {
      id: 'hikvision',
      label: 'Hikvision LPR Camera',
      model: 'DS-2CD7A26G0/P-IZS',
      urlTemplate: 'rtsp://admin:SecurityPass99@192.168.1.101:554/Streaming/Channels/101',
      protocol: 'RTSP_TCP'
    },
    {
      id: 'dahua',
      label: 'Dahua ANPR Bullet',
      model: 'ITC237-PW6M-IRLZF1050',
      urlTemplate: 'rtsp://admin:SecurityPass99@192.168.1.102:554/cam/realmonitor?channel=1&subtype=0',
      protocol: 'RTSP_TCP'
    },
    {
      id: 'axis',
      label: 'Axis Q1700-E LPR',
      model: 'Q1700-E Plate Camera',
      urlTemplate: 'rtsp://admin:SecurityPass99@192.168.1.103:554/live/ch0',
      protocol: 'RTSP_TCP'
    },
    {
      id: 'webcam',
      label: 'Local USB / WebCam',
      model: 'Logitech Brio / Kiosk WebCam',
      urlTemplate: 'webcam://0',
      protocol: 'DIRECT_WEBCAM'
    }
  ];

  const handleApplyPreset = (preset) => {
    setSelectedPreset(preset.id);
    setRtspUrl(preset.urlTemplate);
    setCameraModel(preset.model);
    setProtocol(preset.protocol);
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await axios.post('http://localhost:5000/api/cameras/test-connection', {
        rtsp_url: rtspUrl,
        protocol: protocol
      });
      setTestResult(res.data);
      if (onShowToast) {
        onShowToast({
          type: 'success',
          title: 'Camera Stream Verified',
          message: `${cameraName}: ${res.data.message}`
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: err.response?.data?.message || err.message
      });
      if (onShowToast) {
        onShowToast({
          type: 'error',
          title: 'Connection Failed',
          message: err.response?.data?.message || err.message
        });
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveCamera = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await axios.post('http://localhost:5000/api/cameras/config', {
        id: cameraId,
        name: cameraName,
        rtsp_url: rtspUrl,
        camera_model: cameraModel,
        protocol: protocol,
        location: location,
        status: 'ONLINE',
        ocr_enabled: 1,
        fps: parseInt(fps),
        resolution: resolution
      });

      if (onShowToast) {
        onShowToast({
          type: 'success',
          title: 'RTSP Stream Saved',
          message: `${cameraName} registered into SQLite gate matrix.`
        });
      }
      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (err) {
      if (onShowToast) {
        onShowToast({
          type: 'error',
          title: 'Save Failed',
          message: err.message
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="clean-modal-backdrop" onClick={onClose}>
      <div className="clean-modal-card" style={{ maxWidth: '640px', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="clean-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: 38, 
              height: 38, 
              borderRadius: 'var(--radius-sm)', 
              background: 'var(--accent-cyan-bg)', 
              color: 'var(--accent-cyan)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Camera size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                RTSP & IP Gate Camera Stream Settings
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                Configure real CCTV RTSP streams (Hikvision, Dahua, Axis) for plate recognition.
              </p>
            </div>
          </div>

          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Body with Scroll */}
        <div className="modal-scrollable-body" style={{ padding: '1.25rem 1.5rem', gap: '1.1rem' }}>
          {/* Quick Hardware Brand Presets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.72rem', fontBold: 700, textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700 }}>
              Select Hardware Preset / Brand Template:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {presets.map((p) => {
                const isSelected = selectedPreset === p.id;
                return (
                  <div
                    key={p.id}
                    className={`camera-preset-box ${isSelected ? 'active' : ''}`}
                    onClick={() => handleApplyPreset(p)}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="camera-preset-title">{p.label}</div>
                      <div className="camera-preset-model">{p.model}</div>
                    </div>
                    {isSelected && <CheckCircle2 size={16} color="var(--primary)" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Configuration Form */}
          <form onSubmit={handleSaveCamera} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-input-group">
                <label>Camera Designation / Name</label>
                <input 
                  type="text" 
                  value={cameraName}
                  onChange={(e) => setCameraName(e.target.value)}
                  placeholder="e.g. Main North Gate LPR"
                  className="global-search-input"
                  required
                />
              </div>

              <div className="form-input-group">
                <label>Physical Gate Location</label>
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. North Campus Entrance"
                  className="global-search-input"
                  required
                />
              </div>
            </div>

            {/* RTSP Stream URL */}
            <div className="form-input-group">
              <label>RTSP Stream URL / Live Video URI</label>
              <div className="input-with-icon">
                <Wifi size={15} className="input-icon" color="var(--accent-cyan)" />
                <input 
                  type="text" 
                  value={rtspUrl}
                  onChange={(e) => setRtspUrl(e.target.value)}
                  placeholder="rtsp://admin:password@192.168.1.100:554/Streaming/Channels/101"
                  className="global-search-input"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', paddingLeft: '2.4rem' }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr', gap: '0.75rem' }}>
              <div className="form-input-group">
                <label>Streaming Protocol</label>
                <select 
                  value={protocol} 
                  onChange={(e) => setProtocol(e.target.value)}
                  className="global-search-input"
                >
                  <option value="RTSP_TCP">RTSP (TCP Reliable)</option>
                  <option value="RTSP_UDP">RTSP (UDP Low Latency)</option>
                  <option value="HTTP_MJPEG">HTTP MJPEG Stream</option>
                  <option value="DIRECT_WEBCAM">Local USB WebCam</option>
                </select>
              </div>

              <div className="form-input-group">
                <label>Resolution</label>
                <select 
                  value={resolution} 
                  onChange={(e) => setResolution(e.target.value)}
                  className="global-search-input"
                >
                  <option value="1920x1080">1080p FHD</option>
                  <option value="2560x1440">2K QHD</option>
                  <option value="1280x720">720p HD</option>
                  <option value="3840x2160">4K UHD</option>
                </select>
              </div>

              <div className="form-input-group">
                <label>Target FPS</label>
                <input 
                  type="number" 
                  value={fps}
                  onChange={(e) => setFps(e.target.value)}
                  min="10"
                  max="60"
                  className="global-search-input"
                />
              </div>
            </div>

            {/* Test Connection Diagnostic Box */}
            <div style={{ 
              padding: '0.75rem 1rem', 
              background: 'var(--bg-card-subtle)', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Cpu size={14} color="var(--primary)" />
                  <span>Hardware Stream Handshake & Diagnostic</span>
                </span>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="quick-action-btn secondary"
                  style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}
                >
                  {isTesting ? <RefreshCw size={12} className="spin" /> : <Wifi size={12} />}
                  <span>{isTesting ? 'Pinging Stream...' : '⚡ Ping & Test Stream'}</span>
                </button>
              </div>

              {testResult && (
                <div style={{ 
                  padding: '0.5rem 0.75rem', 
                  borderRadius: 'var(--radius-sm)',
                  background: testResult.success ? 'var(--accent-green-bg)' : 'var(--accent-rose-bg)',
                  border: `1px solid ${testResult.success ? 'var(--accent-green-border)' : 'var(--accent-rose-border)'}`,
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: testResult.success ? 'var(--accent-green)' : 'var(--accent-rose)'
                }}>
                  {testResult.success ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
                  <span>{testResult.message}</span>
                  {testResult.latency_ms && (
                    <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {testResult.latency_ms}ms latency
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
              <button 
                type="submit" 
                className="login-submit-btn" 
                style={{ flex: 1, margin: 0, padding: '0.65rem' }}
                disabled={isSaving}
              >
                <Save size={15} />
                <span>Save Camera Configuration</span>
              </button>

              <button 
                type="button" 
                onClick={onClose}
                className="quick-action-btn secondary"
                style={{ padding: '0 1.25rem' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
