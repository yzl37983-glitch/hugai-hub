import React from 'react';
import { AgentStep, AgentType } from '../types';
import { CheckCircle2, Circle, Loader2, BrainCircuit, Search, Database, MessageSquare } from 'lucide-react';

interface ThinkingProcessProps {
  steps: AgentStep[];
  isThinking: boolean;
}

const getAgentIcon = (type: string) => {
  switch (type) {
    case 'supervisor': return <BrainCircuit className="w-3.5 h-3.5" />;
    case 'search_agent': return <Search className="w-3.5 h-3.5" />;
    case 'rag_agent': return <Database className="w-3.5 h-3.5" />;
    case 'chat_agent': return <MessageSquare className="w-3.5 h-3.5" />;
    default: return <Circle className="w-3.5 h-3.5" />;
  }
};

const getAgentStyles = (type: string) => {
  switch (type) {
    case 'supervisor': return 'text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-400/30 bg-purple-50 dark:bg-purple-400/10';
    case 'search_agent': return 'text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-400/30 bg-blue-50 dark:bg-blue-400/10';
    case 'rag_agent': return 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-400/30 bg-emerald-50 dark:bg-emerald-400/10';
    case 'chat_agent': return 'text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-400/30 bg-orange-50 dark:bg-orange-400/10';
    default: return 'text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800';
  }
};

export const ThinkingProcess: React.FC<ThinkingProcessProps> = ({ steps, isThinking }) => {
  if (steps.length === 0 && !isThinking) return null;

  return (
    <div className="text-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1 rounded bg-gray-100 dark:bg-gray-700">
           <BrainCircuit className="w-3 h-3 text-gray-500 dark:text-gray-400" />
        </div>
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          思维链 (Chain of Thought)
        </span>
      </div>
      
      <div className="relative pl-3 space-y-3">
        {/* Vertical Line */}
        <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-700" />

        {steps.map((step, index) => {
          const isActive = step.status === 'running';
          
          return (
            <div key={step.id} className="relative pl-4">
              {/* Dot on timeline */}
              <div className={`absolute left-0 top-3 w-3 h-3 -translate-x-1/2 rounded-full border-2 transition-colors z-10 ${
                isActive 
                  ? 'bg-white dark:bg-gray-800 border-indigo-500 animate-pulse' 
                  : step.status === 'completed' 
                    ? 'bg-indigo-500 border-indigo-500' 
                    : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
              }`} />

              <div className={`p-3 rounded-lg border text-sm transition-all duration-300 ${getAgentStyles(step.agent)}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 font-semibold">
                    {getAgentIcon(step.agent)}
                    <span className="capitalize">{step.agent.replace('_', ' ')}</span>
                  </div>
                  <div className="text-xs opacity-75">
                    {step.status === 'running' ? (
                      <div className="flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Running
                      </div>
                    ) : (
                      <CheckCircle2 className="w-3 h-3" />
                    )}
                  </div>
                </div>
                
                <div className="opacity-90 leading-relaxed">
                  {step.description}
                </div>

                {step.output && (
                   <div className="mt-2 text-xs font-mono p-2 rounded bg-black/5 dark:bg-black/30 border border-black/5 dark:border-white/5 whitespace-pre-wrap">
                     {step.output}
                   </div>
                )}
              </div>
            </div>
          );
        })}

        {isThinking && steps.length > 0 && steps[steps.length - 1].status === 'completed' && (
           <div className="relative pl-4">
             <div className="absolute left-0 top-2 w-2 h-2 -translate-x-1/2 rounded-full bg-gray-400 dark:bg-gray-500 animate-ping" />
             <div className="text-xs text-gray-500 dark:text-gray-400 italic">
               生成最终回复中...
             </div>
           </div>
        )}
      </div>
    </div>
  );
};