import { useEffect, useState } from 'react';
import { trpc } from '../utils/trpc';
import { useLocation } from 'react-router-dom';
import { BaseApiResponse } from '@shared/types/api.types';

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
  additionalMetaTags?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}

type ApiResponseWithSeoData = BaseApiResponse<SeoData>;

interface UseSeoProps {
  path?: string;
  defaultSeo?: Partial<SeoData>;
}

export function useSeo(props?: UseSeoProps) {
  const location = useLocation();
  const { defaultSeo = {} } = props || {};
  
  const [currentPath, setCurrentPath] = useState<string>(props?.path || location.pathname);
  const [seo, setSeo] = useState<SeoData>({
    path: currentPath,
    title: defaultSeo.title || 'Quasar Admin',
    description: defaultSeo.description || 'Quasar Admin Dashboard',
    keywords: defaultSeo.keywords || '',
    ogTitle: defaultSeo.ogTitle,
    ogDescription: defaultSeo.ogDescription,
    ogImage: defaultSeo.ogImage,
    ogUrl: defaultSeo.ogUrl,
    ogType: defaultSeo.ogType || 'website',
    twitterCard: defaultSeo.twitterCard || 'summary_large_image',
    twitterTitle: defaultSeo.twitterTitle,
    twitterDescription: defaultSeo.twitterDescription,
    twitterImage: defaultSeo.twitterImage,
    canonicalUrl: defaultSeo.canonicalUrl,
    locale: defaultSeo.locale,
    additionalMetaTags: defaultSeo.additionalMetaTags || {},
  });
  
  const isMainRoute = (path: string): boolean => {
    const assetExtensions = ['.css', '.js', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'];
    return !assetExtensions.some(ext => path.includes(ext));
  };
  
  const { 
    data: seoData, 
    isLoading, 
    error,
    refetch 
  } = trpc.seo.getByPath.useQuery(
    { path: currentPath },
    { 
      enabled: !!currentPath && isMainRoute(currentPath),
      staleTime: 1000 * 60 * 5,
      retry: 1
    }
  );

  useEffect(() => {
    if (error) {
      console.warn(`SEO data fetch error for path ${currentPath}:`, error);
    }
  }, [error, currentPath]);

  const { 
    data: adminSeoData 
  } = trpc.adminSeo.getByPath.useQuery(
    { path: currentPath },
    { 
      enabled: !!currentPath && isMainRoute(currentPath) && !seoData,
      staleTime: 1000 * 60 * 5,
      retry: 1
    }
  );

  useEffect(() => {
    if (!props?.path) {
      const path = location.pathname;
      if (isMainRoute(path)) {
        setCurrentPath(path);
      }
    }
  }, [location.pathname, props?.path]);

  useEffect(() => {
    if (seoData && typeof seoData === 'object' && 'data' in seoData) {
      const apiResponse = seoData as unknown as ApiResponseWithSeoData;
      
      if (apiResponse.data) {
        setSeo(prevSeo => ({
          ...prevSeo,
          ...apiResponse.data,
          ogTitle: apiResponse.data.ogTitle || prevSeo.ogTitle || apiResponse.data.title,
          ogDescription: apiResponse.data.ogDescription || prevSeo.ogDescription || apiResponse.data.description,
          twitterTitle: apiResponse.data.twitterTitle || prevSeo.twitterTitle || apiResponse.data.title,
          twitterDescription: apiResponse.data.twitterDescription || prevSeo.twitterDescription || apiResponse.data.description,
          additionalMetaTags: {
            ...prevSeo.additionalMetaTags,
            ...apiResponse.data.additionalMetaTags
          }
        }));
      }
    }
    else if (adminSeoData && typeof adminSeoData === 'object' && 'data' in adminSeoData) {
      const apiResponse = adminSeoData as unknown as ApiResponseWithSeoData;
      
      if (apiResponse.data) {
        setSeo(prevSeo => ({
          ...prevSeo,
          ...apiResponse.data,
          ogTitle: apiResponse.data.ogTitle || prevSeo.ogTitle || apiResponse.data.title,
          ogDescription: apiResponse.data.ogDescription || prevSeo.ogDescription || apiResponse.data.description,
          twitterTitle: apiResponse.data.twitterTitle || prevSeo.twitterTitle || apiResponse.data.title,
          twitterDescription: apiResponse.data.twitterDescription || prevSeo.twitterDescription || apiResponse.data.description,
          additionalMetaTags: {
            ...prevSeo.additionalMetaTags,
            ...apiResponse.data.additionalMetaTags
          }
        }));
      }
    }
  }, [seoData, adminSeoData]);

  const updateHead = (seoData: SeoData) => {
    if (seoData.title) {
      document.title = seoData.title;
    }

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

    updateMetaTag('description', seoData.description);
    updateMetaTag('keywords', seoData.keywords);
    
    updateOgMetaTag('og:title', seoData.ogTitle || seoData.title);
    updateOgMetaTag('og:description', seoData.ogDescription || seoData.description);
    updateOgMetaTag('og:image', seoData.ogImage);
    updateOgMetaTag('og:url', seoData.ogUrl || window.location.href);
    updateOgMetaTag('og:type', seoData.ogType || 'website');
    
    updateMetaTag('twitter:card', seoData.twitterCard || 'summary_large_image');
    updateMetaTag('twitter:title', seoData.twitterTitle || seoData.ogTitle || seoData.title);
    updateMetaTag('twitter:description', seoData.twitterDescription || seoData.ogDescription || seoData.description);
    updateMetaTag('twitter:image', seoData.twitterImage || seoData.ogImage);
    
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
    
    if (seoData.additionalMetaTags && typeof seoData.additionalMetaTags === 'object') {
      Object.entries(seoData.additionalMetaTags).forEach(([name, content]) => {
        if (name.startsWith('og:')) {
          updateOgMetaTag(name, content);
        } else {
          updateMetaTag(name, content);
        }
      });
    }
  };

  useEffect(() => {
    if (seo && typeof document !== 'undefined') {
      updateHead(seo);
    }
  }, [seo]);

  return {
    seo,
    isLoading,
    error,
    updateHead,
    refetch
  };
} 