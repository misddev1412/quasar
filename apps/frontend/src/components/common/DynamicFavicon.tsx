'use client';

import { useEffect } from 'react';
import { useSettings } from '../../hooks/useSettings';

interface DynamicFaviconProps {
  defaultFavicon?: string;
}

export const DynamicFavicon: React.FC<DynamicFaviconProps> = ({
  defaultFavicon = '/favicon.ico'
}) => {
  const { getSiteFavicon } = useSettings();
  const favicon = getSiteFavicon();

  useEffect(() => {
    const updateFavicon = (url: string) => {
      // Remove existing favicon links
      const existingLinks = document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]');
      existingLinks.forEach(link => link.remove());

      // Add new favicon link
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = url;
      link.type = 'image/x-icon';
      document.head.appendChild(link);

      // Add apple touch icon
      const appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      appleLink.href = url;
      document.head.appendChild(appleLink);
    };

    if (favicon) {
      updateFavicon(favicon);
    } else {
      updateFavicon(defaultFavicon);
    }
  }, [favicon, defaultFavicon]);

  return null;
};