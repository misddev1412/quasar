'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import type { SEOData } from '../types/trpc';

interface SEOContextType {
  serverSEOData: SEOData | null;
  pathname: string;
}

const SEOContext = createContext<SEOContextType | undefined>(undefined);

interface SEOProviderProps {
  children: ReactNode;
  serverSEOData: SEOData | null;
  pathname: string;
}

export function SEOProvider({ children, serverSEOData, pathname }: SEOProviderProps) {
  return (
    <SEOContext.Provider value={{ serverSEOData, pathname }}>
      {children}
    </SEOContext.Provider>
  );
}

export function useSEOContext() {
  const context = useContext(SEOContext);
  if (context === undefined) {
    throw new Error('useSEOContext must be used within an SEOProvider');
  }
  return context;
}

export default SEOProvider;