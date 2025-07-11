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

// 删除本地定义的 ApiResponse 接口，使用共享库的 BaseApiResponse
type ApiResponseWithSeoData = BaseApiResponse<SeoData>;

interface UseSeoProps {
  path?: string;
  defaultSeo?: Partial<SeoData>;
}

export function useSeo(props?: UseSeoProps) {
  const location = useLocation();
  const { defaultSeo = {} } = props || {};
  
  // 使用提供的路径或当前位置路径
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
  
  // 只处理主路由（忽略资源请求）
  const isMainRoute = (path: string): boolean => {
    // 过滤掉资源路径，如.css, .js, .jpg等
    const assetExtensions = ['.css', '.js', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'];
    return !assetExtensions.some(ext => path.includes(ext));
  };
  
  // 使用client.seo路径获取公开SEO数据
  const { 
    data: seoData, 
    isLoading, 
    error,
    refetch 
  } = trpc.seo.getByPath.useQuery(
    { path: currentPath },
    { 
      enabled: !!currentPath && isMainRoute(currentPath),
      staleTime: 1000 * 60 * 5, // 缓存5分钟
      retry: 1
    }
  );

  // 捕获错误并记录到控制台
  useEffect(() => {
    if (error) {
      console.warn(`SEO data fetch error for path ${currentPath}:`, error);
    }
  }, [error, currentPath]);

  // 管理员可以访问adminSeo端点的备用查询
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
    // 首先尝试使用公开的SEO数据
    if (seoData && typeof seoData === 'object' && 'data' in seoData) {
      const apiResponse = seoData as unknown as ApiResponseWithSeoData;
      
      if (apiResponse.data) {
        // 合并默认值与API响应数据
        setSeo(prevSeo => ({
          ...prevSeo,
          ...apiResponse.data,
          // 保留任何由API未提供但在默认值中存在的属性
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
    // 如果客户端端点失败，尝试使用管理员端点
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

  // 更新document头部的SEO数据
  const updateHead = (seoData: SeoData) => {
    // 更新页面标题
    if (seoData.title) {
      document.title = seoData.title;
    }

    // 更新meta标签的帮助函数
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

    // 更新Open Graph meta标签的帮助函数
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

    // 更新基本meta标签
    updateMetaTag('description', seoData.description);
    updateMetaTag('keywords', seoData.keywords);
    
    // 更新Open Graph meta标签
    updateOgMetaTag('og:title', seoData.ogTitle || seoData.title);
    updateOgMetaTag('og:description', seoData.ogDescription || seoData.description);
    updateOgMetaTag('og:image', seoData.ogImage);
    updateOgMetaTag('og:url', seoData.ogUrl || window.location.href);
    updateOgMetaTag('og:type', seoData.ogType || 'website');
    
    // 更新Twitter meta标签
    updateMetaTag('twitter:card', seoData.twitterCard || 'summary_large_image');
    updateMetaTag('twitter:title', seoData.twitterTitle || seoData.ogTitle || seoData.title);
    updateMetaTag('twitter:description', seoData.twitterDescription || seoData.ogDescription || seoData.description);
    updateMetaTag('twitter:image', seoData.twitterImage || seoData.ogImage);
    
    // 更新canonical链接
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
    
    // 处理additionalMetaTags
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