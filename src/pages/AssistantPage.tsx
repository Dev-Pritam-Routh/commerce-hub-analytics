
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Send, Image, RefreshCw, Bot, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getProductById } from '@/services/productService';
import config from '@/config';

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

const AssistantPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API URL from config
  const API_URL = config.chatApiUrl;

  // Create a new chat session when the component mounts
  useEffect(() => {
    createChatSession();
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
            content: response.data.message || 'Hello! How can I help you today?',
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
          content: 'Hello! How can I help you today? (Note: I\'m currently in demo mode)',
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size exceeds 5MB limit. Please choose a smaller image.');
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

  // Parse product IDs from message content
  const parseProductIds = (content: string): string[] => {
    // Look for product IDs in the format "Product ID: XXXX - productName"
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

  const convertImageToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the data:image/jpeg;base64, part
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
        } else {
          reject(new Error('Failed to convert image to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() && !imageFile) return;
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      role: 'user',
      content: newMessage,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    
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
        try {
          const base64String = await convertImageToBase64(imageFile);
          requestData.image_data = base64String;
          
          console.log('Image data prepared for upload. Size:', base64String.length);
          clearImage(); // Clear the image after sending
        } catch (error) {
          console.error('Error converting image to base64:', error);
          toast.error('Failed to process image. Please try again.');
          setLoading(false);
          return;
        }
      }
      
      console.log('Sending request to:', `${API_URL}/api/chat/message`);
      
      // Send the message to the API
      const response = await axios.post(`${API_URL}/api/chat/message`, requestData);
      
      console.log('Received response:', response.data);
      
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

  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  const handleRestart = () => {
    setMessages([]);
    createChatSession();
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-lg border-slate-200 dark:border-slate-700 mt-4">
          <CardContent className="p-0">
            {/* Chat header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 bg-primary/10">
                  <Bot className="h-6 w-6 text-primary" />
                </Avatar>
                <div className="ml-3">
                  <h2 className="text-lg font-semibold">Commerce Assistant</h2>
                  <p className="text-sm text-muted-foreground">Ask about products, orders, or get help</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleRestart} title="Restart conversation">
                <RefreshCw className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Chat messages */}
            <div className="h-[500px] overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words">{message.content}</div>
                    <div
                      className={`text-xs mt-1 ${
                        message.role === 'user' ? 'text-primary-foreground/80' : 'text-muted-foreground'
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                    
                    {/* Product info card */}
                    {message.productInfo && (
                      <div 
                        className="mt-3 p-2 bg-white dark:bg-slate-800 rounded-md shadow-sm cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-700"
                        onClick={() => handleProductClick(message.productInfo!.id)}
                      >
                        <div className="flex items-center space-x-3">
                          {message.productInfo.image && (
                            <img 
                              src={message.productInfo.image} 
                              alt={message.productInfo.name} 
                              className="w-16 h-16 object-cover rounded-md" 
                            />
                          )}
                          <div>
                            <h4 className="font-medium text-slate-900 dark:text-white">{message.productInfo.name}</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Category: {message.productInfo.category}</p>
                            <div className="flex items-center justify-between mt-1">
                              <p className="font-semibold text-primary">${message.productInfo.price.toFixed(2)}</p>
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
            
            {/* Preview image if any */}
            {imagePreview && (
              <div className="p-2 border-t">
                <div className="relative inline-block">
                  <img 
                    src={imagePreview} 
                    alt="Upload preview" 
                    className="h-16 w-16 object-cover rounded" 
                  />
                  <button
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white"
                  >
                    <span className="sr-only">Remove image</span>
                    ✕
                  </button>
                </div>
              </div>
            )}
            
            {/* Chat input */}
            <form onSubmit={handleSendMessage} className="border-t p-4 flex gap-2">
              <div className="flex-1 relative">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="resize-none min-h-[60px] pr-10"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="image-upload"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 bottom-2.5"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Image className="h-5 w-5 text-muted-foreground" />
                </Button>
              </div>
              <Button 
                type="submit" 
                disabled={loading || (!newMessage.trim() && !imageFile)}
                className="self-end"
              >
                <Send className="h-5 w-5" />
                <span className="sr-only">Send message</span>
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AssistantPage;
