import json
from fastapi import APIRouter, HTTPException
from langchain_core.messages import HumanMessage
from app.schemas.agent_schemas import AnomalyEvent
from app.services.agent_service import attendance_agent

router = APIRouter()

@router.post("/api/v1/attendance/anomaly")
async def handle_anomaly(event: AnomalyEvent):
    """
    Triggered when a geofence check fails.
    The Agent takes over, investigates, communicates, acts, and returns the JSON result.
    """
    try:
        initial_state = {
            "messages": [HumanMessage(content=f"Fix the anomaly for employee {event.employee_id}. Anomaly: {event.anomaly_type}. Time: {event.timestamp}")],
            "employee_id": event.employee_id,
            "anomaly_type": event.anomaly_type,
        }
        
        # Invoke the LangGraph workflow
        final_state = attendance_agent.invoke(initial_state)
        
        # Parse the structured JSON output from the last node
        structured_result = json.loads(final_state["messages"][-1].content)
        
        return {
            "status": "resolved_autonomously",
            "employee_id": event.employee_id,
            "agent_resolution": structured_result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
