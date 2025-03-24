
import axios from 'axios';

// Set the base URL from environment variable or use default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Configure axios to use the API URL
axios.defaults.baseURL = API_URL;

// Helper function to set the auth token
const setAuthToken = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
  }
};

// Define product interface
export interface Product {
  _id?: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  category: string;
  images: string[];
  stock: number;
  seller?: string;
  featured?: boolean;
  status?: 'active' | 'draft' | 'archived';
  averageRating?: number;
  ratings?: any[];
}

// Define user interface
export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  productsCount?: number;
  revenue?: number;
}

// Fetch all users (admin only)
export const fetchAllUsers = async (token: string) => {
  try {
    console.log("Fetching all users");
    setAuthToken(token);
    const response = await axios.get('/users');
    setAuthToken(null);
    console.log("Users response:", response.data);
    return response.data.users;
  } catch (error) {
    console.error('Error fetching users:', error);
    setAuthToken(null);
    throw error;
  }
};

// Fetch all sellers (admin only)
export const fetchAllSellers = async (token: string) => {
  try {
    console.log("Fetching all sellers");
    setAuthToken(token);
    const response = await axios.get('/users/sellers');
    setAuthToken(null);
    console.log("Sellers response:", response.data);
    return response.data.sellers;
  } catch (error) {
    console.error('Error fetching sellers:', error);
    setAuthToken(null);
    throw error;
  }
};

// Update user status (admin only)
export const updateUserStatus = async (userId: string, status: 'active' | 'inactive', token: string) => {
  try {
    console.log(`Updating user ${userId} status to ${status}`);
    setAuthToken(token);
    const response = await axios.patch(`/users/${userId}/status`, { status });
    setAuthToken(null);
    console.log("Update user status response:", response.data);
    return response.data.user;
  } catch (error) {
    console.error('Error updating user status:', error);
    setAuthToken(null);
    throw error;
  }
};

// Delete user (admin only)
export const deleteUser = async (userId: string, token: string) => {
  try {
    console.log(`Deleting user with ID: ${userId}`);
    setAuthToken(token);
    const response = await axios.delete(`/users/${userId}`);
    setAuthToken(null);
    console.log("Delete user response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    setAuthToken(null);
    throw error;
  }
};

// Get all products
export const getAllProducts = async (filters: Record<string, any> = {}) => {
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    console.log("Fetching products with query:", queryString);
    
    const response = await axios.get(`/products${queryString}`);
    console.log("API Response:", response.data);
    return response.data.products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Get featured products
export const getFeaturedProducts = async () => {
  try {
    console.log("Fetching featured products");
    const response = await axios.get('/products?featured=true');
    console.log("Featured products response:", response.data);
    return response.data.products;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    throw error;
  }
};

// Get product by ID
export const getProductById = async (id: string) => {
  try {
    if (!id) {
      throw new Error('Product ID is required');
    }
    console.log(`Fetching product with ID: ${id}`);
    const response = await axios.get(`/products/${id}`);
    console.log("Product details response:", response.data);
    return response.data.product;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};


// Add a new product (requires authentication)
export const addProduct = async (productData: Product, token: string) => {
  try {
    console.log("Adding product with token:", token ? "Token exists" : "No token");
    console.log("Product data being sent:", productData);
    
    setAuthToken(token);
    const response = await axios.post('/products', productData);
    setAuthToken(null);
    
    console.log("Server response:", response.data);
    return response.data.product;
  } catch (error) {
    console.error('Error adding product:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Server error response:', error.response.data);
    }
    setAuthToken(null);
    throw error;
  }
};

// Update a product (requires authentication)
export const updateProduct = async (id: string, productData: Partial<Product>, token: string) => {
  try {
    console.log(`Updating product ${id} with data:`, productData);
    setAuthToken(token);
    const response = await axios.put(`/products/${id}`, productData);
    setAuthToken(null);
    console.log("Update product response:", response.data);
    return response.data.product;
  } catch (error) {
    console.error('Error updating product:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Server error response:', error.response.data);
    }
    setAuthToken(null);
    throw error;
  }
};

// Delete a product (requires authentication)
export const deleteProduct = async (id: string, token: string) => {
  try {
    console.log(`Deleting product with ID: ${id}`);
    setAuthToken(token);
    const response = await axios.delete(`/products/${id}`);
    setAuthToken(null);
    console.log("Delete product response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting product:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Server error response:', error.response.data);
    }
    setAuthToken(null);
    throw error;
  }
};

// Get seller products (requires authentication)
export const getSellerProducts = async (token: string) => {
  try {
    console.log("Fetching seller's products");
    setAuthToken(token);
    const response = await axios.get('/products/seller/products');
    setAuthToken(null);
    console.log("Seller products response:", response.data);
    return response.data.products;
  } catch (error) {
    console.error('Error fetching seller products:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Server error response:', error.response.data);
    }
    setAuthToken(null);
    throw error;
  }
};

// Get product statistics (requires authentication)
export const getProductStats = async (token: string) => {
  try {
    console.log("Fetching product statistics");
    setAuthToken(token);
    const response = await axios.get('/products/seller/stats');
    setAuthToken(null);
    console.log("Product stats response:", response.data);
    return response.data.stats;
  } catch (error) {
    console.error('Error fetching product statistics:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Server error response:', error.response.data);
    }
    setAuthToken(null);
    throw error;
  }
};

// Add product review (requires authentication)
export const addProductReview = async (productId: string, reviewData: { rating: number, review: string }, token: string) => {
  try {
    console.log(`Adding review for product ${productId}:`, reviewData);
    setAuthToken(token);
    const response = await axios.post(`/products/${productId}/reviews`, reviewData);
    setAuthToken(null);
    console.log("Add review response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding product review:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Server error response:', error.response.data);
    }
    setAuthToken(null);
    throw error;
  }
};

// Get all products for admin
export const getAllProductsForAdmin = async (token: string) => {
  try {
    console.log("Fetching all products for admin");
    setAuthToken(token);
    const response = await axios.get('/products');
    setAuthToken(null);
    console.log("Admin products response:", response.data);
    return response.data.products;
  } catch (error) {
    console.error('Error fetching products for admin:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Server error response:', error.response.data);
    }
    setAuthToken(null);
    throw error;
  }
};

// Update product status (admin only)
export const updateProductStatus = async (productId: string, status: 'active' | 'inactive' | 'archived', token: string) => {
  try {
    console.log(`Updating product ${productId} status to ${status}`);
    setAuthToken(token);
    const response = await axios.put(`/products/${productId}`, { status });
    setAuthToken(null);
    console.log("Update product status response:", response.data);
    return response.data.product;
  } catch (error) {
    console.error('Error updating product status:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Server error response:', error.response.data);
    }
    setAuthToken(null);
    throw error;
  }
};

// Delete product (admin only)
export const deleteProductAdmin = async (productId: string, token: string) => {
  try {
    console.log(`Deleting product with ID: ${productId}`);
    setAuthToken(token);
    const response = await axios.delete(`/products/${productId}`);
    setAuthToken(null);
    console.log("Delete product response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting product:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Server error response:', error.response.data);
    }
    setAuthToken(null);
    throw error;
  }
};

export default {
  getAllProducts,
  getFeaturedProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  getProductStats,
  addProductReview,
  getAllProductsForAdmin,
  updateProductStatus,
  deleteProductAdmin,
  fetchAllUsers,
  fetchAllSellers,
  updateUserStatus,
  deleteUser
};
