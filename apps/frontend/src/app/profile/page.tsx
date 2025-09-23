import { Metadata } from 'next';
import ProfilePage from '../../pages/ProfilePage';

export const metadata: Metadata = {
  title: 'Profile',
  description: 'Manage your profile',
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <ProfilePage />;
}