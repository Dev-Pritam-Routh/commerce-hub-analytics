
import { useState, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Image, X } from 'lucide-react';
import { toast } from 'sonner';

interface ChatInputProps {
  onSendMessage: (message: string, imageFile: File | null) => void;
  onImageSearch?: (imageFile: File) => void;
  loading: boolean;
}

const ChatInput = ({ onSendMessage, onImageSearch, loading }: ChatInputProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If only image is uploaded (no text) and we have an image search handler
    if (!newMessage.trim() && imageFile && onImageSearch) {
      onImageSearch(imageFile);
      clearImage();
      return;
    }
    
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
          placeholder={imageFile ? "Describe what you're looking for in this image..." : "Type your message..."}
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
          disabled={loading}
        >
          <Image className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>
      <Button 
        type="submit" 
        disabled={loading}
        className="self-end bg-gold hover:bg-gold-dark text-black"
      >
        <Send className="h-5 w-5" />
        <span className="sr-only">Send message</span>
      </Button>

      {/* Preview image if any */}
      {imagePreview && (
        <div className="absolute bottom-20 left-4 p-2 border rounded-md bg-background shadow-md">
          <div className="relative inline-block">
            <img 
              src={imagePreview} 
              alt="Upload preview" 
              className="h-20 w-20 object-cover rounded" 
            />
            <Button
              onClick={clearImage}
              size="sm"
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </form>
  );
};

export default ChatInput;
