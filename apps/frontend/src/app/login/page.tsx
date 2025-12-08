'use client';

import { useRouter } from 'next/navigation';
import AuthLayout from '../../components/layout/AuthLayout';
import LoginForm from '../../components/auth/LoginForm';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (data: { email: string; password: string; remember: boolean }) => {
    try {
      await login(data.email, data.password);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  const handleSignUp = () => {
    router.push('/register');
  };

  return (
    <AuthLayout>
      <LoginForm
        onSubmit={handleSubmit}
        onForgotPassword={handleForgotPassword}
        onSignUp={handleSignUp}
      />
    </AuthLayout>
  );
}