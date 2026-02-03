from langchain_core.tools import tool
from langchain_community.tools import DuckDuckGoSearchRun
import random

# 1. Search Tool
@tool
def duckduckgo_search(query: str) -> str:
    """Useful for searching the internet for current events and real-time information."""
    search = DuckDuckGoSearchRun()
    try:
        return search.run(query)
    except Exception as e:
        return f"Search failed: {str(e)}"

# 2. RAG Tool (Mock for now, easy to swap with ChromaDB)
@tool
def retrieve_documents(query: str) -> str:
    """Retrieve relevant documents from the internal knowledge base."""
    # In a real impl, this would query ChromaDB/Faiss
    return f"[RAG Result] Found relevant docs for '{query}': \n1. HugAi Architecture v3.0 specs...\n2. LangGraph integration patterns..."

# 3. Calculator / Python REPL
@tool
def python_calculator(expression: str) -> str:
    """Calculate math expressions."""
    try:
        return str(eval(expression))
    except Exception as e:
        return f"Error: {e}"

# Tool Registry
TOOL_MAP = {
    "duckduckgo_search": duckduckgo_search,
    "retrieve_documents": retrieve_documents,
    "calculator": python_calculator
}

def get_tools_by_names(names: list[str]):
    return [TOOL_MAP[name] for name in names if name in TOOL_MAP]
