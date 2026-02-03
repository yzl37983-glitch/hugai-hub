import React, { useState, useRef, useEffect } from 'react';
import { Message, AppConfig, AgentStep, Solution } from './types';
import { ChatMessage } from './components/ChatMessage';
import { SettingsPanel } from './components/SettingsPanel';
import { KnowledgeBase } from './components/KnowledgeBase';
import { simulateAgentResponse, generateId } from './services/mockAgentService';
import { Send, Menu, MessageSquare, Box, Github, Moon, Sun, ChevronLeft, ChevronRight, Layout } from 'lucide-react';

type Tab = 'chat' | 'knowledge' | 'settings';

export default function App() {
  // Theme State - Default to 'light' as requested
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  
  // Layout State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  
  // App Logic State
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '您好！我是 HugAi 智能中枢。\n\n我们提供三种 AI 协作范式：\n1. **Multi-Agent 团队**：Supervisor 统一调度。\n2. **Agentic Loop**：具备 System 2 慢思考能力的独立智能体。\n3. **Workflow (New)**：确定性的线性执行流。\n\n请在顶部选择适合您的方案开始对话。',
      timestamp: Date.now()
    }
  ]);
  
  // Configuration State
  const [config, setConfig] = useState<AppConfig>({
    modelName: 'gpt-4o',
    baseUrl: 'https://api.openai.com/v1',
    apiKey: '',
    temperature: 0.7,
    provider: 'openai',
    activeSolutionId: 'default_multi',
    solutions: [
      {
        id: 'default_multi',
        name: '协作专家组 (Multi-Agent Team)',
        description: '经典 Supervisor 架构。任务被路由至专门的 Search、RAG 或 Chat 专家处理。',
        mode: 'multi-agent',
        enabledTools: ['duckduckgo', 'calculator'],
        agents: [
          {
            id: 'supervisor',
            type: 'supervisor',
            name: 'Supervisor (智能中枢)',
            description: '负责意图识别和任务路由',
            systemPrompt: '你是智能中枢，请根据用户问题选择合适的助手 (Search, RAG, Chat)。',
            enabled: true,
            isSystem: true
          },
          {
            id: 'search_agent',
            type: 'search_agent',
            name: 'Search Agent (搜索)',
            description: '负责联网检索最新信息',
            systemPrompt: '你是一个搜索助手，擅长使用搜索引擎工具查找实时信息。',
            enabled: true
          },
          {
            id: 'rag_agent',
            type: 'rag_agent',
            name: 'RAG Agent (知识库)',
            description: '负责查询本地向量数据库',
            systemPrompt: '你是一个知识库助手，请基于检索到的文档切片回答用户问题。',
            enabled: true
          },
          {
            id: 'chat_agent',
            type: 'chat_agent',
            name: 'Chat Agent (对话)',
            description: '负责通用闲聊和文本润色',
            systemPrompt: '你是一个友好的聊天助手，负责处理一般性对话。',
            enabled: true
          }
        ]
      },
      {
        id: 'simple_agentic',
        name: '深度思考者 (Agentic Loop)',
        description: '单体 Agentic 模式。采用 System 2 慢思考机制，包含规划(Plan)、执行(Act)与反思(Reflect)循环。',
        mode: 'agentic',
        enabledTools: ['duckduckgo'],
        agents: [
           {
            id: 'primary',
            type: 'custom_agent',
            name: 'Reasoning Engine',
            description: '具备 ReAct 循环能力的核心大脑',
            systemPrompt: 'You are a helpful assistant with tool access and self-reflection capabilities.',
            enabled: true,
            isSystem: true
           }
        ]
      },
      {
        id: 'simple_workflow',
        name: '文章生成流 (Sequential Workflow)',
        description: '线性工作流：大纲生成 -> 内容扩写 -> 润色审阅。',
        mode: 'workflow',
        enabledTools: [],
        agents: [
           {
            id: 'step_1',
            type: 'workflow_step',
            name: 'Step 1: Outline',
            description: 'Generate structure',
            systemPrompt: 'Create a detailed outline.',
            enabled: true
           },
           {
            id: 'step_2',
            type: 'workflow_step',
            name: 'Step 2: Draft',
            description: 'Expand on outline',
            systemPrompt: 'Write the full content based on the outline.',
            enabled: true
           },
           {
            id: 'step_3',
            type: 'workflow_step',
            name: 'Step 3: Polish',
            description: 'Final review',
            systemPrompt: 'Fix grammar and improve style.',
            enabled: true
           }
        ]
      }
    ],
    tools: [
      {
        id: 'duckduckgo',
        name: 'DuckDuckGo Search',
        description: '用于搜索互联网上的实时公开信息。',
        enabled: true,
        requiresKey: false
      },
      {
        id: 'calculator',
        name: 'Python REPL / Calculator',
        description: '用于执行精确的数学计算或代码逻辑。',
        enabled: true,
        requiresKey: false
      },
      {
        id: 'weather',
        name: 'OpenWeatherMap',
        description: '查询全球各地的实时天气情况。',
        enabled: false,
        requiresKey: true
      }
    ]
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle Theme Class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (activeTab === 'chat') {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking, activeTab]);

  // Focus input when switching to chat
  useEffect(() => {
      if (activeTab === 'chat' && !isThinking) {
          inputRef.current?.focus();
      }
  }, [activeTab, isThinking]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const activeSolution = config.solutions.find(s => s.id === config.activeSolutionId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking || !activeSolution) return;

    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    const assistantMsgId = generateId();
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      steps: [],
      isThinking: true
    };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      const finalContent = await simulateAgentResponse(
        userMsg.content, 
        activeSolution.mode,
        (step) => {
          setMessages(prev => prev.map(msg => {
            if (msg.id === assistantMsgId) {
              const existingSteps = msg.steps || [];
              const stepIndex = existingSteps.findIndex(s => s.id === step.id);
              let newSteps;
              if (stepIndex >= 0) {
                  newSteps = [...existingSteps];
                  newSteps[stepIndex] = step;
              } else {
                  newSteps = [...existingSteps, step];
              }
              return { ...msg, steps: newSteps };
            }
            return msg;
          }));
        }
      );

      setMessages(prev => prev.map(msg => {
        if (msg.id === assistantMsgId) {
          return { ...msg, content: finalContent, isThinking: false };
        }
        return msg;
      }));
    } catch (error) {
      console.error(error);
      setMessages(prev => prev.map(msg => {
        if (msg.id === assistantMsgId) {
          return { ...msg, content: "系统遇到错误，请稍后再试。", isThinking: false };
        }
        return msg;
      }));
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-hidden transition-colors duration-300 font-sans">
      
      {/* Sidebar Navigation */}
      <aside 
        className={`${isSidebarOpen ? 'w-64 md:w-72' : 'w-20'} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out flex flex-col shrink-0 z-20 shadow-xl md:shadow-none absolute md:relative h-full ${!isSidebarOpen && 'items-center'}`}
      >
        {/* Brand */}
        <div className={`p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3 ${!isSidebarOpen && 'justify-center p-4'}`}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
                <Box className="w-6 h-6 text-white" />
            </div>
            {isSidebarOpen && (
                <div className="overflow-hidden whitespace-nowrap">
                    <h1 className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">HugAi</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Nano Agent Hub</p>
                </div>
            )}
        </div>

        {/* Nav Links */}
        <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
            {[
                { id: 'chat', label: '智能对话', icon: MessageSquare },
                { id: 'knowledge', label: '知识库 RAG', icon: Box },
                { id: 'settings', label: '系统配置', icon: Menu }
            ].map(item => (
                <button 
                    key={item.id}
                    onClick={() => setActiveTab(item.id as Tab)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative
                        ${activeTab === item.id 
                            ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' 
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                        }
                        ${!isSidebarOpen && 'justify-center'}
                    `}
                    title={!isSidebarOpen ? item.label : ''}
                >
                    <item.icon className={`w-5 h-5 shrink-0 ${activeTab === item.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                    {isSidebarOpen && <span>{item.label}</span>}
                    
                    {/* Active Indicator Bar */}
                    {activeTab === item.id && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full" />
                    )}
                </button>
            ))}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
            
            {/* Theme Toggle */}
            <button 
                onClick={toggleTheme}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white
                    ${!isSidebarOpen && 'justify-center'}
                `}
            >
                {theme === 'dark' ? <Moon className="w-5 h-5 shrink-0" /> : <Sun className="w-5 h-5 shrink-0" />}
                {isSidebarOpen && <span>{theme === 'dark' ? '深色模式' : '浅色模式'}</span>}
            </button>

            {/* Collapse Button (Desktop only for visual logic) */}
            <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white hidden md:flex
                    ${!isSidebarOpen && 'justify-center'}
                `}
            >
                {isSidebarOpen ? <ChevronLeft className="w-5 h-5 shrink-0" /> : <ChevronRight className="w-5 h-5 shrink-0" />}
                {isSidebarOpen && <span>收起侧边栏</span>}
            </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
        
        {/* Mobile Header */}
        <div className="md:hidden h-16 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 bg-white dark:bg-gray-900 sticky top-0 z-10 justify-between">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Box className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">HugAi</span>
           </div>
           <button 
             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
           >
             <Menu className="w-6 h-6" />
           </button>
        </div>

        {/* Conditional Content Rendering */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
            
            {/* 1. CHAT VIEW */}
            {activeTab === 'chat' && (
                <>
                    {/* Chat Header: Solution Selector */}
                    <div className="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10">
                        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                             <div className="flex items-center gap-2">
                                <Layout className="w-4 h-4 text-indigo-500" />
                                <span className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Scheme:</span>
                             </div>
                             <div className="relative">
                                <select 
                                    value={config.activeSolutionId}
                                    onChange={(e) => setConfig({...config, activeSolutionId: e.target.value})}
                                    className="appearance-none bg-transparent text-sm font-bold text-gray-900 dark:text-white focus:outline-none cursor-pointer pr-4 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                >
                                    {config.solutions.map(s => (
                                        <option key={s.id} value={s.id} className="text-black">{s.name}</option>
                                    ))}
                                </select>
                             </div>
                        </div>
                        <div className={`hidden md:flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider 
                            ${activeSolution?.mode === 'multi-agent' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300' 
                            : activeSolution?.mode === 'agentic' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300'
                            }`}>
                             {activeSolution?.mode === 'multi-agent' ? 'Multi-Agent Team' : activeSolution?.mode === 'agentic' ? 'Agentic Loop' : 'Workflow Sequence'}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <div className="max-w-3xl mx-auto w-full py-8">
                             {messages.map(msg => (
                                <ChatMessage key={msg.id} message={msg} />
                            ))}
                            <div ref={messagesEndRef} className="h-4" />
                        </div>
                    </div>

                    <div className="p-4 md:p-6 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800/50">
                        <div className="max-w-3xl mx-auto relative">
                             <form onSubmit={handleSubmit} className="relative shadow-2xl shadow-gray-200 dark:shadow-black/50 rounded-2xl">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={`Message ${activeSolution?.name || 'Assistant'}...`}
                                    className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-2xl pl-5 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder-gray-400 dark:placeholder-gray-600 text-base"
                                    disabled={isThinking}
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isThinking}
                                    className="absolute right-2 top-2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all active:scale-95"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                            <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-3">
                                HugAi • {activeSolution?.mode === 'multi-agent' ? 'Orchestrated by Supervisor' : activeSolution?.mode === 'workflow' ? 'Running Sequential Pipeline' : 'Powered by ReAct Loop'}
                            </p>
                        </div>
                    </div>
                </>
            )}

            {/* 2. CONFIG VIEW */}
            {activeTab === 'settings' && (
                <div className="flex-1 overflow-hidden">
                    <SettingsPanel config={config} onConfigChange={setConfig} />
                </div>
            )}

            {/* 3. KNOWLEDGE VIEW */}
            {activeTab === 'knowledge' && (
                <div className="flex-1 overflow-hidden">
                    <KnowledgeBase />
                </div>
            )}

        </div>
      </main>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/50 z-10 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
      )}
    </div>
  );
}