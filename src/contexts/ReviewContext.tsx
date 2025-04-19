import React, { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import { reviews } from '../services/api';

interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  product: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  verifiedPurchase: boolean;
  helpfulVotes: number;
  createdAt: string;
}

interface ReviewContextType {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  ratingCounts: Record<number, number>;
  isLoading: boolean;
  createReview: (data: Omit<Review, '_id' | 'user' | 'createdAt'>) => Promise<void>;
  updateReview: (id: string, data: Partial<Review>) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  markReviewHelpful: (id: string) => Promise<void>;
  reportReview: (id: string, reason: string) => Promise<void>;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export const ReviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: reviewsData = { reviews: [], averageRating: 0, totalReviews: 0, ratingCounts: {} }, isLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn: () => reviews.getProductReviews('').then(res => res.data),
    enabled: !!user,
  });

  const createReviewMutation = useMutation({
    mutationFn: (data: Omit<Review, '_id' | 'user' | 'createdAt'>) => reviews.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });

  const updateReviewMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Review> }) => reviews.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (id: string) => reviews.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });

  const markReviewHelpfulMutation = useMutation({
    mutationFn: (id: string) => reviews.markHelpful(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });

  const reportReviewMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => reviews.report(id, reason),
  });

  const value = {
    reviews: reviewsData.reviews,
    averageRating: reviewsData.averageRating,
    totalReviews: reviewsData.totalReviews,
    ratingCounts: reviewsData.ratingCounts,
    isLoading,
    createReview: async (data: Omit<Review, '_id' | 'user' | 'createdAt'>) => {
      await createReviewMutation.mutateAsync(data);
    },
    updateReview: async (id: string, data: Partial<Review>) => {
      await updateReviewMutation.mutateAsync({ id, data });
    },
    deleteReview: async (id: string) => {
      await deleteReviewMutation.mutateAsync(id);
    },
    markReviewHelpful: async (id: string) => {
      await markReviewHelpfulMutation.mutateAsync(id);
    },
    reportReview: async (id: string, reason: string) => {
      await reportReviewMutation.mutateAsync({ id, reason });
    },
  };

  return <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>;
};

export const useReview = (productId: string) => {
  const context = useContext(ReviewContext);
  if (context === undefined) {
    throw new Error('useReview must be used within a ReviewProvider');
  }

  const { data: reviewsData = { reviews: [], averageRating: 0, totalReviews: 0, ratingCounts: {} }, isLoading } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => reviews.getProductReviews(productId).then(res => res.data),
    enabled: !!productId,
  });

  return {
    ...context,
    reviews: reviewsData.reviews,
    averageRating: reviewsData.averageRating,
    totalReviews: reviewsData.totalReviews,
    ratingCounts: reviewsData.ratingCounts,
    isLoading,
  };
}; 