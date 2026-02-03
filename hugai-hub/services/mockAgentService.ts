import { Message, AgentStep, AgentType, SolutionMode } from '../types';

// Helper to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateId = () => Math.random().toString(36).substr(2, 9);

/**
 * Simulates the Agent execution based on mode
 */
export const simulateAgentResponse = async (
  input: string, 
  mode: SolutionMode,
  onStep: (step: AgentStep) => void
): Promise<string> => {
  
  // --- MULTI-AGENT MODE FLOW ---
  if (mode === 'multi-agent') {
    // 1. Supervisor Node: Intent Recognition
    const supervisorStepId = generateId();
    onStep({
      id: supervisorStepId,
      agent: 'supervisor',
      status: 'running',
      description: 'Supervisor: 分析用户意图并分发任务...',
      timestamp: Date.now()
    });

    await delay(1200);

    // Determine intent
    let selectedAgent: AgentType = 'chat_agent';
    let intentDescription = '判断为闲聊任务，路由至 Chat Agent';

    if (input.includes('搜索') || input.includes('查') || input.includes('最新')) {
      selectedAgent = 'search_agent';
      intentDescription = '需要实时信息，路由至 Search Agent';
    } else if (input.includes('文档') || input.includes('知识库') || input.includes('RAG')) {
      selectedAgent = 'rag_agent';
      intentDescription = '涉及内部知识，路由至 RAG Agent';
    }

    onStep({
      id: supervisorStepId,
      agent: 'supervisor',
      status: 'completed',
      description: intentDescription,
      timestamp: Date.now()
    });

    // 2. Worker Node Execution
    const workerStepId = generateId();
    const agentNames: Record<string, string> = {
      'supervisor': 'Supervisor',
      'rag_agent': 'RAG 知识库助手',
      'search_agent': '联网搜索助手',
      'chat_agent': '通用对话助手'
    };

    onStep({
      id: workerStepId,
      agent: selectedAgent,
      status: 'running',
      description: `${agentNames[selectedAgent] || 'Worker'} 正在执行...`,
      timestamp: Date.now()
    });

    await delay(2000);

    let output = '';
    let finalResponse = '';

    switch (selectedAgent) {
      case 'search_agent':
        output = `Tool Call: duckduckgo_search("${input}")\nResult: Found 3 relevant articles.`;
        finalResponse = `根据搜索结果，"${input}" 的相关信息如下：\n\n1. 2026年 AI Agent 技术已全面普及。\n2. Multi-Agent 架构成为企业级应用首选。\n\n如需更多细节请告知。`;
        break;
      case 'rag_agent':
        output = `Retrieval: query_chromadb("${input}")\nResult: 2 chunks (Score: 0.92)`;
        finalResponse = `检索到相关知识库文档：\n\nHugAi 方案配置文档显示，您可以在“系统配置”中切换 Multi-Agent 或 Agentic 模式。\n\n更多详情请查阅 V3.0 手册。`;
        break;
      case 'chat_agent':
      default:
        output = `LLM Inference...`;
        finalResponse = `收到！我是您的协作助手。关于 "${input}"，这是一个很好的问题。\n\n我可以帮您调用工具或查询知识库，请问需要我做什么？`;
        break;
    }

    onStep({
      id: workerStepId,
      agent: selectedAgent,
      status: 'completed',
      description: `执行完成`,
      output: output,
      timestamp: Date.now()
    });

    return finalResponse;
  } 
  
  // --- WORKFLOW MODE FLOW (Sequential Chain) ---
  else if (mode === 'workflow') {
      const steps = ['Input Analysis', 'Data Processing', 'Final Generation'];
      
      for (let i = 0; i < steps.length; i++) {
          const stepId = generateId();
          const stepName = steps[i];
          
          onStep({
            id: stepId,
            agent: 'workflow_step',
            status: 'running',
            description: `Step ${i + 1}: ${stepName} 正在执行...`,
            timestamp: Date.now()
          });

          await delay(1200);

          let output = '';
          if (i === 0) output = `Analysis: User asking for "${input}"`;
          if (i === 1) output = `Processing: Data transformed successfully.`;
          if (i === 2) output = `Generation: Content created.`;

          onStep({
            id: stepId,
            agent: 'workflow_step',
            status: 'completed',
            description: `${stepName} 完成`,
            output: output,
            timestamp: Date.now()
          });
      }

      return `(Workflow Result) 流程执行完毕。\n\n输入 "${input}" 已按照预定工序处理完成。`;
  }

  // --- AGENTIC MODE FLOW (System 2 / ReAct Loop) ---
  else {
    // Step 1: Planning / Thought
    const step1Id = generateId();
    onStep({
      id: step1Id,
      agent: 'custom_agent', 
      status: 'running',
      description: 'System 2 Thinking: 拆解任务与规划 (Planning)...',
      timestamp: Date.now()
    });
    
    await delay(1500);
    
    onStep({
      id: step1Id,
      agent: 'custom_agent',
      status: 'completed',
      description: '已生成执行计划',
      output: `Thought: 用户想要 "${input}"。\n1. 检查是否有相关工具。\n2. 如果需要搜索，调用 Search 工具。\n3. 对结果进行反思验证。`,
      timestamp: Date.now()
    });

    // Step 2: Action / Tool Use
    const step2Id = generateId();
    let finalResponse = '';
    
    if (input.includes('搜索') || input.includes('查')) {
        onStep({
            id: step2Id,
            agent: 'custom_agent',
            status: 'running',
            description: 'Action: 调用工具获取外部信息...',
            timestamp: Date.now()
        });
        await delay(1500);
        
        onStep({
            id: step2Id,
            agent: 'custom_agent',
            status: 'completed',
            description: '工具调用成功',
            output: `Tool: duckduckgo_search\nInput: "${input}"\nObservation: 获得 3 条结果。`,
            timestamp: Date.now()
        });
        
        finalResponse = `(Agentic Mode) 经过联网检索与反思，关于 "${input}" 的结论如下：\n\n该领域目前正处于快速上升期，Agentic Workflow (代理工作流) 通过引入循环与反思机制，显著提升了复杂任务的准确率。`;
    } else {
        // Direct thought
        onStep({
            id: step2Id,
            agent: 'custom_agent',
            status: 'running',
            description: 'Reflection: 自我反思与生成...',
            timestamp: Date.now()
        });
        await delay(1000);
        
        onStep({
            id: step2Id,
            agent: 'custom_agent',
            status: 'completed',
            description: '完成推理',
            output: `Critique: 检查生成内容的逻辑一致性。\nResult: 通过。`,
            timestamp: Date.now()
        });
        
        finalResponse = `(Agentic Mode) 我是一个独立智能体。我通过内部的 ReAct (Reason+Act) 循环来处理您的请求，而不需要 Supervisor 进行分发。\n\n针对 "${input}"，我的建议是...`;
    }

    return finalResponse;
  }
};