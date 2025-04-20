
import { motion } from 'framer-motion';
import { Avatar } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';
import { Product } from '@/types';
import ReactMarkdown from 'react-markdown';
import ChatProductResponse from './ChatProductResponse';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  referenced_products?: Product[];
  type?: string;
  productIds?: string | string[];
}

const ChatMessage = ({ 
  role, 
  content, 
  timestamp, 
  referenced_products,
  type,
  productIds 
}: ChatMessageProps) => {
  const isAssistant = role === 'assistant';

  // Clean and format the message content
  const formatMessage = (text: string): string => {
    if (typeof text !== 'string') {
      return '';
    }
    
    // Remove any LaTeX formatting
    let cleanedText = text.replace(/\$\$.*?\$\$/g, '');
    cleanedText = cleanedText.replace(/\$.*?\$/g, '');
    
    // Remove product references
    cleanedText = cleanedText.replace(/\[PRODUCT:[a-f0-9]{24}\].*?(?=\n|$)/g, '').trim();
    
    // Format markdown properly
    return cleanedText;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} mb-4`}
    >
      <div className={`flex ${isAssistant ? 'flex-row' : 'flex-row-reverse'} items-start max-w-[80%]`}>
        <Avatar className={`h-8 w-8 ${isAssistant ? 'mr-2' : 'ml-2'}`}>
          {isAssistant ? (
            <Bot className="h-5 w-5 text-gold" />
          ) : (
            <User className="h-5 w-5 text-primary" />
          )}
        </Avatar>
        <div className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}>
          <div className={`rounded-lg p-3 ${
            isAssistant 
              ? 'bg-muted text-foreground' 
              : 'bg-primary text-primary-foreground'
          }`}>
            <div className="prose dark:prose-invert max-w-none">
              {isAssistant ? (
                <ReactMarkdown>
                  {formatMessage(content)}
                </ReactMarkdown>
              ) : (
                <div>{content}</div>
              )}
            </div>
          </div>
          
          {/* Display product cards if there are product IDs */}
          {isAssistant && productIds && (
            <div className="mt-4 w-full">
              <ChatProductResponse productIds={productIds} />
            </div>
          )}
          
          {/* Display referenced products if available */}
          {referenced_products && referenced_products.length > 0 && (
            <div className="mt-4 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {referenced_products.map((product) => (
                <ProductCard key={product.product_id} product={product} />
              ))}
            </div>
          )}
          
          <span className="text-xs text-muted-foreground mt-1">
            {new Date(timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
