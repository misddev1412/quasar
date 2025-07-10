import { useEffect, useState } from 'react';
import { trpc } from '../utils/trpc';
import { useLocation } from 'react-router-dom';

export interface SeoData {
  id?: string;
  path: string;
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  locale?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse {
  status: number;
  message: string;
  data: SeoData;
}

export function useSeo() {
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState<string>('');
  const [seo, setSeo] = useState<SeoData | null>(null);
  
  // Only process main routes (ignore asset requests)
  const isMainRoute = (path: string): boolean => {
    // Filter out asset paths like .css, .js, .jpg, etc.
    const assetExtensions = ['.css', '.js', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'];
    return !assetExtensions.some(ext => path.includes(ext));
  };
  
  const { data: seoData, isLoading, error } = trpc.adminSeo.getByPath.useQuery(
    { path: currentPath },
    { 
      enabled: !!currentPath && isMainRoute(currentPath),
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
      retry: 1
    }
  );

  useEffect(() => {
    const path = location.pathname;
    if (isMainRoute(path)) {
      setCurrentPath(path);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (seoData && typeof seoData === 'object' && 'data' in seoData) {
      const apiResponse = seoData as unknown as ApiResponse;
      setSeo(apiResponse.data);
    }
  }, [seoData]);

  // Function to update document head with SEO data
  const updateHead = (seoData: SeoData) => {
    // Update page title
    if (seoData.title) {
      document.title = seoData.title;
    }

    // Helper function to update meta tag
    const updateMetaTag = (name: string, content?: string) => {
      if (!content) return;
      
      let metaTag = document.querySelector(`meta[name="${name}"]`);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        (metaTag as HTMLMetaElement).name = name;
        document.head.appendChild(metaTag);
      }
      (metaTag as HTMLMetaElement).content = content;
    };

    // Helper function to update Open Graph meta tag
    const updateOgMetaTag = (property: string, content?: string) => {
      if (!content) return;
      
      let metaTag = document.querySelector(`meta[property="${property}"]`);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('property', property);
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', content);
    };

    // Update basic meta tags
    updateMetaTag('description', seoData.description);
    updateMetaTag('keywords', seoData.keywords);
    
    // Update Open Graph meta tags
    updateOgMetaTag('og:title', seoData.ogTitle || seoData.title);
    updateOgMetaTag('og:description', seoData.ogDescription || seoData.description);
    updateOgMetaTag('og:image', seoData.ogImage);
    updateOgMetaTag('og:url', seoData.ogUrl);
    updateOgMetaTag('og:type', seoData.ogType || 'website');
    
    // Update Twitter meta tags
    updateMetaTag('twitter:card', seoData.twitterCard || 'summary_large_image');
    updateMetaTag('twitter:title', seoData.twitterTitle || seoData.ogTitle || seoData.title);
    updateMetaTag('twitter:description', seoData.twitterDescription || seoData.ogDescription || seoData.description);
    updateMetaTag('twitter:image', seoData.twitterImage || seoData.ogImage);
    
    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    
    if (seoData.canonicalUrl) {
      if (!canonicalLink) {
        canonicalLink = document.createElement('link') as HTMLLinkElement;
        canonicalLink.rel = 'canonical';
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.href = seoData.canonicalUrl;
    } else if (canonicalLink) {
      canonicalLink.remove();
    }
  };

  useEffect(() => {
    if (seo) {
      updateHead(seo);
    }
  }, [seo]);

  return {
    seo: seo || { path: currentPath },
    isLoading,
    error,
    updateHead
  };
} 