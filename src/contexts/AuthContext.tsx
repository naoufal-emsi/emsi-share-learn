import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/services/api';

// --- Cookie helpers ---
function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}
function getCookie(name: string) {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r
  }, '');
}
function removeCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

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
  updateProfile: (profileData: Partial<{ first_name: string; last_name: string; email: string; avatar?: string }>) => Promise<void>;
};

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checked, setChecked] = useState(false); // Prevents flicker on first load

  // On mount, check for token in cookies and auto-login if valid
  useEffect(() => {
    const token = getCookie('emsi_access');
    if (token) {
      authAPI.getMe().then(userData => {
        const mappedUser: User = {
          id: userData.id.toString(),
          name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.username,
          email: userData.email,
          role: userData.role,
          avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.first_name || userData.email)}&background=random`,
        };
        setUser(mappedUser);
        setIsAuthenticated(true);
        setChecked(true);
      }).catch(() => {
        logout();
        setChecked(true);
      });
    } else {
      setChecked(true);
    }
  // eslint-disable-next-line
  }, []);

  // Login function using backend
  const login = async (email: string, password: string) => {
    try {
      const data = await authAPI.login(email, password);
      setCookie('emsi_access', data.access, 14); // 14 days
      setCookie('emsi_refresh', data.refresh, 30); // 30 days

      // Fetch user info
      const userData = await authAPI.getMe();
      const mappedUser: User = {
        id: userData.id.toString(),
        name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.username,
        email: userData.email,
        role: userData.role,
        avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.first_name || userData.email)}&background=random`,
      };

      setUser(mappedUser);
      setIsAuthenticated(true);
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
    removeCookie('emsi_access');
    removeCookie('emsi_refresh');
  };

  // Update profile function
  const updateProfile = async (profileData: Partial<{ first_name: string; last_name: string; email: string; avatar?: string }>) => {
    try {
      // Call your API to update the profile
      const updatedUserData = await authAPI.updateProfile(profileData);
      
      // Update the user state with the new data
      const mappedUser: User = {
        id: updatedUserData.id.toString(),
        name: `${updatedUserData.first_name || ''} ${updatedUserData.last_name || ''}`.trim() || updatedUserData.username,
        email: updatedUserData.email,
        role: updatedUserData.role,
        avatar: updatedUserData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(updatedUserData.first_name || updatedUserData.email)}&background=random`,
      };
      setUser(mappedUser);

      // Optionally, you might want to refetch the user or merge data carefully
      // For example, if the API only returns a success message:
      // const currentUser = await authAPI.getMe(); // Refetch user
      // setUser(currentUser); // Update state

    } catch (error) {
      console.error('Profile update failed:', error);
      throw new Error('Profile update failed');
    }
  };

  // Only render children after auth check to avoid flicker
  if (!checked) return null;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, register, updateProfile }}>
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
