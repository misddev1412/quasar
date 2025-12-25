import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useAuth } from '../../context/AuthContext';
import AuthCard from '../../components/auth/AuthCard';
import LoginForm from '../../components/auth/LoginForm';
import LoginSkeleton from '../../components/auth/LoginSkeleton';
import { useLoginForm } from '../../hooks/useLoginForm';
import { useAdminSeo } from '../../hooks/useAdminSeo';
import { useBrandingSetting } from '../../hooks/useBrandingSetting';
import {
  ADMIN_LOGIN_BRANDING_KEY,
  DEFAULT_ADMIN_LOGIN_BRANDING,
} from '../../constants/adminBranding';

export function LoginPage() {
  const auth = useAuth();
  const { t, isLoading: isTranslationLoading } = useTranslationWithBackend();
  const { error, isSubmitting, handleLogin } = useLoginForm({ auth });

  const { isLoading: isBrandingLoading } = useBrandingSetting(
    ADMIN_LOGIN_BRANDING_KEY,
    DEFAULT_ADMIN_LOGIN_BRANDING,
    { publicAccess: true },
  );

  // Set SEO for login page
  useAdminSeo({
    path: '/auth/login',
    defaultSeo: {
      title: t('auth.admin_login', 'Admin Login') + ' | Quasar',
      description: t('auth.enter_credentials', 'Please enter your credentials to continue using the system'),
      keywords: 'login, admin, authentication, quasar'
    }
  });

  if (isTranslationLoading || isBrandingLoading) {
    return <LoginSkeleton />;
  }

  return (
    <AuthCard>
      <LoginForm
        onSubmit={handleLogin}
        isSubmitting={isSubmitting}
      />
    </AuthCard>
  );
}

export default LoginPage; 