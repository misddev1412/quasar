'use client';

import { useState } from 'react';
import { HeroUIProvider } from '@heroui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { trpc, createTrpcClient } from '../utils/trpc';
import { AuthProvider } from '../contexts/AuthContext';
import { ToastProvider } from '../contexts/ToastContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AppInitProvider, useAppInit } from '../contexts/AppInitContext';
import { AppLoadingOverlay } from '../components/common/AppLoadingOverlay';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function AppProviders({ children }: { children: React.ReactNode }) {
  const { isLoading, initializationProgress, initializationMessage } = useAppInit();
  const [trpcClient] = useState(() => createTrpcClient());
  const TRPCProvider = (trpc as any).Provider;

  return (
    <>
      <AppLoadingOverlay
        isLoading={isLoading}
        progress={initializationProgress}
        message={initializationMessage}
      />
      <TRPCProvider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <HeroUIProvider>
            <ThemeProvider>
              <ToastProvider>
                <AuthProvider>{children}</AuthProvider>
              </ToastProvider>
            </ThemeProvider>
          </HeroUIProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </TRPCProvider>
    </>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppInitProvider>
      <AppProviders>{children}</AppProviders>
    </AppInitProvider>
  );
}
