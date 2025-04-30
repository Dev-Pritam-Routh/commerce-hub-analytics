import React, { useEffect, useState } from 'react';
import { ChatMessage as ChatMessageType } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ChatProductCard from './ChatProductCard';
import ChatProductResponse from './ChatProductResponse';

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
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className="flex flex-row items-start gap-2 max-w-[80%]">
        {message.role === 'assistant' && (
          <Avatar>
            <AvatarImage src="/assets/images/assistant-avatar.png" alt="Assistant Avatar" />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
        )}
        <div className="flex flex-col text-sm w-full">
          <div className={`px-4 py-2 rounded-lg ${message.role === 'user' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-gray-200'}`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = (className || '').match(/language-(\w+)/);
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={dracula}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
            {message.productIds && renderProductResponse(message.productIds)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
