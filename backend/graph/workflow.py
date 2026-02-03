import json
import functools
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI

from backend.core.state import AgentState
from backend.core.tools import get_tools_by_names
from backend.graph.nodes import create_agent, agent_node, make_supervisor_node

# --- Factory to build the graph based on Config ---
def build_multi_agent_graph(config):
    """
    Constructs a Supervisor-Worker Graph dynamically based on config.yaml
    """
    
    # 1. Initialize LLM
    llm = ChatOpenAI(
        model=config['llm']['model'],
        api_key=config['llm']['api_key'],
        base_url=config['llm']['base_url'],
        temperature=config['llm']['temperature']
    )

    # 2. Setup Workers
    workers_config = config['agents']['workers']
    members = [w['name'] for w in workers_config]
    
    workflow = StateGraph(AgentState)
    
    # 3. Create Worker Nodes
    for worker in workers_config:
        name = worker['name']
        tools = get_tools_by_names(worker.get('tools', []))
        
        # Create the agent runner
        agent_executor = create_agent(llm, tools, worker['prompt'])
        
        # Create the node function using partial to bake in arguments
        node_func = functools.partial(agent_node, agent_executor=agent_executor, name=name)
        
        workflow.add_node(name, node_func)

    # 4. Create Supervisor Node
    supervisor_chain = make_supervisor_node(llm, members)
    
    def supervisor_node_func(state):
        # Run the supervisor chain
        result_str = supervisor_chain.invoke(state)
        # Parse JSON output from function call
        result = json.loads(result_str)
        return {"next": result['next']}

    workflow.add_node("supervisor", supervisor_node_func)

    # 5. Define Edges
    # Entry point -> Supervisor
    workflow.set_entry_point("supervisor")

    # Supervisor -> Workers (Conditional)
    conditional_map = {k: k for k in members}
    conditional_map["FINISH"] = END
    
    workflow.add_conditional_edges(
        "supervisor",
        lambda x: x["next"],
        conditional_map
    )

    # Workers -> Supervisor (Always return to manager)
    for member in members:
        workflow.add_edge(member, "supervisor")

    return workflow.compile()
