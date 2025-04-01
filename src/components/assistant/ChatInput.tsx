
import { useState, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Image } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string, imageFile: File | null) => void;
  loading: boolean;
}

const ChatInput = ({ onSendMessage, loading }: ChatInputProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() && !imageFile) return;
    
    onSendMessage(newMessage, imageFile);
    setNewMessage('');
    clearImage();
  };

  return (
    <form onSubmit={handleSubmit} className="border-t p-4 flex gap-2">
      <div className="flex-1 relative">
        <Textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="resize-none min-h-[60px] pr-10"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
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
        className="self-end bg-gold hover:bg-gold-dark text-black"
      >
        <Send className="h-5 w-5" />
        <span className="sr-only">Send message</span>
      </Button>

      {/* Preview image if any */}
      {imagePreview && (
        <div className="absolute bottom-20 left-4 p-2 border rounded-md bg-background">
          <div className="relative inline-block">
            <img 
              src={imagePreview} 
              alt="Upload preview" 
              className="h-16 w-16 object-cover rounded" 
            />
            <button
              onClick={clearImage}
              className="absolute -top-2 -right-2 bg-destructive rounded-full p-1 text-destructive-foreground"
              aria-label="Remove image"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </form>
  );
};

export default ChatInput;
