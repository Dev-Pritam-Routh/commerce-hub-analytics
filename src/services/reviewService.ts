import api from './api';

export interface Review {
  _id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
}

export interface ReviewResponse {
  reviews: Review[];
  total: number;
  averageRating: number;
}

export const getProductReviews = async (productId: string): Promise<ReviewResponse> => {
  try {
    const response = await api.get(`/reviews/product/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    throw error;
  }
};

export const createReview = async (productId: string, data: { rating: number; comment: string }): Promise<Review> => {
  try {
    const response = await api.post(`/reviews/product/${productId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

export const updateReview = async (reviewId: string, data: { rating?: number; comment?: string }): Promise<Review> => {
  try {
    const response = await api.put(`/reviews/${reviewId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

export const deleteReview = async (reviewId: string): Promise<void> => {
  try {
    await api.delete(`/reviews/${reviewId}`);
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
}; 