import { useState, useEffect } from 'react'
import axios from 'axios'
import { BrainCircuit, Clock, MapPin, AlertTriangle, CheckCircle2, Loader2, Sparkles } from 'lucide-react'
import './index.css'

function App() {
  const [anomalies, setAnomalies] = useState([])
  const [loadingMap, setLoadingMap] = useState({})

  // Fetch anomalies from Node.js backend
  useEffect(() => {
    fetchAnomalies()
  }, [])

  const fetchAnomalies = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/anomalies')
      setAnomalies(res.data)
    } catch (error) {
      console.error("Failed to fetch anomalies", error)
    }
  }

  const resolveWithAI = async (eventId) => {
    setLoadingMap(prev => ({ ...prev, [eventId]: true }))
    
    try {
      const res = await axios.post('http://localhost:5000/api/resolve-anomaly', {
        event_id: eventId
      })
      
      // Update local state with the resolved anomaly
      setAnomalies(prev => prev.map(a => 
        a.id === eventId ? res.data.anomaly : a
      ))
    } catch (error) {
      console.error("Failed to resolve with AI", error)
      alert("AI Agent failed. Make sure Python FastAPI is running on port 8000 and Node on port 5000.")
    } finally {
      setLoadingMap(prev => ({ ...prev, [eventId]: false }))
    }
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1>Autonomous AI Agent</h1>
        <p>Fully Autonomous HR Administration Dashboard</p>
      </header>

      <div className="anomalies-grid">
        {anomalies.map((anomaly) => (
          <div key={anomaly.id} className="anomaly-card">
            
            {/* Loading State Overlay */}
            {loadingMap[anomaly.id] && (
              <div className="loading-overlay">
                <Loader2 size={40} className="spinner" color="#3b82f6" />
                <div className="loading-text">AI Agent Investigating...</div>
              </div>
            )}

            <div className="card-header">
              <div className="employee-info">
                <h2>{anomaly.employee_name}</h2>
                <p>ID: {anomaly.employee_id}</p>
              </div>
              <div className={`badge ${anomaly.status}`}>
                {anomaly.status}
              </div>
            </div>

            <div className="anomaly-details">
              <p>
                <AlertTriangle size={16} color="#f59e0b" />
                <span><strong>Type:</strong> {anomaly.anomaly_type.replace('_', ' ').toUpperCase()}</span>
              </p>
              <p>
                <Clock size={16} color="#94a3b8" />
                <span><strong>Time:</strong> {anomaly.timestamp}</span>
              </p>
              <p>
                <MapPin size={16} color="#94a3b8" />
                <span><strong>Location:</strong> Main Office</span>
              </p>
            </div>

            {anomaly.status === 'pending' ? (
              <button 
                className="btn-resolve"
                onClick={() => resolveWithAI(anomaly.id)}
                disabled={loadingMap[anomaly.id]}
              >
                <Sparkles size={18} />
                Resolve with AI Agent
              </button>
            ) : (
              <div className="resolution-box">
                <h3>
                  <CheckCircle2 size={18} />
                  AI Resolution Complete
                </h3>
                {anomaly.agent_resolution && (
                  <>
                    <span className="action-taken">⚡ {anomaly.agent_resolution.action_taken}</span>
                    <p style={{ marginTop: '0.8rem' }}>
                      <strong>Reasoning:</strong> {anomaly.agent_resolution.reasoning}
                    </p>
                  </>
                )}
              </div>
            )}
            
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
