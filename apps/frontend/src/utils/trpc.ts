import { createTRPCReact } from '@trpc/react-query';
import {
  createTRPCProxyClient,
  CreateTRPCClientOptions,
  httpBatchLink,
  httpLink,
  splitLink,
  TRPCLink,
} from '@trpc/client';
import { errorLink } from './trpc-error-link';
import { apiBaseUrl } from './apiBase';
import type { AppRouter } from '../../../backend/src/types/app-router';

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

// Helper function to decode JWT token
function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

// Check if token is expired or about to expire (within 5 minutes)
export function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;

  const expirationTime = decoded.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  const fiveMinutesInMs = 5 * 60 * 1000;

  return expirationTime - currentTime < fiveMinutesInMs;
}

// Store pending refresh requests to avoid multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Refresh token function
export async function refreshToken(): Promise<boolean> {
  const refreshTokenValue = getRefreshToken();
  if (!refreshTokenValue) {
    return false;
  }

  if (isRefreshing) {
    // If already refreshing, wait for the result
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    const response = await fetch(`${getBaseUrl()}/trpc/clientUser.refreshToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        json: {
          refreshToken: refreshTokenValue,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    const result = data.result?.data;

    if (result?.json) {
      const authData = result.json;
      setAuthToken(authData.accessToken);

      if (authData.refreshToken) {
        setRefreshToken(authData.refreshToken);
      }

      processQueue(null, authData.accessToken);
      return true;
    }

    throw new Error('Invalid refresh response');
  } catch (error) {
    console.error('Token refresh failed:', error);
    processQueue(error, null);
    return false;
  } finally {
    isRefreshing = false;
  }
}

function getBaseUrl() {
  return apiBaseUrl;
}

// Create tRPC React hooks
export const trpc = createTRPCReact<AppRouter>();

// Shared links configuration
export const links: TRPCLink<AppRouter>[] = [
  // Custom error handling
  errorLink,

    // Simple httpLink for better compatibility
  httpLink({
    url: `${getBaseUrl()}/trpc`,
    headers() {
      const token = getAuthToken();
      const headers: Record<string, string> = {};

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Add client identifier for backend to distinguish frontend from admin
      headers['X-Client-Type'] = 'frontend';

      headers['x-locale'] = getLocale();

      return headers;
    },
  }),
];

// Vanilla client for non-React contexts
export const trpcClient = createTRPCProxyClient<AppRouter>({
  links,
});

// Factory function to create tRPC client with options
export const createTrpcClient = (options?: Omit<CreateTRPCClientOptions<AppRouter>, 'links'>) => {
  return trpc.createClient({
    ...options,
    links,
  });
};

const DEFAULT_LOCALE = (process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'vi').split('-')[0];

function getLocale(): string {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }

  try {
    const stored = window.localStorage?.getItem('i18nextLng');
    if (stored) {
      return stored.split('-')[0];
    }
  } catch {
    // Ignore storage access failures (e.g. disabled cookies)
  }

  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language.split('-')[0];
  }

  const htmlLang = window.document?.documentElement?.lang;
  if (htmlLang) {
    return htmlLang.split('-')[0];
  }

  return DEFAULT_LOCALE;
}
