
import api from './api';
import { Product } from '@/types';

// Get user's wishlist items
export const getWishlist = async (): Promise<{ products: Product[] }> => {
  const response = await api.get('/wishlist');
  return response.data;
};

// Add a product to wishlist
export const addToWishlist = async (productId: string): Promise<void> => {
  await api.post(`/wishlist/add/${productId}`);
};

// Remove a product from wishlist
export const removeFromWishlist = async (productId: string): Promise<void> => {
  await api.delete(`/wishlist/remove/${productId}`);
};

// Clear the entire wishlist
export const clearWishlist = async (): Promise<void> => {
  await api.delete('/wishlist/clear');
};
