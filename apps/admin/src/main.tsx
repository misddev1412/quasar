import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';

// We will rely on Tailwind's preflight for CSS resets and base styles.
import '@shared/styles/css/index.css';

// Import admin-specific styles, including Tailwind
import './styles.scss';

// Set default locale to English
import './setDefaultLocale';

// Initialize i18n
import './i18n';

import App from './app/app';
import { trpc, createTrpcClient } from './utils/trpc';

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

// Create the tRPC client using the new factory function
const trpcClient = createTrpcClient({});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </trpc.Provider>
  </StrictMode>
);
