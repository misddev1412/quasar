import { useState } from 'react';
import AuthCard from '../../components/auth/AuthCard';
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { trpc } from '../../utils/trpc';
import { useAdminSeo } from '../../hooks/useAdminSeo';

export function ForgotPasswordPage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslationWithBackend();

  // Set SEO for forgot password page
  useAdminSeo({
    path: '/auth/forgot-password',
    defaultSeo: {
      title: t('auth.forgot_password', 'Forgot Password') + ' | Quasar Admin',
      description: t('auth.enter_email', 'Enter your email address and we\'ll send you a link to reset your password'),
      keywords: 'forgot password, reset password, admin, quasar'
    }
  });

  const handleForgotPassword = async (email: string): Promise<void> => {
    setError('');
    setIsLoading(true);

    try {
      // const result = await someApiMutation.mutateAsync({ email });
      
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
    } catch (err) {
      setError(t('auth.forgot_password_error'));
      console.error('Forgot password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard title={t('auth.forgot_password')}>
      <ForgotPasswordForm 
        onSubmit={handleForgotPassword}
        isSubmitting={isLoading}
        error={error}
      />
    </AuthCard>
  );
}

export default ForgotPasswordPage; 