import { useState } from 'react';
import AuthCard from '../../components/auth/AuthCard';
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { trpc } from '../../utils/trpc';

export function ForgotPasswordPage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslationWithBackend();

  // 处理忘记密码请求
  const handleForgotPassword = async (email: string): Promise<void> => {
    setError('');
    setIsLoading(true);

    try {
      // 注意：这里应该连接到后端的忘记密码API
      // 暂时模拟一个成功的请求
      // 实际实现时应该使用类似于：
      // const result = await someApiMutation.mutateAsync({ email });
      
      // 模拟API调用延迟
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // 不返回值
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