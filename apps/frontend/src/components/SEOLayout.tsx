import React from 'react';
import { SEOProvider } from '../contexts/SEOContext';
import type { SEOData } from '../types/trpc';

interface SEOLayoutProps {
  children: React.ReactNode;
  serverSEOData: SEOData | null;
  pathname: string;
  fallback: SEOData;
}

/**
 * Layout wrapper that provides SEO context to client components
 * Server-side SEO is handled by the generateMetadata API in each page
 */
export function SEOLayout({
  children,
  serverSEOData,
  pathname,
  fallback,
}: SEOLayoutProps) {
  return (
    <>
      {/* Provide SEO context to client components */}
      <SEOProvider serverSEOData={serverSEOData} pathname={pathname}>
        {children}
      </SEOProvider>
    </>
  );
}

export default SEOLayout;