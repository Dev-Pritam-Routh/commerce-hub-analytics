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
import ChatSidebar, { ChatSession as ChatSessionImport } from '@/components/assistant/ChatSidebar';
import ChatInput from '@/components/assistant/ChatInput';
import { useIsMobile } from '@/hooks/use-mobile';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
// Import as ProductType to avoid conflict with local interface
import { Product as ProductType } from '@/types';
import ChatProductResponse from '@/components/assistant/ChatProductResponse';
import { cn } from '@/lib/utils';

// Quick prompts for empty state
const quickPrompts = [
  "What are some trending products right now?",
  "Can you recommend a good laptop for video editing?",
  "I'm looking for a gift for my mom",
  "Show me similar products to this image"
];

interface ImageSearchResponse {
  products: ProductType[];
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

interface ProductResponse {
  success: boolean;
  product: ProductType;
  error?: string;
}

// Type definition that extends ProductType to include all properties used
interface LocalProduct extends ProductType {
  description?: string;
  rating?: number;
  similarity?: number;
}

// Update referenced_products type
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  referenced_products?: LocalProduct[];
  type?: string; // Can be 'products', 'general', or any intent from the API
  intent?: string; // Store the intent from the API response
  productId?: string[]; // Array of product IDs
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
  products: ProductType[];
}

interface ProductInfo {
  product_id: string;
  name: string;
  price: number;
  category: string;
  image_url: string;
  images: string[];
}

// Our local definition of ChatSession for backend compatibility
interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
  session_id?: string; // Added to handle backend response format
}

interface SearchResult {
  _id: string;
  name: string;
  price: number;
  image: string;
}

// Define an interface for the new image search response format
interface ImageSearchMessageResponse {
  message: string;
  intent: string;
  product_id: string | string[] | null;
}

const AssistantPage = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [productQuery, setProductQuery] = useState<string>("");
  const [imageSearchResults, setImageSearchResults] = useState<ProductInfo[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // API URL from config
  const API_URL = config.assistantApiUrl;

  // Log the API configuration for debugging
  useEffect(() => {
    console.log("API configuration:", {
      assistantApiUrl: config.assistantApiUrl,
      chatEndpoints: config.chatEndpoints,
      // Access safely without message property
      fullURL: `${config.assistantApiUrl}${config.chatEndpoints?.sendMessage || '/chat/message'}`
    });
  }, []);

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
        const sortedSessions = response.data.sessions.sort((a: ChatSessionImport, b: ChatSessionImport) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        setChatSessions(sortedSessions.map((session: ChatSessionImport) => ({
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
      const response = await axios.post<ImageSearchResponse | ImageSearchMessageResponse>(`${API_URL}/image-search`, {
        image_data: base64Data
      });
      
      console.log("Image search response:", response.data);
      
        // Add a user message with the image
        const userMessage: Message = {
          role: 'user',
          content: "What products are similar to this image?",
          timestamp: new Date().toISOString()
        };
        
      setMessages(prev => [...prev, userMessage]);
      
      // Check if we have a valid response with the new format
      if (response.data && response.data.message) {
        // Backend is using the new format with message, intent, and product_id
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.data.message,
          timestamp: new Date().toISOString(),
          type: response.data.intent || 'image_search'
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Handle product ID if it exists
        if (response.data.product_id) {
          const productIds = Array.isArray(response.data.product_id) 
            ? response.data.product_id 
            : [response.data.product_id];
          
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
      // Fall back to the old format if necessary
      else if (response.data && response.data.products) {
        // Add assistant message with the search results
        const assistantMessage: Message = {
          role: 'assistant',
          content: `I found ${response.data.products.length} products similar to your image.`,
          timestamp: new Date().toISOString(),
          type: 'product_search'
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Only add product IDs if there are actual products
        if (response.data.products.length > 0) {
          // Extract product IDs
          const productIds = response.data.products.map(p => p._id);
          
          // Add a product message (same format as chat product responses)
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
        // Handle case with no products found
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
  const fetchProductDetails = async (productId: string): Promise<ProductType | null> => {
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
  const extractProductIds = (message: string): string[] => {
    // Look for product IDs in various formats
    const patterns = [
      /product_id: ([a-f0-9]{24})/i,
      /product id: ([a-f0-9]{24})/i,
      /id: ([a-f0-9]{24})/i,
      /\[([a-f0-9]{24})\]/,
      /\(([a-f0-9]{24})\)/
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
      
      // Log the request
      console.log("Sending request to:", `${API_URL}/chat/message`);
      console.log("Request data:", requestData);
      
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
        console.log("product_id in parsed data:", parsedData.product_id);
      } catch (e) {
        console.error("Error parsing raw response:", e);
      }
      
      // Continue with regular axios call for consistency with the rest of the code
      const response = await axios.post<ChatMessageResponse>(`${API_URL}/chat/message`, requestData);
      
      console.log("Raw API response from axios:", response.data);
      console.log("Response product_id type:", typeof response.data.product_id);
      console.log("Response product_id value:", response.data.product_id);
      
      // Use the manually parsed data if available and if it has product_id
      // This is to diagnose if axios is somehow dropping the field
      const messageData = parsedData && parsedData.product_id !== undefined 
        ? parsedData 
        : response.data;
      
      // Check if messageData.message exists and is an object
      const isNestedMessage = 
        messageData.message !== null && 
        typeof messageData.message === 'object' &&
        'message' in (messageData.message as Record<string, unknown>);
      
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
      
      // Get response from API
      const response = await sendMessage(message, imageFile);
      
      console.log("API Response:", response); // Debug log
      
      // Add assistant's message with proper formatting
      const assistantMessage: Message = {
        role: 'assistant',
        content: typeof response.message === 'string' ? response.message : JSON.stringify(response.message) || "",
        timestamp: new Date().toISOString(),
        // Add intent to the message for any special handling in UI
        type: response.intent || "general"
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Process product IDs - check if we have a non-null product_id
      console.log("Processing product IDs from:", response.product_id);
      
      // Fix for case when axios might have dropped the product_id field
      // This is a temporary workaround to check if the manually parsed data has a product_id
      // that got lost in the axios response
      let productId = response.product_id;
      
      // If we're rendering a product response based on intent, but no product_id exists
      if (!productId && response.intent === 'product_search') {
        // Make a direct API call to get product recommendations based on the message
        try {
          const searchResponse = await axios.get(`${API_URL}/search?q=${encodeURIComponent(message.substring(0, 100))}&limit=1`);
          if (searchResponse.data && searchResponse.data.products && searchResponse.data.products.length > 0) {
            const product = searchResponse.data.products[0];
            console.log("Retrieved product from search:", product);
            
            // Handle different field name variations for product ID
            productId = product._id || product.product_id || product.id;
            
            console.log("Extracted product ID from search result:", productId);
          }
        } catch (err) {
          console.error("Error fetching product recommendations:", err);
        }
      }
      
      // Convert to array if it's a string
      let productIdsArray: string[] = [];
      
      if (Array.isArray(productId)) {
        productIdsArray = [...productId]; // Make a copy
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

  // Add ProductCard component
  const ProductCard = ({ product }: { product: LocalProduct }) => {
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
            src={product.images[0]} 
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
                  {/* Only render content if it's not an empty product-only message */}
                  {((typeof message.content === 'string' && message.content.trim()) || message.role === "user") && (
                      <div
                        className={cn(
                          "max-w-[80%] rounded-lg p-4",
                          message.role === "user"
                            ? "bg-primary text-white"
                            : "bg-white dark:bg-gray-800"
                        )}
                      >
                        {message.role === "assistant" ? (
                          <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                            components={{
                              // Your existing component definitions...
                            }}
                          >
                            {typeof message.content === 'string' ? message.content : JSON.stringify(message.content)}
                          </ReactMarkdown>
                        ) : (
                        <span>{typeof message.content === 'string' ? message.content : JSON.stringify(message.content)}</span>
                        )}
                      </div>
                    )}
                    
                    {/* Render product cards if available */}
                    {message.type === 'products' && message.productId && message.productId.length > 0 && (
                      <div className="w-full mt-2">
                        <ChatProductResponse productIds={message.productId} />
                      </div>
                    )}
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
