import { Metadata } from 'next';
import AboutPage from '../../pages/AboutPage';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn more about our company, mission, and values',
  openGraph: {
    title: 'About Us - Your Site Name',
    description: 'Learn more about our company, mission, and values',
    url: '/about',
  },
};

export default function Page() {
  return <AboutPage />;
}