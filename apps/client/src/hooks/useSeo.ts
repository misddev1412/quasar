import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { trpc } from '../utils/trpc';
import { NextSeoProps } from 'next-seo';
import { createUseSeoHook } from '@shared';

interface UseSeoOptions {
  defaultTitle?: string;
  defaultDescription?: string;
  defaultKeywords?: string;
}

// Create the shared hook using the tRPC client
const useSharedSeo = createUseSeoHook(trpc);

export function useSeo(options: UseSeoOptions = {}) {
  const router = useRouter();
  const [seo, setSeo] = useState<NextSeoProps>({
    title: options.defaultTitle || 'Quasar App',
    description: options.defaultDescription || '',
    additionalMetaTags: options.defaultKeywords 
      ? [{ name: 'keywords', content: options.defaultKeywords }] 
      : []
  });

  // Use the shared hook with Next.js router path
  const { seo: sharedSeo, isLoading, error } = useSharedSeo({
    path: router.asPath,
    defaultTitle: options.defaultTitle || 'Quasar App',
    defaultDescription: options.defaultDescription || '',
    defaultKeywords: options.defaultKeywords || '',
    enabled: router.isReady
  });

  useEffect(() => {
    const metaTags = [];
    
    // Add keywords meta tag if provided
    if (sharedSeo.keywords) {
      metaTags.push({ name: 'keywords', content: sharedSeo.keywords });
    }
    
    // Add any additional meta tags from the API
    if (sharedSeo.additionalMetaTags) {
      Object.entries(sharedSeo.additionalMetaTags).forEach(([name, content]) => {
        metaTags.push({ name, content });
      });
    }
    
    setSeo({
      title: sharedSeo.title,
      description: sharedSeo.description || options.defaultDescription,
      additionalMetaTags: metaTags
    });
  }, [sharedSeo, options.defaultDescription]);

  return {
    seo,
    isLoading,
    error
  };
} 