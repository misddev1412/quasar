import { Metadata } from 'next';
import LoginPage from '../../pages/LoginPage';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to your account',
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <LoginPage />;
}