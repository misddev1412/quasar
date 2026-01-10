import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, createTrpcClient } from '../utils/trpc';
import { Toaster } from 'react-hot-toast';
import { I18nProvider } from '../contexts/I18nContext';

function QuasarApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const [trpcClient] = useState(() => createTrpcClient({}));

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <Component {...pageProps} />
          <Toaster position="top-right" />
        </I18nProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default QuasarApp;
