
import React, { useState } from 'react';
import { useReview } from '@/contexts/ReviewContext';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Rating } from '@smastrom/react-rating';
import '@smastrom/react-rating/style.css';

interface ReviewFormProps {
  productId: string;
  onClose?: () => void;
}

const ReviewForm = ({ productId, onClose }: ReviewFormProps) => {
  const { createReview } = useReview();
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmitting(true);

    try {
      await createReview({
        productId,
        rating,
        comment,
        product: productId,
        verifiedPurchase: false,
        helpfulVotes: 0,
        updatedAt: new Date().toISOString(),
      });

      toast.success('Review submitted successfully!');
      if (onClose) onClose();
    } catch (error) {
      toast.error('Failed to submit review. Please try again.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="rating">Rating</Label>
        <Rating 
          style={{ maxWidth: 200 }} 
          value={rating} 
          onChange={setRating}
          className="my-2"
        />
      </div>
      <div>
        <Label htmlFor="comment">Comment</Label>
        <Textarea
          id="comment"
          placeholder="Write your review here"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
};

export default ReviewForm;
