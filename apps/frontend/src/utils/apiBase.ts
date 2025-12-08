const DEFAULT_API_URL = 'http://localhost:3000/api';

/**
 * Normalize API URL from env (shared with admin):
 * - read REACT_APP_API_URL first to keep a single env name
 * - drop trailing slashes
 * - drop a trailing `/api` so we can safely append paths like `/api/*` or `/trpc`
 */
const rawApiEnv =
  process.env.REACT_APP_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  DEFAULT_API_URL;

const normalizedEnv = rawApiEnv.replace(/\/+$/, '');
const originWithoutApi = normalizedEnv.replace(/\/api$/i, '');

// Expose the base origin for all storefront calls
export const apiBaseUrl = originWithoutApi;

export function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiBaseUrl}${normalizedPath}`;
}
