
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Dashboard stats
export const fetchAdminStats = async () => {
  const response = await axios.get(`${API_URL}/admin/stats`, {
    headers: {
      'x-auth-token': localStorage.getItem('token')
    }
  });
  return response.data;
};

// User management
export const fetchAllUsers = async (searchParams = {}) => {
  const response = await axios.get(`${API_URL}/admin/users`, {
    headers: {
      'x-auth-token': localStorage.getItem('token')
    },
    params: searchParams
  });
  return response.data;
};

export const updateUserStatus = async (userId: string, status: 'active' | 'inactive') => {
  const response = await axios.patch(`${API_URL}/admin/users/${userId}/status`, 
    { status },
    {
      headers: {
        'x-auth-token': localStorage.getItem('token')
      }
    }
  );
  return response.data;
};

export const updateUserRole = async (userId: string, role: 'user' | 'seller' | 'admin') => {
  const response = await axios.patch(`${API_URL}/admin/users/${userId}/role`, 
    { role },
    {
      headers: {
        'x-auth-token': localStorage.getItem('token')
      }
    }
  );
  return response.data;
};

export const deleteUser = async (userId: string) => {
  const response = await axios.delete(`${API_URL}/admin/users/${userId}`, {
    headers: {
      'x-auth-token': localStorage.getItem('token')
    }
  });
  return response.data;
};

// Product management
export const fetchAllProducts = async (searchParams = {}) => {
  const response = await axios.get(`${API_URL}/admin/products`, {
    headers: {
      'x-auth-token': localStorage.getItem('token')
    },
    params: searchParams
  });
  return response.data;
};

export const updateProductStatus = async (productId: string, status: 'active' | 'inactive') => {
  const response = await axios.patch(`${API_URL}/admin/products/${productId}/status`, 
    { status },
    {
      headers: {
        'x-auth-token': localStorage.getItem('token')
      }
    }
  );
  return response.data;
};

export const deleteProduct = async (productId: string) => {
  const response = await axios.delete(`${API_URL}/admin/products/${productId}`, {
    headers: {
      'x-auth-token': localStorage.getItem('token')
    }
  });
  return response.data;
};

// Seller management
export const fetchAllSellers = async (searchParams = {}) => {
  const response = await axios.get(`${API_URL}/admin/sellers`, {
    headers: {
      'x-auth-token': localStorage.getItem('token')
    },
    params: searchParams
  });
  return response.data;
};

export const updateSellerStatus = async (sellerId: string, status: 'active' | 'inactive' | 'pending') => {
  const response = await axios.patch(`${API_URL}/admin/sellers/${sellerId}/status`, 
    { status },
    {
      headers: {
        'x-auth-token': localStorage.getItem('token')
      }
    }
  );
  return response.data;
};

export const deleteSeller = async (sellerId: string) => {
  const response = await axios.delete(`${API_URL}/admin/sellers/${sellerId}`, {
    headers: {
      'x-auth-token': localStorage.getItem('token')
    }
  });
  return response.data;
};
