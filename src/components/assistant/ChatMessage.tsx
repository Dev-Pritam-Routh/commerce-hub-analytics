import { motion } from 'framer-motion';
import { Avatar } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

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

  // Sanitize and format content for ReactMarkdown
  const getFormattedContent = (text: string) => {
    try {
      // Remove product references
      let cleanedText = text.replace(/\[PRODUCT:[a-f0-9]{24}\].*?(?=\n|$)/g, '').trim();
      
      // Format the message
      cleanedText = cleanedText
        .replace(/\n\s*\n/g, '\n\n')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Ensure it's a string and handle any special characters
      return String(cleanedText);
    } catch (error) {
      console.error('Error formatting content:', error);
      return String(text);
    }
  };

  const formattedContent = getFormattedContent(content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} mb-4`}
    >
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
              {isAssistant ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className="bg-muted px-1 py-0.5 rounded text-sm" {...props}>
                          {String(children)}
                        </code>
                      );
                    },
                    p({ children }) {
                      return <p className="mb-4 leading-relaxed">{String(children)}</p>;
                    },
                    ul({ children }) {
                      return <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>;
                    },
                    ol({ children }) {
                      return <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>;
                    },
                    li({ children }) {
                      return <li className="mb-1">{String(children)}</li>;
                    },
                    blockquote({ children }) {
                      return (
                        <blockquote className="border-l-4 border-muted-foreground pl-4 italic my-4">
                          {String(children)}
                        </blockquote>
                      );
                    },
                    table({ children }) {
                      return (
                        <div className="overflow-x-auto">
                          <table className="border-collapse border border-muted-foreground my-4">
                            {children}
                          </table>
                        </div>
                      );
                    },
                    th({ children }) {
                      return (
                        <th className="border border-muted-foreground px-4 py-2 bg-muted">
                          {String(children)}
                        </th>
                      );
                    },
                    td({ children }) {
                      return (
                        <td className="border border-muted-foreground px-4 py-2">
                          {String(children)}
                        </td>
                      );
                    }
                  }}
                >
                  {formattedContent}
                </ReactMarkdown>
              ) : (
                <div className="whitespace-pre-wrap">{formattedContent}</div>
              )}
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
      </div>
    </motion.div>
  );
};

export default ChatMessage;
