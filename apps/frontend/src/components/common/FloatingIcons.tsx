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
  zalo: 'zalo',
  messenger: 'chat',
  custom: 'star',
  group_phone: 'phone',
};

const emptyMetadata = (): NonNullable<FloatingWidgetActionConfig['metadata']> => ({
  phoneNumber: undefined,
  email: undefined,
  messengerLink: undefined,
  zaloPhone: undefined,
  customUrl: undefined,
  note: undefined,
  groupPhoneList: [],
});

const DEFAULT_EFFECT: FloatingWidgetActionEffect = 'none';
const BUTTON_SIZE_PX = 54;

const EFFECT_CLASS_MAP: Record<FloatingWidgetActionEffect, string> = {
  none: '',
  pulse: 'animate-pulse',
  ring: '',
  bounce: 'animate-bounce',
};

const resolveIconName = (item: FloatingWidgetActionConfig): string => {
  if (item.type === 'zalo') {
    if (!item.icon || item.icon === 'chat') {
      return 'zalo';
    }
  }
  return item.icon || DEFAULT_ICON_BY_TYPE[item.type] || 'star';
};

const normalizeFloatingIcons = (items: FloatingWidgetActionConfigList): FloatingWidgetActionConfigList =>
  items
    .map((item) => ({
      ...item,
      icon: resolveIconName(item),
      effect: item.effect || DEFAULT_EFFECT,
      isTransparentBackground: Boolean(item.isTransparentBackground),
      hasSlideOutInfo: Boolean(item.hasSlideOutInfo),
      slideOutText: item.slideOutText,
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
        const transparentBg = Boolean(item.isTransparentBackground);
        const iconClassName = transparentBg ? '' : 'h-5 w-5';
        const iconVariant = transparentBg ? 'floating' : 'nav';
        const iconSize = transparentBg ? BUTTON_SIZE_PX : 20;
        const iconStyle = transparentBg
          ? { color: iconColor, width: BUTTON_SIZE_PX, height: BUTTON_SIZE_PX }
          : { color: iconColor };
        const backgroundColor = transparentBg ? 'transparent' : item.backgroundColor || '#0ea5e9';
        const buttonShapeClasses = transparentBg ? '' : 'shadow-[0_10px_25px_rgba(15,23,42,0.2)]';


        const getSlideOutText = () => {
          if (!item.hasSlideOutInfo) return null;
          if (item.slideOutText?.trim()) return item.slideOutText;
          if (item.label?.trim()) return item.label;
          // Fallback to metadata
          if (item.type === 'call') return item.metadata?.phoneNumber;
          if (item.type === 'email') return item.metadata?.email;
          if (item.type === 'zalo') return item.metadata?.zaloPhone;
          return null;
        };

        const slideOutContent = getSlideOutText();

        const isGroupPhone = item.type === 'group_phone';
        const groupPhoneList = item.metadata?.groupPhoneList || [];

        return (
          <div
            key={getItemKey(item)}
            className="group pointer-events-auto relative flex items-center justify-end"
          >
            {isGroupPhone && groupPhoneList.length > 0 ? (
              <div
                className={`absolute right-full bottom-0 mr-3 whitespace-nowrap rounded-2xl bg-white shadow-xl ring-1 ring-gray-100 transition-all duration-300 opacity-0 translate-x-4 invisible group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 overflow-hidden`}
              >
                <div className="flex flex-col min-w-[200px]">
                  {groupPhoneList.map((phoneItem, idx) => {
                    // Use item color or fallback to black/dark gray for readability on white
                    const itemColor = phoneItem.textColor || '#1f2937';
                    return (
                      <a
                        key={idx}
                        href={`tel:${phoneItem.phoneNumber.replace(/\D/g, '')}`}
                        className="flex items-center gap-3 p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                        style={{ color: itemColor }}
                      >
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100/80"
                          style={{ color: itemColor }}
                        >
                          <UnifiedIcon icon={phoneItem.icon || 'phone'} size={16} style={{ color: itemColor }} />
                        </div>
                        <div className="flex flex-col leading-tight">
                          <span className="text-xs font-medium opacity-70">{phoneItem.label}</span>
                          <span className="font-bold">{phoneItem.phoneNumber}</span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            ) : (
              slideOutContent && (
                <div
                  className={`absolute right-full mr-3 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium shadow-lg transition-all duration-300 opacity-0 translate-x-4 invisible group-hover:visible group-hover:opacity-100 group-hover:translate-x-0`}
                  style={{
                    backgroundColor: item.backgroundColor || '#0ea5e9',
                    color: item.textColor || '#ffffff',
                  }}
                >
                  {slideOutContent}
                </div>
              )
            )}
            <button
              type="button"
              onClick={() => handleClick(item)}
              className={`relative flex items-center justify-center overflow-visible rounded-full transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 ${buttonShapeClasses} ${EFFECT_CLASS_MAP[effect]}`}
              style={{
                backgroundColor,
                width: BUTTON_SIZE_PX,
                height: BUTTON_SIZE_PX,
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
                variant={iconVariant}
                size={iconSize}
                className={iconClassName}
                style={iconStyle}
              />
            </button>
          </div>
        );
      })}

      {scrollTopItems.length > 0 && showScrollTop && (
        scrollTopItems.map((item) => {
          const effect = item.effect || DEFAULT_EFFECT;
          const iconColor = item.textColor || '#ffffff';
          const isRing = effect === 'ring';
          const transparentBg = Boolean(item.isTransparentBackground);
          const iconClassName = transparentBg ? '' : 'h-5 w-5';
          const iconVariant = transparentBg ? 'floating' : 'nav';
          const iconSize = transparentBg ? BUTTON_SIZE_PX : 20;
          const iconStyle = transparentBg
            ? { color: iconColor, width: BUTTON_SIZE_PX, height: BUTTON_SIZE_PX }
            : { color: iconColor };
          const backgroundColor = transparentBg ? 'transparent' : item.backgroundColor || '#0ea5e9';
          const buttonShapeClasses = transparentBg ? '' : 'shadow-[0_10px_25px_rgba(15,23,42,0.2)]';

          return (
            <button
              key={getItemKey(item)}
              type="button"
              onClick={() => handleClick(item)}
              className={`pointer-events-auto relative flex items-center justify-center overflow-visible rounded-full transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 ${buttonShapeClasses} ${EFFECT_CLASS_MAP[effect]}`}
              style={{
                backgroundColor,
                width: BUTTON_SIZE_PX,
                height: BUTTON_SIZE_PX,
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
                variant={iconVariant}
                size={iconSize}
                className={iconClassName}
                style={iconStyle}
              />
            </button>
          );
        })
      )}
    </div>
  );
};

export default FloatingIcons;
