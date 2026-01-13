'use client';

import { useState } from 'react';
import { HeroUIProvider } from '@heroui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HelmetProvider } from 'react-helmet-async';
import { trpc, createTrpcClient } from '../utils/trpc';
import { AuthProvider } from '../contexts/AuthContext';
import { ToastProvider } from '../contexts/ToastContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AppInitProvider, useAppInit } from '../contexts/AppInitContext';
import { AppLoadingOverlay } from '../components/common/AppLoadingOverlay';
import { CartWrapper } from '../components/ecommerce/CartProvider';
import ImpersonationBanner from '../components/common/ImpersonationBanner';
import '../lib/i18n';
import LocaleWrapper from '../components/LocaleWrapper';

import { useFCM } from '../hooks/useFCM';
import { CurrencyProvider } from '../contexts/CurrencyContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function FCMListener() {
  useFCM();
  return null;
}

function AppProviders({ children, locale, messages }: { children: React.ReactNode; locale: string; messages: any }) {
  const { isLoading, initializationProgress, initializationMessage } = useAppInit();
  const [trpcClient] = useState(() => createTrpcClient());
  const TRPCProvider = (trpc as any).Provider;

  return (
    <HelmetProvider>
      <TRPCProvider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <LocaleWrapper initialLocale={locale} initialMessages={messages}>
            <AppLoadingOverlay
              isLoading={isLoading}
              progress={initializationProgress}
              message={initializationMessage}
            />
            <CurrencyProvider>
              <HeroUIProvider>
                <ThemeProvider>
                  <ToastProvider>
                    <AuthProvider>
                      <FCMListener />
                      <CartWrapper taxRate={0.08} defaultShippingCost={5.99}>
                        <ImpersonationBanner />
                        {children}
                      </CartWrapper>
                    </AuthProvider>
                  </ToastProvider>
                </ThemeProvider>
              </HeroUIProvider>
            </CurrencyProvider>
          </LocaleWrapper>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </TRPCProvider>
    </HelmetProvider>
  );
}

export function Providers({ children, locale, messages }: { children: React.ReactNode; locale: string; messages: any }) {
  return (
    <AppInitProvider>
      <AppProviders locale={locale} messages={messages}>
        {children}
      </AppProviders>
    </AppInitProvider>
  );
}
