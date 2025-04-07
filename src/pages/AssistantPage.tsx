
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Bot, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { getProductById } from '@/services/productService';
import config from '@/config';
import ChatMessage from '@/components/assistant/ChatMessage';
import QuickPromptButton from '@/components/assistant/QuickPromptButton';
import ChatSidebar from '@/components/assistant/ChatSidebar';
import ChatInput from '@/components/assistant/ChatInput';
import { useIsMobile } from '@/hooks/use-mobile';
import ThemeToggle from '@/components/ThemeToggle';

// Define the message interface
interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
  productInfo?: {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
  };
}

// Product info interface
interface ProductInfo {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
}

const quickPrompts = [
  "What are some trending products right now?",
  "Can you recommend a good laptop for video editing?",
  "I'm looking for a gift for my mom",
  "Show me similar products to this image"
];

const AssistantPage = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // API URL from config
  const API_URL = config.assistantApiUrl;

  // Create a new chat session when the component mounts
  useEffect(() => {
    createChatSession();
    // Close sidebar on mobile by default
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createChatSession = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/chat/session`, {
        user_id: user?.id || 'guest',
        user_email: user?.email || undefined
      });

      if (response.data && response.data.session_id) {
        setSessionId(response.data.session_id);
        setMessages([
          {
            role: 'assistant',
            content: response.data.message || 'Welcome to your premium shopping assistant. Ask me anything about products, pricing, or recommendations.',
            timestamp: new Date().toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error('Error creating chat session:', error);
      toast.error('Failed to connect to the assistant. Please try again later.');
      // Set default welcome message even if API fails
      setMessages([
        {
          role: 'assistant',
          content: 'Welcome to your premium shopping assistant. Ask me anything about products, pricing, or recommendations. (Note: I\'m currently in demo mode)',
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Parse product IDs from message content
  const parseProductIds = (content: string): string[] => {
    // Look for product IDs in the format "Product ID: XXXX - productName" or just "Product ID: XXXX"
    const regex = /Product ID: ([a-f0-9]{24})/g;
    const matches = [...content.matchAll(regex)];
    return matches.map(match => match[1]);
  };

  // Fetch product information for a product ID
  const fetchProductInfo = async (productId: string): Promise<ProductInfo | null> => {
    try {
      const product = await getProductById(productId);
      return product;
    } catch (error) {
      console.error(`Error fetching product ${productId}:`, error);
      return null;
    }
  };

  // Process message to add product info
  const processMessageWithProductInfo = async (message: ChatMessage): Promise<ChatMessage> => {
    if (message.role !== 'assistant') return message;

    const productIds = parseProductIds(message.content);
    if (productIds.length === 0) return message;

    try {
      // Just get the first product for simplicity
      const productId = productIds[0];
      const productInfo = await fetchProductInfo(productId);
      
      if (productInfo) {
        return {
          ...message,
          productInfo: {
            id: productInfo._id,
            name: productInfo.name,
            price: productInfo.price,
            image: productInfo.images[0],
            category: productInfo.category
          }
        };
      }
    } catch (error) {
      console.error('Error processing product info:', error);
    }

    return message;
  };

  const handleSendMessage = async (newMessage: string, imageFile: File | null) => {
    if (!newMessage.trim() && !imageFile) return;
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      role: 'user',
      content: newMessage,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Show typing indicator
    setLoading(true);
    
    try {
      // Prepare request data
      const requestData: any = {
        session_id: sessionId || 'demo-session',
        message: newMessage
      };
      
      // If we have an image file, encode it as base64
      if (imageFile) {
        const base64String = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            // Extract the base64 data without the prefix
            const base64Data = base64.split(',')[1];
            resolve(base64Data);
          };
          reader.readAsDataURL(imageFile);
        });
        
        requestData.image_data = base64String;
      }
      
      // Send the message to the API
      const response = await axios.post(`${API_URL}/api/chat/message`, requestData);
      
      // Add assistant response to chat
      if (response.data && response.data.message) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.data.message,
          timestamp: new Date().toISOString()
        };
        
        // Process the message to add product info if any
        const processedMessage = await processMessageWithProductInfo(assistantMessage);
        setMessages(prev => [...prev, processedMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Add fallback response in case of API failure
      const fallbackMessage: ChatMessage = {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, fallbackMessage]);
      toast.error('Failed to get response from the assistant.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPromptClick = (prompt: string) => {
    handleSendMessage(prompt, null);
  };
  
  const handleNewChat = () => {
    setMessages([]);
    createChatSession();
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <ChatSidebar 
        onNewChat={handleNewChat} 
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      {/* Main chat area */}
      <div 
        className={`flex-1 flex flex-col transition-all ${
          isSidebarOpen && !isMobile ? "ml-[320px]" : "ml-0"
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 md:h-20 px-4 border-b flex items-center justify-between bg-background">
          <div className="flex items-center">
            <button 
              onClick={toggleSidebar}
              className="p-2 mr-2 rounded-md hover:bg-accent"
              aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              <ArrowLeft className={`h-5 w-5 transition-transform ${isSidebarOpen ? "rotate-0" : "rotate-180"}`} />
            </button>
            <h1 className="text-xl font-bold text-gold">Shopping Assistant</h1>
          </div>
          {!isSidebarOpen && <ThemeToggle />}
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center max-w-md"
              >
                <Avatar className="h-16 w-16 mx-auto mb-4 bg-gold/10">
                  <Bot className="h-8 w-8 text-gold" />
                </Avatar>
                <h2 className="text-2xl font-bold text-gold mb-2">Shopping Assistant</h2>
                <p className="text-muted-foreground mb-8">
                  Welcome to your premium shopping assistant. Ask me anything about products, pricing, or recommendations.
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {quickPrompts.map((prompt, index) => (
                    <QuickPromptButton 
                      key={index} 
                      prompt={prompt} 
                      onClick={handleQuickPromptClick}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                  productInfo={message.productInfo}
                />
              ))}
              
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-muted rounded-lg p-3 flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
                         style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
                         style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
                         style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        <div className="relative">
          <ChatInput onSendMessage={handleSendMessage} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default AssistantPage;
