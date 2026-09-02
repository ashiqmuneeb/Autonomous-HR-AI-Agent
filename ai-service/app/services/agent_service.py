import json
from typing import TypedDict, Annotated, List, Dict, Any, Generator
from langchain_core.messages import BaseMessage, SystemMessage, HumanMessage, AIMessage, ToolMessage
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langgraph.graph.message import add_messages
from app.tools.hr_tools import hr_tools_list
from app.schemas.agent_schemas import FinalDecision, AnomalyEvent
from app.core.config import settings

class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], add_messages]
    employee_id: str
    anomaly_type: str

# Tools map by name for direct execution in streaming
tools_map = {t.name: t for t in hr_tools_list}

# Initialize Groq LLM
llm = ChatGroq(
    model_name=settings.GROQ_MODEL, 
    temperature=0, 
    api_key=settings.GROQ_API_KEY
)
llm_with_tools = llm.bind_tools(hr_tools_list)
llm_structured = llm.with_structured_output(FinalDecision)

SYSTEM_PROMPT_TEMPLATE = (
    "You are an autonomous HR Administrator AI for {project_name}. Your job is to resolve workforce attendance anomalies completely on your own, just like an experienced human HR Director.\n"
    "An anomaly '{anomaly_type}' occurred for Employee ID {employee_id}.\n\n"
    "YOUR REQUIRED AUTONOMOUS WORKFLOW:\n"
    "1. Gather Evidence: Query attendance history (fetch_attendance_history), geofence logs (check_geofence_logs), and parking gate cameras (query_lpr_events).\n"
    "2. Consult HR Policies: Query company rules (search_hr_policy) to find the exact compliance clauses.\n"
    "3. Clarify if Needed: If context is ambiguous, contact the employee (contact_employee).\n"
    "4. Execute Definite Action:\n"
    "   - If evidence + policy justifies an override (e.g. LPR proves physical presence or grace period applies), call 'override_attendance_record'.\n"
    "   - If evidence shows unexcused breach or policy requires human discretion (e.g. unauthorized remote work), call 'create_hr_ticket' to escalate to human admin.\n"
    "Do not finish without executing either override_attendance_record or create_hr_ticket."
)

def reasoner_node(state: AgentState):
    """The core reasoning node that calls tools."""
    messages = state["messages"]
    
    # Ensure system message is present
    has_system = any(isinstance(m, SystemMessage) for m in messages)
    if not has_system:
        sys_msg = SystemMessage(content=SYSTEM_PROMPT_TEMPLATE.format(
            project_name=settings.PROJECT_NAME,
            anomaly_type=state['anomaly_type'],
            employee_id=state['employee_id']
        ))
        messages = [sys_msg] + messages

    response = llm_with_tools.invoke(messages)
    return {"messages": [response]}

tool_node = ToolNode(hr_tools_list)

def should_continue(state: AgentState):
    last_message = state["messages"][-1]
    if last_message.tool_calls:
        return "tools"
    return "format_output"

def format_output_node(state: AgentState):
    """Formats the final conclusion into structured JSON schema."""
    final_analysis = llm_structured.invoke(state["messages"])
    if isinstance(final_analysis, dict):
        decision_json = json.dumps(final_analysis)
    elif hasattr(final_analysis, "model_dump_json"):
        decision_json = final_analysis.model_dump_json()
    else:
        decision_json = json.dumps(final_analysis.dict())
    return {"messages": [AIMessage(content=decision_json)]}

def create_agent():
    workflow = StateGraph(AgentState)
    workflow.add_node("reasoner", reasoner_node)
    workflow.add_node("tools", tool_node)
    workflow.add_node("format_output", format_output_node)

    workflow.set_entry_point("reasoner")
    workflow.add_conditional_edges("reasoner", should_continue, {"tools": "tools", "format_output": "format_output"})
    workflow.add_edge("tools", "reasoner")
    workflow.add_edge("format_output", END)

    return workflow.compile()

attendance_agent = create_agent()

def stream_agent_execution(event: AnomalyEvent) -> Generator[Dict[str, Any], None, None]:
    """
    Generator that executes the agent step-by-step and yields real-time streaming progress:
    - Thought states
    - Tool calls with arguments
    - Tool results
    - Final structured decision
    """
    sys_content = SYSTEM_PROMPT_TEMPLATE.format(
        project_name=settings.PROJECT_NAME,
        anomaly_type=event.anomaly_type,
        employee_id=event.employee_id
    )
    
    messages: List[BaseMessage] = [
        SystemMessage(content=sys_content),
        HumanMessage(content=f"Resolve anomaly '{event.anomaly_type}' for employee {event.employee_id} at time {event.timestamp}.")
    ]

    yield {
        "type": "thought",
        "content": f"Initiating autonomous investigation for Employee {event.employee_id} (Anomaly: {event.anomaly_type})..."
    }

    max_iterations = 6
    iteration = 0

    while iteration < max_iterations:
        iteration += 1
        
        # Invoke LLM
        response = llm_with_tools.invoke(messages)
        messages.append(response)

        # If LLM triggered tool calls
        if response.tool_calls:
            for tc in response.tool_calls:
                tool_name = tc["name"]
                tool_args = tc["args"]
                
                yield {
                    "type": "tool_call",
                    "tool_name": tool_name,
                    "tool_input": tool_args,
                    "content": f"Invoking tool `{tool_name}` with parameters: {json.dumps(tool_args)}"
                }

                # Execute the actual tool
                if tool_name in tools_map:
                    try:
                        tool_func = tools_map[tool_name]
                        tool_output = tool_func.invoke(tool_args)
                    except Exception as err:
                        tool_output = f"Tool execution error: {str(err)}"
                else:
                    tool_output = f"Tool {tool_name} not recognized."

                # Append tool message to history
                tool_msg = ToolMessage(
                    content=str(tool_output),
                    name=tool_name,
                    tool_call_id=tc.get("id", f"call_{tool_name}_{iteration}")
                )
                messages.append(tool_msg)

                yield {
                    "type": "tool_result",
                    "tool_name": tool_name,
                    "tool_output": str(tool_output),
                    "content": f"Tool `{tool_name}` completed: {str(tool_output)[:120]}..."
                }
        else:
            # No further tool calls, model is ready for final decision
            break

    # Format final structured output
    yield {
        "type": "thought",
        "content": "Compiling final evidence synthesis and structured decision..."
    }

    final_analysis = llm_structured.invoke(messages)
    if hasattr(final_analysis, "model_dump"):
        decision_dict = final_analysis.model_dump()
    elif isinstance(final_analysis, dict):
        decision_dict = final_analysis
    else:
        decision_dict = final_analysis.dict()

    yield {
        "type": "decision",
        "decision": decision_dict,
        "content": "Autonomous resolution completed."
    }
