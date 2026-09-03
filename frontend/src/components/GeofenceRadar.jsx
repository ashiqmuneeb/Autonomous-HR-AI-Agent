import React, { useEffect, useRef } from 'react';
import { MapPin, Navigation, Car, Shield, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function GeofenceRadar({ 
  distanceMeters = 450, 
  isInside = false, 
  employeeName = 'Employee', 
  plateMatched = true,
  plateNumber = 'NY-99-DC-1099',
  shiftStartTime = '08:30 AM',
  gateEntryTime = '08:30 AM',
  punchTime = '08:30 AM'
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let angle = 0;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const geofenceRadius = width * 0.36;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Radar background circles
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.15)';
      ctx.lineWidth = 1;
      [0.2, 0.4, 0.6, 0.8, 1.0].forEach(factor => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, geofenceRadius * factor, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Crosshairs
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.beginPath();
      ctx.moveTo(centerX, 0);
      ctx.lineTo(centerX, height);
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      // Geofence Authorized Zone Boundary (Cyan/Blue)
      ctx.fillStyle = 'rgba(6, 182, 212, 0.05)';
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, geofenceRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);

      // Rotating radar sweep line
      const sweepGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, geofenceRadius);
      sweepGradient.addColorStop(0, 'rgba(6, 182, 212, 0.3)');
      sweepGradient.addColorStop(1, 'rgba(6, 182, 212, 0.0)');

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, geofenceRadius, angle, angle + 0.4);
      ctx.closePath();
      ctx.fillStyle = sweepGradient;
      ctx.fill();
      ctx.restore();

      // Campus HQ Landmark Center
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Gate 1: Main North Gate
      const gateX = centerX;
      const gateY = centerY - geofenceRadius;
      ctx.fillStyle = plateMatched ? '#10b981' : '#f59e0b';
      ctx.beginPath();
      ctx.arc(gateX, gateY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Employee GPS Ping (Positioned based on distance)
      const pingDistanceRatio = Math.min(1.25, Math.max(0.2, distanceMeters / 500));
      const pingAngle = -Math.PI / 3; // 60 deg top-right
      const pingX = centerX + Math.cos(pingAngle) * (geofenceRadius * pingDistanceRatio);
      const pingY = centerY + Math.sin(pingAngle) * (geofenceRadius * pingDistanceRatio);

      // Ping ring pulse
      ctx.strokeStyle = isInside ? '#10b981' : '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pingX, pingY, 8 + (Math.sin(Date.now() / 200) * 3), 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = isInside ? '#10b981' : '#f59e0b';
      ctx.beginPath();
      ctx.arc(pingX, pingY, 5, 0, Math.PI * 2);
      ctx.fill();

      angle += 0.03;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationFrameId);
  }, [distanceMeters, isInside, plateMatched]);

  return (
    <div className="radar-widget-container">
      <div className="radar-header-row">
        <div className="radar-title">
          <Navigation size={15} color="var(--accent-cyan)" />
          <span>Multi-Signal Geofence Radar Telemetry</span>
        </div>
        <span className={`radar-status-badge ${isInside ? 'inside' : 'drift'}`}>
          {isInside ? 'Within Campus Perimeter' : `${distanceMeters}m Outside Boundary`}
        </span>
      </div>

      <div className="radar-canvas-wrapper">
        <canvas 
          ref={canvasRef} 
          width={280} 
          height={220} 
          className="radar-canvas"
        />
        <div className="radar-legend-overlay">
          <div className="legend-item"><span className="legend-dot blue"></span> Campus HQ</div>
          <div className="legend-item"><span className="legend-dot green"></span> North Gate (LPR)</div>
          <div className="legend-item"><span className="legend-dot amber"></span> Mobile GPS Ping</div>
        </div>
      </div>

      {/* Interactive Shift Timeline Scrubber */}
      <div className="shift-timeline-wrapper">
        <div className="timeline-title">
          <Clock size={13} color="var(--text-dim)" />
          <span>24-Hour Shift Telemetry Correlation</span>
        </div>

        <div className="timeline-track">
          <div className="timeline-step passed">
            <div className="timeline-node"><Clock size={11} /></div>
            <div className="timeline-text">
              <span className="timeline-label">Shift Start</span>
              <span className="timeline-time">{shiftStartTime}</span>
            </div>
          </div>

          <div className="timeline-connector active"></div>

          <div className="timeline-step passed">
            <div className="timeline-node camera"><Car size={11} /></div>
            <div className="timeline-text">
              <span className="timeline-label">Gate LPR Read</span>
              <span className="timeline-time">{gateEntryTime} (99%)</span>
            </div>
          </div>

          <div className="timeline-connector active"></div>

          <div className="timeline-step passed">
            <div className="timeline-node gps"><MapPin size={11} /></div>
            <div className="timeline-text">
              <span className="timeline-label">GPS Mobile Punch</span>
              <span className="timeline-time">{punchTime}</span>
            </div>
          </div>

          <div className="timeline-connector active"></div>

          <div className="timeline-step ai-resolved">
            <div className="timeline-node check"><CheckCircle2 size={11} /></div>
            <div className="timeline-text">
              <span className="timeline-label">AI Auto-Excused</span>
              <span className="timeline-time">Rule POL-ATT-04</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
