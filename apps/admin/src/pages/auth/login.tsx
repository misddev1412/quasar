import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthCard from '../../components/auth/AuthCard';
import LoginForm from '../../components/auth/LoginForm';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';

export function LoginPage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslationWithBackend();

  const handleLogin = async (email: string, password: string) => {
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      } else {
        setError(t('auth.login_failed'));
      }
    } catch (err) {
      setError(t('auth.error_occurred'));
      console.error(t('auth.login_error'), err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard title={t('auth.admin_platform')}>
      <LoginForm 
        onSubmit={handleLogin}
        isSubmitting={isLoading}
        error={error}
      />
    </AuthCard>
  );
}

export default LoginPage; 