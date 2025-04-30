
import React, { useEffect, useState } from 'react';
import { ChatMessage as ChatMessageType } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ChatProductResponse from './ChatProductResponse';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const renderProductResponse = (productIds: string | string[]) => {
    if (!productIds || (Array.isArray(productIds) && productIds.length === 0)) {
      return null;
    }
    
    // Convert to array if it's a string
    const ids = Array.isArray(productIds) ? productIds : [productIds];
    
    return <ChatProductResponse productIds={ids} />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 10 }}
      transition={{ duration: 0.3 }}
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-6 px-2`}
    >
      <div className="flex flex-row items-start gap-3 max-w-[85%]">
        {message.role === 'assistant' && (
          <Avatar className="mt-0.5 border border-slate-600 bg-slate-700">
            <AvatarImage src="/assets/images/assistant-avatar.png" alt="AI" />
            <AvatarFallback className="bg-slate-700 text-slate-200">AI</AvatarFallback>
          </Avatar>
        )}
        <div className="flex flex-col text-sm w-full">
          <div
            className={cn(
              "px-4 py-3 rounded-2xl backdrop-blur-sm",
              message.role === 'user'
                ? "bg-gradient-to-br from-[#9b87f5] to-[#7E69AB] text-white"
                : "bg-[#333333]/80 text-slate-100 dark:bg-slate-800/80"
            )}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({node, className, children, ...props}) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !match ? (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  ) : (
                    <SyntaxHighlighter
                      style={dracula}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  );
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
            {message.productIds && renderProductResponse(message.productIds)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 px-1">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        {message.role === 'user' && (
          <Avatar className="mt-0.5 border border-slate-600 bg-slate-700">
            <AvatarFallback className="bg-slate-700 text-slate-200">You</AvatarFallback>
          </Avatar>
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessage;
