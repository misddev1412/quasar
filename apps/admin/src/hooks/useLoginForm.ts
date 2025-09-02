import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFormState } from './useFormState';
import { useTranslationWithBackend } from './useTranslationWithBackend';
import { useToast } from '../context/ToastContext';
import { UseAuthReturn } from './useAuth';

interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LocationState {
  from?: {
    pathname: string;
  };
}

interface UseLoginFormProps {
  auth: UseAuthReturn;
}

interface UseLoginFormReturn {
  formState: ReturnType<typeof useFormState<LoginFormValues>>;
  isSubmitting: boolean;
  error: string;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleLogin: (email: string, password: string) => Promise<void>;
  redirectPath: string;
}

const initialValues: LoginFormValues = {
  email: '',
  password: '',
  rememberMe: false
};

/**
 * 登录表单逻辑Hook
 */
export function useLoginForm({ auth }: UseLoginFormProps): UseLoginFormReturn {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const state = location.state as LocationState;
  const redirectPath = state?.from?.pathname || '/';
  
  // 自动重定向已登录用户
  useEffect(() => {
    if (auth.isAuthenticated && !auth.isLoading) {
      navigate(redirectPath, { replace: true });
    }
  }, [auth.isAuthenticated, auth.isLoading, navigate, redirectPath]);

  // Check for deactivated account error from auth state (from /me endpoint)
  useEffect(() => {
    if (auth.lastDeactivatedAccountError && !auth.isAuthenticated) {
      // Show toast notification for deactivated account
      addToast({
        type: 'warning',
        title: t('auth.account_deactivated'),
        description: t('auth.account_deactivated_message')
      });
      // Clear the error from auth state
      auth.clearDeactivatedAccountError();
    }
  }, [auth.lastDeactivatedAccountError, auth.isAuthenticated, auth.clearDeactivatedAccountError, addToast, t]);

  // 表单验证器
  const validators = {
    password: (value: string) => {
      if (value.length < 6) {
        return t('auth.password_min_length') || '密码长度必须至少为6个字符';
      }
      return undefined;
    }
  };

  // 登录处理函数，直接使用email和password
  const handleLogin = async (email: string, password: string) => {
    setError('');
    setIsSubmitting(true);

    try {
      const result = await auth.login(email, password);

      if (result.success) {
        // 登录成功后重定向
        navigate(redirectPath, { replace: true });
      } else {
        // 检查是否是账户被停用的错误
        const errorMessage = result.errorMessage || '';

        // Use the isAccountDeactivated flag from auth result if available, otherwise fall back to pattern matching
        const isDeactivatedAccount = result.isAccountDeactivated ||
                                   errorMessage.includes('deactivated') ||
                                   errorMessage.includes('inactive') ||
                                   errorMessage.includes('not found or inactive') ||
                                   errorMessage.includes('User not found or inactive') ||
                                   errorMessage.toLowerCase().includes('account has been deactivated');

        if (isDeactivatedAccount) {
          // Show toast notification for deactivated account
          addToast({
            type: 'warning',
            title: t('auth.account_deactivated'),
            description: t('auth.account_deactivated_message')
          });
        } else {
          // 显示其他错误信息
          setError(errorMessage || t('auth.login_failed'));
        }
      }
    } catch (err) {
      setError(t('auth.error_occurred'));
      console.error(t('auth.login_error'), err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 表单提交处理
  const handleFormSubmit = async (values: LoginFormValues) => {
    const { email, password } = values;
    await handleLogin(email, password);
  };

  // 创建表单状态
  const formState = useFormState<LoginFormValues>({
    initialValues,
    validators,
    onSubmit: handleFormSubmit
  });

  // 创建自定义提交处理程序
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 手动验证密码
    const isPasswordValid = formState.validateField('password');
    
    if (isPasswordValid) {
      await formState.handleSubmit(e);
    }
  };

  return {
    formState,
    isSubmitting,
    error,
    handleSubmit,
    handleLogin,
    redirectPath
  };
} 