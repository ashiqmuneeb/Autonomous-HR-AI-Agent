from typing import TypedDict, Annotated, List
from langchain_core.messages import BaseMessage, SystemMessage, AIMessage
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langgraph.graph.message import add_messages
from app.tools.hr_tools import hr_tools_list
from app.schemas.agent_schemas import FinalDecision
from app.core.config import settings

class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], add_messages]
    employee_id: str
    anomaly_type: str

# Initialize LLM
llm = ChatGroq(
    model_name="llama3-8b-8192", 
    temperature=0, 
    api_key=settings.GROQ_API_KEY
)
llm_with_tools = llm.bind_tools(hr_tools_list)
llm_structured = llm.with_structured_output(FinalDecision)

def reasoner_node(state: AgentState):
    """The core decision engine that thinks like a human admin."""
    messages = state["messages"]
    
    if len(messages) == 1:
        sys_msg = SystemMessage(content=(
            f"You are an autonomous HR Administrator AI for {settings.PROJECT_NAME}. Your job is to resolve attendance anomalies entirely on your own, just like a human would. "
            f"An anomaly '{state['anomaly_type']}' occurred for Employee ID {state['employee_id']}. "
            f"\n\nYOUR REQUIRED WORKFLOW:\n"
            f"1. Gather data (Logs, LPR, History).\n"
            f"2. Check HR Policy (search_hr_policy) to see what the exact company rules are.\n"
            f"3. If the policy is unclear or you need more info, contact the employee (contact_employee).\n"
            f"4. TAKE ACTION: You MUST either fix the database (override_attendance_record) or escalate it (create_hr_ticket).\n"
            f"Do not finish until you have taken a definitive action."
        ))
        messages = [sys_msg] + messages

    response = llm_with_tools.invoke(messages)
    return {"messages": [response]}

tool_node = ToolNode(hr_tools_list)

def should_continue(state: AgentState):
    """Determines if the agent is still gathering data/acting, or if it is done."""
    last_message = state["messages"][-1]
    if last_message.tool_calls:
        return "tools"
    return "format_output"

def format_output_node(state: AgentState):
    """Takes the entire conversation and formats the final summary into strict JSON."""
    final_analysis = llm_structured.invoke(state["messages"])
    # Convert Pydantic object to JSON string for message history
    return {"messages": [AIMessage(content=final_analysis.model_dump_json())]}

def create_agent():
    """Builds and compiles the LangGraph StateGraph."""
    workflow = StateGraph(AgentState)
    workflow.add_node("reasoner", reasoner_node)
    workflow.add_node("tools", tool_node)
    workflow.add_node("format_output", format_output_node)

    workflow.set_entry_point("reasoner")
    workflow.add_conditional_edges("reasoner", should_continue, {"tools": "tools", "format_output": "format_output"})
    workflow.add_edge("tools", "reasoner")
    workflow.add_edge("format_output", END)

    return workflow.compile()

# Provide a compiled instance
attendance_agent = create_agent()
