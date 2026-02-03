import operator
from typing import Annotated, List, TypedDict, Union, Sequence
from langchain_core.messages import BaseMessage

# The State of the Agent Graph
# This is the "Memory" that gets passed around between Supervisor and Workers
class AgentState(TypedDict):
    # The history of messages in the conversation
    messages: Annotated[Sequence[BaseMessage], operator.add]
    
    # The next agent to act (determined by Supervisor)
    next: str
    
    # Optional: Track the current steps for frontend visualization
    steps: List[dict]
