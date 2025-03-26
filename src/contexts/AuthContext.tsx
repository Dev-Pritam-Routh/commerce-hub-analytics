
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { toast } from '@/components/ui/use-toast';

// Configure axios defaults - ensure we're using the correct API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Set default base URL for all axios requests
axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = false; // No need for credentials for this API

interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'seller' | 'admin';
  phone?: string;
  address?: Address;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string, 
    email: string, 
    password: string, 
    role?: string,
    phone?: string,
    address?: Address
  ) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Set up axios with token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
    }
  }, [token]);

  // Load user on initial render if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('Loading user with token:', token);
        const res = await axios.get('/auth/me');
        console.log('Auth response:', res.data);
        
        if (res.data && res.data.user) {
          setUser({
            id: res.data.user._id,
            name: res.data.user.name,
            email: res.data.user.email,
            role: res.data.user.role,
            phone: res.data.user.phone,
            address: res.data.user.address
          });
          setIsAuthenticated(true);
        } else {
          console.error('Invalid user data returned:', res.data);
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Logging in user:', email);
      console.log('API URL:', axios.defaults.baseURL);
      
      const res = await axios.post('/auth/login', { email, password });
      console.log('Login response:', res.data);
      
      if (res.data && res.data.success) {
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        setToken(token);
        setUser({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address
        });
        setIsAuthenticated(true);
        toast({
          title: "Login successful!",
          description: `Welcome back, ${user.name}!`,
        });
      } else {
        throw new Error(res.data?.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast({
        title: "Login failed",
        description: message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (
    name: string, 
    email: string, 
    password: string, 
    role = 'user',
    phone?: string,
    address?: Address
  ) => {
    try {
      setIsLoading(true);
      console.log('Registering user:', email, 'with role:', role);
      
      const userData = {
        name,
        email,
        password,
        role,
        ...(phone && { phone }),
        ...(address && { address })
      };
      
      const res = await axios.post('/auth/register', userData);
      console.log('Register response:', res.data);
      
      if (res.data && res.data.success) {
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        setToken(token);
        setUser({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address
        });
        setIsAuthenticated(true);
        toast({
          title: "Registration successful!",
          description: `Welcome to CommerceHub, ${user.name}!`,
        });
      } else {
        throw new Error(res.data?.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast({
        title: "Registration failed",
        description: message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    toast({
      title: "Logged out successfully",
    });
  };

  // Update user function
  const updateUser = async (userData: Partial<User>) => {
    try {
      setIsLoading(true);
      if (!user) throw new Error('User not authenticated');
      
      const res = await axios.put(`/users/${user.id}`, userData);
      
      if (res.data && res.data.success) {
        setUser({ ...user, ...res.data.user });
        toast({
          title: "Profile updated successfully",
        });
      } else {
        throw new Error(res.data?.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Update user error:', error);
      const message = error.response?.data?.message || 'Failed to update profile';
      toast({
        title: "Update failed",
        description: message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
