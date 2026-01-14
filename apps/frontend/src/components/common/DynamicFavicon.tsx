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
      // Only remove links managed by this component to avoid conflicting with Next/React head updates.
      const existingLinks = document.querySelectorAll('link[data-dynamic-favicon="true"]');
      existingLinks.forEach(link => link.remove());

      // Add new favicon link
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = url;
      link.type = 'image/x-icon';
      link.setAttribute('data-dynamic-favicon', 'true');
      document.head.appendChild(link);

      // Add apple touch icon
      const appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      appleLink.href = url;
      appleLink.setAttribute('data-dynamic-favicon', 'true');
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
