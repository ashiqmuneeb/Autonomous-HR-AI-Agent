import React, { useState, useEffect, useRef } from 'react';
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
  Eye,
  Scan,
  SlidersHorizontal,
  Flame,
  Moon,
  Sparkles,
  AlertTriangle,
  Settings,
  Wifi,
  Video,
  VideoOff
} from 'lucide-react';
import CameraConfigModal from './CameraConfigModal';

export default function LiveCameraFeed({ employees, onShowToast, maskPII = false }) {
  const [cameras, setCameras] = useState([]);
  const [activeCamId, setActiveCamId] = useState('CAM_01_NORTH');
  const [filterMode, setFilterMode] = useState('normal'); // 'normal' | 'nightvision' | 'thermal'
  const [gateLogs, setGateLogs] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || 'EMP-101');
  const [customPlate, setCustomPlate] = useState('');
  const [ocrThreshold, setOcrThreshold] = useState('95.0');
  const [simulateLowConfidence, setSimulateLowConfidence] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  
  // Real WebCam Stream State
  const [useWebcam, setUseWebcam] = useState(false);
  const [webcamActive, setWebcamActive] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    fetchCameras();
    fetchGateLogs();
    const interval = setInterval(fetchGateLogs, 6000);
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(clockInterval);
      stopWebcam();
    };
  }, []);

  const fetchCameras = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/cameras/config');
      setCameras(res.data);
      if (res.data.length > 0 && !activeCamId) {
        setActiveCamId(res.data[0].id);
      }
    } catch (err) {
      console.warn('Could not load camera settings:', err);
    }
  };

  const fetchGateLogs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/gate-feed');
      setGateLogs(res.data);
    } catch (error) {
      console.error('Failed to load gate logs:', error);
    }
  };

  const activeCameraObj = cameras.find(c => c.id === activeCamId) || {
    id: 'CAM_01_NORTH',
    name: 'Main North Gate LPR',
    rtsp_url: 'rtsp://admin:SecurityPass99@192.168.1.101:554/Streaming/Channels/101',
    camera_model: 'Hikvision Pro LPR (DS-2CD7A26G0/P-IZS)',
    protocol: 'RTSP_TCP',
    location: 'North Campus Entrance Gate',
    status: 'ONLINE',
    fps: 30,
    resolution: '1920x1080'
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setWebcamActive(true);
        setUseWebcam(true);
      }
      if (onShowToast) {
        onShowToast({
          type: 'success',
          title: 'Live WebCam Active',
          message: 'Direct camera stream initialized with optical OCR HUD overlay.'
        });
      }
    } catch (err) {
      console.error('Webcam access failed:', err);
      if (onShowToast) {
        onShowToast({
          type: 'error',
          title: 'Webcam Access Denied',
          message: 'Please permit camera access in your browser or connect a USB camera.'
        });
      }
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setWebcamActive(false);
    setUseWebcam(false);
  };

  const selectedEmployee = employees.find(e => e.id === selectedEmpId) || employees[0];

  const maskText = (text, visibleLen = 3) => {
    if (!maskPII || !text) return text;
    if (text.length <= visibleLen) return '***';
    return text.slice(0, visibleLen) + '•'.repeat(Math.max(3, text.length - visibleLen));
  };

  const handleSimulateScan = async (e) => {
    e.preventDefault();
    const plate = customPlate || selectedEmployee?.license_plate || 'NY-99-DC-1099';
    setIsScanning(true);
    setScanResult(null);

    const generatedConfidence = simulateLowConfidence 
      ? (88.0 + Math.random() * 4.0).toFixed(1)
      : (96.5 + Math.random() * 3.0).toFixed(1);

    const meetsThreshold = parseFloat(generatedConfidence) >= parseFloat(ocrThreshold);

    setTimeout(async () => {
      try {
        await axios.post('http://localhost:5000/api/gate-feed/simulate', {
          license_plate: plate,
          employee_id: selectedEmployee?.id,
          gate_name: activeCameraObj.name,
          direction: 'ENTRY',
          confidence: parseFloat(generatedConfidence) / 100
        });

        const resultObj = {
          plate,
          employee: selectedEmployee,
          confidence: generatedConfidence,
          meetsThreshold,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          gate: activeCameraObj.name
        };

        setScanResult(resultObj);
        fetchGateLogs();

        if (onShowToast) {
          onShowToast({
            type: meetsThreshold ? 'success' : 'warning',
            title: meetsThreshold ? 'Optical OCR Match (99%)' : 'Low Optical Confidence Warning',
            message: meetsThreshold 
              ? `Plate ${plate} verified at ${activeCameraObj.name} (${generatedConfidence}%).`
              : `Confidence ${generatedConfidence}% is below policy threshold (${ocrThreshold}%). Human review requested.`
          });
        }
      } catch (err) {
        console.error('Scan simulation error:', err);
      } finally {
        setIsScanning(false);
      }
    }, 1200);
  };

  return (
    <div className="cctv-container">
      {/* Top Header Bar: Camera Switcher Tabs (Left) + Actions (Right) */}
      <div className="cctv-top-bar-aligned">
        <div className="cctv-cameras-row">
          {(cameras.length > 0 ? cameras : [activeCameraObj]).map((cam) => {
            const isActive = activeCamId === cam.id;
            return (
              <button
                key={cam.id}
                className={`cctv-cam-tab ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveCamId(cam.id);
                  if (cam.protocol === 'DIRECT_WEBCAM') {
                    startWebcam();
                  } else if (useWebcam) {
                    stopWebcam();
                  }
                }}
              >
                <Camera size={14} />
                <span>{cam.name}</span>
                <span className="pulse-indicator" style={{ width: 6, height: 6, marginLeft: 4 }}></span>
              </button>
            );
          })}
        </div>

        {/* Right Controls: WebCam + Filters + RTSP Settings */}
        <div className="cctv-actions-row">
          {/* WebCam Toggle */}
          <button
            className={`quick-action-btn ${useWebcam ? 'primary' : 'secondary'}`}
            onClick={useWebcam ? stopWebcam : startWebcam}
            title={useWebcam ? 'Turn off WebCam Stream' : 'Activate Live Local WebCam'}
          >
            {useWebcam ? <Video size={14} /> : <VideoOff size={14} />}
            <span>{useWebcam ? 'Live WebCam Active' : 'Use WebCam'}</span>
          </button>

          {/* Filter Modes */}
          <div className="cctv-view-modes">
            <button 
              className={`cctv-mode-btn ${filterMode === 'normal' ? 'active' : ''}`}
              onClick={() => setFilterMode('normal')}
            >
              RGB
            </button>
            <button 
              className={`cctv-mode-btn ${filterMode === 'nightvision' ? 'active' : ''}`}
              onClick={() => setFilterMode('nightvision')}
            >
              IR Night
            </button>
            <button 
              className={`cctv-mode-btn ${filterMode === 'thermal' ? 'active' : ''}`}
              onClick={() => setFilterMode('thermal')}
            >
              Thermal
            </button>
          </div>

          {/* RTSP Settings */}
          <button 
            className="quick-action-btn secondary"
            onClick={() => setConfigModalOpen(true)}
            title="Configure RTSP URL & IP Camera Hardware"
          >
            <Settings size={14} />
            <span>RTSP Settings</span>
          </button>
        </div>
      </div>

      {/* Main CCTV SOC Screen & HUD */}
      <div className={`cctv-screen filter-${filterMode}`}>
        <div className="cctv-scanlines"></div>

        {/* Real WebCam Video element if active */}
        {useWebcam ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          /* CCTV simulation car background */
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at center, #0f172a 20%, #020617 90%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Car size={180} strokeWidth={1} style={{ opacity: 0.12, color: '#38bdf8' }} />
          </div>
        )}

        {/* CCTV SOC HUD OVERLAY */}
        <div className="cctv-hud-overlay">
          {/* Top Telemetry Bar */}
          <div className="hud-top-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div className="hud-rec-badge">
                <span className="rec-pulse-dot"></span>
                <span>REC • LIVE</span>
              </div>
              <span>{activeCameraObj.name.toUpperCase()} [{activeCameraObj.camera_model || 'HIKVISION PRO LPR'}]</span>
              <span style={{ color: 'var(--accent-cyan)' }}>RTSP: {activeCameraObj.protocol || 'TCP'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span>FPS: {activeCameraObj.fps || 30}.0</span>
              <span>RES: {activeCameraObj.resolution || '1920x1080'}</span>
              <span>{currentTime}</span>
            </div>
          </div>

          {/* Centered Optical Reticle & Plate ROI Box */}
          <div className="hud-reticle-center">
            <div className="hud-corner tl"></div>
            <div className="hud-corner tr"></div>
            <div className="hud-corner bl"></div>
            <div className="hud-corner br"></div>

            <div className="hud-reticle-label">
              {isScanning ? '🔍 AI OCR LOCALIZING PLATE ROI...' : 'OPTICAL LPR DETECTION ZONE'}
            </div>

            <div className="ocr-bounding-box-inner">
              <div className="ocr-plate-tag">
                {isScanning ? 'ACQUIRING...' : maskText(scanResult?.plate || (gateLogs[0]?.license_plate || 'CA-77-SJ-8812'))}
              </div>
              <div className="ocr-confidence-tag">
                {isScanning ? 'OCR SCANNING...' : `CONFIDENCE: ${scanResult?.confidence || '99.4'}%`}
              </div>
            </div>
          </div>

          {/* Bottom Telemetry Bar */}
          <div className="hud-bottom-bar">
            <div>GATE: {activeCameraObj.location || 'North Campus Entrance Gate'} • SENSOR: SONY STARVIS™ 4K</div>
            <div style={{ display: 'flex', gap: '1rem', color: '#06b6d4' }}>
              <span>LATENCY: 28ms</span>
              <span>POLICY MIN: {ocrThreshold}%</span>
              <span>FEED: SECURE (TLS)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls & Real-Time Telemetry Grid */}
      <div className="cctv-controls-card">
        {/* Left: Interactive LPR Camera Trigger & Confidence Simulator */}
        <div className="clean-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Scan size={18} color="var(--accent-cyan)" />
              <span>Optical Vision & Plate Trigger</span>
            </h3>
            <span className="brand-badge">EASYOCR / YOLOv8</span>
          </div>

          <form onSubmit={handleSimulateScan} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Select Employee Vehicle:
              </label>
              <select 
                value={selectedEmpId}
                onChange={(e) => {
                  setSelectedEmpId(e.target.value);
                  setCustomPlate('');
                }}
                className="global-search-input"
                style={{ marginTop: '0.35rem' }}
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.department}) — Plate: {emp.license_plate || 'No Registered Plate'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Or Enter Custom Vehicle License Plate:
              </label>
              <input 
                type="text" 
                placeholder="e.g. NY-99-DC-1099" 
                value={customPlate}
                onChange={(e) => setCustomPlate(e.target.value.toUpperCase())}
                className="global-search-input"
                style={{ marginTop: '0.35rem', fontFamily: 'var(--font-mono)' }}
              />
            </div>

            {/* OCR Confidence Policy Threshold Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                <span>Minimum Confidence Policy Threshold:</span>
                <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{ocrThreshold}%</span>
              </div>
              <input 
                type="range" 
                min="80" 
                max="99" 
                step="0.5" 
                value={ocrThreshold}
                onChange={(e) => setOcrThreshold(e.target.value)}
                style={{ width: '100%', marginTop: '0.4rem', accentColor: 'var(--accent-cyan)' }}
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                Rule POL-OCR-01: Detections below {ocrThreshold}% will trigger supervisor verification.
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <input 
                type="checkbox" 
                id="low-conf" 
                checked={simulateLowConfidence}
                onChange={(e) => setSimulateLowConfidence(e.target.checked)}
              />
              <label htmlFor="low-conf" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Simulate Dirty/Obscured Plate (Generates &lt; 92% confidence)
              </label>
            </div>

            <button 
              type="submit" 
              className="login-submit-btn" 
              style={{ margin: 0 }}
              disabled={isScanning}
            >
              {isScanning ? <RefreshCw size={16} className="spin" /> : <Play size={16} />}
              <span>{isScanning ? 'Processing Optical Frame...' : 'Trigger Optical Gate Recognition'}</span>
            </button>
          </form>

          {/* Active Detection Feedback */}
          {scanResult && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '0.85rem', 
              borderRadius: 'var(--radius-md)', 
              background: scanResult.meetsThreshold ? 'var(--accent-green-bg)' : 'var(--accent-amber-bg)',
              border: `1px solid ${scanResult.meetsThreshold ? 'var(--accent-green-border)' : 'var(--accent-amber-border)'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: scanResult.meetsThreshold ? 'var(--accent-green)' : 'var(--accent-amber)' }}>
                  {scanResult.meetsThreshold ? '✓ Optical Match Verified' : '⚠️ Low Confidence Fallback'}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 700 }}>
                  {scanResult.confidence}%
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                Plate <strong>{maskText(scanResult.plate)}</strong> logged at {scanResult.gate} ({scanResult.timestamp}).
              </div>
            </div>
          )}
        </div>

        {/* Right: Active RTSP Camera Hardware Dossier & Recent Gate Logs */}
        <div className="clean-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Wifi size={18} color="var(--primary)" />
              <span>RTSP Stream Diagnostics & Gate History</span>
            </h3>
            <span className="guardrail-chip pass" style={{ fontSize: '0.7rem' }}>CONNECTED</span>
          </div>

          {/* Hardware Telemetry Card */}
          <div style={{ 
            padding: '0.75rem 0.9rem', 
            background: 'var(--bg-card-subtle)', 
            borderRadius: 'var(--radius-sm)', 
            border: '1px solid var(--border-subtle)',
            marginBottom: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
            fontSize: '0.78rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-dim)' }}>RTSP Stream URI:</span>
              <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                {maskPII ? 'rtsp://admin:••••••••@192.168.1.•••:554/...' : activeCameraObj.rtsp_url}
              </code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-dim)' }}>Hardware Model:</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{activeCameraObj.camera_model}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-dim)' }}>Transport Mode:</span>
              <span>{activeCameraObj.protocol} • H.264 Main Profile</span>
            </div>
          </div>

          {/* Gate Logs Table */}
          <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
            Recent Optical Detections:
          </h4>
          <div className="table-wrapper" style={{ maxHeight: '200px', overflowY: 'auto' }}>
            <table className="custom-table" style={{ fontSize: '0.78rem' }}>
              <thead>
                <tr>
                  <th>Plate</th>
                  <th>Employee</th>
                  <th>Gate</th>
                  <th>Conf.</th>
                </tr>
              </thead>
              <tbody>
                {gateLogs.slice(0, 5).map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{maskText(log.license_plate)}</td>
                    <td>{log.employee_name || 'Visitor'}</td>
                    <td>{log.gate_name}</td>
                    <td>
                      <span className={`guardrail-chip ${(log.confidence_score || 0.98) >= 0.95 ? 'pass' : 'warn'}`} style={{ fontSize: '0.68rem', padding: '0.1rem 0.35rem' }}>
                        {((log.confidence_score || 0.98) * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RTSP Camera Hardware Configuration Modal */}
      <CameraConfigModal 
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        onSaveSuccess={() => {
          fetchCameras();
          fetchGateLogs();
        }}
        onShowToast={onShowToast}
      />
    </div>
  );
}
