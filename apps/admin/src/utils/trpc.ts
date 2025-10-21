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

// Simple auth token management (you might want to use a state management library)
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_access_token');
}

function getBaseUrl() {
  return `http://localhost:3000`; // Backend port (changed to match our running backend)
}

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
      url: `${getBaseUrl()}/trpc`,
      headers() {
        const token = getAuthToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
    false: httpLink({
      url: `${getBaseUrl()}/trpc`,
      headers() {
        const token = getAuthToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
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
