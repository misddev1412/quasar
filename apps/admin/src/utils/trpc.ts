import { createTRPCReact } from '@trpc/react-query';
import {
  CreateTRPCClientOptions,
  createTRPCProxyClient,
  httpBatchLink,
  httpLink,
  splitLink,
  TRPCLink,
} from '@trpc/client';
import type { AppRouter } from '../../../backend/src/types/app-router';
import { errorLink } from './trpc-error-link';
import { getCurrentLocale } from '../i18n';
import { getTrpcUrl } from './apiConfig';

// Simple auth token management (you might want to use a state management library)
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_access_token');
}

const trpcUrl = getTrpcUrl();

// For use in React components with hooks
export const trpc = createTRPCReact<AppRouter>();

// A set of links that can be shared between the vanilla client and the React Query client
export const links: TRPCLink<AppRouter>[] = [
  // Custom error link to handle network errors globally
  errorLink,
  // Split link to use GET for queries and POST for mutations
  splitLink({
    condition(op) {
      // Use batching for mutations only
      return op.type === 'mutation';
    },
    true: httpBatchLink({
      url: trpcUrl,
      headers() {
        const headers: Record<string, string> = {};
        const token = getAuthToken();
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const locale = getCurrentLocale();
        if (locale) {
          headers['x-locale'] = locale;
        }

        headers['X-Client-Type'] = 'admin';

        return headers;
      },
    }),
    false: httpLink({
      url: trpcUrl,
      headers() {
        const headers: Record<string, string> = {};
        const token = getAuthToken();
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const locale = getCurrentLocale();
        if (locale) {
          headers['x-locale'] = locale;
        }

        headers['X-Client-Type'] = 'admin';

        return headers;
      },
    }),
  }),
];

// Create a vanilla client for non-React contexts (services, utilities)
export const trpcClient = createTRPCProxyClient<AppRouter>({
  links,
});

// Create a type-safe client for React Query
export const createTrpcClient = (
  options: Omit<CreateTRPCClientOptions<AppRouter>, 'links'>
) => {
  return trpc.createClient({ ...options, links });
}; 
