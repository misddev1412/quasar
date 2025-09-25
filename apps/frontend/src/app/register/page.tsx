'use client';

import { useRouter } from 'next/navigation';
import AuthLayout from '../../components/layout/AuthLayout';
import RegisterForm from '../../components/auth/RegisterForm';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const handleSubmit = async (data: {
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  }) => {
    try {
      await register({
        email: data.email,
        password: data.password,
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
      });
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const handleSignIn = () => {
    router.push('/login');
  };

  return (
    <AuthLayout>
      <RegisterForm
        onSubmit={handleSubmit}
        onSignIn={handleSignIn}
      />
    </AuthLayout>
  );
}
