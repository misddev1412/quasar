import { createTRPCProxyClient, httpLink } from '@trpc/client';
import type { AppRouter } from '../../../backend/src/types/app-router';
import type { SEOData, ApiResponse } from '../types/trpc';

/**
 * Server-side tRPC client for SEO data fetching
 * This client is used during SSR to fetch SEO data before rendering
 */
export function createServerTRPCClient() {
  return createTRPCProxyClient<AppRouter>({
    links: [
      httpLink({
        url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/trpc`,
        headers: {
          'X-Client-Type': 'frontend',
        },
      }),
    ],
  });
}

/**
 * Fetch SEO data server-side for a given path
 */
export async function getServerSideSEOData(path: string): Promise<SEOData | null> {
  try {
    const client = createServerTRPCClient();

    // Fetch SEO data from backend
    const response = await client.seo.getByPath.query({ path });

    // Cast the response to the expected API response structure
    const apiResponse = response as unknown as ApiResponse<SEOData>;

    // The response structure from the API
    if (apiResponse && apiResponse.status === 'OK' && apiResponse.data) {
      return apiResponse.data as SEOData;
    }

    return null;
  } catch (error) {
    console.warn(`Failed to fetch SEO data for path ${path}:`, error);
    return null;
  }
}

/**
 * Get SEO data with fallbacks for server-side rendering
 */
export async function getServerSideSEOWithFallback(
  path: string,
  fallback: SEOData
): Promise<SEOData> {
  const seoData = await getServerSideSEOData(path);
  return seoData || fallback;
}
