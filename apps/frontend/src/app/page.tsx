import { Metadata } from 'next';
import HomePage from '../pages/HomePage';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Welcome to our website - Your trusted partner in ecommerce',
  openGraph: {
    title: 'Home - Your Site Name',
    description: 'Welcome to our website - Your trusted partner in ecommerce',
    url: '/',
  },
};

export default async function Page() {
  // Server-side data fetching for SSR
  // You can fetch data here that will be rendered on the server

  return <HomePage />;
}