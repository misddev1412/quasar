import React from 'react';
import LayoutDemo from '@admin/components/LayoutDemo';
import withSeo from '@admin/components/SEO/withSeo';
import { SeoData } from '@admin/hooks/useSeo';

// Define the static SEO data for the home page
const homeSeoData: SeoData = {
  path: '/',
  title: 'Dashboard | Quasar Admin',
  description: 'Welcome to Quasar Admin Dashboard - Manage your application with ease',
  keywords: 'dashboard, admin, quasar, management',
  ogTitle: 'Quasar Admin Dashboard',
  ogDescription: 'Powerful admin dashboard for managing your application',
  ogType: 'website'
};

export const HomePage: React.FC = () => {
  return <LayoutDemo />;
};

// Wrap the HomePage component with SEO
export default withSeo(HomePage, homeSeoData); 