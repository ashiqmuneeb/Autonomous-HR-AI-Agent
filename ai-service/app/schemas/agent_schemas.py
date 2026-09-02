from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class AnomalyEvent(BaseModel):
    employee_id: str
    anomaly_type: str
    timestamp: str
    event_id: Optional[str] = None
    severity: Optional[str] = "MEDIUM"

class FinalDecision(BaseModel):
    action_taken: str = Field(description="Exact action executed (e.g. 'Overrode attendance record to PRESENT for employee EMP-101', 'Escalated to Human HR Manager')")
    risk_level: str = Field(default="LOW", description="Risk assessment of the case: 'LOW', 'MEDIUM', 'HIGH'")
    confidence_score: float = Field(default=0.95, description="Confidence score from 0.0 to 1.0")
    reasoning: str = Field(description="Clear, numbered step-by-step reasoning citing evidence, telemetry, and specific HR policies checked.")
    requires_human_followup: bool = Field(description="Boolean flag indicating if a human HR admin needs to review or sign off.")
    suggested_action: Optional[str] = Field(default=None, description="Recommended next action for HR admin if human followup is required.")

class StreamStep(BaseModel):
    type: str # "thought", "tool_call", "tool_result", "decision", "error"
    content: Optional[str] = None
    tool_name: Optional[str] = None
    tool_input: Optional[Dict[str, Any]] = None
    tool_output: Optional[str] = None
    decision: Optional[FinalDecision] = None
