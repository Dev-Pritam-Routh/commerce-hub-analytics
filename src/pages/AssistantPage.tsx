
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Send, Image, RefreshCw, Bot } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

// Define the message interface
interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
}

const AssistantPage = () => {
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API URL - this should point to your API server
  const API_URL = 'http://localhost:5000';

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
        const reader = new FileReader();
        const imageBase64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => {
            const base64String = reader.result as string;
            resolve(base64String.split(',')[1]); // Remove the data:image/jpeg;base64, part
          };
          reader.readAsDataURL(imageFile);
        });
        
        requestData.image_data = await imageBase64Promise;
        clearImage(); // Clear the image after sending
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
