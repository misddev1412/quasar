import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { trpc } from '../utils/trpc';
import { TrpcApiResponse } from '@shared/types/api-response.types';

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<{success: boolean, errorMessage?: string}>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

export interface UseAuthReturn extends AuthState, AuthActions {}

// 存储键常量
const TOKEN_KEY = 'admin_access_token';
const REFRESH_TOKEN_KEY = 'admin_refresh_token';
const USER_KEY = 'admin_user';

/**
 * 身份验证Hook，提供登录、登出和令牌刷新功能
 */
export function useAuth(): UseAuthReturn {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });
  
  const navigate = useNavigate();
  const loginMutation = trpc.adminAuth.login.useMutation();
  const refreshMutation = trpc.adminAuth.refresh.useMutation();

  /**
   * 从本地存储中恢复身份验证状态
   */
  const restoreAuth = useCallback(async () => {
    try {
      const storedUser = localStorage.getItem(USER_KEY);
      const accessToken = localStorage.getItem(TOKEN_KEY);
      
      if (storedUser && accessToken) {
        setAuthState(prev => ({
          ...prev,
          user: JSON.parse(storedUser),
          isAuthenticated: true,
          isLoading: false
        }));
        return true;
      }
      
      // 尝试刷新令牌
      const refreshed = await refreshToken();
      if (!refreshed) {
        clearAuthData();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('恢复身份验证状态失败:', error);
      clearAuthData();
      return false;
    }
  }, []);

  /**
   * 清除所有身份验证数据
   */
  const clearAuthData = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  }, []);

  /**
   * 登录操作
   */
  const login = useCallback(async (email: string, password: string): Promise<{success: boolean, errorMessage?: string}> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const result = await loginMutation.mutateAsync({ email, password }) as TrpcApiResponse;
      
      if (result.code === 200 && result.data) {
        const userData = result.data.user as User;
        const accessToken = result.data.accessToken as string;
        const refreshToken = result.data.refreshToken as string;
        
        // 存储身份验证数据
        localStorage.setItem(TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        
        // 更新状态
        setAuthState({
          user: userData,
          isAuthenticated: true,
          isLoading: false
        });
        
        return { success: true };
      }
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, errorMessage: result.status || '登录失败' };
    } catch (error: any) {
      console.error('登录错误:', error);
      
      // 尝试从错误中提取API错误信息
      let errorMessage = '登录失败';
      
      if (error.shape?.data) {
        const errorData = Array.isArray(error.shape.data) 
          ? error.shape.data[0]?.error 
          : error.shape.data?.error;
          
        if (errorData) {
          errorMessage = errorData.message || errorMessage;
        }
      }
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, errorMessage };
    }
  }, [loginMutation]);

  /**
   * 刷新令牌操作
   */
  const refreshToken = useCallback(async (): Promise<boolean> => {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    
    if (!storedRefreshToken) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
    
    try {
      const result = await refreshMutation.mutateAsync({ 
        refreshToken: storedRefreshToken 
      }) as TrpcApiResponse;
      
      if (result.code === 200 && result.data) {
        const accessToken = result.data.accessToken as string;
        const refreshToken = result.data.refreshToken as string;
        
        localStorage.setItem(TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        
        // 用户数据在刷新时通常不会改变
        const storedUser = localStorage.getItem(USER_KEY);
        if (storedUser) {
          setAuthState({
            user: JSON.parse(storedUser),
            isAuthenticated: true,
            isLoading: false
          });
        }
        
        return true;
      }
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    } catch (error) {
      console.error('令牌刷新错误:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [refreshMutation]);

  /**
   * 登出操作
   */
  const logout = useCallback(() => {
    clearAuthData();
    navigate('/auth/login');
  }, [clearAuthData, navigate]);

  // 初始化时检查身份验证状态
  useEffect(() => {
    restoreAuth();
  }, [restoreAuth]);

  return {
    ...authState,
    login,
    logout,
    refreshToken
  };
} 