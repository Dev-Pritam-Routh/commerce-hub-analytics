
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Avatar } from '@/components/ui/avatar';
import { Send, Paperclip, ArrowLeft, MessageCircle } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import config from '@/config';
import ChatMessage from '@/components/assistant/ChatMessage';
import QuickPromptButton from '@/components/assistant/QuickPromptButton';
import ChatSidebar from '@/components/assistant/ChatSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Product as ProductType } from '@/types';
import ChatProductResponse from '@/components/assistant/ChatProductResponse';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Quick prompts for empty state
const quickPrompts = [
  "What are some trending products right now?",
  "Can you recommend a good laptop for video editing?",
  "I'm looking for a gift for my mom",
  "Show me similar products to this image"
];

// Types definitions
interface ImageSearchResponse {
  products: ProductType[];
}

interface ImageSearchMessageResponse {
  message: string;
  intent: string;
  product_id: string[] | string | null;
}

interface ChatMessageResponse {
  message: string;
  intent: string;
  product_id: string[] | string | null;
}

interface ChatRequestData {
  session_id: string;
  message: string;
  image_data?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  referenced_products?: ProductType[];
  type?: string;
  intent?: string;
  productId?: string[];
}

interface ChatSessionResponse {
  session_id: string;
  message: string;
}

interface ChatHistoryResponse {
  messages: Message[];
}

interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
}

const AssistantPage = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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
      const response = await axios.post<ChatSessionResponse>(`${API_URL}/chat/session`, {
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
      
      // Send to image search endpoint
      const response = await axios.post<ImageSearchResponse | ImageSearchMessageResponse>(
        `${API_URL}/image-search`, 
        { image_data: base64Data }
      );
      
      console.log("Image search response:", response.data);
        
      // Add a user message with the image
      const userMessage: Message = {
        role: 'user',
        content: "What products are similar to this image?",
        timestamp: new Date().toISOString()
      };
        
      setMessages(prev => [...prev, userMessage]);
      
      // Handle the API response based on whether it has the expected fields
      const responseData = response.data as any;
      
      // Check if we're dealing with the new format (message + intent + product_id)
      if (responseData.message !== undefined) {
        // Add assistant message
        const assistantMessage: Message = {
          role: 'assistant',
          content: responseData.message,
          timestamp: new Date().toISOString(),
          type: responseData.intent || 'image_search'
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Handle product ID if it exists
        if (responseData.product_id) {
          const productIds = Array.isArray(responseData.product_id) 
            ? responseData.product_id 
            : [responseData.product_id];
          
          // Add product message if we have valid IDs
          if (productIds.length > 0) {
            const productMessage: Message = {
              role: 'assistant',
              content: '',
              type: 'products',
              productId: productIds,
              timestamp: new Date().toISOString()
            };
            
            setMessages(prev => [...prev, productMessage]);
          }
        }
      }
      // Old format (products array)
      else if (responseData.products && Array.isArray(responseData.products)) {
        // Add assistant message
        const assistantMessage: Message = {
          role: 'assistant',
          content: `I found ${responseData.products.length} products similar to your image.`,
          timestamp: new Date().toISOString(),
          type: 'product_search'
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Add product IDs if there are any
        if (responseData.products.length > 0) {
          const productIds = responseData.products.map((p: any) => p._id);
          
          const productMessage: Message = {
            role: 'assistant',
            content: '',
            type: 'products',
            productId: productIds,
            timestamp: new Date().toISOString()
          };
          
          setMessages(prev => [...prev, productMessage]);
        }
      } else {
        // No products found case
        const noProductsMessage: Message = {
          role: 'assistant',
          content: 'Sorry, I couldn\'t find any products matching this image.',
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, noProductsMessage]);
        toast.error('No products found for this image');
      }
    } catch (error) {
      console.error('Error searching image:', error);
      toast.error('Failed to search for products similar to this image.');
      
      // Add error message to chat
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error while searching for products similar to your image.',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setImageFile(null);
      setImagePreview(null);
    }
  };

  // Load full chat history from the backend
  const loadChatHistory = async (sessionId?: string) => {
    if (!sessionId) return;

    try {
      setLoading(true);
      const response = await axios.get<ChatHistoryResponse>(`${API_URL}/chat/history?session_id=${sessionId}&limit=50`);
      
      if (response.data && response.data.messages) {
        // Map messages to the local format
        const formattedMessages = response.data.messages.map((msg) => ({
          role: msg.role as 'assistant' | 'user',
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

  const sendMessage = async (message: string, imageFile: File | null) => {
    try {
      // Prepare request data
      const requestData: ChatRequestData = {
        session_id: sessionId || 'demo-session',
        message: message
      };
      
      // If we have an image file, encode it as base64
      if (imageFile) {
        const base64Data = await convertImageToBase64(imageFile);
        requestData.image_data = base64Data;
      }
      
      // Use a custom axios configuration to preserve the raw response
      const rawResponse = await fetch(`${API_URL}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
      
      // Log the raw response
      const rawData = await rawResponse.text();
      console.log("Raw response text:", rawData);
      
      // Parse the raw data manually to ensure we capture all fields
      let parsedData;
      try {
        parsedData = JSON.parse(rawData);
        console.log("Manually parsed response:", parsedData);
      } catch (e) {
        console.error("Error parsing raw response:", e);
      }
      
      // Continue with regular axios call for consistency with the rest of the code
      const response = await axios.post<ChatMessageResponse>(`${API_URL}/chat/message`, requestData);
      
      console.log("Raw API response from axios:", response.data);
      
      // Use the manually parsed data if available
      const messageData = parsedData || response.data;
      
      // Check if messageData.message exists and is an object
      const isNestedMessage = 
        messageData.message !== null && 
        typeof messageData.message === 'object' &&
        'message' in messageData.message;
      
      // Handle nested message structure
      if (isNestedMessage) {
        const nestedMessage = messageData.message as { 
          message?: string, 
          intent?: string 
        };
        
        // Extract from nested structure
        return {
          message: nestedMessage.message || "",
          intent: nestedMessage.intent || messageData.intent || "general",
          product_id: messageData.product_id // Keep original value
        };
      }
      
      // Standard response format
      return {
        message: messageData.message || "",
        intent: messageData.intent || "general",
        product_id: messageData.product_id // Keep original value
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const handleSendMessage = async (message: string, imageFile: File | null) => {
    if (!message.trim() && !imageFile) return;
  
    try {
      setLoading(true);
      
      // Add user message to chat
      const userMessage: Message = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);
      
      // Clear input field
      setInputMessage('');
      
      // Handle image search if an image is provided
      if (imageFile) {
        await handleImageSearch(imageFile);
        return;
      }
      
      // Get response from API
      const response = await sendMessage(message, null);
      
      console.log("API Response:", response);
      
      // Add assistant's message with proper formatting
      const assistantMessage: Message = {
        role: 'assistant',
        content: typeof response.message === 'string' ? response.message : JSON.stringify(response.message),
        timestamp: new Date().toISOString(),
        type: response.intent || "general"
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Process product IDs if available
      let productId = response.product_id;
      
      // If we're rendering a product response but no product_id was returned
      if (!productId && response.intent === 'product_search') {
        // Try to get product recommendations based on the message
        try {
          const searchResponse = await axios.get(`${API_URL}/search?q=${encodeURIComponent(message.substring(0, 100))}&limit=1`);
          if (searchResponse.data?.products?.length > 0) {
            const product = searchResponse.data.products[0];
            productId = product._id || product.product_id || product.id;
          }
        } catch (err) {
          console.error("Error fetching product recommendations:", err);
        }
      }
      
      // Convert product IDs to array
      let productIdsArray: string[] = [];
      
      if (Array.isArray(productId)) {
        productIdsArray = [...productId];
      } else if (typeof productId === 'string') {
        productIdsArray = [productId];
      }
      
      // Filter out any invalid values
      const validProductIds = productIdsArray.filter(id => id && id.trim().length > 0);
      
      console.log("Valid product IDs:", validProductIds);
      
      // Create product message if we have valid IDs
      if (validProductIds.length > 0) {
          const productMessage: Message = {
            role: 'assistant',
            content: '',
            type: 'products',
            productId: validProductIds,
            timestamp: new Date().toISOString()
          };
          setMessages(prev => [...prev, productMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle quick prompt selection
  const handleQuickPromptClick = (prompt: string) => {
    setInputMessage(prompt);
    handleSendMessage(prompt, null);
  };
  
  // Handle starting a new chat
  const handleNewChat = () => {
    setMessages([]);
    createChatSession();
  };

  // Handle selecting an existing session
  const handleSelectSession = (selectedSessionId: string) => {
    if (selectedSessionId === sessionId) return;
    
    setMessages([]);
    loadChatHistory(selectedSessionId);
    setSessionId(selectedSessionId);
    
    // Close sidebar on mobile after selection
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // Toggle sidebar open/closed
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setImageFile(file);
      
      // Create preview for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputMessage, imageFile);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="h-screen w-full bg-[#1A1F2C] text-slate-100 flex overflow-hidden">
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
        <header className="sticky top-0 z-30 h-16 px-4 border-b border-slate-700/50 flex items-center justify-between bg-[#1A1F2C]/90 backdrop-blur-md">
          <div className="flex items-center">
            <Button
              variant="ghost" 
              size="icon"
              onClick={toggleSidebar}
              className="p-2 mr-2 rounded-md text-slate-300 hover:bg-slate-700/50"
              aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              <ArrowLeft className={`h-5 w-5 transition-transform ${isSidebarOpen ? "rotate-0" : "rotate-180"}`} />
            </Button>
            <div className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-[#9b87f5]" />
              <h1 className="text-xl font-semibold text-slate-200">Chat</h1>
            </div>
          </div>
        </header>

        {/* Messages area with glass card */}
        <main className="flex-1 overflow-hidden p-4 relative">
          <div className="absolute inset-4 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl"></div>
          
          <div 
            ref={scrollRef}
            className="h-full overflow-y-auto px-2 py-6 relative z-10 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center max-w-md"
                >
                  <Avatar className="h-16 w-16 mx-auto mb-6 bg-[#9b87f5]/20 border border-[#9b87f5]/30">
                    <MessageCircle className="h-8 w-8 text-[#9b87f5]" />
                  </Avatar>
                  <h2 className="text-2xl font-bold text-slate-200 mb-3">Shopping Assistant</h2>
                  <p className="text-slate-400 mb-8">
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
              <div className="max-w-3xl mx-auto space-y-2">
                <AnimatePresence initial={false}>
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChatMessage message={message} />
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start px-3 py-6"
                  >
                    <div className="flex space-x-3">
                      <div className="w-2 h-2 bg-[#9b87f5] rounded-full animate-bounce" 
                          style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-[#9b87f5]/80 rounded-full animate-bounce" 
                          style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-[#9b87f5]/60 rounded-full animate-bounce" 
                          style={{ animationDelay: '300ms' }} />
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          {/* Input area */}
          <div className="absolute bottom-8 left-0 right-0 px-8 z-20">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputMessage, imageFile);
              }}
              className="relative max-w-3xl mx-auto"
            >
              {/* Preview image if any */}
              {imagePreview && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-20 left-2"
                >
                  <div className="relative inline-block">
                    <img 
                      src={imagePreview} 
                      alt="Upload preview" 
                      className="h-16 w-16 object-cover rounded-lg border border-slate-600" 
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                </motion.div>
              )}
              
              <div className="relative flex items-end bg-slate-800/50 backdrop-blur-md border border-slate-600/50 rounded-full overflow-hidden shadow-lg">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add a message..."
                  className="flex-1 bg-transparent border-none resize-none py-4 pl-6 pr-20 max-h-32 focus:outline-none text-slate-200 placeholder:text-slate-500"
                  rows={1}
                  disabled={loading}
                  style={{ scrollbarWidth: 'none' }}
                />
                
                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-2 rounded-full ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-700'}`}
                    disabled={loading}
                  >
                    <Paperclip className="h-5 w-5 text-slate-400" />
                  </button>
                  <button 
                    type="submit" 
                    className={`p-2 bg-[#9b87f5] rounded-full ${loading || (!inputMessage.trim() && !imageFile) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#7E69AB]'}`}
                    disabled={loading || (!inputMessage.trim() && !imageFile)}
                  >
                    <Send className="h-5 w-5 text-slate-100" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AssistantPage;
