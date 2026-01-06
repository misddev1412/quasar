'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Avatar, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/react';
import { FiShoppingCart } from 'react-icons/fi';
import { MenuItem, MenuTranslation, useMenu } from '../../hooks/useMenu';
import { MenuTarget, MenuType, TopMenuTimeFormat } from '@shared/enums/menu.enums';
import Container from '../common/Container';
import UnifiedIcon from '../common/UnifiedIcon';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { useCart } from '../ecommerce/CartProvider';

const TOP_MENU_GROUP = 'top';

const MAX_MARQUEE_CONTENT_REPEAT = 20;
const topSkeletonBase =
  'bg-gradient-to-r from-slate-600/40 via-slate-500/20 to-slate-600/30 dark:from-slate-500/30 dark:via-slate-700/40 dark:to-slate-500/30';

const TopMenuSkeleton: React.FC = () => {
  const labelWidths = ['w-24', 'w-16', 'w-20', 'w-28'];

  return (
    <div className="flex w-full flex-wrap items-center gap-3 md:gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={`top-menu-skeleton-${index}`}
          className="flex min-w-[160px] items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-xs text-white/80 shadow-lg/20 backdrop-blur animate-pulse"
        >
          <span className={`h-8 w-8 rounded-full ${topSkeletonBase}`} />
          <div className="space-y-1">
            <span className={`block h-3 rounded-full ${topSkeletonBase} ${labelWidths[index % labelWidths.length]}`} />
            <span className={`block h-2 rounded-full opacity-70 ${topSkeletonBase} w-14`} />
          </div>
        </div>
      ))}
      <div className="flex-1 min-w-[200px]">
        <div className={`h-10 rounded-2xl ${topSkeletonBase} animate-pulse`} />
      </div>
    </div>
  );
};

const getConfigString = (config: Record<string, unknown> | undefined, key: string): string | undefined => {
  if (!config || typeof config !== 'object') {
    return undefined;
  }

  const value = config[key];
  return typeof value === 'string' ? value : undefined;
};

const getNormalizedTel = (value: string) => value.replace(/[^+\d]/g, '');

type ConfigMarqueeEntry = {
  label?: string;
  url?: string;
  target: MenuTarget;
  icon?: string;
};

type MarqueeDisplayItem = {
  key: string;
  label?: string;
  href?: string;
  target?: MenuTarget;
  iconName?: string;
  iconColor?: string;
};

const getTopMarqueeConfigItems = (config: Record<string, unknown> | undefined | null): ConfigMarqueeEntry[] => {
  if (!config || typeof config !== 'object') {
    return [];
  }

  const rawItems = (config as Record<string, unknown>)['topMarqueeItems'];
  if (!Array.isArray(rawItems)) {
    return [];
  }

  return rawItems
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const record = item as Record<string, unknown>;
      const label = typeof record.label === 'string' ? record.label : undefined;
      const url = typeof record.url === 'string' ? record.url : undefined;
      const target =
        record.target === MenuTarget.BLANK || record.target === MenuTarget.SELF
          ? (record.target as MenuTarget)
          : MenuTarget.SELF;

      const trimmedIcon = typeof record.icon === 'string' ? record.icon.trim() : '';
      const entry: ConfigMarqueeEntry = {
        label,
        url,
        target,
        icon: trimmedIcon.length > 0 ? trimmedIcon : undefined,
      };
      return entry;
    })
    .filter((item): item is ConfigMarqueeEntry => item !== null);
};

const getTranslationForLocale = (
  translations: MenuTranslation[],
  locale: string,
  fallbackLocale: string = 'en',
) => {
  const normalizedLocale = locale.split('-')[0];

  const localized = translations.find(
    (translation) => translation.locale === locale || translation.locale === normalizedLocale,
  );
  if (localized) {
    return localized;
  }

  return translations.find((translation) => translation.locale === fallbackLocale) ?? null;
};

const formatTimeForLocale = (format: string, locale: string) => {
  const normalizedLocale = locale.startsWith('vi') ? 'vi' : 'en';
  dayjs.locale(normalizedLocale);
  return dayjs().format(format);
};

const useClock = (format: string, locale: string) => {
  const [currentTime, setCurrentTime] = useState(() => formatTimeForLocale(format, locale));

  useEffect(() => {
    const update = () => setCurrentTime(formatTimeForLocale(format, locale));
    update();

    const shouldTickEachSecond = /s/i.test(format);
    const interval = shouldTickEachSecond ? 1000 : 60000;
    const timer = window.setInterval(update, interval);

    return () => {
      window.clearInterval(timer);
    };
  }, [format, locale]);

  return currentTime;
};

const TopCurrentTimeItem: React.FC<{ item: MenuItem; label?: string; locale: string }> = ({
  item,
  label,
  locale,
}) => {
  const selectedFormat = getConfigString(item.config, 'topTimeFormat') || TopMenuTimeFormat.HOURS_MINUTES;
  const currentTime = useClock(selectedFormat, locale);
  const iconColor = item.textColor || undefined;

  return (
    <div className="flex items-center gap-2">
      {item.icon ? <UnifiedIcon icon={item.icon} variant="nav" size={16} color={iconColor} /> : null}
      {label ? (
        <>
          <span className="font-medium">{label}</span>
          <span className="text-gray-400" aria-hidden>
            •
          </span>
        </>
      ) : null}
      <span className="font-semibold">{currentTime}</span>
    </div>
  );
};

const UserCircleIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const SunIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.75V6m0 12v1.25m7.25-7.25H18M6 12H4.75m13.053 5.303-.884-.884M6.081 7.919l-.884-.884m12.302 0-.884.884M6.081 16.081l-.884.884M16 12a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);

const OrderTrackingIcon: React.FC<{ color?: string }> = ({ color = '#ffffff' }) => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.8}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 11a3 3 0 100-6 3 3 0 000 6z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 11c0 7.5-7.5 10.5-7.5 10.5S4.5 18.5 4.5 11a7.5 7.5 0 1115 0z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 10.75l1.25 1.25 2.25-2.25" />
  </svg>
);

const TopMenuThemeToggle: React.FC<{
  className: string;
  style?: React.CSSProperties;
  label?: string;
  iconNode?: React.ReactNode;
}> = ({ className, style, label, iconNode }) => {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  const hasLabel = Boolean(label);

  return (
    <button
      type="button"
      className={clsx(
        className,
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/70 transition-colors',
        hasLabel ? 'gap-2 px-3 py-1.5 min-h-[36px]' : 'gap-0 px-0 py-0 w-9 h-9 justify-center',
      )}
      style={style}
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} mode`}
    >
      {iconNode ?? (theme === 'dark' ? <MoonIcon /> : <SunIcon />)}
      {hasLabel ? <span className="font-semibold">{label}</span> : null}
    </button>
  );
};

const TopMenuCartButton: React.FC<{
  className: string;
  style?: React.CSSProperties;
  label?: string;
  iconNode?: React.ReactNode;
}> = ({ className, style, label, iconNode }) => {
  const { summary, openCart } = useCart();
  const tCart = useTranslations('ecommerce.cart');

  const cartLabel =
    summary.totalItems > 0
      ? tCart('aria_labels.cart_button', { count: summary.totalItems })
      : tCart('aria_labels.cart_button_empty');

  const hasCustomLabel = Boolean(label);
  const normalizedCount = summary.totalItems > 99 ? '99+' : String(summary.totalItems);
  const showInlineCount = hasCustomLabel && summary.totalItems > 0;

  return (
    <button
      type="button"
      className={clsx(className, 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/70')}
      style={style}
      onClick={openCart}
      aria-label={cartLabel}
    >
      {iconNode ?? <FiShoppingCart className="text-base" />}
      {hasCustomLabel ? (
        <>
          <span className="font-semibold">{label}</span>
          {showInlineCount ? <span className="text-xs font-semibold opacity-90">({normalizedCount})</span> : null}
        </>
      ) : (
        <span className="font-semibold">{cartLabel}</span>
      )}
    </button>
  );
};

const TopMenuMarquee: React.FC<{
  items: MarqueeDisplayItem[];
  className: string;
  style: React.CSSProperties;
  normalizedMaxWidth?: string;
  animationDuration: number;
}> = ({ items, className, style, normalizedMaxWidth, animationDuration }) => {
  const marqueeWrapperRef = useRef<HTMLDivElement | null>(null);
  const measurementRef = useRef<HTMLDivElement | null>(null);
  const [contentRepeat, setContentRepeat] = useState(1);

  const repeatSegments = items.length <= 1 ? 3 : 2;
  const translatePercent = -100 / repeatSegments;

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    let rafHandle: number | null = null;

    const updateRepeat = () => {
      rafHandle = null;
      const containerEl = marqueeWrapperRef.current;
      const measureEl = measurementRef.current;

      if (!containerEl || !measureEl) {
        return;
      }

      const containerWidth = containerEl.offsetWidth;
      const baseWidth = measureEl.scrollWidth;

      if (!containerWidth || !baseWidth) {
        return;
      }

      const requiredRepeats = Math.max(1, Math.ceil(containerWidth / baseWidth));
      const bufferedRepeats = Math.min(MAX_MARQUEE_CONTENT_REPEAT, requiredRepeats + 1);

      setContentRepeat((prev) => (prev === bufferedRepeats ? prev : bufferedRepeats));
    };

    const handleResize = () => {
      if (rafHandle) {
        cancelAnimationFrame(rafHandle);
      }
      rafHandle = window.requestAnimationFrame(updateRepeat);
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && marqueeWrapperRef.current) {
      observer = new ResizeObserver(handleResize);
      observer.observe(marqueeWrapperRef.current);
    }

    return () => {
      if (rafHandle) {
        cancelAnimationFrame(rafHandle);
      }
      window.removeEventListener('resize', handleResize);
      observer?.disconnect();
    };
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  const marqueeStyle: React.CSSProperties = { ...style };
  if (normalizedMaxWidth) {
    marqueeStyle.width = normalizedMaxWidth;
    marqueeStyle.maxWidth = normalizedMaxWidth;
  } else {
    marqueeStyle.flex = '1 1 240px';
  }

  const marqueeTrackStyle = {
    animationDuration: `${animationDuration}s`,
    '--marquee-translate': `${translatePercent}%`,
  } as React.CSSProperties;

  const renderTickerEntry = (
    entry: MarqueeDisplayItem,
    entryIndex: number,
    iterationIndex: number,
    repeatIndex: number,
    { isMeasurement = false }: { isMeasurement?: boolean } = {},
  ) => {
    const label = entry.label || entry.href || '';
    const href = entry.href;
    const wrapperClasses = 'flex items-center gap-2 pr-6 mr-6 whitespace-nowrap text-xs md:text-sm';
    const keySuffix = isMeasurement ? 'measure' : 'node';
    const key = `${entry.key}-${keySuffix}-${iterationIndex}-${repeatIndex}-${entryIndex}`;
    const baseProps =
      iterationIndex > 0 || isMeasurement
        ? {
          'aria-hidden': true as const,
          tabIndex: -1,
        }
        : {};

    const iconNode = entry.iconName ? (
      <UnifiedIcon
        icon={entry.iconName}
        variant="nav"
        size={14}
        color={entry.iconColor || undefined}
        className="text-current"
      />
    ) : null;

    const content = (
      <span className="flex items-center gap-2 whitespace-nowrap">
        {iconNode}
        <span className="font-medium">{label}</span>
      </span>
    );

    if (!href || href === '#') {
      return (
        <span key={key} className={wrapperClasses} {...baseProps}>
          {content}
        </span>
      );
    }

    const isExternal = entry.target === MenuTarget.BLANK || /^https?:/i.test(href);
    if (isExternal) {
      return (
        <a
          key={key}
          href={href}
          target={entry.target || '_self'}
          rel={entry.target === MenuTarget.BLANK ? 'noopener noreferrer' : undefined}
          className={wrapperClasses}
          {...baseProps}
        >
          {content}
        </a>
      );
    }

    return (
      <Link key={key} href={href} target={entry.target || undefined} className={wrapperClasses} {...baseProps}>
        {content}
      </Link>
    );
  };

  const marqueeSequence: React.ReactNode[] = [];
  for (let iterationIndex = 0; iterationIndex < repeatSegments; iterationIndex += 1) {
    for (let repeatIndex = 0; repeatIndex < contentRepeat; repeatIndex += 1) {
      items.forEach((entry, entryIndex) => {
        marqueeSequence.push(renderTickerEntry(entry, entryIndex, iterationIndex, repeatIndex));
      });
    }
  }

  return (
    <div
      className={clsx(className, 'min-w-0 overflow-hidden', { 'flex-1': !normalizedMaxWidth })}
      style={marqueeStyle}
    >
      <div className="relative w-full overflow-hidden" ref={marqueeWrapperRef}>
        <div className="top-menu-marquee-track flex flex-nowrap items-center" style={marqueeTrackStyle}>
          {marqueeSequence}
        </div>

        <div
          aria-hidden
          className="top-menu-marquee-measure flex flex-nowrap items-center absolute inset-0 opacity-0 pointer-events-none h-0 overflow-hidden"
          ref={measurementRef}
        >
          {items.map((entry, entryIndex) => renderTickerEntry(entry, entryIndex, 0, 0, { isMeasurement: true }))}
        </div>
      </div>
    </div>
  );
};

const TopAccountDropdown: React.FC<{
  className: string;
  style?: React.CSSProperties;
  label?: string;
  iconNode?: React.ReactNode;
}> = ({ className, style, label, iconNode }) => {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const router = useRouter();
  const t = useTranslations();

  const accountItems = useMemo(
    () => [
      { key: 'account', label: t('layout.header.user.account'), href: '/profile' },
      { key: 'orders', label: t('layout.header.user.orders'), href: '/orders' },
      { key: 'settings', label: t('layout.header.user.settings'), href: '/settings' },
      { key: 'logout', label: t('layout.header.user.logout'), action: 'logout' as const, color: 'danger' as const },
    ],
    [t],
  );

  const guestItems = useMemo(
    () => [
      { key: 'signin', label: t('layout.header.guest.signin'), href: '/login' },
      { key: 'signup', label: t('layout.header.guest.signup'), href: '/register', color: 'primary' as const },
    ],
    [t],
  );

  const handleNavigate = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router],
  );

  const handleLogout = useCallback(() => {
    logout();
    router.push('/');
  }, [logout, router]);

  const triggerLabel = label || (isAuthenticated ? user?.name || t('layout.header.user.account') : t('layout.header.guest.signin'));

  const hasDecor = Boolean(label || iconNode);
  if (isLoading) {
    return (
      <div className={clsx(className, hasDecor ? 'gap-3' : 'justify-center')} style={style}>
        {hasDecor ? (
          <>
            {iconNode}
            {label ? <span className="font-medium">{label}</span> : null}
          </>
        ) : null}
        <span
          className={clsx('bg-white/30 animate-pulse', hasDecor ? 'h-4 w-16 rounded-full' : 'h-7 w-7 rounded-full')}
        />
      </div>
    );
  }

  return (
    <div className={clsx(className, hasDecor ? 'gap-3' : 'justify-center')} style={style}>
      {hasDecor ? (
        <>
          {iconNode}
          {label ? <span className="font-medium">{label}</span> : null}
        </>
      ) : null}
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <button
            type="button"
            aria-label={triggerLabel}
            className={clsx('flex items-center text-current font-semibold text-xs', {
              'gap-2': hasDecor,
              'justify-center': !hasDecor,
            })}
          >
            {isAuthenticated ? (
              <Avatar
                size="sm"
                classNames={{
                  base: 'w-7 h-7 text-[0.7rem]',
                }}
                src={user?.avatar}
                name={user?.name || user?.email}
                showFallback
                fallback={<UserCircleIcon />}
              />
            ) : (
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full text-white/90">
                <UserCircleIcon />
              </span>
            )}
            {hasDecor ? (
              <>
                <span className="max-w-[120px] truncate">{triggerLabel}</span>
                <ChevronDownIcon />
              </>
            ) : null}
          </button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Account menu" variant="flat" className="min-w-[200px]">
          {isAuthenticated ? (
            <>
              <DropdownItem key="profile-header" className="h-16 gap-2 py-3" textValue="profile" isReadOnly>
                <div className="flex flex-col text-left">
                  <p className="text-xs text-gray-500">{t('layout.header.user.signedInAs')}</p>
                  <p className="font-semibold text-sm truncate">{user?.name || user?.email}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
              </DropdownItem>
              <DropdownItem key="divider" className="h-px my-1" isReadOnly>
                <div className="border-t border-default-200" />
              </DropdownItem>
              {accountItems.map((item) => (
                <DropdownItem
                  key={item.key}
                  color={item.color || 'default'}
                  className="min-h-[38px]"
                  onPress={() => {
                    if (item.action === 'logout') {
                      handleLogout();
                    } else if (item.href) {
                      handleNavigate(item.href);
                    }
                  }}
                >
                  {item.label}
                </DropdownItem>
              ))}
            </>
          ) : (
            guestItems.map((item) => (
              <DropdownItem
                key={item.key}
                color={item.color || 'default'}
                className="min-h-[38px]"
                onPress={() => handleNavigate(item.href)}
              >
                {item.label}
              </DropdownItem>
            ))
          )}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

const TopMenuBar: React.FC = () => {
  const localeValue = useLocale();
  const t = useTranslations();
  const normalizedLocale = localeValue.split('-')[0];
  const { treeData, isLoading, getLabel, buildHref } = useMenu(TOP_MENU_GROUP);

  const items = useMemo(() => {
    if (!treeData) {
      return [] as MenuItem[];
    }

    return treeData
      .filter((item) => item.isEnabled && (!item.parentId || item.parentId === null))
      .sort((a, b) => a.position - b.position);
  }, [treeData]);

  if (!isLoading && items.length === 0) {
    return null;
  }

  const renderMenuItem = (item: MenuItem) => {
    const label = getLabel(item) || (item.type === MenuType.ORDER_TRACKING ? t('pages.order_tracking.badge') : undefined);
    const translation = getTranslationForLocale(item.translations, normalizedLocale);
    const textColor = item.textColor || (item.type === MenuType.ORDER_TRACKING ? '#ffffff' : undefined);
    const backgroundColor = item.backgroundColor || undefined;
    const borderColor = item.borderColor || undefined;
    const borderWidth = item.borderWidth || undefined;
    const hasCustomBorder = Boolean(borderColor || borderWidth);
    let iconNode: React.ReactNode = item.icon ? (
      <UnifiedIcon icon={item.icon} variant="nav" size={16} color={textColor} />
    ) : null;
    if (!iconNode && item.type === MenuType.ORDER_TRACKING) {
      iconNode = <OrderTrackingIcon color={textColor} />;
    } else if (!iconNode && item.type === MenuType.CART_BUTTON) {
      iconNode = <FiShoppingCart className="text-base" />;
    }

    const commonClasses = clsx(
      'flex items-center gap-2 text-xs md:text-sm transition-colors px-2 py-1 rounded-md',
      hasCustomBorder ? 'border' : 'border-0',
      backgroundColor ? 'shadow-sm' : 'hover:bg-white/10',
    );
    const compactClasses = clsx(
      'flex items-center justify-center text-xs md:text-sm transition-colors rounded-full w-9 h-9',
      hasCustomBorder ? 'border' : 'border-0',
      backgroundColor ? 'shadow-sm' : 'hover:bg-white/10',
    );

    const style = {
      color: textColor,
      backgroundColor,
    } as React.CSSProperties;

    if (borderColor) {
      style.borderColor = borderColor;
    }
    if (borderWidth) {
      style.borderWidth = borderWidth;
    }
    if (borderColor || borderWidth) {
      style.borderStyle = style.borderStyle || 'solid';
      if (!style.borderWidth) {
        style.borderWidth = '1px';
      }
    }

    switch (item.type) {
      case MenuType.TOP_PHONE: {
        const phoneNumber = getConfigString(item.config, 'topPhoneNumber');
        if (!phoneNumber) {
          return null;
        }

        return (
          <a
            key={item.id}
            href={`tel:${getNormalizedTel(phoneNumber)}`}
            className={commonClasses}
            style={style}
          >
            {iconNode}
            <span className="font-medium">{label || phoneNumber}</span>
          </a>
        );
      }

      case MenuType.TOP_EMAIL: {
        const emailAddress = getConfigString(item.config, 'topEmailAddress');
        if (!emailAddress) {
          return null;
        }

        return (
          <a key={item.id} href={`mailto:${emailAddress}`} className={commonClasses} style={style}>
            {iconNode}
            <span className="font-medium">{label || emailAddress}</span>
          </a>
        );
      }

      case MenuType.TOP_CURRENT_TIME: {
        return (
          <div key={item.id} className={commonClasses} style={style}>
            <TopCurrentTimeItem item={item} label={label} locale={normalizedLocale} />
          </div>
        );
      }

      case MenuType.THEME_TOGGLE: {
        const themeClasses = !label && !iconNode ? compactClasses : commonClasses;
        return (
          <TopMenuThemeToggle key={item.id} className={themeClasses} style={style} label={label} iconNode={iconNode} />
        );
      }

      case MenuType.LOCALE_SWITCHER: {
        if (!label && !iconNode) {
          return (
            <div key={item.id} className={compactClasses} style={style}>
              <LanguageSwitcher className="inline-flex" variant="minimal" />
            </div>
          );
        }

        return (
          <div key={item.id} className={clsx(commonClasses, 'gap-3')} style={style}>
            {iconNode}
            {label ? <span className="font-medium">{label}</span> : null}
            <LanguageSwitcher className="inline-flex" />
          </div>
        );
      }

      case MenuType.CART_BUTTON: {
        const cartClasses = !label && !iconNode ? compactClasses : commonClasses;
        return (
          <TopMenuCartButton
            key={item.id}
            className={cartClasses}
            style={style}
            label={label}
            iconNode={iconNode}
          />
        );
      }

      case MenuType.USER_PROFILE: {
        const profileClasses = !label && !iconNode ? compactClasses : commonClasses;
        return (
          <TopAccountDropdown key={item.id} className={profileClasses} style={style} label={label} iconNode={iconNode} />
        );
      }

      case MenuType.TOP_MARQUEE: {
        const configMarqueeItems = getTopMarqueeConfigItems(item.config);
        const childItems = item.children
          .filter((child) => child.isEnabled)
          .sort((a, b) => a.position - b.position)
          .map((child) => {
            const childLabel = getLabel(child) || undefined;
            const href = buildHref(child);
            return {
              key: child.id,
              label: childLabel || href,
              href,
              target: child.target,
              iconName: child.icon || undefined,
              iconColor: child.textColor || textColor || undefined,
            };
          });

        const translationMarqueeItems = getTopMarqueeConfigItems(translation?.config || undefined);

        const prioritizedConfigItems = translationMarqueeItems.length > 0 ? translationMarqueeItems : configMarqueeItems;

        const displayItems: MarqueeDisplayItem[] =
          prioritizedConfigItems.length > 0
            ? prioritizedConfigItems.map((entry, index) => ({
              key: `${item.id}-cfg-${index}`,
              label: entry.label || entry.url || undefined,
              href: entry.url,
              target: entry.target || MenuTarget.SELF,
              iconName: entry.icon,
              iconColor: textColor,
            }))
            : childItems;

        if (displayItems.length === 0) {
          return null;
        }

        const marqueeMaxWidth = getConfigString(item.config, 'topMarqueeMaxWidth');
        const normalizedMaxWidth = marqueeMaxWidth?.trim() || undefined;
        const marqueeSpeedValue = getConfigString(item.config, 'topMarqueeSpeed');
        const parsedSpeed = marqueeSpeedValue ? parseFloat(marqueeSpeedValue) : undefined;
        const fallbackDuration = Math.max(12, displayItems.length * 4);
        const animationDuration = parsedSpeed && Number.isFinite(parsedSpeed) && parsedSpeed > 0 ? parsedSpeed : fallbackDuration;
        return (
          <TopMenuMarquee
            key={item.id}
            items={displayItems}
            className={commonClasses}
            style={style}
            normalizedMaxWidth={normalizedMaxWidth}
            animationDuration={animationDuration}
          />
        );
      }

      case MenuType.CUSTOM_HTML: {
        if (!translation?.customHtml) {
          return null;
        }

        return (
          <div
            key={item.id}
            className={clsx(commonClasses, 'max-w-full')}
            style={style}
            dangerouslySetInnerHTML={{ __html: translation.customHtml }}
          />
        );
      }

      default: {
        const href = buildHref(item);
        if (!href) {
          return null;
        }

        const isExternal = item.target === MenuTarget.BLANK || /^https?:/i.test(href);
        const content = (
          <span className="flex items-center gap-2">
            {iconNode}
            <span className="font-medium">{label || href}</span>
          </span>
        );

        if (isExternal) {
          return (
            <a
              key={item.id}
              href={href}
              target={item.target || '_self'}
              rel={item.target === MenuTarget.BLANK ? 'noopener noreferrer' : undefined}
              className={commonClasses}
              style={style}
            >
              {content}
            </a>
          );
        }

        return (
          <Link key={item.id} href={href} target={item.target || undefined} className={commonClasses} style={style}>
            {content}
          </Link>
        );
      }
    }
  };

  return (
    <div className="bg-slate-900 text-gray-100 border-b border-slate-800/60 shadow-sm">
      <Container className="py-1">
        <div className="flex w-full flex-wrap items-center justify-between gap-2 md:gap-3">
          {isLoading && items.length === 0 ? (
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <span className="h-2.5 w-24 rounded-full bg-slate-700/70 animate-pulse" />
              <span className="h-2.5 w-16 rounded-full bg-slate-700/70 animate-pulse" />
              <span className="h-2.5 w-20 rounded-full bg-slate-700/70 animate-pulse" />
            </div>
          ) : (
            items.map((item) => renderMenuItem(item))
          )}
        </div>
      </Container>
    </div>
  );
};

export default TopMenuBar;
