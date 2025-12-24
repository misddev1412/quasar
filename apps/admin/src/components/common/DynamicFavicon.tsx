import { useEffect } from 'react';
import { useBrandingSetting } from '../../hooks/useBrandingSetting';
import {
  ADMIN_LOGIN_BRANDING_KEY,
  DEFAULT_ADMIN_LOGIN_BRANDING
} from '../../constants/adminBranding';

interface DynamicFaviconProps {
  defaultFavicon?: string;
}

/**
 * Keeps the admin favicon in sync with the login branding settings so updates made
 * on the Admin Branding page are reflected everywhere (including the login screen).
 */
export const DynamicFavicon: React.FC<DynamicFaviconProps> = ({
  defaultFavicon = '/favicon.ico',
}) => {
  const { config } = useBrandingSetting(
    ADMIN_LOGIN_BRANDING_KEY,
    DEFAULT_ADMIN_LOGIN_BRANDING,
    { publicAccess: true }
  );

  const faviconFromSettings = typeof config.faviconUrl === 'string' ? config.faviconUrl.trim() : '';

  useEffect(() => {
    const href = faviconFromSettings || defaultFavicon;

    const updateFavicon = (url: string) => {
      const selectors =
        'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]';
      document.querySelectorAll<HTMLLinkElement>(selectors).forEach((link) => {
        link.parentElement?.removeChild(link);
      });

      const createLink = (rel: string, type?: string) => {
        const link = document.createElement('link');
        link.rel = rel;
        link.href = url;
        if (type) {
          link.type = type;
        }
        document.head.appendChild(link);
      };

      createLink('icon', 'image/x-icon');
      createLink('shortcut icon', 'image/x-icon');
      createLink('apple-touch-icon');
    };

    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      updateFavicon(href);
    }
  }, [faviconFromSettings, defaultFavicon]);

  return null;
};

export default DynamicFavicon;
