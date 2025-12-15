import { S3StorageConfig } from '../interfaces/storage.interface';

export const trimTrailingSlash = (value?: string): string => {
  if (!value) {
    return '';
  }
  return value.replace(/\/+$/, '');
};

export const buildS3PublicUrl = (config: S3StorageConfig, key: string): string => {
  const cdnBase = trimTrailingSlash(config.cdnUrl);
  if (cdnBase) {
    return `${cdnBase}/${key}`;
  }

  const endpoint = trimTrailingSlash(config.endpoint);
  if (endpoint) {
    return `${endpoint}/${config.bucket}/${key}`;
  }

  return `https://${config.bucket}.s3.${config.region}.amazonaws.com/${key}`;
};

export const extractS3KeyFromUrl = (
  url: string,
  config: Pick<S3StorageConfig, 'bucket' | 'cdnUrl' | 'endpoint'>
): string | null => {
  if (!url) {
    return null;
  }

  try {
    const sanitizedUrl = url.split('?')[0];
    const normalizedCdn = trimTrailingSlash(config.cdnUrl);
    const normalizedEndpoint = trimTrailingSlash(config.endpoint);

    if (normalizedCdn && sanitizedUrl.startsWith(normalizedCdn)) {
      const relative = sanitizedUrl.slice(normalizedCdn.length).replace(/^\/+/g, '');
      return relative || null;
    }

    if (normalizedEndpoint) {
      const endpointPrefix = `${normalizedEndpoint}/${config.bucket}/`;
      if (sanitizedUrl.startsWith(endpointPrefix)) {
        const relative = sanitizedUrl.slice(endpointPrefix.length);
        return relative || null;
      }
    }

    const parsed = new URL(sanitizedUrl);
    let key = parsed.pathname.startsWith('/') ? parsed.pathname.slice(1) : parsed.pathname;

    if (key.startsWith(`${config.bucket}/`)) {
      key = key.slice(config.bucket.length + 1);
    }

    return key || null;
  } catch {
    return null;
  }
};
