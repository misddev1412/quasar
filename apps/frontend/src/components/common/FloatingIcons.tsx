'use client';

import React, { useState, useEffect } from 'react';
import { trpc } from '../../utils/trpc';
import {
  FloatingWidgetActionConfig,
  FloatingWidgetActionConfigList,
  floatingWidgetActionListSchema,
} from '@shared/types/floating-widget.types';
import UnifiedIcon from './UnifiedIcon';

const DEFAULT_ICON_BY_TYPE: Record<string, string> = {
  call: 'phone',
  email: 'mail',
  back_to_top: 'arrow-up',
  zalo: 'chat',
  messenger: 'chat',
  custom: 'star',
};

const emptyMetadata = (): NonNullable<FloatingWidgetActionConfig['metadata']> => ({
  phoneNumber: undefined,
  email: undefined,
  messengerLink: undefined,
  zaloPhone: undefined,
  customUrl: undefined,
  note: undefined,
});

const normalizeFloatingIcons = (items: FloatingWidgetActionConfigList): FloatingWidgetActionConfigList =>
  items
    .map((item) => ({
      ...item,
      icon: item.icon || DEFAULT_ICON_BY_TYPE[item.type] || 'star',
      metadata: { ...emptyMetadata(), ...(item.metadata || {}) },
    }))
    .filter((item) => item.isActive)
    .sort((a, b) => a.order - b.order)
    .map((item, index) => ({
      ...item,
      order: index,
    }));

const FloatingIcons: React.FC = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { data: settingsResponse, isLoading, error } = trpc.settings.getPublicSetting.useQuery({
    key: 'storefront.float_icons'
  });

  // Parse and validate floating icons data
  const floatingIcons: FloatingWidgetActionConfigList = React.useMemo(() => {
    const rawValue = settingsResponse?.data?.value;
    if (!rawValue) {
      return [];
    }

    try {
      const parsed = JSON.parse(rawValue);
      const validated = floatingWidgetActionListSchema.safeParse(parsed);
      if (validated.success) {
        return normalizeFloatingIcons(validated.data);
      }
    } catch (parseError) {
      console.error('Failed to parse floating icons setting:', parseError);
    }

    return [];
  }, [settingsResponse]);

  // Handle scroll to show/hide back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Generate action URL based on type and metadata
  const generateActionUrl = (item: FloatingWidgetActionConfig): string => {
    // If custom href is provided, use it
    if (item.href) {
      return item.href;
    }

    // Generate URL based on type
    switch (item.type) {
      case 'call':
        return item.metadata?.phoneNumber ? `tel:${item.metadata.phoneNumber}` : '#';
      case 'email':
        return item.metadata?.email ? `mailto:${item.metadata.email}` : '#';
      case 'messenger':
        return item.metadata?.messengerLink || '#';
      case 'zalo':
        return item.metadata?.zaloPhone || '#';
      case 'custom':
        return item.metadata?.customUrl || '#';
      case 'back_to_top':
        return '#';
      default:
        return '#';
    }
  };

  // Handle click action
  const handleClick = (item: FloatingWidgetActionConfig) => {
    if (item.type === 'back_to_top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const url = generateActionUrl(item);
    if (url && url !== '#') {
      if (url.startsWith('tel:') || url.startsWith('mailto:') || url.startsWith('https://')) {
        window.open(url, '_blank');
      } else {
        window.location.href = url;
      }
    }
  };

  // Don't render if loading, error, or no icons
  if (isLoading || error || floatingIcons.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* Filter out back_to_top icons and render them separately */}
      {floatingIcons
        .filter(item => item.type !== 'back_to_top')
        .map((item) => (
          <button
            key={item.id}
            onClick={() => handleClick(item)}
            className="group relative flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
            style={{
              backgroundColor: item.backgroundColor || '#0ea5e9',
              color: item.textColor || '#ffffff',
            }}
            title={item.tooltip || item.label}
          >
            <UnifiedIcon
              icon={item.icon || DEFAULT_ICON_BY_TYPE[item.type]}
              className="h-6 w-6"
            />

            {/* Tooltip */}
            {item.tooltip && (
              <span className="absolute right-full mr-3 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {item.tooltip}
                <span className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></span>
              </span>
            )}
          </button>
        ))
      }

      {/* Back to top button - show only when scrolled */}
      {floatingIcons
        .filter(item => item.type === 'back_to_top')
        .map((item) => (
          showScrollTop && (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              className="group relative flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
              style={{
                backgroundColor: item.backgroundColor || '#0ea5e9',
                color: item.textColor || '#ffffff',
              }}
              title={item.tooltip || item.label}
            >
              <UnifiedIcon
                icon={item.icon || DEFAULT_ICON_BY_TYPE[item.type]}
                className="h-6 w-6"
              />

              {/* Tooltip */}
              {item.tooltip && (
                <span className="absolute right-full mr-3 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {item.tooltip}
                  <span className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></span>
                </span>
              )}
            </button>
          )
        ))
      }
    </div>
  );
};

export default FloatingIcons;
