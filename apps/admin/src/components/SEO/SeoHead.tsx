import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useSeo, SeoData } from '../../hooks/useSeo';
import { useBrandingSetting } from '../../hooks/useBrandingSetting';
import { ADMIN_LOGIN_BRANDING_KEY, DEFAULT_ADMIN_LOGIN_BRANDING } from '../../constants/adminBranding';
import { DEFAULT_PLATFORM_TITLE } from '../../config/seoTitles';

interface SeoHeadProps {
  path?: string;
  data?: SeoData;
  defaultSeo?: Partial<SeoData>;
}

export const SeoHead: React.FC<SeoHeadProps> = ({ path, data, defaultSeo }) => {
  // 如果提供了完整的data，则直接使用它，否则从useSeo获取
  const { 
    seo = null,
    isLoading
  } = data ? { seo: data, isLoading: false } : useSeo({
    path,
    defaultSeo
  });

  const { config: loginBranding } = useBrandingSetting(
    ADMIN_LOGIN_BRANDING_KEY,
    DEFAULT_ADMIN_LOGIN_BRANDING,
    { publicAccess: true },
  );
  const platformTitle = loginBranding.platformTitle?.trim() || DEFAULT_PLATFORM_TITLE;
  
  if (isLoading) {
    return null;
  }
  
  if (!seo) {
    // 默认SEO回退方案
    return (
      <Helmet>
        <title>{platformTitle}</title>
        <meta name="description" content={`${platformTitle} Dashboard`} />
      </Helmet>
    );
  }
  
  return (
    <Helmet>
      {seo.title && <title>{seo.title}</title>}
      {seo.description && <meta name="description" content={seo.description} />}
      {seo.keywords && <meta name="keywords" content={seo.keywords} />}
      
      {/* Open Graph */}
      {(seo.ogTitle || seo.title) && 
        <meta property="og:title" content={seo.ogTitle || seo.title} />}
      {(seo.ogDescription || seo.description) && 
        <meta property="og:description" content={seo.ogDescription || seo.description} />}
      {seo.ogImage && <meta property="og:image" content={seo.ogImage} />}
      {seo.ogUrl && <meta property="og:url" content={seo.ogUrl} />}
      {seo.ogType && <meta property="og:type" content={seo.ogType} />}
      
      {/* Twitter */}
      {seo.twitterCard && <meta name="twitter:card" content={seo.twitterCard} />}
      {(seo.twitterTitle || seo.ogTitle || seo.title) && 
        <meta name="twitter:title" content={seo.twitterTitle || seo.ogTitle || seo.title} />}
      {(seo.twitterDescription || seo.ogDescription || seo.description) && 
        <meta name="twitter:description" content={seo.twitterDescription || seo.ogDescription || seo.description} />}
      {(seo.twitterImage || seo.ogImage) && 
        <meta name="twitter:image" content={seo.twitterImage || seo.ogImage} />}
      
      {/* Canonical URL */}
      {seo.canonicalUrl && <link rel="canonical" href={seo.canonicalUrl} />}
      
      {/* Locale */}
      {seo.locale && <meta property="og:locale" content={seo.locale} />}
      
      {/* 渲染additionalMetaTags（如果有的话） */}
      {seo.additionalMetaTags && Object.entries(seo.additionalMetaTags).map(([name, content]) => {
        // 根据名称决定是渲染为普通meta标签还是og标签
        if (name.startsWith('og:')) {
          return <meta key={name} property={name} content={content} />;
        }
        return <meta key={name} name={name} content={content} />;
      })}
    </Helmet>
  );
};

export default SeoHead; 
