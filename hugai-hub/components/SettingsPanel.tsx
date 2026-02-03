import React, { useState, useEffect } from 'react';
import { AppConfig, AgentDefinition, ToolDefinition, Solution, SolutionMode } from '../types';
import { Settings, Save, Server, Key, Cpu, Users, Wrench, ToggleLeft, ToggleRight, Edit3, Plus, Trash2, Layout, Info, ArrowDown, MoveUp, MoveDown, Workflow, GitBranch, Bot, FileCode } from 'lucide-react';

interface SettingsPanelProps {
  config: AppConfig;
  onConfigChange: (newConfig: AppConfig) => void;
}

type SettingsTab = 'general' | 'solutions' | 'tools';

// Dynamic Model Data
const PROVIDER_MODELS: Record<string, { value: string; label: string }[]> = {
  openai: [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  ],
  anthropic: [
    { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' },
    { value: 'claude-3-opus', label: 'Claude 3 Opus' },
  ],
  deepseek: [
    { value: 'deepseek-chat', label: 'DeepSeek V2 Chat' },
    { value: 'deepseek-coder', label: 'DeepSeek Coder' },
  ],
  ollama: [
    { value: 'llama3:8b', label: 'Llama 3 8B' },
    { value: 'llama3:70b', label: 'Llama 3 70B' },
    { value: 'mistral', label: 'Mistral 7B' },
    { value: 'qwen2.5', label: 'Qwen 2.5' },
  ]
};

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ config, onConfigChange }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [selectedSolutionId, setSelectedSolutionId] = useState<string>(config.activeSolutionId);

  // Sync selected ID if config changes externally (e.g. deletion)
  useEffect(() => {
    if (!config.solutions.find(s => s.id === selectedSolutionId)) {
      if (config.solutions.length > 0) {
        setSelectedSolutionId(config.solutions[0].id);
      }
    }
  }, [config.solutions, selectedSolutionId]);

  const activeSolution = config.solutions.find(s => s.id === selectedSolutionId) || config.solutions[0];

  const handleChange = (key: keyof AppConfig, value: any) => {
    onConfigChange({ ...config, [key]: value });
  };

  // --- Model Logic ---
  const handleProviderChange = (provider: string) => {
    // When provider changes, auto-select the first model of that provider
    const availableModels = PROVIDER_MODELS[provider] || [];
    const defaultModel = availableModels.length > 0 ? availableModels[0].value : '';
    
    onConfigChange({ 
      ...config, 
      provider: provider as any,
      modelName: defaultModel
    });
  };

  // --- Solution Logic ---
  const handleAddSolution = () => {
    // Default to Multi-Agent structure
    const newSolution: Solution = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Solution',
      description: 'A new empty configuration.',
      mode: 'multi-agent', // Default start
      enabledTools: [],
      agents: getTemplateAgents('multi-agent')
    };
    handleChange('solutions', [...config.solutions, newSolution]);
    setSelectedSolutionId(newSolution.id);
  };

  const getTemplateAgents = (mode: SolutionMode): AgentDefinition[] => {
    if (mode === 'multi-agent') {
        return [
            {
                id: 'supervisor',
                type: 'supervisor',
                name: 'Supervisor',
                description: 'Orchestrator',
                systemPrompt: 'You are the supervisor. Route tasks to the appropriate worker.',
                enabled: true,
                isSystem: true
            },
            {
                id: 'worker_1',
                type: 'custom_agent',
                name: 'General Assistant',
                description: 'Worker',
                systemPrompt: 'You are a helpful assistant.',
                enabled: true
            }
        ];
    } else if (mode === 'agentic') {
        return [
            {
                id: 'primary_brain',
                type: 'custom_agent',
                name: 'Core Agent',
                description: 'The main reasoning loop',
                systemPrompt: 'You are an autonomous agent with ReAct capabilities.',
                enabled: true,
                isSystem: true
            }
        ];
    } else {
        // Workflow
        return [
            {
                id: 'step_1',
                type: 'workflow_step',
                name: 'Step 1: Input Analysis',
                description: 'First step of the pipeline',
                systemPrompt: 'Analyze the user input and extract key entities.',
                enabled: true
            },
            {
                id: 'step_2',
                type: 'workflow_step',
                name: 'Step 2: Execution',
                description: 'Second step',
                systemPrompt: 'Process the entities and generate a result.',
                enabled: true
            }
        ];
    }
  };

  const handleDeleteSolution = (id: string) => {
    if (config.solutions.length <= 1) {
      alert("At least one solution is required.");
      return;
    }
    const newSolutions = config.solutions.filter(s => s.id !== id);
    handleChange('solutions', newSolutions);
  };

  const updateActiveSolution = (updates: Partial<Solution>) => {
    const newSolutions = config.solutions.map(s => 
      s.id === selectedSolutionId ? { ...s, ...updates } : s
    );
    handleChange('solutions', newSolutions);
  };

  // --- Mode Switching Logic (BUG FIX) ---
  const handleModeChange = (newMode: SolutionMode) => {
    if (newMode === activeSolution.mode) return;
    
    // Confirm reset if there are custom changes? (Skipped for simplicity in this demo)
    const newAgents = getTemplateAgents(newMode);
    
    updateActiveSolution({
        mode: newMode,
        agents: newAgents
    });
  };

  // --- Agent/Step Logic ---
  const updateSolutionAgent = (agentIndex: number, field: keyof AgentDefinition, value: any) => {
    const newAgents = [...activeSolution.agents];
    newAgents[agentIndex] = { ...newAgents[agentIndex], [field]: value };
    updateActiveSolution({ agents: newAgents });
  };

  const handleAddAgentToSolution = () => {
    const isWorkflow = activeSolution.mode === 'workflow';
    const newAgent: AgentDefinition = {
      id: isWorkflow ? `step_${Date.now()}` : `worker_${Date.now()}`,
      type: isWorkflow ? 'workflow_step' : 'custom_agent',
      name: isWorkflow ? `Step ${activeSolution.agents.length + 1}` : 'New Worker',
      description: isWorkflow ? 'New pipeline step' : 'New team member',
      systemPrompt: 'Please define instructions...',
      enabled: true
    };
    updateActiveSolution({ agents: [...activeSolution.agents, newAgent] });
  };

  const handleDeleteAgentFromSolution = (index: number) => {
    const agent = activeSolution.agents[index];
    if (agent.isSystem) return; 
    
    const newAgents = activeSolution.agents.filter((_, i) => i !== index);
    updateActiveSolution({ agents: newAgents });
  };

  const moveAgent = (index: number, direction: 'up' | 'down') => {
    const newAgents = [...activeSolution.agents];
    if (direction === 'up' && index > 0) {
        [newAgents[index], newAgents[index - 1]] = [newAgents[index - 1], newAgents[index]];
    } else if (direction === 'down' && index < newAgents.length - 1) {
        [newAgents[index], newAgents[index + 1]] = [newAgents[index + 1], newAgents[index]];
    }
    updateActiveSolution({ agents: newAgents });
  };

  // --- Tool Logic ---
  const handleAddTool = () => {
    const newTool: ToolDefinition = {
      id: `my_new_tool_${Math.floor(Math.random()*1000)}`,
      name: 'New Tool',
      description: 'Mock: Returns current time',
      enabled: true,
      isCustom: true,
      requiresKey: false
    };
    handleChange('tools', [...config.tools, newTool]);
  };

  const handleToolUpdate = (index: number, field: keyof ToolDefinition, value: any) => {
    const newTools = [...config.tools];
    newTools[index] = { ...newTools[index], [field]: value };
    handleChange('tools', newTools);
  };

  const handleDeleteTool = (index: number) => {
    const newTools = config.tools.filter((_, i) => i !== index);
    handleChange('tools', newTools);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="flex items-center gap-3 p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
           <Settings className="w-5 h-5" />
        </div>
        <div>
           <h2 className="text-lg font-bold text-gray-900 dark:text-white">系统配置</h2>
           <p className="text-xs text-gray-500 dark:text-gray-400">管理模型、方案与工具</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 px-6 bg-white dark:bg-gray-900">
        {(['general', 'solutions', 'tools'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 pt-4 px-4 text-sm font-medium transition-all border-b-2 ${
              activeTab === tab 
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center gap-2 capitalize">
              {tab === 'general' && <Cpu className="w-4 h-4" />}
              {tab === 'solutions' && <Layout className="w-4 h-4" />}
              {tab === 'tools' && <Wrench className="w-4 h-4" />}
              {tab === 'solutions' ? '方案 (Schemes)' : tab}
            </div>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full">
        
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="space-y-6 max-w-2xl">
            <div className="grid gap-6">
               <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-3 h-3" /> 模型选择 (Model Selection)
                </label>
                
                {/* Enhanced Model Provider/Name Selection */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">厂商 (Provider)</label>
                        <select 
                            value={config.provider}
                            onChange={(e) => handleProviderChange(e.target.value)}
                            className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                        >
                            <option value="openai">OpenAI Compatible</option>
                            <option value="ollama">Ollama (Local)</option>
                            <option value="anthropic">Anthropic</option>
                            <option value="deepseek">DeepSeek</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                         <label className="text-xs text-gray-400">模型 (Model Name)</label>
                         <div className="relative">
                            <input 
                                list="model-options"
                                value={config.modelName}
                                onChange={(e) => handleChange('modelName', e.target.value)}
                                className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                                placeholder="Select or type model..."
                            />
                            <datalist id="model-options">
                                {(PROVIDER_MODELS[config.provider] || []).map(opt => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </datalist>
                         </div>
                    </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Server className="w-3 h-3" /> Base URL
                </label>
                <input
                  type="text"
                  value={config.baseUrl}
                  onChange={(e) => handleChange('baseUrl', e.target.value)}
                  className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400"
                  placeholder="https://api.openai.com/v1"
                />
                <p className="text-[10px] text-gray-400">本地 Ollama 通常使用: http://localhost:11434/v1</p>
              </div>

              {config.provider !== 'ollama' && (
                  <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Key className="w-3 h-3" /> API Key
                      </label>
                      <input
                        type="password"
                        value={config.apiKey}
                        onChange={(e) => handleChange('apiKey', e.target.value)}
                        className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400 font-mono"
                        placeholder="sk-..."
                      />
                  </div>
              )}

              <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Temperature (随机性)</label>
                    <span className="text-xs font-mono text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">{config.temperature}</span>
                  </div>
                  <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.1"
                      value={config.temperature}
                      onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
              </div>
            </div>
          </div>
        )}

        {/* Solutions Tab */}
        {activeTab === 'solutions' && (
          <div className="grid lg:grid-cols-12 gap-6 h-[calc(100vh-250px)]">
             {/* Left: Solution List */}
             <div className="lg:col-span-4 flex flex-col border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-800/50 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                    <h3 className="font-bold text-sm text-gray-700 dark:text-gray-200">方案列表 (Schemes)</h3>
                    <button onClick={handleAddSolution} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-indigo-600 dark:text-indigo-400 transition-colors" title="Create New Scheme">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {config.solutions.map(s => (
                        <div 
                            key={s.id}
                            onClick={() => setSelectedSolutionId(s.id)}
                            className={`p-3 rounded-lg cursor-pointer border transition-all ${
                                selectedSolutionId === s.id 
                                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500/50 shadow-sm' 
                                : 'bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="font-semibold text-sm text-gray-900 dark:text-white">{s.name}</div>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider 
                                    ${s.mode === 'multi-agent' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300' 
                                    : s.mode === 'agentic' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300'
                                    : 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300'
                                    }`}>
                                    {s.mode === 'multi-agent' ? 'Team' : s.mode === 'agentic' ? 'Agentic' : 'Workflow'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{s.description}</p>
                        </div>
                    ))}
                </div>
             </div>

             {/* Right: Solution Details */}
             <div className="lg:col-span-8 space-y-6 overflow-y-auto pr-2 pb-10">
                
                {/* Scheme Settings Card */}
                <div className="space-y-4 bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex justify-between items-start">
                         <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">方案基础设置</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">定义此方案的运行模式与基本信息</p>
                         </div>
                         <button onClick={() => handleDeleteSolution(activeSolution.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors">
                             <Trash2 className="w-3 h-3" /> 删除方案
                         </button>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500">方案名称</label>
                            <input 
                                type="text" 
                                value={activeSolution.name}
                                onChange={(e) => updateActiveSolution({ name: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 text-gray-900 dark:text-white"
                            />
                        </div>
                         <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 flex items-center gap-1">
                                运行模式 (Mode)
                                <div className="group relative">
                                    <Info className="w-3 h-3 cursor-help text-gray-400" />
                                    <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900 text-white text-xs p-3 rounded shadow-lg hidden group-hover:block z-50 leading-relaxed">
                                        <div className="mb-2"><b>Multi-Agent (协作):</b> Supervisor 负责意图识别与路由，适合复杂任务分发。</div>
                                        <div className="mb-2"><b>Agentic (自主):</b> 单一智能体拥有 ReAct 循环，适合需要深度推理的任务。</div>
                                        <div><b>Workflow (流式):</b> 线性步骤执行，输入->步骤1->步骤2->输出。</div>
                                    </div>
                                </div>
                            </label>
                            <select 
                                value={activeSolution.mode}
                                onChange={(e) => handleModeChange(e.target.value as SolutionMode)}
                                className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 text-gray-900 dark:text-white"
                            >
                                <option value="multi-agent">Multi-Agent (Supervisor Team)</option>
                                <option value="agentic">Agentic (Single Loop / ReAct)</option>
                                <option value="workflow">Workflow (Sequential Chain)</option>
                            </select>
                        </div>
                        <div className="col-span-2 space-y-1">
                            <label className="text-xs font-bold text-gray-500">描述</label>
                            <input 
                                type="text" 
                                value={activeSolution.description}
                                onChange={(e) => updateActiveSolution({ description: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Agents / Steps Configuration */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {activeSolution.mode === 'multi-agent' && <Users className="w-4 h-4 text-purple-500" />}
                            {activeSolution.mode === 'agentic' && <Bot className="w-4 h-4 text-emerald-500" />}
                            {activeSolution.mode === 'workflow' && <Workflow className="w-4 h-4 text-blue-500" />}
                            
                            <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                                {activeSolution.mode === 'multi-agent' ? '智能体团队编排 (Team Nodes)' : 
                                 activeSolution.mode === 'agentic' ? 'Agent 核心配置' : '工作流步骤 (Sequence)'}
                            </h3>
                        </div>
                        {(activeSolution.mode === 'multi-agent' || activeSolution.mode === 'workflow') && (
                            <button 
                                onClick={handleAddAgentToSolution}
                                className="text-xs flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                            >
                                <Plus className="w-3 h-3" /> {activeSolution.mode === 'workflow' ? '新增步骤' : '新增子智能体'}
                            </button>
                        )}
                    </div>

                    <div className={`${activeSolution.mode === 'workflow' ? 'space-y-0 relative' : 'space-y-3'}`}>
                        {/* Workflow Line Decoration */}
                        {activeSolution.mode === 'workflow' && (
                            <div className="absolute left-[26px] top-4 bottom-4 w-0.5 bg-gray-200 dark:bg-gray-700 z-0"></div>
                        )}

                        {activeSolution.agents.map((agent, idx) => (
                            <div key={idx} className={`relative z-10 ${activeSolution.mode === 'workflow' ? 'pb-4 last:pb-0' : ''}`}>
                                <div className={`bg-white dark:bg-gray-800 border rounded-xl p-4 transition-all 
                                    ${agent.isSystem 
                                        ? 'border-indigo-200 dark:border-indigo-900/50 shadow-sm bg-indigo-50/30' 
                                        : 'border-gray-200 dark:border-gray-700'}
                                    ${activeSolution.mode === 'workflow' ? 'ml-0' : ''}
                                `}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {/* Icon Logic */}
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 
                                                ${activeSolution.mode === 'workflow' 
                                                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                                                    : agent.isSystem 
                                                        ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600' 
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                                                {activeSolution.mode === 'workflow' ? <span className="font-bold text-xs">{idx + 1}</span> : <Users className="w-4 h-4" />}
                                            </div>
                                            
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    {agent.isSystem ? (
                                                        <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{agent.name}</span>
                                                    ) : (
                                                        <input 
                                                            value={agent.name}
                                                            onChange={(e) => updateSolutionAgent(idx, 'name', e.target.value)}
                                                            className="text-sm font-bold text-gray-900 dark:text-white bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-500 focus:outline-none w-40"
                                                        />
                                                    )}
                                                    {agent.isSystem && <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900 px-1.5 rounded text-indigo-600 dark:text-indigo-300 font-bold">CORE</span>}
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-mono mt-0.5">{agent.id}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                             {/* Workflow Ordering */}
                                             {activeSolution.mode === 'workflow' && (
                                                 <div className="flex flex-col gap-1 mr-2">
                                                     <button onClick={() => moveAgent(idx, 'up')} disabled={idx === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-20"><MoveUp className="w-3 h-3"/></button>
                                                     <button onClick={() => moveAgent(idx, 'down')} disabled={idx === activeSolution.agents.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-20"><MoveDown className="w-3 h-3"/></button>
                                                 </div>
                                             )}

                                             {/* Enable Toggle */}
                                             {(!agent.isSystem && activeSolution.mode !== 'agentic') && (
                                                 <button 
                                                    onClick={() => updateSolutionAgent(idx, 'enabled', !agent.enabled)}
                                                    className={agent.enabled ? 'text-emerald-500' : 'text-gray-400'}
                                                    title="Enable/Disable"
                                                >
                                                    {agent.enabled ? <ToggleRight /> : <ToggleLeft />}
                                                </button>
                                             )}
                                             {/* Delete Button (Non-System Only) */}
                                             {!agent.isSystem && (
                                                 <button 
                                                    onClick={() => handleDeleteAgentFromSolution(idx)}
                                                    className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                                                    title="Delete"
                                                 >
                                                     <Trash2 className="w-4 h-4" />
                                                 </button>
                                             )}
                                        </div>
                                    </div>
                                    
                                    {agent.enabled && (
                                        <div className="space-y-1 pt-1 mt-2">
                                            <label className="text-xs text-gray-500 flex items-center gap-1">
                                                <FileCode className="w-3 h-3" /> 
                                                {activeSolution.mode === 'workflow' ? 'Step Instruction (执行指令)' : 'System Prompt (人设与职责)'}
                                            </label>
                                            <textarea
                                                value={agent.systemPrompt}
                                                onChange={(e) => updateSolutionAgent(idx, 'systemPrompt', e.target.value)}
                                                rows={2}
                                                className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-700 dark:text-gray-300 font-mono resize-none focus:ring-1 focus:ring-indigo-500"
                                            />
                                        </div>
                                    )}
                                </div>
                                {activeSolution.mode === 'workflow' && idx < activeSolution.agents.length - 1 && (
                                    <div className="flex justify-center -mb-2 mt-1 relative z-20">
                                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full p-1 text-gray-400">
                                            <ArrowDown className="w-3 h-3" />
                                         </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    {activeSolution.mode === 'multi-agent' && (
                        <div className="bg-purple-50 dark:bg-purple-900/10 p-3 rounded-lg border border-purple-100 dark:border-purple-800/30 flex gap-2">
                            <Info className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-purple-600 dark:text-purple-300 leading-relaxed">
                                <b>Supervisor 模式说明：</b> 系统会自动将用户请求发送给 Supervisor。Supervisor 根据 System Prompt 中的描述，将任务动态分发给下方启用的子智能体。
                            </p>
                        </div>
                    )}
                     {activeSolution.mode === 'workflow' && (
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-800/30 flex gap-2">
                            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-600 dark:text-blue-300 leading-relaxed">
                                <b>Workflow 模式说明：</b> 线性执行模式。请求会严格按照顺序 Step 1 -> Step 2 执行。上一步的输出将作为下一步的输入。
                            </p>
                        </div>
                    )}
                </div>
             </div>
          </div>
        )}

        {/* Tools Tab */}
        {activeTab === 'tools' && (
           <div className="space-y-4">
              <div className="flex justify-between items-center mb-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/30">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg text-blue-600 dark:text-blue-400">
                        <Wrench className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">工具注册中心 (Tool Registry)</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">此处注册的工具可在所有方案中通用。Agent 会根据语义自主决定何时调用。</p>
                    </div>
                 </div>
                 <button 
                    onClick={handleAddTool}
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                 >
                    <Plus className="w-4 h-4" /> 注册新工具
                 </button>
              </div>

             <div className="grid gap-4 md:grid-cols-2">
                {config.tools.map((tool, idx) => (
                    <div key={tool.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex flex-col justify-between shadow-sm relative group hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                        {tool.isCustom && (
                            <button 
                                onClick={() => handleDeleteTool(idx)}
                                className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all opacity-0 group-hover:opacity-100"
                                title="Delete Tool"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                        
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3 w-full">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${tool.enabled ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                                    <Wrench className="w-5 h-5" />
                                </div>
                                <div className="space-y-1 w-full pr-10">
                                    {tool.isCustom ? (
                                        <input 
                                            value={tool.name}
                                            onChange={(e) => handleToolUpdate(idx, 'name', e.target.value)}
                                            className="font-bold text-gray-900 dark:text-white text-sm bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-500 focus:outline-none w-full"
                                            placeholder="Tool Display Name"
                                        />
                                    ) : (
                                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">{tool.name}</h3>
                                    )}
                                    
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-500 font-mono">
                                            {tool.id}
                                        </span>
                                        {tool.isCustom && <span className="text-[10px] text-amber-500 border border-amber-500/30 px-1 rounded">Mock</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                         {/* ID Editing for Custom Tools */}
                         {tool.isCustom && (
                             <div className="mb-2">
                                 <label className="text-[10px] font-bold text-gray-400 uppercase">Tool ID (Function Name)</label>
                                 <input 
                                     value={tool.id}
                                     onChange={(e) => handleToolUpdate(idx, 'id', e.target.value)}
                                     className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-xs font-mono text-gray-700 dark:text-gray-300 focus:outline-none focus:border-indigo-500"
                                     placeholder="e.g. get_stock_price"
                                 />
                                 <p className="text-[10px] text-gray-400 mt-1">此 ID 必须与后端 @tool 装饰器的函数名一致。</p>
                             </div>
                         )}
                        
                        {tool.isCustom ? (
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Description</label>
                                <textarea 
                                    value={tool.description}
                                    onChange={(e) => handleToolUpdate(idx, 'description', e.target.value)}
                                    className="text-xs text-gray-600 dark:text-gray-300 mb-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded p-2 w-full resize-none focus:ring-1 focus:ring-indigo-500"
                                    rows={2}
                                    placeholder="描述工具的用途，LLM 将依据此描述决定是否调用。"
                                />
                            </div>
                        ) : (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 h-8 line-clamp-2">{tool.description}</p>
                        )}
                        
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                             <span className="text-xs font-medium text-gray-500">Status</span>
                             <button 
                                onClick={() => handleToolUpdate(idx, 'enabled', !tool.enabled)}
                                className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${tool.enabled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}
                            >
                                {tool.enabled ? 'Enabled' : 'Disabled'}
                            </button>
                        </div>
                    </div>
                ))}
             </div>
           </div>
        )}

      </div>

      <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky bottom-0 z-10">
        <button className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl transition-all font-semibold shadow-lg shadow-indigo-500/20 active:scale-[0.98]">
          <Save className="w-4 h-4" />
          保存所有配置
        </button>
      </div>
    </div>
  );
};