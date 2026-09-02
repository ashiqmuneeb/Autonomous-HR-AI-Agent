import json
import asyncio
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from langchain_core.messages import HumanMessage
from app.schemas.agent_schemas import AnomalyEvent
from app.services.agent_service import attendance_agent, stream_agent_execution

router = APIRouter()

@router.post("/api/v1/attendance/anomaly")
async def handle_anomaly(event: AnomalyEvent):
    """
    Standard synchronous endpoint for anomaly resolution.
    """
    try:
        initial_state = {
            "messages": [HumanMessage(content=f"Resolve anomaly '{event.anomaly_type}' for employee {event.employee_id} at time {event.timestamp}.")],
            "employee_id": event.employee_id,
            "anomaly_type": event.anomaly_type,
        }
        
        final_state = attendance_agent.invoke(initial_state)
        structured_result = json.loads(final_state["messages"][-1].content)
        
        return {
            "status": "resolved_autonomously",
            "employee_id": event.employee_id,
            "agent_resolution": structured_result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/v1/attendance/anomaly/stream")
async def handle_anomaly_stream(event: AnomalyEvent):
    """
    Real-time Server-Sent Events (SSE) streaming endpoint.
    Yields step-by-step thoughts, tool calls, tool results, and final decision.
    """
    async def event_generator():
        try:
            # Run generator
            for step in stream_agent_execution(event):
                data = json.dumps(step)
                yield f"data: {data}\n\n"
                await asyncio.sleep(0.05) # Tiny yield to ensure smooth streaming
        except Exception as e:
            error_data = json.dumps({"type": "error", "content": str(e)})
            yield f"data: {error_data}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
