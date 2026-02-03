import os
import yaml
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langserve import add_routes
from dotenv import load_dotenv

from backend.graph.workflow import build_multi_agent_graph

# Load Env
load_dotenv()

# Load Config
with open("backend/config.yaml", "r") as f:
    config = yaml.safe_load(f)

# Initialize App
app = FastAPI(
    title="HugAi Backend",
    version="1.0",
    description="LangGraph Multi-Agent Server"
)

# CORS (Allow Frontend to connect)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Build Graph
graph = build_multi_agent_graph(config)

# Expose Graph as API
# This creates endpoints like /invoke, /stream, /batch
add_routes(
    app,
    graph,
    path="/api/v1/chat",
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
