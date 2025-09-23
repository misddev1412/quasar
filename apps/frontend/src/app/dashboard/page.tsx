import { Metadata } from 'next';
import DashboardPage from '../../pages/DashboardPage';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your personal dashboard',
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <DashboardPage />;
}