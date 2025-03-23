
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  seller: string;
}

export interface ShippingInfo {
  fullName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderData {
  items: OrderItem[];
  shippingInfo: ShippingInfo;
  paymentMethod: string;
  totalAmount: number;
}

// Create a new order
export const createOrder = async (orderData: OrderData) => {
  const response = await axios.post(`${API_URL}/orders`, orderData, {
    headers: {
      'x-auth-token': localStorage.getItem('token')
    }
  });
  return response.data;
};

// Get user's orders
export const fetchUserOrders = async () => {
  const response = await axios.get(`${API_URL}/orders/user`, {
    headers: {
      'x-auth-token': localStorage.getItem('token')
    }
  });
  return response.data;
};

// Get a specific order by ID
export const fetchOrderById = async (orderId: string) => {
  const response = await axios.get(`${API_URL}/orders/${orderId}`, {
    headers: {
      'x-auth-token': localStorage.getItem('token')
    }
  });
  return response.data;
};

// Get orders for a seller
export const fetchSellerOrders = async (params = {}) => {
  const response = await axios.get(`${API_URL}/orders/seller`, {
    headers: {
      'x-auth-token': localStorage.getItem('token')
    },
    params
  });
  return response.data;
};

// Update order status
export const updateOrderStatus = async (orderId: string, status: string) => {
  const response = await axios.patch(
    `${API_URL}/orders/${orderId}/status`,
    { status },
    {
      headers: {
        'x-auth-token': localStorage.getItem('token')
      }
    }
  );
  return response.data;
};

// Admin: Get all orders
export const fetchAdminOrders = async (params = {}) => {
  const response = await axios.get(`${API_URL}/orders/admin`, {
    headers: {
      'x-auth-token': localStorage.getItem('token')
    },
    params
  });
  return response.data;
};
