import { StrictMode, useState } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HeroUIProvider } from '@heroui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HelmetProvider } from 'react-helmet-async';

import App from './app/app';
import { trpc, createTrpcClient } from './utils/trpc';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function Root() {
  // Create tRPC client
  const [trpcClient] = useState(() => createTrpcClient());

  const TRPCProvider = (trpc as any).Provider;

  return (
    <StrictMode>
      <TRPCProvider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <HeroUIProvider>
            <HelmetProvider>
              <BrowserRouter>
                <ToastProvider>
                  <AuthProvider>
                    <App />
                  </AuthProvider>
                </ToastProvider>
              </BrowserRouter>
            </HelmetProvider>
          </HeroUIProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </TRPCProvider>
    </StrictMode>
  );
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(<Root />);
