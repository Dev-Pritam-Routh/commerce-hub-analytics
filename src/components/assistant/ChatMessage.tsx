
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProductInfo {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface ChatMessageProps {
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
  productInfo?: ProductInfo;
}

const ChatMessage = ({ role, content, timestamp, productInfo }: ChatMessageProps) => {
  const navigate = useNavigate();
  
  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          role === 'user'
            ? 'bg-primary text-primary-foreground ml-auto'
            : 'bg-muted'
        }`}
      >
        <div className="whitespace-pre-wrap break-words">{content}</div>
        <div
          className={`text-xs mt-1 ${
            role === 'user' ? 'text-primary-foreground/80' : 'text-muted-foreground'
          }`}
        >
          {new Date(timestamp).toLocaleTimeString()}
        </div>
        
        {/* Product info card */}
        {productInfo && (
          <div 
            className="mt-3 p-2 bg-white dark:bg-slate-800 rounded-md shadow-sm cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-700"
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
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white">{productInfo.name}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Category: {productInfo.category}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="font-semibold text-primary">${productInfo.price.toFixed(2)}</p>
                  <span className="text-xs flex items-center text-primary">
                    View details <ExternalLink className="ml-1 h-3 w-3" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessage;
