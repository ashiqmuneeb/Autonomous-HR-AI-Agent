# 🧠 Autonomous HR AI Agent

![Microservices Architecture](https://img.shields.io/badge/Architecture-Microservices-blue)
![LangGraph](https://img.shields.io/badge/AI_Engine-LangGraph-orange)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688)
![React](https://img.shields.io/badge/Frontend-React.js-61DAFB)

A production-ready, fully autonomous AI Agent built to replace manual HR administration tasks. This project demonstrates advanced agentic workflows (using **LangGraph** and **Llama-3 via Groq**) where the AI does not just *read* data, but actively reasons, researches policies, communicates with employees, and modifies database records.

## 🚀 Key Features

* **True Agency (Action-Taking):** The AI Agent has access to simulated database override tools (`override_attendance_record`) and ticketing tools (`create_hr_ticket`).
* **RAG Policy Checking:** Before making any decisions, the Agent queries the internal company rulebook (`search_hr_policy`) to ensure strict legal and corporate compliance.
* **Autonomous Employee Communication:** If data is unclear (e.g., geofence breach without LPR confirmation), the AI autonomously contacts the employee (`contact_employee`) for justification.
* **Strict Structured Outputs:** Utilizes `with_structured_output` to force the LLM to return strict Pydantic JSON schemas to the Node.js API Gateway.
* **Microservices Architecture:** Clean separation of concerns between the React frontend, Node.js gateway, and Python AI microservice.

---

## 🏗️ System Architecture

The project is divided into three interconnected microservices:

1. **`ai-service/` (Python / FastAPI / LangGraph)**
   The brain of the operation. Contains the LangGraph `StateGraph`, the prompt logic, and the Python-based tools that the agent uses to interact with the world.
2. **`backend/` (Node.js / Express)**
   The API Gateway. Holds the local state/database of pending anomalies. Proxies resolution requests to the Python AI service.
3. **`frontend/` (React.js / Vite)**
   A beautiful, responsive glassmorphism UI built with vanilla CSS and Lucide icons to monitor anomalies and trigger the AI.

---

## ⚙️ Quick Start Guide

You will need three terminal windows to run the full stack.

### 1. Setup the AI Service (Python)
Navigate to `ai-service` and set up the environment:
```bash
cd ai-service
# Create virtual environment (or use conda)
pip install -r requirements.txt
```
**Important:** Create a `.env` file in the `ai-service` folder and add your free Groq API key:
```env
GROQ_API_KEY=gsk_your_api_key_here
HOST=0.0.0.0
PORT=8000
```
Run the service:
```bash
python main.py
```

### 2. Setup the API Gateway (Node.js)
Navigate to `backend`:
```bash
cd backend
npm install
npm run dev
```

### 3. Setup the Frontend (React)
Navigate to `frontend`:
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. Click **"Resolve with AI Agent"** on any pending anomaly and watch the Python terminal as the AI autonomously investigates the issue, consults the rulebook, and applies a fix!

---

## 🤖 Agentic Workflow (How the AI Thinks)

1. **Trigger:** The React UI tells Node.js an anomaly occurred. Node.js hits the Python FastAPI endpoint.
2. **Data Gathering:** The LLM uses tools to check the employee's history (`fetch_attendance_history`), geofence logs (`check_geofence_logs`), and physical gate logs (`query_lpr_events`).
3. **Policy Review:** The LLM queries the company handbook (`search_hr_policy`).
4. **Decision Engine:** The LLM decides if it has enough proof to automatically override the record, or if it needs to escalate to a human (`create_hr_ticket`).
5. **Final Output:** The Agent packages its reasoning and action taken into a strict JSON payload and sends it back up the chain to the UI.
