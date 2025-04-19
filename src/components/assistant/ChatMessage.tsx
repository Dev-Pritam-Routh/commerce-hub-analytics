import { motion } from 'framer-motion';
<<<<<<< Updated upstream
import { ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProductInfo {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}
=======
import { Avatar } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import ReactMarkdown from 'react-markdown';
>>>>>>> Stashed changes

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  referenced_products?: Product[];
}

const ChatMessage = ({ role, content, timestamp, referenced_products }: ChatMessageProps) => {
  const isAssistant = role === 'assistant';

  // Extract product references from content
  const extractProductReferences = (text: string) => {
    const productRefRegex = /\[PRODUCT:([a-f0-9]{24})\]\s*(.*?)(?=\n|$)/g;
    const matches = [...text.matchAll(productRefRegex)];
    return matches.map(match => ({
      product_id: match[1],
      name: match[2].trim()
    }));
  };

  // Remove product references from content
  const cleanContent = (text: string) => {
    return text.replace(/\[PRODUCT:[a-f0-9]{24}\].*?(?=\n|$)/g, '').trim();
  };

  // Extract product ID from content if it exists
  const extractProductId = (text: string) => {
    const regex = /Product ID: ([a-f0-9]{24})/;
    const match = text.match(regex);
    return match ? match[1] : null;
  };

  // Check if the message contains a product ID
  const productId = role === 'assistant' ? extractProductId(content) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} mb-4`}
    >
<<<<<<< Updated upstream
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          role === 'user'
            ? 'bg-primary text-primary-foreground ml-auto'
            : 'bg-muted'
        }`}
      >
        <div className="whitespace-pre-wrap break-words">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
        <div
          className={`text-xs mt-1 ${
            role === 'user' ? 'text-primary-foreground/80' : 'text-muted-foreground'
          }`}
        >
          {new Date(timestamp).toLocaleTimeString()}
        </div>
        
        {/* Product info card */}
        {productInfo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-3"
          >
            <Card 
              className="p-2 cursor-pointer hover:shadow-md transition-shadow duration-300"
              onClick={() => handleProductClick(productInfo.id)}
            >
              <div className="flex items-center space-x-3">
                {productInfo.image && (
                  <img 
                    src={productInfo.image} 
                    alt={productInfo.name} 
                    className="w-16 h-16 object-cover rounded-md" 
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900 dark:text-white">{productInfo.name}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Category: {productInfo.category}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="font-semibold text-primary">${productInfo.price.toFixed(2)}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs flex items-center text-primary p-0 h-6"
                    >
                      View details <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
=======
      <div className={`flex ${isAssistant ? 'flex-row' : 'flex-row-reverse'} items-start max-w-3xl`}>
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
              <ReactMarkdown>
                {cleanContent(content)}
              </ReactMarkdown>
            </div>
          </div>
          {referenced_products && referenced_products.length > 0 && (
            <div className="mt-4 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {referenced_products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
          <span className="text-xs text-muted-foreground mt-1">
            {new Date(timestamp).toLocaleTimeString()}
          </span>
        </div>
>>>>>>> Stashed changes
      </div>
    </motion.div>
  );
};

export default ChatMessage;
