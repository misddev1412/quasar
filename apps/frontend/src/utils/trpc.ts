import { createTRPCReact, createTRPCProxyClient, CreateTRPCClientOptions } from '@trpc/react-query';
import { httpBatchLink, httpLink, splitLink, TRPCLink } from '@trpc/client';
import { errorLink } from './trpc-error-link';
import type { AppRouter } from '../types/trpc';

// Token management for frontend users (not admin)
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token'); // Different key from admin
}

export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', token);
  }
}

export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
  }
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refresh_token');
}

export function setRefreshToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('refresh_token', token);
  }
}

export function removeRefreshToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('refresh_token');
  }
}

function getBaseUrl() {
  // Use environment variable or default to localhost
  if (typeof window !== 'undefined') {
    // Browser should use relative path or env variable
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  }
  // SSR should use localhost
  return 'http://localhost:3000';
}

// Create tRPC React hooks
// Using 'any' for router type to avoid cross-compilation with backend
// Type safety is maintained through explicit typing in hooks
export const trpc = createTRPCReact<any>();

// Shared links configuration
export const links: TRPCLink<any>[] = [
  // Custom error handling
  errorLink,

  // Split between regular queries and batch mutations
  splitLink({
    condition(op) {
      // Use batch link for mutations
      return op.type === 'mutation';
    },
    true: httpBatchLink({
      url: `${getBaseUrl()}/trpc`,
      headers() {
        const token = getAuthToken();
        const headers: Record<string, string> = {};

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        // Add client identifier for backend to distinguish frontend from admin
        headers['X-Client-Type'] = 'frontend';

        return headers;
      },
      // Optional: Add request interceptor for refresh token logic
      fetch(url, options) {
        return fetch(url, options).then(async (response) => {
          // If unauthorized, try to refresh token
          if (response.status === 401) {
            const refreshToken = getRefreshToken();
            if (refreshToken) {
              // You would implement refresh logic here
              console.log('Token expired, implement refresh logic');
            }
          }
          return response;
        });
      },
    }),
    false: httpLink({
      url: `${getBaseUrl()}/trpc`,
      headers() {
        const token = getAuthToken();
        const headers: Record<string, string> = {};

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        headers['X-Client-Type'] = 'frontend';

        return headers;
      },
    }),
  }),
];

// Vanilla client for non-React contexts
export const trpcClient = createTRPCProxyClient<any>({
  links,
});

// Factory function to create tRPC client with options
export const createTrpcClient = (options?: Omit<CreateTRPCClientOptions<any>, 'links'>) => {
  return (trpc as any).createClient({
    ...options,
    links,
  });
};
