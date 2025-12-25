import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  getSeoConfigForPath,
  getMetaTitleForPath,
  getMetaDescriptionForPath,
  DEFAULT_PLATFORM_TITLE,
} from '../config/seoTitles';
import { useTranslation } from 'react-i18next';
import { useBrandingSetting } from './useBrandingSetting';
import { ADMIN_LOGIN_BRANDING_KEY, DEFAULT_ADMIN_LOGIN_BRANDING } from '../constants/adminBranding';

export interface AdminSeoData {
  path: string;
  title: string;
  description: string;
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

interface UseAdminSeoProps {
  path?: string;
  defaultSeo?: Partial<AdminSeoData>;
}

export function useAdminSeo(props?: UseAdminSeoProps) {
  const location = useLocation();
  const { i18n } = useTranslation();
  const currentLocale = i18n.language as 'en' | 'vi' || 'en';

  const { config: brandingConfig } = useBrandingSetting(
    ADMIN_LOGIN_BRANDING_KEY,
    DEFAULT_ADMIN_LOGIN_BRANDING,
    { publicAccess: true },
  );
  const platformTitle = brandingConfig.platformTitle?.trim() || DEFAULT_PLATFORM_TITLE;

  // Use provided path or current location path
  const currentPath = props?.path || location.pathname;

  // Initialize SEO data with defaults
  const [seo, setSeo] = useState<AdminSeoData>(() => ({
    path: currentPath,
    title: getMetaTitleForPath(currentPath, currentLocale, platformTitle),
    description: getMetaDescriptionForPath(currentPath, currentLocale),
    keywords: '',
    ogTitle: getMetaTitleForPath(currentPath, currentLocale, platformTitle),
    ogDescription: undefined,
    ogImage: undefined,
    ogUrl: window.location.href,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: undefined,
    twitterDescription: undefined,
    twitterImage: undefined,
    canonicalUrl: window.location.href,
    locale: currentLocale,
    isActive: true,
    additionalMetaTags: {},
    ...props?.defaultSeo
  }));

  // Update SEO when path or locale changes
  useEffect(() => {
    const config = getSeoConfigForPath(currentPath, currentLocale);
    const resolvedTitle = getMetaTitleForPath(currentPath, currentLocale, platformTitle);

    if (config) {
      setSeo(prevSeo => ({
        ...prevSeo,
        path: currentPath,
        title: resolvedTitle,
        description: config.description?.[currentLocale] || prevSeo.description,
        ogTitle: resolvedTitle,
        ogDescription: config.description?.[currentLocale],
        ogUrl: window.location.href,
        canonicalUrl: window.location.href,
        locale: currentLocale,
      }));
    } else {
      setSeo(prevSeo => ({
        ...prevSeo,
        path: currentPath,
        title: resolvedTitle,
        ogTitle: resolvedTitle,
        ogUrl: window.location.href,
        canonicalUrl: window.location.href,
        locale: currentLocale,
      }));
    }
  }, [currentPath, currentLocale, platformTitle]);

  // Update document head with SEO data
  const updateHead = (seoData: AdminSeoData) => {
    // Update page title
    if (seoData.title) {
      document.title = seoData.title;
    }

    // Update meta tags helper function
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

    // Update Open Graph meta tags helper function
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
    updateOgMetaTag('og:url', seoData.ogUrl || window.location.href);
    updateOgMetaTag('og:type', seoData.ogType || 'website');
    updateOgMetaTag('og:locale', seoData.locale);

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

    // Handle additionalMetaTags
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
    isLoading: false, // Static config, no loading state
    error: null, // Static config, no error state
    updateHead,
    currentPath,
    currentLocale,
    refetch: () => {}, // Static config, no refetch needed
  };
}
