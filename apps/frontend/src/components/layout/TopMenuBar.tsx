'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Avatar, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/react';
import { MenuItem, MenuTranslation, useMenu } from '../../hooks/useMenu';
import { MenuTarget, MenuType, TopMenuTimeFormat } from '@shared/enums/menu.enums';
import Container from '../common/Container';
import UnifiedIcon from '../common/UnifiedIcon';
import ThemeToggle from '../common/ThemeToggle';
import { useAuth } from '../../contexts/AuthContext';

const TOP_MENU_GROUP = 'top';

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

  if (isLoading) {
    return (
      <div className={clsx(className, 'gap-3')} style={style}>
        {iconNode}
        {label ? <span className="font-medium">{label}</span> : null}
        <span className="h-4 w-16 rounded-full bg-white/30 animate-pulse" />
      </div>
    );
  }

  return (
    <div className={clsx(className, 'gap-3')} style={style}>
      {iconNode}
      {label ? <span className="font-medium">{label}</span> : null}
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <button type="button" className="flex items-center gap-2 text-current font-semibold text-xs">
            {isAuthenticated ? (
              <Avatar
                size="sm"
                classNames={{
                  base: 'w-7 h-7 text-[0.7rem] border border-white/30',
                }}
                src={user?.avatar}
                name={user?.name || user?.email}
                showFallback
                fallback={<UserCircleIcon />}
              />
            ) : (
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/30 text-white/80">
                <UserCircleIcon />
              </span>
            )}
            {!label ? <span className="max-w-[120px] truncate">{triggerLabel}</span> : null}
            <ChevronDownIcon />
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
    const label = getLabel(item) || undefined;
    const translation = getTranslationForLocale(item.translations, normalizedLocale);
    const textColor = item.textColor || undefined;
    const backgroundColor = item.backgroundColor || undefined;
    const borderColor = item.borderColor || undefined;
    const borderWidth = item.borderWidth || undefined;
    const iconNode = item.icon ? <UnifiedIcon icon={item.icon} variant="nav" size={16} color={textColor} /> : null;

    const commonClasses = clsx(
      'flex items-center gap-2 text-xs md:text-sm transition-colors px-2 py-1 rounded-md border border-transparent',
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
        return (
          <div key={item.id} className={clsx(commonClasses, 'gap-3')} style={style}>
            {iconNode}
            {label ? <span className="font-medium">{label}</span> : null}
            <ThemeToggle className="text-gray-100 dark:text-gray-100" size="sm" showLabel={!label && !iconNode} />
          </div>
        );
      }

      case MenuType.USER_PROFILE: {
        return (
          <TopAccountDropdown key={item.id} className={commonClasses} style={style} label={label} iconNode={iconNode} />
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

        const displayItems =
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
        const repeatCount = displayItems.length <= 1 ? 3 : 2;
        const translatePercent = -100 / repeatCount;

        const renderTickerEntry = (entry: (typeof displayItems)[number], entryIndex: number, iterationIndex: number) => {
          const label = entry.label || entry.href || '';
          const href = entry.href;
          const wrapperClasses = 'flex items-center gap-2 pr-6 whitespace-nowrap text-xs md:text-sm';
          const key = `${entry.key}-iter-${iterationIndex}-${entryIndex}`;
          const baseProps = iterationIndex > 0 ? { 'aria-hidden': true, tabIndex: -1 } : {};
          const iconNode =
            entry.iconName ? (
              <UnifiedIcon icon={entry.iconName} variant='nav' size={14} color={entry.iconColor || textColor || undefined} className="text-current" />
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

        const marqueeStyle: React.CSSProperties = { ...style };
        if (normalizedMaxWidth) {
          marqueeStyle.maxWidth = normalizedMaxWidth;
        } else {
          marqueeStyle.flex = '1 1 240px';
        }

        const marqueeTrackStyle: React.CSSProperties = {
          animationDuration: `${animationDuration}s`,
          '--marquee-translate': `${translatePercent}%`,
        };

        const marqueeSequence: React.ReactNode[] = [];
        for (let iterationIndex = 0; iterationIndex < repeatCount; iterationIndex += 1) {
          displayItems.forEach((entry, entryIndex) => {
            marqueeSequence.push(renderTickerEntry(entry, entryIndex, iterationIndex));
          });
        }

        return (
          <div
            key={item.id}
            className={clsx(commonClasses, 'min-w-0 overflow-hidden', { 'flex-1': !normalizedMaxWidth })}
            style={marqueeStyle}
          >
            <div className="relative w-full overflow-hidden">
              <div className="top-menu-marquee-track flex flex-nowrap items-center gap-6" style={marqueeTrackStyle}>
                {marqueeSequence}
              </div>
            </div>
          </div>
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
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
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
