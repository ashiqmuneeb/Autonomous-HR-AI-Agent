import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Navbar';
import AnomalyFeed from './components/AnomalyFeed';
import ClockInSimulator from './components/ClockInSimulator';
import AttendanceLedger from './components/AttendanceLedger';
import PolicyManager from './components/PolicyManager';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import StreamingThoughtModal from './components/StreamingThoughtModal';
import AnomalyDetailModal from './components/AnomalyDetailModal';
import AddEmployeeModal from './components/AddEmployeeModal';
import LiveCameraFeed from './components/LiveCameraFeed';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('anomalies');
  const [employees, setEmployees] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Streaming modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [streamingAnomaly, setStreamingAnomaly] = useState(null);
  const [streamEvents, setStreamEvents] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);

  // Detail / Explanation modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedAnomalyForDetail, setSelectedAnomalyForDetail] = useState(null);

  // Add Employee modal state
  const [addEmployeeModalOpen, setAddEmployeeModalOpen] = useState(false);

  useEffect(() => {
    fetchAllData();
    // Poll data every 10 seconds for real-time sync
    const interval = setInterval(fetchAllData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      const [empRes, anoRes, attRes, polRes, anaRes] = await Promise.all([
        axios.get('http://localhost:5000/api/employees'),
        axios.get('http://localhost:5000/api/anomalies'),
        axios.get('http://localhost:5000/api/attendance'),
        axios.get('http://localhost:5000/api/policies'),
        axios.get('http://localhost:5000/api/analytics')
      ]);

      setEmployees(empRes.data);
      setAnomalies(anoRes.data);
      setAttendanceRecords(attRes.data);
      setPolicies(polRes.data);
      setAnalytics(anaRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching system data:', error);
      setLoading(false);
    }
  };

  // Start Real-Time AI Streaming Resolution
  const handleResolveStream = async (anomaly) => {
    setStreamingAnomaly(anomaly);
    setStreamEvents([]);
    setModalOpen(true);
    setIsStreaming(true);

    try {
      const response = await fetch('http://localhost:5000/api/resolve-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: anomaly.id })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep last incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              setStreamEvents(prev => [...prev, data]);
            } catch (e) {
              console.error('Parse error on SSE line:', line);
            }
          }
        }
      }

      setIsStreaming(false);
      fetchAllData();
    } catch (error) {
      console.error('Streaming error:', error);
      setStreamEvents(prev => [...prev, { type: 'error', content: error.message }]);
      setIsStreaming(false);
    }
  };

  // Open Detailed Explanation Modal
  const handleOpenDetailModal = (anomaly) => {
    setSelectedAnomalyForDetail(anomaly);
    setDetailModalOpen(true);
  };

  // Human-in-the-Loop decision handler
  const handleHitlDecision = async (eventId, action, notes) => {
    try {
      await axios.post('http://localhost:5000/api/hitl/decision', {
        event_id: eventId,
        action,
        notes
      });
      fetchAllData();
    } catch (error) {
      alert('Failed to submit decision: ' + error.message);
    }
  };

  const pendingCount = anomalies.filter(a => a.status === 'pending').length;
  const escalatedCount = anomalies.filter(a => a.status === 'escalated_to_human').length;

  return (
    <div className="app-layout">
      {/* Left Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        pendingCount={pendingCount}
        escalatedCount={escalatedCount}
        totalEmployees={employees.length}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <main className="main-content">
          {loading ? (
            <div className="clean-card" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
              <h3 style={{ color: 'var(--primary)', fontWeight: 600 }}>Loading dashboard...</h3>
            </div>
          ) : (
            <>
              {activeTab === 'anomalies' && (
                <AnomalyFeed 
                  anomalies={anomalies}
                  onResolveStream={handleResolveStream}
                  onHitlDecision={handleHitlDecision}
                  onOpenDetailModal={handleOpenDetailModal}
                  loadingEventId={isStreaming ? streamingAnomaly?.id : null}
                />
              )}

              {activeTab === 'kiosk' && (
                <ClockInSimulator 
                  employees={employees}
                  onClockInSuccess={fetchAllData}
                  onNavigateToAnomalies={() => setActiveTab('anomalies')}
                />
              )}

              {activeTab === 'ledger' && (
                <AttendanceLedger 
                  records={attendanceRecords}
                  employees={employees}
                  onOpenAddEmployeeModal={() => setAddEmployeeModalOpen(true)}
                />
              )}

              {activeTab === 'cameras' && (
                <LiveCameraFeed 
                  employees={employees}
                />
              )}

              {activeTab === 'policies' && (
                <PolicyManager 
                  policies={policies}
                  onPolicyAdded={fetchAllData}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsDashboard 
                  analytics={analytics}
                />
              )}
            </>
          )}
        </main>

        {/* Global Footer */}
        <footer className="app-footer">
          <div>PulseHR • Autonomous Workforce Intelligence</div>
          <div>SQLite Database Connected • LangGraph Active</div>
        </footer>
      </div>

      {/* Streaming Thought Modal */}
      <StreamingThoughtModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        anomaly={streamingAnomaly}
        streamEvents={streamEvents}
        isStreaming={isStreaming}
        onComplete={fetchAllData}
      />

      {/* Dedicated Anomaly Explanation & Evidence Modal */}
      <AnomalyDetailModal 
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        anomaly={selectedAnomalyForDetail}
        onHitlDecision={handleHitlDecision}
      />

      {/* Add Employee Modal */}
      <AddEmployeeModal 
        isOpen={addEmployeeModalOpen}
        onClose={() => setAddEmployeeModalOpen(false)}
        onEmployeeAdded={fetchAllData}
      />
    </div>
  );
}

export default App;
