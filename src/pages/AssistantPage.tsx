
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
import ChatSidebar, { ChatSession } from '@/components/assistant/ChatSidebar';
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
}

// Quick prompts for empty state
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
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // API URL from config
  const API_URL = config.assistantApiUrl;

  // Load sessions when component mounts
  useEffect(() => {
    loadSessions();
    
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

  // Load available chat sessions
  const loadSessions = async () => {
    try {
      const response = await axios.get(`${API_URL}${config.chatEndpoints.getSessions}`, {
        params: { user_id: user?.id || 'guest' }
      });

      if (response.data && response.data.sessions) {
        // Sort sessions by timestamp (newest first)
        const sortedSessions = response.data.sessions.sort((a: any, b: any) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        setChatSessions(sortedSessions.map((session: any) => ({
          id: session.session_id,
          title: session.title || "New Conversation",
          timestamp: session.timestamp,
          lastMessage: session.last_message
        })));

        // If no active session, create a new one
        if (!sessionId && sortedSessions.length > 0) {
          setSessionId(sortedSessions[0].session_id);
          loadChatHistory(sortedSessions[0].session_id);
        } else if (!sessionId) {
          createChatSession();
        }
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Failed to load chat sessions. Please try again later.');
      createChatSession();
    }
  };

  // Create a new chat session
  const createChatSession = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}${config.chatEndpoints.createSession}`, {
        user_id: user?.id || 'guest',
        user_email: user?.email || undefined
      });

      if (response.data && response.data.session_id) {
        setSessionId(response.data.session_id);
        
        // Add the new session to the list
        const newSession: ChatSession = {
          id: response.data.session_id,
          title: "New Conversation",
          timestamp: new Date().toISOString()
        };
        setChatSessions(prev => [newSession, ...prev]);
        
        // Set the welcome message
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

  // Load chat history for a specific session
  const loadChatHistory = async (sessionIdToLoad: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}${config.chatEndpoints.getHistory}`, {
        params: { 
          session_id: sessionIdToLoad,
          limit: 50
        }
      });

      if (response.data && response.data.messages) {
        const messagesWithTimestamps = response.data.messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp || new Date().toISOString()
        }));

        // Process messages to add product info if any
        const processedMessages = await Promise.all(
          messagesWithTimestamps.map(processMessageWithProductInfo)
        );
        
        setMessages(processedMessages);
        setSessionId(sessionIdToLoad);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      toast.error('Failed to load chat history. Please try again later.');
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

  // Image search function
  const handleImageSearch = async (imageFile: File) => {
    if (!imageFile) return;

    try {
      setLoading(true);
      
      // Convert image to base64
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
      
      // Add user message with image info
      const userMessage: ChatMessage = {
        role: 'user',
        content: "I'm looking for products similar to this image",
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Send the image to the API
      const response = await axios.post(`${API_URL}${config.chatEndpoints.sendMessage}`, {
        session_id: sessionId,
        message: "Find products similar to this image",
        image_data: base64String
      });
      
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
      console.error('Error searching with image:', error);
      toast.error('Failed to search with image.');
      
      // Add fallback response
      const fallbackMessage: ChatMessage = {
        role: 'assistant',
        content: "I'm sorry, I couldn't process that image. Please try a different image or a text search instead.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Handle sending a message
  const handleSendMessage = async (newMessage: string, imageFile: File | null) => {
    if (!newMessage.trim() && !imageFile) return;
    
    // If the user is only uploading an image, handle as image search
    if (imageFile && !newMessage.trim()) {
      return handleImageSearch(imageFile);
    }
    
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
      const response = await axios.post(`${API_URL}${config.chatEndpoints.sendMessage}`, requestData);
      
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
        
        // Update session title based on first message
        if (chatSessions.length > 0 && messages.length <= 1) {
          updateSessionTitle(newMessage);
        }
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

  // Update session title based on first user message
  const updateSessionTitle = (firstMessage: string) => {
    // Truncate to first 30 chars
    const title = firstMessage.length > 30 
      ? firstMessage.substring(0, 27) + '...' 
      : firstMessage;
    
    setChatSessions(prev => prev.map(session => 
      session.id === sessionId ? { ...session, title } : session
    ));
  };

  // Handle quick prompt selection
  const handleQuickPromptClick = (prompt: string) => {
    handleSendMessage(prompt, null);
  };
  
  // Handle starting a new chat
  const handleNewChat = () => {
    setMessages([]);
    setSearchResults([]);
    setSearchQuery("");
    createChatSession();
  };

  // Handle selecting an existing session
  const handleSelectSession = (selectedSessionId: string) => {
    if (selectedSessionId === sessionId) return;
    
    setMessages([]);
    setSearchResults([]);
    setSearchQuery("");
    loadChatHistory(selectedSessionId);
    
    // Close sidebar on mobile after selection
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // Toggle sidebar open/closed
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <ChatSidebar 
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onLoadHistory={loadSessions}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        sessions={chatSessions}
        currentSessionId={sessionId}
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
              
              {searchResults.length > 0 && (
                <div className="bg-muted p-4 rounded-lg mt-4">
                  <h3 className="font-medium mb-2">Search Results for "{searchQuery}"</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {searchResults.map((product, index) => (
                      <Card key={index} className="p-3 hover:bg-accent cursor-pointer">
                        <div className="flex items-center gap-3">
                          {product.image && (
                            <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{product.name}</div>
                            <div className="text-sm text-muted-foreground">${product.price}</div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
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
