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

// Mock users for demo
const mockUsers = [
  { id: '1', name: 'Student Demo', email: 'student@emsi.ma', password: 'password', role: 'student', avatar: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&q=80&w=100' },
  { id: '2', name: 'Teacher Demo', email: 'teacher@emsi.ma', password: 'password', role: 'teacher', avatar: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&q=80&w=100' },
  { id: '3', name: 'Admin Demo', email: 'admin@emsi.ma', password: 'password', role: 'admin', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=100' },
];

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

  // Login function: try backend, fallback to mock
  const login = async (email: string, password: string) => {
    try {
      // Backend login (JWT)
      const response = await fetch('http://localhost:8000/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error('Backend login failed');

      const data = await response.json();
      localStorage.setItem('emsi_access', data.access);
      localStorage.setItem('emsi_refresh', data.refresh);

      // Fetch user info
      const userRes = await fetch('http://localhost:8000/api/auth/me/', {
        headers: { 'Authorization': `Bearer ${data.access}` },
      });
      if (!userRes.ok) throw new Error('Failed to fetch user info');
      const userData = await userRes.json();

      // Map backend fields to frontend User type
      const mappedUser: User = {
        id: userData.id,
        name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
        email: userData.email,
        role: userData.role,
        avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.first_name || userData.email)}&background=random`,
      };

      setUser(mappedUser);
      setIsAuthenticated(true);
      localStorage.setItem('emsi_user', JSON.stringify(mappedUser));
    } catch (err) {
      // Fallback to mock
      const foundUser = mockUsers.find(u => u.email === email && u.password === password);
      if (foundUser) {
        const { password, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword as User);
        setIsAuthenticated(true);
        localStorage.setItem('emsi_user', JSON.stringify(userWithoutPassword));
      } else {
        throw new Error('Invalid email or password');
      }
    }
  };

  // Register function: try backend, fallback to mock
  const register = async (name: string, email: string, password: string, role: 'student' | 'teacher') => {
    try {
      // Backend register
      const response = await fetch('http://localhost:8000/api/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: email.split('@')[0],
          email,
          password,
          password2: password,
          first_name: name.split(' ')[0],
          last_name: name.split(' ').slice(1).join(' '),
          role,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.password?.join(' ') ||
          errorData.detail ||
          'Registration failed'
        );
      }

      // Auto-login after registration
      await login(email, password);
    } catch (err) {
      // Fallback to mock
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
