'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

import { useLocale } from 'next-intl';
import { MenuItem, MenuTranslation, useMenu } from '../../hooks/useMenu';
import { MenuTarget, MenuType, TopMenuTimeFormat } from '@shared/enums/menu.enums';
import Container from '../common/Container';
import UnifiedIcon from '../common/UnifiedIcon';

const TOP_MENU_GROUP = 'top';

const getConfigString = (config: Record<string, unknown> | undefined, key: string): string | undefined => {
  if (!config || typeof config !== 'object') {
    return undefined;
  }

  const value = config[key];
  return typeof value === 'string' ? value : undefined;
};

const getNormalizedTel = (value: string) => value.replace(/[^+\d]/g, '');

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
