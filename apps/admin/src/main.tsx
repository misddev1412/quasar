import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';

// We will rely on Tailwind's preflight for CSS resets and base styles.
import '@shared/styles/css/index.css';

// Import admin-specific styles, including Tailwind
import '@admin/styles.scss';
import 'sweetalert2/dist/sweetalert2.min.css';
import '@admin/sweetalert-overrides.scss';

// Legacy locale bootstrap (does not force a default)
import '@admin/setDefaultLocale';

// Initialize i18n
import '@admin/i18n';

import App from '@admin/app/app';
import { trpc, createTrpcClient } from '@admin/utils/trpc';

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
