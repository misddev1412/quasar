import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useAuth } from '../../context/AuthContext';
import AuthCard from '../../components/auth/AuthCard';
import LoginForm from '../../components/auth/LoginForm';
import { useLoginForm } from '../../hooks/useLoginForm';

export function LoginPage() {
  const auth = useAuth();
  const { t } = useTranslationWithBackend();
  const { error, isSubmitting, handleLogin } = useLoginForm({ auth });

  return (
    <AuthCard title={t('auth.admin_platform')}>
      <LoginForm
        onSubmit={handleLogin}
        isSubmitting={isSubmitting}
      />
    </AuthCard>
  );
}

export default LoginPage; 