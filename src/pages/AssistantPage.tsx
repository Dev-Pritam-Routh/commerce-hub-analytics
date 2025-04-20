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
import ChatSidebar, { ChatSession } from '@/components/assistant/ChatSidebar';
import ChatInput from '@/components/assistant/ChatInput';
import { useIsMobile } from '@/hooks/use-mobile';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Product } from '@/types';
import ChatProductResponse from '@/components/assistant/ChatProductResponse';
import { cn } from '@/lib/utils';
import { ChatMessage as ChatMessageType } from '@/types';

// Quick prompts for empty state
const quickPrompts = [
  "What are some trending products right now?",
  "Can you recommend a good laptop for video editing?",
  "I'm looking for a gift for my mom",
  "Show me similar products to this image"
];

interface ImageSearchResponse {
  products: Product[];
}

interface ChatMessageResponse {
  message: string;
  intent: string;
  product_id?: string;
}

interface ChatRequestData {
  session_id: string;
  message: string;
  image_data?: string;
}

interface ProductResponse {
  success: boolean;
  product: Product;
  error?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  referenced_products?: Product[];
  type?: string;
  productIds?: string[];
}

interface ChatSessionResponse {
  session_id: string;
  message: string;
}

interface ChatHistoryResponse {
  messages: Message[];
}

interface SearchResponse {
  message: string;
  products: Product[];
}

interface ProductInfo {
  product_id: string;
  name: string;
  price: number;
  category: string;
  image_url: string;
  images: string[];
}

interface SessionData {
  session_id: string;
  title?: string;
  timestamp: string;
  last_message?: string;
}

interface SearchResult {
  id: string;
  name: string;
  price: number;
  image?: string;
}

const AssistantPage = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [productQuery, setProductQuery] = useState<string>("");
  const [imageSearchResults, setImageSearchResults] = useState<ProductInfo[]>([]);
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
        const sortedSessions = response.data.sessions.sort((a: SessionData, b: SessionData) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        setChatSessions(sortedSessions.map((session: SessionData) => ({
          id: session.session_id,
          title: session.title || "New Conversation",
          timestamp: session.timestamp,
          lastMessage: session.last_message
        })));

        if (!sessionId && sortedSessions.length > 0) {
          setSessionId(sortedSessions[0].session_id);
          loadChatHistory();
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
      const response = await axios.post<ImageSearchResponse>(`${API_URL}/image-search`, {
        image_data: base64Data
      });
      
      if (response.data && response.data.products) {
        // Add a user message with the image
        const userMessage: ChatMessageType = {
          role: 'user',
          content: "What products are similar to this image?",
          timestamp: new Date().toISOString()
        };
        
        // Format products list
        const productsList = response.data.products.map((p: Product) => 
          `- ${p.name} - $${p.price} (Product ID: ${p.product_id})`
        ).join('\n');
        
        // Add assistant message with the search results
        const assistantMessage: ChatMessageType = {
          role: 'assistant',
          content: `Here are some products that match your image:\n\n${productsList}`,
          timestamp: new Date().toISOString(),
          referenced_products: response.data.products.map((p: Product) => ({
            product_id: p.product_id,
            name: p.name,
            category: p.category,
            price: p.price,
            image_url: p.image_url,
            description: p.similarity ? `Similarity: ${p.similarity.toFixed(2)}` : undefined,
            rating: p.similarity ? p.similarity : undefined
          }))
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
      const response = await axios.get<ChatHistoryResponse>(`${API_URL}/chat/history?session_id=${sessionId}&limit=50`);
      
      if (response.data && response.data.messages) {
        setMessages(response.data.messages);
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
    // Look for product IDs in the format "Product ID: XXXX" or similar patterns
    const regex = /Product ID: ([a-f0-9]{24})/g;
    const matches = [...content.matchAll(regex)];
    return matches.map(match => match[1]);
  };

  // Search products based on a query
  const searchProducts = async (query: string): Promise<SearchResponse['products']> => {
    try {
      const response = await axios.get<SearchResponse>(`${API_URL}/search?q=${encodeURIComponent(query)}&limit=5`);
      return response.data.products || [];
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  };

  // Function to fetch product details with improved error handling
  const fetchProductDetails = async (productId: string): Promise<Product | null> => {
    try {
      const response = await axios.get<ProductResponse>(`${API_URL}/products/${productId}`);
      
      if (response.data.success && response.data.product) {
        return response.data.product;
      }
      
      console.error('Error fetching product details:', response.data.error);
      return null;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          console.error(`Product ${productId} not found`);
        } else {
          console.error(`Error fetching product ${productId}:`, error.message);
        }
      } else {
        console.error(`Unexpected error fetching product ${productId}:`, error);
      }
      return null;
    }
  };

  // Function to extract product IDs from message with improved pattern matching
  const extractProductIds = (message: string | { product_id?: string; product_ids?: string[] }): string[] => {
    // If message is not a string, try to get product_id from the object
    if (typeof message !== 'string') {
      if (message?.product_id) {
        return [message.product_id];
      }
      if (message?.product_ids) {
        return Array.isArray(message.product_ids) ? message.product_ids : [];
      }
      return [];
    }

    // Look for product IDs in various formats
    const patterns = [
      /product_id: ([a-f0-9]{24})/i,
      /product id: ([a-f0-9]{24})/i,
      /id: ([a-f0-9]{24})/i,
      /\[([a-f0-9]{24})\]/,
      /\(([a-f0-9]{24})\)/,
      /"product_id": "([a-f0-9]{24})"/i,
      /"product_id": "([0-9]+)"/i
    ];
    
    const ids = new Set<string>();
    patterns.forEach(pattern => {
      const matches = message.match(new RegExp(pattern, 'g'));
      if (matches) {
        matches.forEach(match => {
          const id = match.match(pattern)?.[1];
          if (id) ids.add(id);
        });
      }
    });
    
    return Array.from(ids);
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
      
      // Send the message to the API
      const response = await axios.post<ChatMessageResponse>(`${API_URL}/chat/message`, requestData);
      return response.data;
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
      const userMessage: ChatMessageType = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);
      
      const response = await sendMessage(message, imageFile);
      
      // Handle the response based on its type
      let responseData;
      if (typeof response === 'string') {
        try {
          responseData = JSON.parse(response);
        } catch (e) {
          // If parsing fails, treat the string as the message content
          responseData = { message: response };
        }
      } else {
        responseData = response;
      }
      
      // Add assistant's message with the message content
      const assistantMessage: ChatMessageType = {
        role: 'assistant',
        content: responseData.message,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      // If we have a product_id, add a product display message
      if (responseData.product_id) {
        const productMessage: ChatMessageType = {
          role: 'assistant',
          content: '',
          type: 'products',
          productIds: [responseData.product_id],
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
    setSessionId(selectedSessionId);
    loadChatHistory();
    
    // Close sidebar on mobile after selection
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // Toggle sidebar open/closed
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  // Add ProductCard component
  const ProductCard = ({ product }: { product: Product }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
      setIsVisible(true);
    }, []);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden my-4"
      >
        <div className="relative h-48">
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {product.name}
          </h3>
          <p className="text-2xl font-bold text-gold mb-2">
            ${product.price.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {product.category}
          </p>
          {product.description && (
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {product.description}
            </p>
          )}
          {product.rating && (
            <div className="flex items-center mt-2">
              <span className="text-yellow-400">★</span>
              <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                {product.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
                <div
                  key={index}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg p-4",
                      message.role === "user"
                        ? "bg-primary text-white"
                        : "bg-white dark:bg-gray-800"
                    )}
                  >
                    {message.role === "assistant" ? (
                      <>
                        <ReactMarkdown
                          remarkPlugins={[remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                          components={{
                            code({ node, className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || '');
                              return match ? (
                                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md overflow-x-auto">
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                </div>
                              ) : (
                                <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded" {...props}>
                                  {children}
                                </code>
                              );
                            },
                            p({ children }) {
                              return <p className="mb-2">{children}</p>;
                            },
                            ul({ children }) {
                              return <ul className="list-disc pl-4 mb-2">{children}</ul>;
                            },
                            ol({ children }) {
                              return <ol className="list-decimal pl-4 mb-2">{children}</ol>;
                            },
                            li({ children }) {
                              return <li className="mb-1">{children}</li>;
                            }
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                        {message.type === 'products' && message.productIds && (
                          <div className="mt-4">
                            <ChatProductResponse productIds={message.productIds} />
                          </div>
                        )}
                      </>
                    ) : (
                      message.content
                    )}
                  </div>
                </div>
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
