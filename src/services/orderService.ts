
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

// Define order interface
export interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Order {
  _id?: string;
  user?: string;
  products: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal' | 'cash_on_delivery';
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid?: boolean;
  paidAt?: string;
  isDelivered?: boolean;
  deliveredAt?: string;
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt?: string;
}

// Create a new order
export const createOrder = async (orderData: Omit<Order, '_id' | 'user'>, token: string) => {
  try {
    console.log("Creating order with data:", orderData);
    setAuthToken(token);
    const response = await axios.post('/orders', orderData);
    setAuthToken(null);
    console.log("Order creation response:", response.data);
    return response.data.order;
  } catch (error) {
    console.error('Error creating order:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Server error response:', error.response.data);
    }
    setAuthToken(null);
    throw error;
  }
};

// Get user orders
export const getUserOrders = async (token: string) => {
  try {
    console.log("Fetching user orders");
    setAuthToken(token);
    const response = await axios.get('/orders/myorders');
    setAuthToken(null);
    console.log("User orders response:", response.data);
    return response.data.orders;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Server error response:', error.response.data);
    }
    setAuthToken(null);
    throw error;
  }
};

// Get order by ID
export const getOrderById = async (id: string, token: string) => {
  try {
    console.log(`Fetching order with ID: ${id}`);
    setAuthToken(token);
    const response = await axios.get(`/orders/${id}`);
    setAuthToken(null);
    console.log("Order details response:", response.data);
    return response.data.order;
  } catch (error) {
    console.error('Error fetching order:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Server error response:', error.response.data);
    }
    setAuthToken(null);
    throw error;
  }
};

// Get seller orders
export const getSellerOrders = async (token: string) => {
  try {
    console.log("Fetching seller orders");
    setAuthToken(token);
    const response = await axios.get('/orders/seller/orders');
    setAuthToken(null);
    console.log("Seller orders response:", response.data);
    return response.data.orders;
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Server error response:', error.response.data);
    }
    setAuthToken(null);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (id: string, status: string, token: string) => {
  try {
    console.log(`Updating order ${id} status to ${status}`);
    setAuthToken(token);
    const response = await axios.put(`/orders/${id}/status`, { status });
    setAuthToken(null);
    console.log("Order status update response:", response.data);
    return response.data.order;
  } catch (error) {
    console.error('Error updating order status:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Server error response:', error.response.data);
    }
    setAuthToken(null);
    throw error;
  }
};

export default {
  createOrder,
  getUserOrders,
  getOrderById,
  getSellerOrders,
  updateOrderStatus
};
