import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const auth = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
};

// Product endpoints
export const products = {
  getAll: (params?: any) => api.get('/products', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: FormData) => api.post('/products', data),
  update: (id: string, data: FormData) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

// Order endpoints
export const orders = {
  getAll: () => api.get('/orders'),
  getById: (id: string) => api.get(`/orders/${id}`),
  create: (data: any) => api.post('/orders', data),
  update: (id: string, data: any) => api.put(`/orders/${id}`, data),
  cancel: (id: string) => api.post(`/orders/${id}/cancel`),
};

// User endpoints
export const users = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/users/password', data),
};

// Wishlist endpoints
export const wishlist = {
  getAll: () => api.get('/api/wishlist'),
  add: (productId: string) => api.post(`/api/wishlist/add/${productId}`),
  remove: (productId: string) => api.delete(`/api/wishlist/remove/${productId}`),
  clear: () => api.delete('/api/wishlist/clear'),
};

// Review endpoints
export const reviews = {
  getProductReviews: (productId: string, params?: any) =>
    api.get(`/api/reviews/product/${productId}`, { params }),
  create: (data: any) => api.post('/api/reviews', data),
  update: (id: string, data: any) => api.put(`/api/reviews/${id}`, data),
  delete: (id: string) => api.delete(`/api/reviews/${id}`),
  markHelpful: (id: string) => api.post(`/api/reviews/${id}/helpful`),
  report: (id: string, reason: string) =>
    api.post(`/api/reviews/${id}/report`, { reason }),
};

// Dashboard endpoints
export const dashboard = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentOrders: () => api.get('/dashboard/recent-orders'),
  getTopProducts: () => api.get('/dashboard/top-products'),
};

// Seller dashboard endpoints
export const sellerDashboard = {
  getStats: () => api.get('/seller/dashboard/stats'),
  getProducts: (params?: any) => api.get('/seller/dashboard/products', { params }),
  getOrders: (params?: any) => api.get('/seller/dashboard/orders', { params }),
  getReviews: (params?: any) => api.get('/seller/dashboard/reviews', { params }),
};

export default api; 