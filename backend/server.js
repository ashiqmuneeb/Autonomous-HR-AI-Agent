const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

app.use(cors());
app.use(express.json());

// Mock database of pending anomalies
let pendingAnomalies = [
    {
        id: "evt_101",
        employee_id: "40",
        employee_name: "Ashiq",
        anomaly_type: "geofence_breach",
        timestamp: "08:30 AM",
        status: "pending",
        agent_resolution: null
    },
    {
        id: "evt_102",
        employee_id: "85",
        employee_name: "Sarah",
        anomaly_type: "late_arrival",
        timestamp: "09:15 AM",
        status: "pending",
        agent_resolution: null
    }
];

// 1. Get all pending anomalies
app.get('/api/anomalies', (req, res) => {
    res.json(pendingAnomalies);
});

// 2. Trigger the AI Agent to resolve a specific anomaly
app.post('/api/resolve-anomaly', async (req, res) => {
    const { event_id } = req.body;
    
    // Find the anomaly
    const anomalyIndex = pendingAnomalies.findIndex(a => a.id === event_id);
    if (anomalyIndex === -1) {
        return res.status(404).json({ error: "Anomaly not found" });
    }
    
    const anomaly = pendingAnomalies[anomalyIndex];
    
    try {
        console.log(`[NODEJS] Triggering Python AI Service for Event: ${event_id}`);
        
        // Proxy the request to the Python FastAPI Agent
        const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/v1/attendance/anomaly`, {
            employee_id: anomaly.employee_id,
            anomaly_type: anomaly.anomaly_type,
            timestamp: anomaly.timestamp
        });

        // The AI successfully resolved it
        const result = aiResponse.data;
        
        // Update our local mock database
        pendingAnomalies[anomalyIndex].status = "resolved";
        pendingAnomalies[anomalyIndex].agent_resolution = result.agent_resolution;
        
        console.log(`[NODEJS] AI Service resolved the anomaly!`);
        
        res.json({
            success: true,
            anomaly: pendingAnomalies[anomalyIndex]
        });
        
    } catch (error) {
        console.error("[NODEJS] Error communicating with AI Service:", error.message);
        res.status(500).json({ 
            error: "Failed to resolve anomaly via AI Agent.",
            details: error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Node.js API Gateway running on http://localhost:${PORT}`);
    console.log(`🔗 Connecting to AI Service at ${AI_SERVICE_URL}`);
});
