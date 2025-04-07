
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Bot, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import config from '@/config';
import ChatMessage from '@/components/assistant/ChatMessage';
import QuickPromptButton from '@/components/assistant/QuickPromptButton';
import ChatSidebar from '@/components/assistant/ChatSidebar';
import ChatInput from '@/components/assistant/ChatInput';
import { useIsMobile } from '@/hooks/use-mobile';
import ThemeToggle from '@/components/ThemeToggle';
import ReactMarkdown from 'react-markdown';

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
  product_id?: string;
  image_url?: string;
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
  const [productQuery, setProductQuery] = useState<string>("");
  const [imageSearchResults, setImageSearchResults] = useState<ProductInfo[]>([]);

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

  // Convert image file to base64 string without the prefix
  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Remove the prefix "data:image/..;base64," if necessary
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle image search
  const handleImageSearch = async (imageFile: File) => {
    if (!imageFile) return;
    
    try {
      setLoading(true);
      // Convert image to base64
      const base64Data = await convertImageToBase64(imageFile);
      
      // Call image search endpoint
      const response = await axios.post(`${API_URL}${config.imageSearchEndpoint}`, {
        image_data: base64Data
      });
      
      if (response.data && response.data.products) {
        setImageSearchResults(response.data.products);
        
        // Add a user message with the image
        const userMessage: ChatMessage = {
          role: 'user',
          content: "What products are similar to this image?",
          timestamp: new Date().toISOString()
        };
        
        // Add an assistant message with the search results
        const productsList = response.data.products.map((p: ProductInfo) => 
          `- ${p.name} - $${p.price} (Product ID: ${p.product_id || p._id})`
        ).join('\n');
        
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: `Here are some products that match your image:\n\n${productsList}`,
          timestamp: new Date().toISOString(),
          productInfo: response.data.products[0] ? {
            id: response.data.products[0].product_id || response.data.products[0]._id,
            name: response.data.products[0].name,
            price: response.data.products[0].price,
            image: response.data.products[0].image_url || (response.data.products[0].images && response.data.products[0].images[0]) || '',
            category: response.data.products[0].category
          } : undefined
        };
        
        setMessages(prev => [...prev, userMessage, assistantMessage]);
      } else {
        toast.error('No products found for this image');
      }
    } catch (error) {
      console.error('Error searching image:', error);
      toast.error('Failed to search for products similar to this image.');
    } finally {
      setLoading(false);
    }
  };

  // Load full chat history from the backend
  const loadChatHistory = async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/chat/history?session_id=${sessionId}&limit=50`);
      
      if (response.data && response.data.messages) {
        // Map messages to the local format
        const formattedMessages = response.data.messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp
        }));
        
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      toast.error('Failed to load chat history. Please try again.');
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

  // Search products based on a query
  const searchProducts = async (query: string): Promise<any[]> => {
    try {
      const response = await axios.get(`${API_URL}/api/search?q=${encodeURIComponent(query)}&limit=5`);
      return response.data.products || [];
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  };

  // Enhanced handleSendMessage to process products and support image search
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
        const base64String = await convertImageToBase64(imageFile);
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
        
        // Check if the response contains product IDs
        const productIds = parseProductIds(response.data.message);
        
        if (productIds.length > 0) {
          // Search for products mentioned in the response
          const productsInfo = await searchProducts(productIds[0]);
          
          if (productsInfo.length > 0) {
            const product = productsInfo[0];
            
            // Add product info to the message
            assistantMessage.productInfo = {
              id: product.product_id || product._id,
              name: product.name,
              price: product.price,
              image: product.image_url || (product.images && product.images[0]) || '',
              category: product.category
            };
          }
        }
        
        setMessages(prev => [...prev, assistantMessage]);
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
        onLoadHistory={loadChatHistory}
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
          <ChatInput 
            onSendMessage={handleSendMessage} 
            onImageSearch={handleImageSearch}
            loading={loading} 
          />
        </div>
      </div>
    </div>
  );
};

export default AssistantPage;
