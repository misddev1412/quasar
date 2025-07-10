import React from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/SEO/SeoHead';
import { SeoData } from '../hooks/useSeo';

export const NotFound: React.FC = () => {
  // Define static SEO data for 404 page
  const seoData: SeoData = {
    path: '/not-found',
    title: '404 - Page Not Found | Quasar Admin',
    description: 'The page you are looking for does not exist.',
    ogTitle: '404 - Page Not Found',
    ogDescription: 'The page you are looking for does not exist.',
    ogType: 'website'
  };

  return (
    <>
      <SeoHead data={seoData} />
      
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <h1 className="text-6xl font-bold text-neutral-900 mb-6">404</h1>
        <h2 className="text-2xl font-semibold text-neutral-700 mb-4">Page Not Found</h2>
        <p className="text-neutral-500 max-w-md mb-8">
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </p>
        
        <Link 
          to="/" 
          className="bg-primary-500 hover:bg-primary-600 text-white font-medium px-6 py-2 rounded-lg transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </>
  );
};

export default NotFound; 