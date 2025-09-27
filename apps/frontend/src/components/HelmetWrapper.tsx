'use client';

import { HelmetProvider } from 'react-helmet-async';

interface HelmetWrapperProps {
  children: React.ReactNode;
}

export default function HelmetWrapper({ children }: HelmetWrapperProps) {
  return <HelmetProvider>{children}</HelmetProvider>;
}