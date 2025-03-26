
import axios from 'axios';

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get seller dashboard overview
export const getSellerDashboardOverview = async (token: string) => {
  try {
    const response = await axios.get(`${API_URL}/seller/dashboard/overview`, {
      headers: {
        'x-auth-token': token
      }
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching seller dashboard overview:', error);
    throw error;
  }
};

// Get seller sales data
export const getSellerSalesData = async (token: string, timeFrame: 'daily' | 'weekly' | 'monthly' = 'monthly') => {
  try {
    const response = await axios.get(`${API_URL}/seller/dashboard/sales`, {
      headers: {
        'x-auth-token': token
      },
      params: {
        timeFrame
      }
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching seller sales data:', error);
    throw error;
  }
};

// Get recent orders for seller
export const getSellerRecentOrders = async (token: string) => {
  try {
    const response = await axios.get(`${API_URL}/seller/dashboard/recent-orders`, {
      headers: {
        'x-auth-token': token
      }
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching seller recent orders:', error);
    throw error;
  }
};

// Get low stock products for seller
export const getSellerLowStockProducts = async (token: string) => {
  try {
    const response = await axios.get(`${API_URL}/seller/dashboard/low-stock`, {
      headers: {
        'x-auth-token': token
      }
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching seller low stock products:', error);
    throw error;
  }
};
