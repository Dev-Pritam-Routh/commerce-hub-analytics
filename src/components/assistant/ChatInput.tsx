import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Image, Send, X } from 'lucide-react';
import { toast } from 'sonner';

interface ChatInputProps {
  onSendMessage: (message: string, imageFile: File | null) => Promise<void>;
  onImageSearch: (imageFile: File) => Promise<void>;
  loading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onImageSearch,
  loading
}) => {
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !imageFile) return;

    if (imageFile) {
      await onImageSearch(imageFile);
    } else {
      await onSendMessage(message, null);
    }

    setMessage('');
    clearImage();
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

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={imageFile ? "Describe what you're looking for in this image..." : "Type your message..."}
            className="min-h-[60px] resize-none"
            disabled={loading}
          />
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            <Image className="h-4 w-4" />
          </Button>
          <Button type="submit" disabled={loading || (!message.trim() && !imageFile)}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview image if any */}
      {imagePreview && (
        <div className="mt-2 relative inline-block">
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
      )}
    </form>
  );
};

export default ChatInput;
