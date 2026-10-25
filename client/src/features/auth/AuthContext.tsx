import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, setAccessToken } from '@/lib/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
  lastLoginAt?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string; confirmPassword: string; role?: 'admin' | 'user' }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session on mount via refresh endpoint
  useEffect(() => {
    let isMounted = true;
    const initializeAuth = async () => {
      try {
        const res = await api.post('/auth/refresh');
        if (isMounted && res.data.success) {
          setAccessToken(res.data.data.accessToken);
          setUser(res.data.data.user);
        }
      } catch {
        if (isMounted) {
          setAccessToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await api.post('/auth/login', credentials);
    if (res.data.success) {
      setAccessToken(res.data.data.accessToken);
      setUser(res.data.data.user);
    }
  };

  const register = async (payload: { name: string; email: string; password: string; confirmPassword: string; role?: 'admin' | 'user' }) => {
    const res = await api.post('/auth/register', payload);
    if (res.data.success) {
      setAccessToken(res.data.data.accessToken);
      setUser(res.data.data.user);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
