const DEFAULT_API_URL = 'http://localhost:3000/api';

const normalizeApiBaseUrl = (value: string): string => {
  const trimmed = value.replace(/\/+$/, '');
  return trimmed.replace(/\/api$/i, '');
};

const resolveEnvApiUrl = (): string => {
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

  return normalizeApiBaseUrl(rawApiEnv);
};

// Expose helpers so middleware or server utilities can reuse the normalization logic
export const apiBaseUrl = resolveEnvApiUrl();

export const getEnvApiBaseUrl = () => apiBaseUrl;
export const normalizeApiBase = (value: string) => normalizeApiBaseUrl(value);

export function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiBaseUrl}${normalizedPath}`;
}
