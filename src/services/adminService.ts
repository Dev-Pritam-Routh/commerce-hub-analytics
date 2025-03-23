
import axios from 'axios';

// Set the base URL from environment variable or use default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Define user interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'seller' | 'admin';
  status: 'active' | 'inactive';
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  createdAt?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: 'user' | 'seller' | 'admin';
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  status?: 'active' | 'inactive';
}

// Helper function to set the auth token
const setAuthToken = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
  }
};

// Fetch all users
export const fetchAllUsers = async (token: string) => {
  try {
    console.log('Fetching all users');
    setAuthToken(token);
    const response = await axios.get(`${API_URL}/users`);
    setAuthToken(null);
    return response.data.users;
  } catch (error) {
    console.error('Error fetching users:', error);
    setAuthToken(null);
    throw error;
  }
};

// Fetch all sellers
export const fetchAllSellers = async (token: string) => {
  try {
    console.log('Fetching all sellers');
    setAuthToken(token);
    const response = await axios.get(`${API_URL}/users/sellers`);
    setAuthToken(null);
    return response.data.sellers;
  } catch (error) {
    console.error('Error fetching sellers:', error);
    setAuthToken(null);
    throw error;
  }
};

// Fetch user by ID
export const fetchUserById = async (userId: string, token: string) => {
  try {
    console.log(`Fetching user with ID: ${userId}`);
    setAuthToken(token);
    const response = await axios.get(`${API_URL}/users/${userId}`);
    setAuthToken(null);
    return response.data.user;
  } catch (error) {
    console.error('Error fetching user:', error);
    setAuthToken(null);
    throw error;
  }
};

// Create a new user
export const createUser = async (userData: {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'seller' | 'admin';
  phone?: string;
  address?: object;
}, token: string) => {
  try {
    console.log('Creating new user:', userData);
    setAuthToken(token);
    const response = await axios.post(`${API_URL}/users`, userData);
    setAuthToken(null);
    return response.data.user;
  } catch (error) {
    console.error('Error creating user:', error);
    setAuthToken(null);
    throw error;
  }
};

// Update user
export const updateUser = async (userId: string, userData: UpdateUserData, token: string) => {
  try {
    console.log(`Updating user with ID: ${userId}`, userData);
    setAuthToken(token);
    const response = await axios.put(`${API_URL}/users/${userId}`, userData);
    setAuthToken(null);
    return response.data.user;
  } catch (error) {
    console.error('Error updating user:', error);
    setAuthToken(null);
    throw error;
  }
};

// Update user status
export const updateUserStatus = async (userId: string, status: 'active' | 'inactive', token: string) => {
  try {
    console.log(`Updating status for user with ID: ${userId} to ${status}`);
    setAuthToken(token);
    const response = await axios.put(`${API_URL}/users/${userId}/status`, { status });
    setAuthToken(null);
    return response.data.user;
  } catch (error) {
    console.error('Error updating user status:', error);
    setAuthToken(null);
    throw error;
  }
};

// Delete user
export const deleteUser = async (userId: string, token: string) => {
  try {
    console.log(`Deleting user with ID: ${userId}`);
    setAuthToken(token);
    const response = await axios.delete(`${API_URL}/users/${userId}`);
    setAuthToken(null);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    setAuthToken(null);
    throw error;
  }
};

// Change user password
export const changeUserPassword = async (userId: string, password: string, token: string) => {
  try {
    console.log(`Changing password for user with ID: ${userId}`);
    setAuthToken(token);
    const response = await axios.put(`${API_URL}/users/${userId}/password`, { password });
    setAuthToken(null);
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    setAuthToken(null);
    throw error;
  }
};

export default {
  fetchAllUsers,
  fetchAllSellers,
  fetchUserById,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
  changeUserPassword
};
