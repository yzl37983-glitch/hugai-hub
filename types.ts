export type Role = 'user' | 'assistant' | 'system';

export type AgentType = 'supervisor' | 'rag_agent' | 'search_agent' | 'chat_agent' | 'custom_agent' | 'workflow_step';

export type SolutionMode = 'multi-agent' | 'agentic' | 'workflow';

export interface AgentStep {
  id: string;
  agent: AgentType | string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  description: string;
  output?: string;
  timestamp: number;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  steps?: AgentStep[]; // CoT / Orchestration steps
  isThinking?: boolean;
}

export interface AgentDefinition {
  id: string;
  type: AgentType;
  name: string;
  description: string;
  systemPrompt: string;
  enabled: boolean;
  isSystem?: boolean; // If true, cannot be deleted (e.g., Supervisor)
}

export interface Solution {
  id: string;
  name: string;
  description: string;
  mode: SolutionMode;
  agents: AgentDefinition[]; // For Multi-Agent, list all. For Agentic, usually just one root agent. For Workflow, ordered steps.
  enabledTools: string[]; // List of Tool IDs enabled for this solution
}

export interface ToolDefinition {
  id: string; // Corresponds to python function name
  name: string; // Display name
  description: string;
  enabled: boolean; // Global toggle
  requiresKey?: boolean;
  apiKey?: string;
  isCustom?: boolean;
}

export interface AppConfig {
  // General Model Config
  modelName: string;
  baseUrl: string;
  apiKey: string;
  temperature: number;
  provider: 'openai' | 'ollama' | 'anthropic' | 'deepseek';

  // Solutions / Schemes
  solutions: Solution[];
  activeSolutionId: string;

  // Global Tools Registry
  tools: ToolDefinition[];
}

export interface KnowledgeFile {
  id: string;
  name: string;
  size: number;
  status: 'uploading' | 'processing' | 'ready';
}