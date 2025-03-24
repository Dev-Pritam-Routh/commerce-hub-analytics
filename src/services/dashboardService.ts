
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

// Interface for the overview data
export interface DashboardOverview {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: any[];
  recentOrdersCount: number;
}

// Interface for sales data
export interface SalesData {
  salesTrends: {
    date: string;
    sales: number;
    count: number;
  }[];
  topSellingProducts: {
    product: any;
    totalSold: number;
    revenue: number;
  }[];
  salesByCategory: {
    category: string;
    totalSales: number;
    count: number;
  }[];
  timeFrame: 'daily' | 'weekly' | 'monthly';
}

// Interface for users data
export interface UsersData {
  registrationsOverTime: {
    date: string;
    count: number;
  }[];
  userRoles: {
    role: string;
    count: number;
  }[];
  activeUsersCount: number;
  userEngagement: {
    user: any;
    orderCount: number;
    totalSpent: number;
  }[];
  totalUsers: number;
}

// Interface for inventory data
export interface InventoryData {
  lowStockProducts: any[];
  inventoryLevels: {
    level: string;
    count: number;
    products: {
      id: string;
      name: string;
      stock: number;
    }[];
  }[];
  topRatedProducts: any[];
  productPerformance: {
    bestSelling: {
      product: {
        id: string;
        name: string;
        category: string;
        price: number;
      };
      totalSold: number;
      revenue: number;
      averagePrice: number;
    }[];
    worstSelling: {
      product: {
        id: string;
        name: string;
        category: string;
        price: number;
      };
      totalSold: number;
      revenue: number;
      averagePrice: number;
    }[];
  };
  stockByCategory: {
    category: string;
    totalStock: number;
    productCount: number;
    averageStock: number;
  }[];
}

// Get dashboard overview
const getDashboardOverview = async (token: string): Promise<DashboardOverview> => {
  try {
    console.log("Fetching dashboard overview");
    setAuthToken(token);
    const response = await axios.get('/admin/dashboard/overview');
    setAuthToken(null);
    console.log("Dashboard overview response:", response.data);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    setAuthToken(null);
    throw error;
  }
};

// Get sales data
const getSalesData = async (token: string, timeFrame: 'daily' | 'weekly' | 'monthly' = 'monthly'): Promise<SalesData> => {
  try {
    console.log(`Fetching sales data with time frame: ${timeFrame}`);
    setAuthToken(token);
    const response = await axios.get(`/admin/dashboard/sales?timeFrame=${timeFrame}`);
    setAuthToken(null);
    console.log("Sales data response:", response.data);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching sales data:', error);
    setAuthToken(null);
    throw error;
  }
};

// Get users data
const getUsersData = async (token: string): Promise<UsersData> => {
  try {
    console.log("Fetching users data");
    setAuthToken(token);
    const response = await axios.get('/admin/dashboard/users');
    setAuthToken(null);
    console.log("Users data response:", response.data);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching users data:', error);
    setAuthToken(null);
    throw error;
  }
};

// Get inventory data
const getInventoryData = async (token: string): Promise<InventoryData> => {
  try {
    console.log("Fetching inventory data");
    setAuthToken(token);
    const response = await axios.get('/admin/dashboard/inventory');
    setAuthToken(null);
    console.log("Inventory data response:", response.data);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching inventory data:', error);
    setAuthToken(null);
    throw error;
  }
};

// Clear dashboard cache
const clearDashboardCache = async (token: string, key?: string): Promise<void> => {
  try {
    console.log(`Clearing dashboard cache${key ? ` for ${key}` : ''}`);
    setAuthToken(token);
    const response = await axios.post('/admin/dashboard/clear-cache', { key });
    setAuthToken(null);
    console.log("Clear cache response:", response.data);
  } catch (error) {
    console.error('Error clearing dashboard cache:', error);
    setAuthToken(null);
    throw error;
  }
};

export {
  getDashboardOverview,
  getSalesData,
  getUsersData,
  getInventoryData,
  clearDashboardCache
};

export default {
  getDashboardOverview,
  getSalesData,
  getUsersData,
  getInventoryData,
  clearDashboardCache
};
