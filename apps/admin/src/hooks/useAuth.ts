import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { trpc } from '../utils/trpc';
import { TrpcApiResponse } from '@shared/types/api-response.types';

interface User {
  id: string;
  email: string;
  username: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // Allow other profile properties
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  lastDeactivatedAccountError?: string;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<{success: boolean, errorMessage?: string, isAccountDeactivated?: boolean}>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  verifyAuth: () => Promise<boolean>;
  clearDeactivatedAccountError: () => void;
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
    isLoading: true,
    lastDeactivatedAccountError: undefined
  });
  
  const navigate = useNavigate();
  const loginMutation = trpc.adminAuth.login.useMutation();
  const refreshMutation = trpc.adminAuth.refresh.useMutation();

  // Use /me endpoint for continuous authentication verification
  // Note: Using type assertion as a temporary workaround for tRPC type inference
  const { data: meData, refetch: refetchMe, error: meError } = (trpc.adminAuth as any).me.useQuery(
    undefined,
    {
      enabled: !!authState.isAuthenticated,
      retry: false,
      refetchOnWindowFocus: true, // Check auth status when window gains focus
      refetchInterval: 5 * 60 * 1000, // Check every 5 minutes
      staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
    }
  );

  // Keep the profile query for when we need full profile data
  const { data: profileData, refetch: refetchProfile } = trpc.adminUser.getProfile.useQuery(
    undefined,
    {
      enabled: false, // Only fetch when explicitly needed
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

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
      isLoading: false,
      lastDeactivatedAccountError: undefined
    });
  }, []);

  /**
   * Clear deactivated account error
   */
  const clearDeactivatedAccountError = useCallback(() => {
    setAuthState(prev => ({ ...prev, lastDeactivatedAccountError: undefined }));
  }, []);

  /**
   * Update user state and local storage
   */
  const updateUserState = useCallback((user: User | null) => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
    setAuthState(prev => ({ ...prev, user }));
  }, []);

  // Use ref to track the last processed user data to prevent infinite loops
  const lastProcessedUserRef = useRef<string>('');

  // Effect to handle /me endpoint response for authentication verification
  useEffect(() => {
    const response = meData as TrpcApiResponse<User> | undefined;
    if (response?.data) {
      const newUserData = response.data;
      const newUserDataString = JSON.stringify(newUserData);

      // Only update if the data has actually changed
      if (lastProcessedUserRef.current !== newUserDataString) {
        lastProcessedUserRef.current = newUserDataString;
        updateUserState(newUserData);
      }
    }
  }, [meData, updateUserState]);

  // Effect to handle authentication errors from /me endpoint
  useEffect(() => {
    if (meError && authState.isAuthenticated) {
      console.error('Authentication verification failed:', meError);

      // Check if this is a deactivated account error from /me endpoint
      const errorMessage = meError.message || '';
      const isDeactivatedAccount = errorMessage.includes('User not found or inactive') ||
                                  errorMessage.includes('deactivated') ||
                                  errorMessage.includes('inactive');

      if (isDeactivatedAccount) {
        // Store the deactivated account error for the login form to pick up
        setAuthState(prev => ({
          ...prev,
          lastDeactivatedAccountError: errorMessage,
          isAuthenticated: false,
          isLoading: false,
          user: null
        }));
      } else {
        // Regular auth error - clear data
        clearAuthData();
      }

      navigate('/auth/login');
    }
  }, [meError, authState.isAuthenticated, clearAuthData, navigate]);

  // Use ref to track the last processed profile data to prevent infinite loops
  const lastProcessedProfileRef = useRef<string>('');

  // Effect to update user state when profile data is fetched (for full profile)
  useEffect(() => {
    const response = profileData as TrpcApiResponse<User> | undefined;
    if (response?.data) {
      const newProfile = response.data;
      const newProfileString = JSON.stringify(newProfile);

      // Only update if the profile data has actually changed
      if (lastProcessedProfileRef.current !== newProfileString) {
        lastProcessedProfileRef.current = newProfileString;
        updateUserState(newProfile);
      }
    }
  }, [profileData, updateUserState]);

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
        // The `enabled` flag in useQuery will trigger a fetch.
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
  }, [clearAuthData]);

  /**
   * 登录操作
   */
  const login = useCallback(async (email: string, password: string): Promise<{success: boolean, errorMessage?: string, isAccountDeactivated?: boolean}> => {
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

        // The `enabled` flag in useQuery will trigger a /me fetch to verify authentication
        return { success: true };
      }
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, errorMessage: result.status || '登录失败' };
    } catch (error: any) {
      console.error('登录错误:', error);

      // 尝试从错误中提取API错误信息
      let errorMessage = '登录失败';

      // Try multiple ways to extract the error message
      if (error.message) {
        errorMessage = error.message;
      } else if (error.shape?.message) {
        errorMessage = error.shape.message;
      } else if (error.shape?.data) {
        const errorData = Array.isArray(error.shape.data)
          ? error.shape.data[0]?.error
          : error.shape.data?.error;

        if (errorData) {
          errorMessage = errorData.message || errorMessage;
        }
      }

      // Check if this is a deactivated account error
      const isAccountDeactivated = errorMessage.includes('deactivated') ||
                                  errorMessage.includes('inactive') ||
                                  errorMessage.includes('not found or inactive') ||
                                  errorMessage.includes('User not found or inactive') ||
                                  errorMessage.toLowerCase().includes('account has been deactivated');

      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, errorMessage, isAccountDeactivated };
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
        
        // After refreshing, we are authenticated, and the /me query will run automatically
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: true,
          isLoading: false
        }));
        
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
   * 验证当前用户身份验证状态
   */
  const verifyAuth = useCallback(async () => {
    if (!authState.isAuthenticated) {
      return false;
    }

    try {
      await refetchMe();
      return true;
    } catch (error) {
      console.error('Authentication verification failed:', error);
      clearAuthData();
      navigate('/auth/login');
      return false;
    }
  }, [authState.isAuthenticated, refetchMe, clearAuthData, navigate]);

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
    refreshToken,
    verifyAuth,
    clearDeactivatedAccountError
  };
} 