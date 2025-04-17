
import React, { createContext, useContext, useState, useEffect } from 'react';

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
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  // Mock login function (in a real app, this would make an API call)
  const login = async (email: string, password: string) => {
    // This is a mock implementation that would be replaced with actual API call
    // In a real app, this would validate credentials with the backend
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock users for demo - in a real app these would come from your backend
    const mockUsers = [
      { id: '1', name: 'Student Demo', email: 'student@emsi.ma', password: 'password', role: 'student', avatar: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&q=80&w=100' },
      { id: '2', name: 'Teacher Demo', email: 'teacher@emsi.ma', password: 'password', role: 'teacher', avatar: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&q=80&w=100' },
    ];
    
    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword as User);
      setIsAuthenticated(true);
      localStorage.setItem('emsi_user', JSON.stringify(userWithoutPassword));
    } else {
      throw new Error('Invalid email or password');
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string, role: 'student' | 'teacher') => {
    // This is a mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create a new user object
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      role,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
    };
    
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('emsi_user', JSON.stringify(newUser));
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('emsi_user');
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
