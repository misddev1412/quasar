'use client';

import React, { useState, useEffect } from 'react';
import { trpc } from '../../utils/trpc';
import {
  FloatingWidgetActionConfig,
  FloatingWidgetActionConfigList,
  FloatingWidgetActionEffect,
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

const DEFAULT_EFFECT: FloatingWidgetActionEffect = 'none';

const EFFECT_CLASS_MAP: Record<FloatingWidgetActionEffect, string> = {
  none: '',
  pulse: 'animate-pulse',
  ring: '',
  bounce: 'animate-bounce',
};

const normalizeFloatingIcons = (items: FloatingWidgetActionConfigList): FloatingWidgetActionConfigList =>
  items
    .map((item) => ({
      ...item,
      icon: item.icon || DEFAULT_ICON_BY_TYPE[item.type] || 'star',
      effect: item.effect || DEFAULT_EFFECT,
      metadata: { ...emptyMetadata(), ...(item.metadata || {}) },
    }))
    .filter((item) => item.isActive)
    .sort((a, b) => a.order - b.order)
    .map((item, index) => ({
      ...item,
      order: index,
    }));

const getItemKey = (item: FloatingWidgetActionConfig) => item.id || `${item.type}-${item.order}`;

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

  const actionItems = React.useMemo(
    () => floatingIcons.filter((item) => item.type !== 'back_to_top'),
    [floatingIcons]
  );
  const scrollTopItems = React.useMemo(
    () => floatingIcons.filter((item) => item.type === 'back_to_top'),
    [floatingIcons]
  );

  // Handle click action
  const handleClick = (item: FloatingWidgetActionConfig) => {
    if (item.type === 'back_to_top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const url = generateActionUrl(item);
    if (url && url !== '#') {
      const isExternalLink = /^https?:\/\//i.test(url);
      if (url.startsWith('tel:') || url.startsWith('mailto:') || url.startsWith('sms:')) {
        window.location.href = url;
        return;
      }

      if (isExternalLink) {
        window.open(url, '_blank', 'noopener');
      } else {
        window.location.href = url;
      }
    }
  };

  // Don't render if loading, error, or no icons
  const noActions = actionItems.length === 0 && scrollTopItems.length === 0;
  if (isLoading || error || noActions) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col gap-3">
      {actionItems.map((item) => {
        const effect = item.effect || DEFAULT_EFFECT;
        const iconColor = item.textColor || '#ffffff';
        const isRing = effect === 'ring';
        return (
          <button
            key={getItemKey(item)}
            type="button"
            onClick={() => handleClick(item)}
            className={`pointer-events-auto relative flex h-12 w-12 items-center justify-center overflow-visible rounded-full shadow-[0_10px_25px_rgba(15,23,42,0.2)] transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 ${EFFECT_CLASS_MAP[effect]}`}
            style={{
              backgroundColor: item.backgroundColor || '#0ea5e9',
            }}
            aria-label={item.label || item.tooltip || 'Floating action button'}
          >
            {isRing && (
              <span
                aria-hidden="true"
                className="absolute inset-0 -z-10 rounded-full opacity-60 animate-ping"
                style={{
                  border: `2px solid ${iconColor}`,
                }}
              ></span>
            )}
            <UnifiedIcon
              icon={item.icon || DEFAULT_ICON_BY_TYPE[item.type]}
              className="h-5 w-5"
              style={{ color: iconColor }}
            />
          </button>
        );
      })}

      {scrollTopItems.length > 0 && showScrollTop && (
        scrollTopItems.map((item) => {
          const effect = item.effect || DEFAULT_EFFECT;
          const iconColor = item.textColor || '#ffffff';
          const isRing = effect === 'ring';
          return (
            <button
              key={getItemKey(item)}
              type="button"
              onClick={() => handleClick(item)}
              className={`pointer-events-auto relative flex h-12 w-12 items-center justify-center overflow-visible rounded-full shadow-[0_10px_25px_rgba(15,23,42,0.2)] transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 ${EFFECT_CLASS_MAP[effect]}`}
              style={{
                backgroundColor: item.backgroundColor || '#0ea5e9',
              }}
              aria-label={item.label || item.tooltip || 'Back to top'}
            >
              {isRing && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 rounded-full opacity-60 animate-ping"
                  style={{
                    border: `2px solid ${iconColor}`,
                  }}
                ></span>
              )}
              <UnifiedIcon
                icon={item.icon || DEFAULT_ICON_BY_TYPE[item.type]}
                className="h-5 w-5"
                style={{ color: iconColor }}
              />
            </button>
          );
        })
      )}
    </div>
  );
};

export default FloatingIcons;
