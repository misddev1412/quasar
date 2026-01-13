import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFormState } from './useFormState';
import { useTranslationWithBackend } from './useTranslationWithBackend';
import { useToast } from '../contexts/ToastContext';
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


export function useLoginForm({ auth }: UseLoginFormProps): UseLoginFormReturn {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const state = location.state as LocationState;
  const redirectPath = state?.from?.pathname || '/';
  
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

  const validators = {
    password: (value: string) => {
      if (value.length < 6) {
        return t('auth.password_min_length') || '密码长度必须至少为6个字符';
      }
      return undefined;
    }
  };

  const handleLogin = async (email: string, password: string, rememberMe: boolean = false) => {
    setError('');
    setIsSubmitting(true);

    try {
      const result = await auth.login(email, password, rememberMe);

      if (result.success) {
        navigate(redirectPath, { replace: true });
      } else {
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
          // Show all backend errors as toast notifications
          addToast({
            type: 'error',
            title: t('auth.login_failed'),
            description: errorMessage || t('auth.check_credentials')
          });
        }
      }
    } catch (err) {
      // Show catch errors as toast notifications
      addToast({
        type: 'error',
        title: t('auth.error_occurred'),
        description: t('auth.check_credentials')
      });
      console.error(t('auth.login_error'), err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async (values: LoginFormValues) => {
    const { email, password, rememberMe } = values;
    await handleLogin(email, password, rememberMe);
  };

  const formState = useFormState<LoginFormValues>({
    initialValues,
    validators,
    onSubmit: handleFormSubmit
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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