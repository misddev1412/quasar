'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { SEOLayout } from './SEOLayout';
import { useTrpcQuery } from '../hooks/useTrpcQuery';
import type { SEOData } from '../types/trpc';

interface SEOPageLayoutProps {
  children: React.ReactNode;
  fallback: SEOData;
  serverSEOData?: SEOData | null;
}

/**
 * Page layout component that handles both server-side and client-side SEO
 * This component ensures SEO data is available for SSR while allowing client-side updates
 */
export function SEOPageLayout({
  children,
  fallback,
  serverSEOData,
}: SEOPageLayoutProps) {
  const pathname = usePathname();
  const { useSEO } = useTrpcQuery();

  // Fetch SEO data client-side for hydration and updates
  const { data: clientSEOData } = useSEO(pathname || '/', {
    enabled: !!pathname,
  });

  // Use server-side data if available, otherwise use client-side data
  const seoData = serverSEOData || (clientSEOData?.data as SEOData | undefined) || null;

  return (
    <SEOLayout
      serverSEOData={seoData}
      pathname={pathname || '/'}
      fallback={fallback}
    >
      {children}
    </SEOLayout>
  );
}

export default SEOPageLayout;