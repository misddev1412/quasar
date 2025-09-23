import { Metadata } from 'next';
import ContactPage from '../../pages/ContactPage';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with our team for support and inquiries',
  openGraph: {
    title: 'Contact Us - Your Site Name',
    description: 'Get in touch with our team for support and inquiries',
    url: '/contact',
  },
};

export default function Page() {
  return <ContactPage />;
}