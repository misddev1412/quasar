import { Metadata } from 'next';
import RegisterPage from '../../pages/RegisterPage';

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create a new account',
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <RegisterPage />;
}