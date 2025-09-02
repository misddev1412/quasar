import { createTRPCNext } from '@trpc/next';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../../backend/src/types/app-router';
import { getAuthToken } from './auth';

function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // Browser should use relative URL
    return '';
  }
  
  if (process.env.VERCEL_URL) {
    // Reference for vercel.com
    return `https://${process.env.VERCEL_URL}`;
  }
  
  if (process.env.RENDER_INTERNAL_HOSTNAME) {
    // Reference for render.com
    return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`;
  }
  
  // Assume localhost
  return `http://localhost:3000`; // Backend port
}

export const trpc = createTRPCNext<AppRouter>({
  config(opts) {
    return {
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/trpc`,
          
          // Include authorization header with JWT token
          async headers() {
            const token = getAuthToken();
            return {
              authorization: token ? `Bearer ${token}` : '',
            };
          },
        }),
      ],
    };
  },
  
  /**
   * @see https://trpc.io/docs/v11/ssr
   */
  ssr: false,
}); 