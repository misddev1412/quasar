import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useAuth } from '../../context/AuthContext';
import AuthCard from '../../components/auth/AuthCard';
import LoginForm from '../../components/auth/LoginForm';
import { useLoginForm } from '../../hooks/useLoginForm';
import { useAdminSeo } from '../../hooks/useAdminSeo';

export function LoginPage() {
  const auth = useAuth();
  const { t } = useTranslationWithBackend();
  const { error, isSubmitting, handleLogin } = useLoginForm({ auth });

  // Set SEO for login page
  useAdminSeo({
    path: '/auth/login',
    defaultSeo: {
      title: t('auth.admin_login', 'Admin Login') + ' | Quasar',
      description: t('auth.enter_credentials', 'Please enter your credentials to continue using the system'),
      keywords: 'login, admin, authentication, quasar'
    }
  });

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