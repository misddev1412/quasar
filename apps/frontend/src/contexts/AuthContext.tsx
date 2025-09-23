import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  getRefreshToken,
  setRefreshToken,
  removeRefreshToken,
} from '../utils/trpc';
import type { User as TRPCUser, AuthResponse } from '../types/trpc';
import { appEvents } from '../utils/trpc-error-link';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  checkAuth: () => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is authenticated on mount
  const checkAuth = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      // Import trpc dynamically to avoid circular dependency
      const { trpcClient } = await import('../utils/trpc');

      // Verify token with backend and get user data
      const userData = await (trpcClient as any).auth.me.query();

      if (userData) {
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.name || userData.email,
          avatar: userData.avatar,
          role: userData.role,
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Token is invalid, remove it
      removeAuthToken();
      removeRefreshToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Listen for auth errors from tRPC
  useEffect(() => {
    const unsubscribe = appEvents.on('auth-error', () => {
      logout();
      navigate('/login');
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { trpcClient } = await import('../utils/trpc');

      const response = await (trpcClient as any).auth.login.mutate({
        email,
        password,
      });

      if (response.accessToken) {
        setAuthToken(response.accessToken);

        if (response.refreshToken) {
          setRefreshToken(response.refreshToken);
        }

        setUser({
          id: response.user.id,
          email: response.user.email,
          name: response.user.name || response.user.email,
          avatar: response.user.avatar,
          role: response.user.role,
        });

        // Show success message
        appEvents.emit('show-toast', {
          type: 'success',
          title: 'Login Successful',
          description: 'Welcome back!',
        });

        // Navigate to dashboard or home
        navigate('/');
      }
    } catch (error: any) {
      // Error will be handled by error link
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const { trpcClient } = await import('../utils/trpc');

      const response = await (trpcClient as any).auth.register.mutate({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (response.accessToken) {
        setAuthToken(response.accessToken);

        if (response.refreshToken) {
          setRefreshToken(response.refreshToken);
        }

        setUser({
          id: response.user.id,
          email: response.user.email,
          name: response.user.name || response.user.email,
          avatar: response.user.avatar,
          role: response.user.role,
        });

        // Show success message
        appEvents.emit('show-toast', {
          type: 'success',
          title: 'Registration Successful',
          description: 'Welcome to our platform!',
        });

        // Navigate to onboarding or dashboard
        navigate('/');
      }
    } catch (error: any) {
      // Error will be handled by error link
      throw error;
    }
  };

  const logout = () => {
    removeAuthToken();
    removeRefreshToken();
    setUser(null);

    appEvents.emit('show-toast', {
      type: 'info',
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });

    navigate('/login');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;