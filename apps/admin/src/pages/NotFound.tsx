import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/SEO/SeoHead';
import { SeoData } from '../hooks/useSeo';
import { useTranslationWithBackend } from '../hooks/useTranslationWithBackend';

export const NotFound: React.FC = () => {
  const { t } = useTranslationWithBackend();

  // Define static SEO data for 404 page
  const seoData: SeoData = useMemo(() => ({
    path: '/not-found',
    title: t('not_found_page.seo_title'),
    description: t('not_found_page.description'),
    ogTitle: t('not_found_page.og_title'),
    ogDescription: t('not_found_page.og_description'),
    ogType: 'website'
  }), [t]);

  return (
    <>
      <SeoHead data={seoData} />
      
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <h1 className="text-6xl font-bold text-neutral-900 mb-6">404</h1>
        <h2 className="text-2xl font-semibold text-neutral-700 mb-4">
          {t('not_found_page.heading')}
        </h2>
        <p className="text-neutral-500 max-w-md mb-8">
          {t('not_found_page.helper_text')}
        </p>
        
        <Link 
          to="/" 
          className="bg-primary-500 hover:bg-primary-600 text-white font-medium px-6 py-2 rounded-lg transition-colors"
        >
          {t('not_found_page.back_to_dashboard')}
        </Link>
      </div>
    </>
  );
};

export default NotFound; 
