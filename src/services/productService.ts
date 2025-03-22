
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
    const response = await axios.get('/products?featured=true');
    return response.data.products;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    throw error;
  }
};

// Get product by ID
export const getProductById = async (id: string) => {
  try {
    const response = await axios.get(`/products/${id}`);
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
    setAuthToken(token);
    const response = await axios.post('/products', productData);
    setAuthToken(null);
    return response.data.product;
  } catch (error) {
    console.error('Error adding product:', error);
    setAuthToken(null);
    throw error;
  }
};

// Update a product (requires authentication)
export const updateProduct = async (id: string, productData: Partial<Product>, token: string) => {
  try {
    setAuthToken(token);
    const response = await axios.put(`/products/${id}`, productData);
    setAuthToken(null);
    return response.data.product;
  } catch (error) {
    console.error('Error updating product:', error);
    setAuthToken(null);
    throw error;
  }
};

// Delete a product (requires authentication)
export const deleteProduct = async (id: string, token: string) => {
  try {
    setAuthToken(token);
    const response = await axios.delete(`/products/${id}`);
    setAuthToken(null);
    return response.data;
  } catch (error) {
    console.error('Error deleting product:', error);
    setAuthToken(null);
    throw error;
  }
};

// Get seller products (requires authentication)
export const getSellerProducts = async (token: string) => {
  try {
    setAuthToken(token);
    const response = await axios.get('/products/seller/products');
    setAuthToken(null);
    return response.data.products;
  } catch (error) {
    console.error('Error fetching seller products:', error);
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
  getSellerProducts
};
