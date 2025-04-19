import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Rating } from './ui/rating';
import { ImageUpload } from './ui/image-upload';
import { useReview } from '../contexts/ReviewContext';
import { toast } from 'sonner';

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(5).max(100),
  comment: z.string().min(10).max(1000),
  images: z.array(z.string()).optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  productId: string;
  existingReview?: {
    _id: string;
    rating: number;
    title: string;
    comment: string;
    images?: string[];
  };
  onSuccess?: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  existingReview,
  onSuccess,
}) => {
  const { createReview, updateReview } = useReview();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>(existingReview?.images || []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: existingReview?.rating || 0,
      title: existingReview?.title || '',
      comment: existingReview?.comment || '',
    },
  });

  const onSubmit = async (data: ReviewFormData) => {
    try {
      setIsSubmitting(true);
      const reviewData = {
        ...data,
        productId,
        images,
      };

      if (existingReview) {
        await updateReview(existingReview._id, reviewData);
        toast.success('Review updated successfully');
      } else {
        await createReview(reviewData);
        toast.success('Review submitted successfully');
      }

      onSuccess?.();
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Rating</label>
        <Rating
          value={existingReview?.rating || 0}
          onChange={(value) => setValue('rating', value)}
        />
        {errors.rating && (
          <p className="text-sm text-red-500 mt-1">{errors.rating.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Title</label>
        <Input
          {...register('title')}
          placeholder="Enter a title for your review"
        />
        {errors.title && (
          <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Review</label>
        <Textarea
          {...register('comment')}
          placeholder="Share your experience with this product"
          rows={5}
        />
        {errors.comment && (
          <p className="text-sm text-red-500 mt-1">{errors.comment.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Photos</label>
        <ImageUpload
          value={images}
          onChange={setImages}
          maxFiles={5}
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
      </Button>
    </form>
  );
}; 