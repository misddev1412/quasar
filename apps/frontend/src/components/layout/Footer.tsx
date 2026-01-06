'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { FiUsers, FiEye, FiTrendingUp, FiClock } from 'react-icons/fi';
import SectionContainer from '../sections/SectionContainer';
import { useSettings } from '../../hooks/useSettings';
import useMenu from '../../hooks/useMenu';
import {
  FooterConfig,
  FooterSocialLink,
  FooterSocialType,
  FooterWidgetConfig,
  DEFAULT_VISITOR_ANALYTICS_CONFIG,
  VisitorAnalyticsMetricType,
  createFooterConfig,
  FooterMenuTypographyConfig,
  FooterMenuFontSize,
  FooterMenuFontWeight,
  FooterMenuTextTransform,
  DEFAULT_MENU_TYPOGRAPHY,
} from '@shared/types/footer.types';
import { MenuTarget } from '@shared/enums/menu.enums';
import { trpc } from '../../utils/trpc';

interface FooterProps {
  className?: string;
  logo?: React.ReactNode;
  brandName?: string;
  description?: string;
  copyright?: string;
  configOverride?: FooterConfig | null;
}

interface FooterMenuLink {
  id: string;
  label: string;
  href: string;
  target?: MenuTarget;
}

interface FooterMenuColumn {
  id: string;
  title?: string;
  links: FooterMenuLink[];
}

interface VisitorStatsCard {
  id: string;
  label: string;
  value: string;
  helper?: string;
  icon: React.ComponentType<{ className?: string }>;
  isTextValue?: boolean;
  valueTitle?: string;
}

const SOCIAL_ICON_MAP: Record<FooterSocialType, JSX.Element> = {
  facebook: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M24 12.073C24 5.373 18.627 0 12 0S0 5.373 0 12.073C0 18.062 4.388 23.027 10.125 23.927V15.542H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  twitter: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 9.864 9.864 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067A13.995 13.995 0 007.557 21.09c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
    </svg>
  ),
  instagram: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm0 2h10c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3zm9 2a1 1 0 100 2 1 1 0 000-2zM12 7a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6z" />
    </svg>
  ),
  youtube: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10 15l5.19-3L10 9v6zm12-3c0 2.5-.2 4-0.44 4.9a2.98 2.98 0 01-2.1 2.1C18.55 19 12 19 12 19s-6.55 0-7.46-.24a2.98 2.98 0 01-2.1-2.1C2.2 16 2 14.5 2 12s.2-4 .44-4.9a2.98 2.98 0 012.1-2.1C5.45 5 12 5 12 5s6.55 0 7.46.24a2.98 2.98 0 012.1 2.1C21.8 8 22 9.5 22 12z" />
    </svg>
  ),
  linkedin: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.065 2.065 0 110-4.13 2.065 2.065 0 010 4.13zm1.782 13.019H3.555V9h3.564v11.452z" />
    </svg>
  ),
  tiktok: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 7.443a5.94 5.94 0 01-3.873-1.365v6.488a6.742 6.742 0 01-6.75 6.734A6.421 6.421 0 014 12.88 6.422 6.422 0 0110.377 6.5c.185 0 .366.014.547.028v3.297a3.21 3.21 0 00-.547-.049 3.137 3.137 0 00-3.131 3.104A3.136 3.136 0 0010.374 16a3.46 3.46 0 003.439-3.38V2h3.312c.2 1.986 1.79 3.555 3.875 3.675V7.443z" />
    </svg>
  ),
  github: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.373 0 12a12.004 12.004 0 008.207 11.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.562 21.8 24 17.302 24 12 24 5.373 18.627 0 12 0z" />
    </svg>
  ),
  custom: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2l2.09 6.26H20l-5.045 3.67L16.18 18 12 14.771 7.82 18l1.225-6.07L4 8.26h5.91z" />
    </svg>
  ),
};

export const defaultSocialIcons = SOCIAL_ICON_MAP;

const isExternalLink = (href?: string) => {
  if (!href) return false;
  return /^https?:\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:');
};

const buildColumnsFromMenu = (
  items: ReturnType<typeof useMenu>['navigationItems'],
  config: FooterConfig
): FooterMenuColumn[] => {
  if (!items || items.length === 0) {
    return [];
  }

  const hasNestedChildren = items.some((item) => item.children && item.children.length > 0);
  if (hasNestedChildren && config.menuLayout === 'columns') {
    return items.map((item) => ({
      id: item.id,
      title: item.name,
      links: (item.children && item.children.length > 0 ? item.children : [item]).map((child) => ({
        id: child.id,
        label: child.name,
        href: child.href,
        target: child.target,
      })),
    }));
  }

  const columnsCount = Math.max(1, config.columnsPerRow || 3);
  const perColumn = Math.max(1, Math.ceil(items.length / columnsCount));
  const columns: FooterMenuColumn[] = [];

  for (let columnIndex = 0; columnIndex < columnsCount; columnIndex += 1) {
    const start = columnIndex * perColumn;
    const end = start + perColumn;
    const slice = items.slice(start, end);
    if (!slice.length) continue;

    columns.push({
      id: `column-${columnIndex}`,
      links: slice.map((item) => ({
        id: item.id,
        label: item.name,
        href: item.href,
        target: item.target,
      })),
    });
  }

  return columns;
};

const getGridClass = (columnsPerRow?: number): string => {
  const count = Math.max(1, Math.min(4, columnsPerRow ?? 3));
  switch (count) {
    case 1:
      return 'grid grid-cols-1 gap-8';
    case 2:
      return 'grid grid-cols-1 sm:grid-cols-2 gap-8';
    case 3:
      return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8';
    default:
      return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8';
  }
};

const getVisitorAnalyticsGridClass = (columns: number): string => {
  const count = Math.max(1, Math.min(4, Math.round(columns) || 1));
  switch (count) {
    case 1:
      return 'grid grid-cols-1 gap-4';
    case 2:
      return 'grid grid-cols-1 gap-4 sm:grid-cols-2';
    case 3:
      return 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3';
    default:
      return 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4';
  }
};

const clampWidgetHeight = (value?: number) => {
  if (!value || Number.isNaN(value)) {
    return 280;
  }
  return Math.min(640, Math.max(160, Math.round(value)));
};

const clampLogoSize = (value?: number) => {
  if (!value || Number.isNaN(value)) {
    return 48;
  }
  return Math.min(640, Math.max(24, Math.round(value)));
};

const MENU_FONT_SIZE_CLASS_MAP: Record<FooterMenuFontSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

const MENU_FONT_WEIGHT_CLASS_MAP: Record<FooterMenuFontWeight, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const MENU_TEXT_TRANSFORM_CLASS_MAP: Record<FooterMenuTextTransform, string> = {
  none: 'normal-case',
  uppercase: 'uppercase',
  capitalize: 'capitalize',
  sentence: 'normal-case',
};

const toLocalizedLower = (value: string) => value.toLocaleLowerCase('vi-VN');
const toLocalizedUpper = (value: string) => value.toLocaleUpperCase('vi-VN');

const toTitleCase = (value: string) =>
  value.replace(/\S+/g, (word) => {
    const firstChar = word.charAt(0);
    if (!firstChar) return word;
    const rest = word.slice(1);
    return `${toLocalizedUpper(firstChar)}${toLocalizedLower(rest)}`;
  });

const toSentenceCase = (value: string) => {
  if (!value) return value;
  const firstNonSpaceIndex = value.search(/\S/);
  if (firstNonSpaceIndex === -1) {
    return value;
  }
  const prefix = value.slice(0, firstNonSpaceIndex);
  const firstChar = value.charAt(firstNonSpaceIndex);
  const rest = value.slice(firstNonSpaceIndex + 1);
  return `${prefix}${toLocalizedUpper(firstChar)}${toLocalizedLower(rest)}`;
};

const transformMenuLabel = (label: string, typography: FooterMenuTypographyConfig) => {
  if (!label) return '';
  switch (typography.textTransform) {
    case 'uppercase':
      return toLocalizedUpper(label);
    case 'capitalize':
      return toTitleCase(toLocalizedLower(label));
    case 'sentence':
      return toSentenceCase(label);
    default:
      return label;
  }
};

const normalizeFacebookTabs = (tabs?: string) => {
  if (!tabs) {
    return 'timeline';
  }
  return tabs
    .split(',')
    .map((tab) => tab.trim())
    .filter(Boolean)
    .join(',') || 'timeline';
};

const buildFacebookEmbedUrl = (pageUrl: string, tabs: string, height: number) => {
  const params = new URLSearchParams({
    href: pageUrl,
    tabs: normalizeFacebookTabs(tabs),
    width: '500',
    height: String(height),
    small_header: 'false',
    adapt_container_width: 'true',
    hide_cover: 'false',
    show_facepile: 'true',
  });
  return `https://www.facebook.com/plugins/page.php?${params.toString()}`;
};

const Footer: React.FC<FooterProps> = ({
  className,
  logo: propLogo,
  brandName: propBrandName = 'Brand',
  description: propDescription,
  copyright: propCopyright,
  configOverride,
}) => {
  const { getSetting, getFooterConfig } = useSettings();
  const footerConfig = configOverride ? createFooterConfig(configOverride) : getFooterConfig();
  const visitorAnalyticsConfig = footerConfig.visitorAnalytics ?? DEFAULT_VISITOR_ANALYTICS_CONFIG;
  const shouldFetchVisitorStats = visitorAnalyticsConfig.enabled !== false;
  const { navigationItems } = useMenu('footer');
  const visitorStatsQuery = (trpc as any).clientVisitorStats.getPublicStats.useQuery(
    {},
    {
      staleTime: 60 * 1000,
      cacheTime: 5 * 60 * 1000,
      enabled: shouldFetchVisitorStats,
    }
  );
  const visitorStatsPayload = visitorStatsQuery?.data;
  const visitorStats =
    visitorStatsPayload && typeof visitorStatsPayload === 'object' && 'data' in visitorStatsPayload
      ? (visitorStatsPayload as any).data
      : visitorStatsPayload;
  const totalVisitors =
    visitorStats && typeof visitorStats.totalVisitors === 'number'
      ? visitorStats.totalVisitors
      : null;
  const totalPageViews =
    visitorStats && typeof visitorStats.totalPageViews === 'number'
      ? visitorStats.totalPageViews
      : null;
  const topPages = Array.isArray(visitorStats?.topPages) ? visitorStats.topPages : [];
  const lastUpdated = visitorStats?.lastUpdated;

  const customBackgroundColor = footerConfig.backgroundColor?.trim() || '';
  const customTextColor = footerConfig.textColor?.trim() || '';
  const fallbackFooterLogo = getSetting('site.footer_logo', '');
  const siteLogoUrl = getSetting('site.logo', '');
  const resolvedLogoUrl = (footerConfig.logoUrl || fallbackFooterLogo || siteLogoUrl || '').trim();
  const siteName = getSetting('site.name', getSetting('site_name', propBrandName));
  const brandTitle = footerConfig.brandTitle?.trim() || siteName;
  const brandDescription = footerConfig.brandDescription || propDescription;
  const brandDescriptionColor = footerConfig.brandDescriptionColor?.trim();
  const getTextStyle = (opacity = 1): React.CSSProperties | undefined =>
    customTextColor ? { color: customTextColor, opacity } : undefined;
  const brandDescriptionStyle = brandDescriptionColor ? { color: brandDescriptionColor } : getTextStyle(0.8);
  const variant = footerConfig.variant ?? 'columns';
  const theme = footerConfig.theme ?? 'dark';
  const shouldShowLogo = footerConfig.showBrandLogo !== false;
  const shouldShowBrandTitle = footerConfig.showBrandTitle !== false;
  const brandLayout = footerConfig.brandLayout === 'stacked' ? 'stacked' : 'inline';
  const logoSize = clampLogoSize(footerConfig.logoSize);
  const isFullWidthLogo = footerConfig.logoFullWidth === true;
  const copyrightText =
    propCopyright || `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`;
  const linkStyle = customTextColor ? { color: customTextColor } : undefined;
  const rootStyle =
    customBackgroundColor || customTextColor
      ? ({
        ...(customBackgroundColor ? { backgroundColor: customBackgroundColor } : {}),
        ...(customTextColor ? { color: customTextColor } : {}),
      } as React.CSSProperties)
      : undefined;

  const socialLinks = useMemo(
    () =>
      (footerConfig.socialLinks || [])
        .filter((link) => link?.isActive !== false && link.url)
        .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0)),
    [footerConfig.socialLinks]
  );

  const extraLinks = useMemo(
    () =>
      (footerConfig.extraLinks || [])
        .filter((link) => link?.isActive !== false && link.url)
        .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0)),
    [footerConfig.extraLinks]
  );

  const inlineMenuLinks: FooterMenuLink[] = useMemo(
    () =>
      (navigationItems || []).map((item) => ({
        id: item.id,
        label: item.name,
        href: item.href,
        target: item.target,
      })),
    [navigationItems]
  );

  const menuColumns = useMemo(
    () => buildColumnsFromMenu(navigationItems, footerConfig),
    [navigationItems, footerConfig]
  );
  const menuGridClass = getGridClass(footerConfig.columnsPerRow);
  const contentWrapperClass = 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';
  const menuTypography = footerConfig.menuTypography || DEFAULT_MENU_TYPOGRAPHY;
  const menuFontSizeClass =
    MENU_FONT_SIZE_CLASS_MAP[menuTypography.fontSize] || MENU_FONT_SIZE_CLASS_MAP.sm;
  const menuFontWeightClass =
    MENU_FONT_WEIGHT_CLASS_MAP[menuTypography.fontWeight] || MENU_FONT_WEIGHT_CLASS_MAP.normal;
  const menuTextTransformClass =
    MENU_TEXT_TRANSFORM_CLASS_MAP[menuTypography.textTransform] || MENU_TEXT_TRANSFORM_CLASS_MAP.none;

  const themeClasses = theme === 'dark'
    ? {
      background: 'bg-gray-900 text-gray-100',
      border: 'storefront-footer-border',
      subtle: 'text-gray-400',
      link: 'text-gray-300 hover:text-white',
      divider: 'storefront-footer-divider',
      inputBg: 'bg-gray-800/70 text-white placeholder-gray-400',
      inputBorder: 'storefront-footer-input-border focus:ring-blue-400 focus:border-blue-400',
      button: 'bg-white text-gray-900 hover:bg-gray-100',
    }
    : {
      background: 'bg-gray-50 text-gray-900',
      border: 'storefront-footer-border',
      subtle: 'text-gray-600',
      link: 'text-gray-600 hover:text-gray-900',
      divider: 'storefront-footer-divider',
      inputBg: 'bg-white text-gray-900 placeholder-gray-500',
      inputBorder: 'storefront-footer-input-border focus:ring-blue-500 focus:border-blue-500',
      button: 'bg-gray-900 text-white hover:bg-gray-800',
    };

  const footerLogoAltText = getSetting('site.footer_logo_alt') || siteName;
  const footerLogoNode =
    shouldShowLogo &&
    (propLogo ||
      (resolvedLogoUrl ? (
        <img
          src={resolvedLogoUrl}
          alt={footerLogoAltText}
          className="w-full h-auto object-contain"
          style={{ maxWidth: '100%' }}
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
      ) : null));

  const renderNavLink = (link: FooterMenuLink) => {
    if (!link.href) return null;
    const linkClass = clsx(
      'transition-colors',
      themeClasses.link,
      menuFontSizeClass,
      menuFontWeightClass,
      menuTextTransformClass
    );
    const targetProps =
      link.target === MenuTarget.BLANK
        ? { target: '_blank', rel: 'noopener noreferrer' }
        : {};
    const formattedLabel = transformMenuLabel(link.label, menuTypography);

    if (isExternalLink(link.href)) {
      return (
        <a href={link.href} className={linkClass} style={linkStyle} {...targetProps}>
          {formattedLabel}
        </a>
      );
    }

    return (
      <Link href={link.href} className={linkClass} style={linkStyle} {...targetProps}>
        {formattedLabel}
      </Link>
    );
  };

  const renderSocialLinks = (links: FooterSocialLink[]) => {
    if (!links.length) return null;
    return (
      <div className="flex flex-wrap gap-3">
        {links.map((link) => {
          const icon = SOCIAL_ICON_MAP[link.type] || SOCIAL_ICON_MAP.custom;
          return (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={clsx(
                'p-2 rounded-full border transition-colors',
                themeClasses.border,
                theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'
              )}
              style={
                customTextColor
                  ? { color: customTextColor, borderColor: customTextColor }
                  : undefined
              }
              aria-label={link.label}
            >
              {icon}
            </a>
          );
        })}
      </div>
    );
  };

  const renderNewsletterForm = () => {
    if (!footerConfig.showNewsletter) return null;
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold tracking-wide uppercase">
          {footerConfig.newsletterHeading || 'Stay in touch'}
        </h4>
        {footerConfig.newsletterDescription && (
          <p className={clsx('text-sm', themeClasses.subtle)} style={getTextStyle(0.8)}>
            {footerConfig.newsletterDescription}
          </p>
        )}
        <form
          className="flex flex-col sm:flex-row gap-3"
          onSubmit={(event) => event.preventDefault()}
        >
          <input
            type="email"
            required
            placeholder="you@example.com"
            className={clsx(
              'w-full rounded-md px-4 py-2 text-sm border focus:outline-none focus:ring-2',
              themeClasses.inputBg,
              themeClasses.inputBorder
            )}
          />
          <button
            type="submit"
            className={clsx(
              'rounded-md px-4 py-2 text-sm font-semibold transition-colors',
              themeClasses.button
            )}
          >
            Subscribe
          </button>
        </form>
      </div>
    );
  };

  const renderEmbeddedWidget = () => {
    const widget = footerConfig.widget;
    if (!widget?.enabled) {
      return null;
    }
    const height = clampWidgetHeight(widget.height);
    const sharedDescription = widget.description ? (
      <p className={clsx('text-sm', themeClasses.subtle)} style={getTextStyle(0.8)}>
        {widget.description}
      </p>
    ) : null;
    const shouldShowGoogle =
      (typeof widget.showGoogleMap === 'boolean'
        ? widget.showGoogleMap
        : widget.type !== 'facebook_page') && Boolean(widget.googleMapEmbedUrl);
    const shouldShowFacebook =
      (typeof widget.showFacebookPage === 'boolean'
        ? widget.showFacebookPage
        : widget.type === 'facebook_page') && Boolean(widget.facebookPageUrl);

    if (!shouldShowGoogle && !shouldShowFacebook) {
      return null;
    }

    const sections: React.ReactNode[] = [];
    if (shouldShowGoogle && widget.googleMapEmbedUrl) {
      sections.push(
        <div
          key="google-map"
          className={clsx('overflow-hidden rounded-xl border', themeClasses.border)}
          style={customTextColor ? { borderColor: customTextColor } : undefined}
        >
          <iframe
            src={widget.googleMapEmbedUrl}
            width="100%"
            height={height}
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            title={widget.title || 'Google Maps embed'}
          />
        </div>
      );
    }

    if (shouldShowFacebook && widget.facebookPageUrl) {
      const tabs = widget.facebookTabs || 'timeline';
      const fbSrc = buildFacebookEmbedUrl(widget.facebookPageUrl, tabs, height);
      sections.push(
        <div
          key="facebook-page"
          className={clsx('overflow-hidden rounded-xl border', themeClasses.border)}
          style={customTextColor ? { borderColor: customTextColor } : undefined}
        >
          <iframe
            src={fbSrc}
            width="100%"
            height={height}
            style={{ border: 'none', overflow: 'hidden' }}
            scrolling="no"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            title={widget.title || 'Facebook fanpage'}
          />
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {widget.title && (
          <h4 className="text-sm font-semibold uppercase tracking-wide">{widget.title}</h4>
        )}
        {sharedDescription}
        <div className="space-y-4">{sections}</div>
      </div>
    );
  };

  const renderBrandSection = () => {
    const shouldRenderHeading = Boolean(footerLogoNode) || shouldShowBrandTitle;
    const brandHeadingClass =
      brandLayout === 'stacked'
        ? 'flex flex-col gap-3 items-start'
        : 'flex items-center gap-3 flex-wrap';
    const logoWrapperStyle = (isFullWidthLogo
      ? { width: '100%' }
      : { width: logoSize }) as React.CSSProperties;
    return (
      <div className="space-y-4">
        {shouldRenderHeading && (
          <div className={brandHeadingClass}>
            {footerLogoNode && (
              <div className={clsx(isFullWidthLogo ? 'w-full' : 'shrink-0')} style={logoWrapperStyle}>
                {footerLogoNode}
              </div>
            )}
            {shouldShowBrandTitle && (
              <p className="text-lg font-semibold" style={getTextStyle()}>
                {brandTitle}
              </p>
            )}
          </div>
        )}
        {footerConfig.showBrandDescription && brandDescription && (
          <p className={clsx('text-sm max-w-md', themeClasses.subtle)} style={brandDescriptionStyle}>
            {brandDescription}
          </p>
        )}
        {footerConfig.customHtml && (
          <div
            className={clsx('text-sm leading-relaxed', themeClasses.subtle)}
            style={brandDescriptionStyle}
            dangerouslySetInnerHTML={{ __html: footerConfig.customHtml }}
          />
        )}
        {renderNewsletterForm()}
        {renderSocialLinks(socialLinks)}
        {renderEmbeddedWidget()}
      </div>
    );
  };

  const renderFooterBottom = () => (
    <div
      className={clsx(
        'pt-6 border-t flex flex-col gap-4 md:flex-row md:items-center md:justify-between',
        themeClasses.divider
      )}
    >
      <p className={clsx('text-sm', themeClasses.subtle)} style={getTextStyle(0.75)}>
        {copyrightText}
      </p>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        {extraLinks.map((link) => (
          <span key={link.id}>{renderNavLink({ id: link.id, label: link.label, href: link.url })}</span>
        ))}
      </div>
    </div>
  );

  const renderVisitorStatsSection = () => {
    if (!visitorAnalyticsConfig?.enabled) {
      return null;
    }

    const isDark = theme === 'dark';
    const analyticsBackgroundColor =
      visitorAnalyticsConfig.backgroundColor?.trim() || customBackgroundColor || '';
    const sectionBorderClass = isDark ? 'border-gray-800/70' : 'border-gray-200';
    const cardBgClass = isDark
      ? 'bg-gray-900/70 text-gray-100 border-white/10'
      : 'bg-white text-gray-900 border-gray-200';
    const labelClass = isDark ? 'text-gray-400' : 'text-gray-600';
    const helperClass = 'text-gray-500';
    const iconBaseClass = isDark
      ? 'bg-white/10 text-white border border-white/15'
      : 'bg-blue-50 text-blue-600 border border-blue-100';
    const sectionBackgroundClass = analyticsBackgroundColor
      ? ''
      : isDark
        ? 'bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950'
        : 'bg-gradient-to-r from-white via-gray-50 to-white';

    const topPage = topPages[0];
    const lastUpdatedDate = lastUpdated ? new Date(lastUpdated) : null;
    const topPageViews =
      topPage && typeof topPage.views === 'number'
        ? topPage.views
        : topPage?.views && !Number.isNaN(Number(topPage.views))
          ? Number(topPage.views)
          : null;

    const metricBuilders: Record<VisitorAnalyticsMetricType, () => VisitorStatsCard> = {
      visitors: () => ({
        id: 'visitors',
        label: 'Lượt truy cập',
        value: totalVisitors !== null ? totalVisitors.toLocaleString('vi-VN') : '—',
        helper: '7 ngày gần nhất',
        icon: FiUsers,
      }),
      pageViews: () => ({
        id: 'pageViews',
        label: 'Lượt xem trang',
        value: totalPageViews !== null ? totalPageViews.toLocaleString('vi-VN') : '—',
        helper: totalPageViews !== null ? 'Trong cùng kỳ' : 'Chưa có dữ liệu',
        icon: FiEye,
      }),
      topPage: () => ({
        id: 'topPage',
        label: 'Trang nổi bật',
        value: topPage ? (topPage.title || topPage.url || 'Trang chưa đặt tên') : 'Đang cập nhật',
        helper:
          topPageViews !== null ? `${topPageViews.toLocaleString('vi-VN')} lượt xem` : 'Chưa có thống kê',
        icon: FiTrendingUp,
        isTextValue: true,
        valueTitle: topPage ? (topPage.title || topPage.url) : undefined,
      }),
      lastUpdated: () => ({
        id: 'updated',
        label: 'Cập nhật',
        value: lastUpdatedDate
          ? lastUpdatedDate.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          })
          : 'Đang cập nhật',
        helper: lastUpdatedDate
          ? lastUpdatedDate.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
          : '',
        icon: FiClock,
        isTextValue: true,
        valueTitle: lastUpdatedDate?.toLocaleString('vi-VN', {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
      }),
    };

    const rawCards = visitorAnalyticsConfig.cards?.length
      ? visitorAnalyticsConfig.cards
      : DEFAULT_VISITOR_ANALYTICS_CONFIG.cards;

    const metrics: VisitorStatsCard[] = rawCards
      .map((card, index) => {
        const metricKey = card?.metric as VisitorAnalyticsMetricType;
        const builder = metricBuilders[metricKey];
        if (!builder) {
          return null;
        }
        const built = builder();
        return {
          ...built,
          id: card?.id || `${metricKey}-${index}`,
        };
      })
      .filter((card): card is VisitorStatsCard => Boolean(card));

    const desiredColumns = Math.max(
      1,
      Math.min(4, visitorAnalyticsConfig.columns || metrics.length || DEFAULT_VISITOR_ANALYTICS_CONFIG.columns)
    );
    const visibleCards = metrics.slice(0, desiredColumns);

    if (!visibleCards.length) {
      return null;
    }

    const gridClass = getVisitorAnalyticsGridClass(Math.min(visibleCards.length, desiredColumns));

    const sectionStyle =
      analyticsBackgroundColor || customTextColor
        ? ({
          ...(analyticsBackgroundColor ? { backgroundColor: analyticsBackgroundColor } : {}),
          ...(customTextColor ? { color: customTextColor } : {}),
        } as React.CSSProperties)
        : undefined;

    return (
      <section
        className={clsx('w-full border-b', sectionBackgroundClass, sectionBorderClass)}
        style={sectionStyle}
      >
        <SectionContainer disablePadding>
          <div className={clsx(contentWrapperClass, 'py-6')}>
            <div className={gridClass}>
              {visibleCards.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className={clsx(
                      'flex h-full flex-col gap-2 rounded-2xl border px-4 py-3 shadow-sm',
                      cardBgClass
                    )}
                    style={customTextColor ? { borderColor: customTextColor } : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <div className={clsx('flex h-10 w-10 items-center justify-center rounded-full', iconBaseClass)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <p className={clsx('text-xs font-semibold uppercase tracking-wide mb-0 mt-0', labelClass)}>
                          {item.label}
                        </p>
                        <p
                          className={clsx(
                            'font-semibold leading-tight mb-0 mt-0',
                            item.isTextValue ? 'text-base truncate' : 'text-xl'
                          )}
                          title={item.valueTitle}
                        >
                          {item.value}
                        </p>
                      </div>
                    </div>
                    {item.helper && (
                      <p className={clsx('text-xs', helperClass)}>{item.helper}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </SectionContainer>
      </section>
    );
  };

  const renderColumnsLayout = () => (
    <footer
      className={clsx(themeClasses.background, 'border-t', themeClasses.border, className)}
      style={rootStyle}
    >
      <div className={clsx(contentWrapperClass, 'py-12 space-y-10')}>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">{renderBrandSection()}</div>
          <div className={clsx('lg:col-span-8', menuGridClass)}>
            {menuColumns.length > 0 ? (
              menuColumns.map((column) => (
                <div key={column.id} className="space-y-3">
                  {column.title && <h3 className="text-sm font-semibold uppercase tracking-wide">{column.title}</h3>}
                  <ul className="space-y-2">
                    {column.links.map((link) => (
                      <li key={link.id}>{renderNavLink(link)}</li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <div className={clsx('text-sm', themeClasses.subtle)} style={getTextStyle(0.75)}>
                No footer links yet. Manage them from the admin dashboard.
              </div>
            )}
          </div>
        </div>

        {renderFooterBottom()}
      </div>
    </footer>
  );

  const renderSplitLayout = () => (
    <footer
      className={clsx(themeClasses.background, 'border-t', themeClasses.border, className)}
      style={rootStyle}
    >
      <div className={clsx(contentWrapperClass, 'py-12 space-y-10')}>
        {renderBrandSection()}
        <div className={menuGridClass}>
          {menuColumns.length > 0 ? (
            menuColumns.map((column) => (
              <div key={column.id} className="space-y-3">
                {column.title && (
                  <h3 className="text-sm font-semibold uppercase tracking-wide">{column.title}</h3>
                )}
                <ul className="space-y-2">
                  {column.links.map((link) => (
                    <li key={link.id}>{renderNavLink(link)}</li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <div className={clsx('text-sm', themeClasses.subtle)} style={getTextStyle(0.75)}>
              No footer links yet. Manage them from the admin dashboard.
            </div>
          )}
        </div>
        {renderFooterBottom()}
      </div>
    </footer>
  );

  const renderSimpleLayout = () => (
    <footer
      className={clsx(themeClasses.background, 'border-t', themeClasses.border, className)}
      style={rootStyle}
    >
      <div className={clsx(contentWrapperClass, 'py-8 space-y-6')}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            {footerLogoNode && <div className="w-10 h-10 shrink-0">{footerLogoNode}</div>}
            <p className={clsx('text-sm', themeClasses.subtle)} style={getTextStyle(0.75)}>
              {copyrightText}
            </p>
          </div>
          {inlineMenuLinks.length > 0 && (
            <nav className="flex flex-wrap items-center gap-4 text-sm">
              {inlineMenuLinks.map((link) => (
                <span key={link.id}>{renderNavLink(link)}</span>
              ))}
            </nav>
          )}
          {renderSocialLinks(socialLinks)}
        </div>
      </div>
    </footer>
  );

  const footerContent =
    variant === 'simple'
      ? renderSimpleLayout()
      : variant === 'split'
        ? renderSplitLayout()
        : renderColumnsLayout();

  return (
    <>
      {renderVisitorStatsSection()}
      {footerContent}
    </>
  );
};

export { Footer };
export default Footer;
