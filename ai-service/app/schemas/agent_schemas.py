from pydantic import BaseModel, Field

class AnomalyEvent(BaseModel):
    employee_id: str
    anomaly_type: str
    timestamp: str

class FinalDecision(BaseModel):
    action_taken: str = Field(description="What action the AI took (e.g., 'Overrode to PRESENT', 'Escalated to HR')")
    reasoning: str = Field(description="Step-by-step reasoning for the decision")
    requires_human_followup: bool = Field(description="Does a human admin need to look at this?")
