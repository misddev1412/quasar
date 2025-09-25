'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  username?: string;
  firstName?: string;
  lastName?: string;
  name: string;
  avatar?: string;
  role?: string;
  phoneNumber?: string;
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
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
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
  const router = useRouter();

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
      const userData = await (trpcClient as any).clientUser.getProfile.query();

      if (userData?.data) {
        const user = userData.data;
        const profile = user.profile || {};

        setUser({
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: profile.firstName,
          lastName: profile.lastName,
          name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || user.username || user.email,
          avatar: profile.avatar,
          role: user.role,
          phoneNumber: profile.phoneNumber,
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
      router.push('/login');
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { trpcClient } = await import('../utils/trpc');

      const response = await (trpcClient as any).clientUser.login.mutate({
        email,
        password,
      });

      if (response?.data) {
        const authData = response.data;
        setAuthToken(authData.accessToken);

        if (authData.refreshToken) {
          setRefreshToken(authData.refreshToken);
        }

        const userData = authData.user;
        const profile = userData.profile || {};

        setUser({
          id: userData.id,
          email: userData.email,
          username: userData.username,
          firstName: profile.firstName,
          lastName: profile.lastName,
          name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || userData.username || userData.email,
          avatar: profile.avatar,
          role: userData.role,
          phoneNumber: profile.phoneNumber,
        });

        // Show success message
        appEvents.emit('show-toast', {
          type: 'success',
          title: 'Login Successful',
          description: 'Welcome back!',
        });

        // Navigate to dashboard or home
        router.push('/');
      }
    } catch (error: any) {
      // Error will be handled by error link
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const { trpcClient } = await import('../utils/trpc');

      const response = await (trpcClient as any).clientUser.register.mutate({
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phoneNumber: data.phoneNumber,
      });

      if (response?.data) {
        const authData = response.data;
        setAuthToken(authData.accessToken);

        if (authData.refreshToken) {
          setRefreshToken(authData.refreshToken);
        }

        const userData = authData.user;
        const profile = userData.profile || {};

        setUser({
          id: userData.id,
          email: userData.email,
          username: userData.username,
          firstName: profile.firstName,
          lastName: profile.lastName,
          name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || userData.username || userData.email,
          avatar: profile.avatar,
          role: userData.role,
          phoneNumber: profile.phoneNumber,
        });

        // Show success message
        appEvents.emit('show-toast', {
          type: 'success',
          title: 'Registration Successful',
          description: 'Welcome to our platform!',
        });

        // Navigate to onboarding or dashboard
        router.push('/');
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

    router.push('/login');
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
