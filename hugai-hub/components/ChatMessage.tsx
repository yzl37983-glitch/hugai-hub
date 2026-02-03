import React from 'react';
import { Message } from '../types';
import { Bot, User, Copy, Check } from 'lucide-react';
import { ThinkingProcess } from './ThinkingProcess';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 px-4 md:px-0`}>
      <div className={`flex max-w-[90%] md:max-w-[85%] gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-sm ${
          isUser 
            ? 'bg-indigo-600 text-white' 
            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-emerald-600 dark:text-emerald-400'
        }`}>
          {isUser ? <User className="w-5 h-5 md:w-6 md:h-6" /> : <Bot className="w-5 h-5 md:w-6 md:h-6" />}
        </div>
        
        {/* Message Bubble */}
        <div className={`flex flex-col min-w-0 ${isUser ? 'items-end' : 'items-start'}`}>
          <div className="flex items-center gap-2 mb-1 px-1">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {isUser ? 'User' : 'HugAi Assistant'}
            </span>
          </div>

          <div className={`relative group p-4 rounded-2xl shadow-sm border ${
            isUser 
              ? 'bg-indigo-600 text-white border-indigo-500 rounded-tr-sm' 
              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 rounded-tl-sm'
          }`}>
            
            {!isUser && (
               <button 
                 onClick={handleCopy}
                 className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-300"
                 title="Copy"
               >
                 {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
               </button>
            )}

            {/* Thinking Process Visualization */}
            {!isUser && message.steps && message.steps.length > 0 && (
              <div className="mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                <ThinkingProcess steps={message.steps} isThinking={!!message.isThinking} />
              </div>
            )}

            <div className={`prose prose-sm max-w-none break-words leading-relaxed ${
              isUser 
                ? 'prose-invert text-white' 
                : 'dark:prose-invert text-gray-800 dark:text-gray-100'
            }`}>
              {message.content}
              {message.isThinking && !message.content && (
                 <span className="inline-block w-2 h-4 bg-gray-400 dark:bg-gray-500 animate-pulse ml-1"/>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};