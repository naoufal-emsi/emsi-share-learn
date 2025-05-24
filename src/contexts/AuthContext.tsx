
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/services/api';

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

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check if user is already logged in from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('emsi_user');
    const token = localStorage.getItem('emsi_access');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
      
      // Verify token is still valid by fetching user info
      authAPI.getMe().catch(() => {
        // Token is invalid, logout
        logout();
      });
    }
  }, []);

  // Login function using backend
  const login = async (email: string, password: string) => {
    try {
      const data = await authAPI.login(email, password);
      localStorage.setItem('emsi_access', data.access);
      localStorage.setItem('emsi_refresh', data.refresh);

      // Fetch user info
      const userData = await authAPI.getMe();

      // Map backend fields to frontend User type
      const mappedUser: User = {
        id: userData.id.toString(),
        name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.username,
        email: userData.email,
        role: userData.role,
        avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.first_name || userData.email)}&background=random`,
      };

      setUser(mappedUser);
      setIsAuthenticated(true);
      localStorage.setItem('emsi_user', JSON.stringify(mappedUser));
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Invalid email or password');
    }
  };

  // Register function using backend
  const register = async (name: string, email: string, password: string, role: 'student' | 'teacher') => {
    try {
      const nameParts = name.split(' ');
      const first_name = nameParts[0] || '';
      const last_name = nameParts.slice(1).join(' ') || '';
      
      await authAPI.register({
        username: email.split('@')[0],
        email,
        password,
        password2: password,
        first_name,
        last_name,
        role,
      });

      // Auto-login after registration
      await login(email, password);
    } catch (error) {
      console.error('Registration failed:', error);
      throw new Error('Registration failed');
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('emsi_user');
    localStorage.removeItem('emsi_access');
    localStorage.removeItem('emsi_refresh');
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
