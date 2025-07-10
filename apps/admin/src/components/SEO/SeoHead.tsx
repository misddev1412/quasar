import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSeo, SeoData } from '../../hooks/useSeo';

interface SeoHeadProps {
  path?: string;
  data?: SeoData;
}

export const SeoHead: React.FC<SeoHeadProps> = ({ path, data }) => {
  const { seo, isLoading, error } = useSeo();
  
  // Use provided data or data from hook
  const seoData = data || seo;
  
  if (isLoading) {
    return null;
  }
  
  if (error || !seoData) {
    // Fallback SEO
    return (
      <Helmet>
        <title>Quasar Admin</title>
        <meta name="description" content="Quasar Admin Dashboard" />
      </Helmet>
    );
  }
  
  return (
    <Helmet>
      {seoData.title && <title>{seoData.title}</title>}
      {seoData.description && <meta name="description" content={seoData.description} />}
      {seoData.keywords && <meta name="keywords" content={seoData.keywords} />}
      
      {/* Open Graph */}
      {(seoData.ogTitle || seoData.title) && 
        <meta property="og:title" content={seoData.ogTitle || seoData.title} />}
      {(seoData.ogDescription || seoData.description) && 
        <meta property="og:description" content={seoData.ogDescription || seoData.description} />}
      {seoData.ogImage && <meta property="og:image" content={seoData.ogImage} />}
      {seoData.ogUrl && <meta property="og:url" content={seoData.ogUrl} />}
      {seoData.ogType && <meta property="og:type" content={seoData.ogType} />}
      
      {/* Twitter */}
      {seoData.twitterCard && <meta name="twitter:card" content={seoData.twitterCard} />}
      {(seoData.twitterTitle || seoData.ogTitle || seoData.title) && 
        <meta name="twitter:title" content={seoData.twitterTitle || seoData.ogTitle || seoData.title} />}
      {(seoData.twitterDescription || seoData.ogDescription || seoData.description) && 
        <meta name="twitter:description" content={seoData.twitterDescription || seoData.ogDescription || seoData.description} />}
      {(seoData.twitterImage || seoData.ogImage) && 
        <meta name="twitter:image" content={seoData.twitterImage || seoData.ogImage} />}
      
      {/* Canonical URL */}
      {seoData.canonicalUrl && <link rel="canonical" href={seoData.canonicalUrl} />}
      
      {/* Locale */}
      {seoData.locale && <meta property="og:locale" content={seoData.locale} />}
    </Helmet>
  );
};

export default SeoHead; 