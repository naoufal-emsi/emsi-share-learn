
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Define types for our context
type User = {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  avatar?: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string, role: 'student' | 'teacher') => Promise<void>;
};

// API base URL
const API_URL = "http://localhost:8000/api";

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check if user is already logged in from localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem('emsi_token');
    const storedUser = localStorage.getItem('emsi_user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
      // Set axios auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Login function to connect to Django backend
  const login = async (email: string, password: string) => {
    try {
      // Make API call to Django backend
      const response = await axios.post(`${API_URL}/token/`, {
        username: email,  // Django uses username by default
        password,
      });
      
      const { access, refresh } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('emsi_token', access);
      localStorage.setItem('emsi_refresh_token', refresh);
      
      // Set axios auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      // Get user info
      const userResponse = await axios.get(`${API_URL}/users/me/`);
      
      // Transform the user data to match our front-end format
      const userData: User = {
        id: userResponse.data.id,
        name: `${userResponse.data.first_name} ${userResponse.data.last_name}`,
        email: userResponse.data.email,
        role: userResponse.data.role,
        avatar: userResponse.data.avatar,
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('emsi_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Invalid email or password');
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string, role: 'student' | 'teacher') => {
    try {
      // Split the name into first_name and last_name
      const nameParts = name.split(' ');
      const first_name = nameParts[0];
      const last_name = nameParts.slice(1).join(' ');
      
      // Make API call to Django backend
      await axios.post(`${API_URL}/users/register/`, {
        username: email,
        email,
        password,
        password2: password,  // The backend requires password confirmation
        first_name,
        last_name,
        role,
      });
      
      // After registration, login
      await login(email, password);
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error('Failed to register account');
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('emsi_token');
    localStorage.removeItem('emsi_refresh_token');
    localStorage.removeItem('emsi_user');
    // Remove axios auth header
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
