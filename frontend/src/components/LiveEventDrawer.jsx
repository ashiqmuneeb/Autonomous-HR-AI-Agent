import React, { useState } from 'react';
import { 
  Activity, 
  ChevronUp, 
  ChevronDown, 
  Radio, 
  Car, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  Trash2, 
  X,
  Volume2,
  VolumeX
} from 'lucide-react';

export default function LiveEventDrawer({ anomalies = [], attendanceRecords = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Generate synthetic live telemetry stream events from current data
  const streamEvents = [
    { id: 'ev-1', type: 'vision', icon: <Car size={13} color="var(--accent-cyan)" />, title: 'Gate 01 OCR', detail: 'Plate NY-99-DC-1099 detected (99.4% confidence)', time: 'Just now' },
    { id: 'ev-2', type: 'agent', icon: <Sparkles size={13} color="var(--ai-indigo)" />, title: 'LangGraph Reasoning', detail: 'Evaluated POL-ATT-04 for David Chen — Override authorized', time: '1m ago' },
    { id: 'ev-3', type: 'db', icon: <ShieldCheck size={13} color="var(--accent-green)" />, title: 'SQLite Audit Commit', detail: 'Immutable record stamped (Audit Hash: 9f4e...2a1)', time: '2m ago' },
    { id: 'ev-4', type: 'gps', icon: <MapPin size={13} color="var(--accent-amber)" />, title: 'Mobile GPS Ping', detail: 'EMP-102 geofence breach flagged (450m delta)', time: '4m ago' },
    { id: 'ev-5', type: 'vision', icon: <Car size={13} color="var(--accent-cyan)" />, title: 'Gate 02 OCR', detail: 'Plate CA-88-TX-4022 recognized (98.8% confidence)', time: '6m ago' }
  ];

  return (
    <div className={`live-event-drawer-container ${isOpen ? 'expanded' : 'collapsed'}`}>
      {/* Drawer Toggle Header Bar */}
      <div className="drawer-header-bar" onClick={() => setIsOpen(!isOpen)}>
        <div className="drawer-header-left">
          <span className="pulse-indicator"></span>
          <Radio size={14} className="drawer-radio-icon" />
          <span className="drawer-title">Live Sensor & Telemetry Feed</span>
          <span className="drawer-count-badge">{streamEvents.length} Events</span>
        </div>

        <div className="drawer-header-right">
          <button 
            className="drawer-icon-btn" 
            onClick={(e) => {
              e.stopPropagation();
              setSoundEnabled(!soundEnabled);
            }}
            title={soundEnabled ? 'Mute Alert Sound' : 'Enable Live Sensor Chime'}
          >
            {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
          </button>
          <div className="drawer-chevron-btn">
            {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </div>
        </div>
      </div>

      {/* Expanded Events Body */}
      {isOpen && (
        <div className="drawer-body-content">
          <div className="drawer-events-list">
            {streamEvents.map((evt) => (
              <div key={evt.id} className="drawer-event-row">
                <div className="drawer-event-icon">{evt.icon}</div>
                <div className="drawer-event-details">
                  <div className="drawer-event-top">
                    <span className="drawer-event-title">{evt.title}</span>
                    <span className="drawer-event-time">{evt.time}</span>
                  </div>
                  <div className="drawer-event-text">{evt.detail}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="drawer-footer-bar">
            <span>SOC Telemetry Stream Active (100ms polling)</span>
          </div>
        </div>
      )}
    </div>
  );
}
