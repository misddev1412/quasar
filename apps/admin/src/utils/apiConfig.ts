const DEFAULT_API_URL = 'http://localhost:3000/api';

const normalizeUrl = (url: string) => url.replace(/\/+$/, '');

// Single source of truth: REACT_APP_API_URL (with a safe default).
export const getConfiguredApiUrl = () =>
  normalizeUrl(process.env.REACT_APP_API_URL || DEFAULT_API_URL);

export const getApiOrigin = () => {
  const apiUrl = getConfiguredApiUrl();
  if (/\/api$/i.test(apiUrl)) {
    return normalizeUrl(apiUrl.replace(/\/api$/i, ''));
  }

  return apiUrl;
};

export const buildApiUrl = (path: string) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${getApiOrigin()}${cleanPath}`;
};

export const getTrpcUrl = () => `${getApiOrigin()}/trpc`;
