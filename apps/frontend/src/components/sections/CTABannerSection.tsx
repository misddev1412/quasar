'use client';

import React, { CSSProperties } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import type { SectionTranslationContent } from './HeroSlider';
import SectionContainer from './SectionContainer';

export interface CTAActionConfig {
  label?: string;
  href?: string;
  openInNewTab?: boolean;
  target?: '_self' | '_blank';
  url?: string;
  text?: string;
}

export interface CTABannerConfig {
  layout?: 'full-width' | 'container';
  style?: 'center' | 'left' | 'right';
  background?: 'primary' | 'secondary' | 'dark' | 'gradient' | 'light' | 'custom';
  backgroundColor?: string;
  backgroundImage?: string;
  overlayOpacity?: number;
  accentColor?: string;
  badge?: string;
  textColor?: string;
  borderRadius?: string;
  primaryCta?: CTAActionConfig | Record<string, unknown>;
  secondaryCta?: CTAActionConfig | Record<string, unknown>;
  ctaLabel?: string;
  ctaUrl?: string;
}

interface CTABannerSectionProps {
  config: CTABannerConfig;
  translation?: SectionTranslationContent | null;
}

const backgroundVariants: Record<string, string> = {
  gradient: 'bg-gradient-to-br from-sky-500 via-indigo-600 to-violet-700 text-white dark:text-white',
  primary: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white dark:text-white',
  secondary: 'bg-gradient-to-r from-rose-500 via-fuchsia-500 to-orange-500 text-white dark:text-white',
  dark: 'bg-slate-900 text-white',
  light: 'bg-white text-gray-900 border border-gray-100 shadow-xl dark:bg-gray-900 dark:text-gray-100 dark:border-gray-800',
  custom: 'text-white dark:text-white',
};

const clampOpacity = (value?: number): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0.5;
  }
  if (value > 1) {
    return Math.min(Math.max(value / 100, 0), 1);
  }
  return Math.min(Math.max(value, 0), 1);
};

const normalizeAction = (action?: unknown): CTAActionConfig | null => {
  if (!action || typeof action !== 'object') {
    return null;
  }
  const raw = action as CTAActionConfig & Record<string, unknown>;
  const labelCandidates = [raw.label, raw.text];
  const hrefCandidates = [raw.href, raw.url];
  const label = labelCandidates.find((value) => typeof value === 'string' && value.trim().length > 0) as string | undefined;
  const href = hrefCandidates.find((value) => typeof value === 'string' && value.trim().length > 0) as string | undefined;
  if (!label && !href) {
    return null;
  }
  return {
    label: label?.trim(),
    href: href?.trim(),
    openInNewTab: raw.openInNewTab === true || raw.target === '_blank',
  };
};

const buildLegacyAction = (label?: unknown, href?: unknown): CTAActionConfig | null => {
  const resolvedLabel = typeof label === 'string' && label.trim().length > 0 ? label.trim() : undefined;
  const resolvedHref = typeof href === 'string' && href.trim().length > 0 ? href.trim() : undefined;
  if (!resolvedLabel && !resolvedHref) {
    return null;
  }
  return {
    label: resolvedLabel,
    href: resolvedHref,
  };
};

export const CTABannerSection: React.FC<CTABannerSectionProps> = ({ config, translation }) => {
  const { t } = useTranslation();
  const layout = config.layout === 'container' ? 'container' : 'full-width';
  const variant = config.background || 'gradient';
  const backgroundClass = backgroundVariants[variant] || backgroundVariants.gradient;
  const isLightVariant = variant === 'light' || variant === 'custom';

  const inlineBackgroundStyle: CSSProperties = {};
  if (config.backgroundColor && config.backgroundColor.trim() !== '') {
    inlineBackgroundStyle.background = config.backgroundColor;
  }
  const hasBackgroundImage = Boolean(config.backgroundImage && config.backgroundImage.trim() !== '');
  if (hasBackgroundImage) {
    inlineBackgroundStyle.backgroundImage = `url(${config.backgroundImage})`;
    inlineBackgroundStyle.backgroundSize = 'cover';
    inlineBackgroundStyle.backgroundPosition = 'center';
  }
  const borderRadiusValue =
    typeof config.borderRadius === 'string' ? config.borderRadius.trim() : '';
  if (borderRadiusValue) {
    inlineBackgroundStyle.borderRadius = borderRadiusValue;
  }
  const containerRadiusClass = borderRadiusValue ? '' : 'rounded-3xl';

  const overlayOpacity = clampOpacity(config.overlayOpacity);
  // null means field is hidden by admin, undefined/empty means visible but no value
  const headingText = translation?.title === null ? '' : (translation?.title?.trim() || t('sections.cta_banner.default_title'));
  const descriptionText = translation?.description === null ? '' : (translation?.description?.trim() || t('sections.cta_banner.default_description'));
  const badgeText = translation?.subtitle === null ? '' : ((config.badge && config.badge.trim()) || translation?.subtitle || '');
  const accentColor = config.accentColor?.trim() || undefined;
  const textColor = config.textColor?.trim();

  const normalizedPrimary =
    normalizeAction(config.primaryCta) ||
    buildLegacyAction(config.ctaLabel, config.ctaUrl);
  const normalizedSecondary = normalizeAction(config.secondaryCta);

  const primaryAction = normalizedPrimary || {
    label: t('sections.cta_banner.primary_label'),
    href: '#',
  };
  const secondaryAction = normalizedSecondary || null;

  const alignment = config.style === 'left' || config.style === 'right' ? config.style : 'center';
  const textAlignClass =
    alignment === 'left'
      ? 'items-start text-left'
      : alignment === 'right'
        ? 'items-end text-right ml-auto'
        : 'items-center text-center mx-auto';
  const actionAlignmentClass =
    alignment === 'left'
      ? 'justify-start'
      : alignment === 'right'
        ? 'justify-end'
        : 'justify-center';
  const contentWidthClass = layout === 'full-width' ? 'max-w-5xl' : 'max-w-4xl';
  const paddingClass = layout === 'full-width' ? 'px-6 sm:px-12 lg:px-20 py-16' : 'px-6 sm:px-10 py-14';
  const headingStyle: CSSProperties | undefined = textColor ? { color: textColor } : undefined;
  const descriptionStyle: CSSProperties | undefined = textColor ? { color: textColor } : undefined;

  const badgeStyle: CSSProperties | undefined = accentColor
    ? {
      borderColor: accentColor,
      color: accentColor,
      backgroundColor: `${accentColor}1A`,
    }
    : undefined;

  const primaryButtonStyle: CSSProperties | undefined = accentColor
    ? { backgroundColor: accentColor, color: '#0f172a' }
    : undefined;

  const renderLink = (action: CTAActionConfig, variantType: 'primary' | 'secondary') => {
    const href = action.href && action.href.trim().length > 0 ? action.href : '#';
    const label =
      (action.label && action.label.trim().length > 0 ? action.label : undefined) ||
      (variantType === 'primary' ? t('sections.cta_banner.primary_label') : t('sections.cta_banner.secondary_label'));
    const buttonClass =
      variantType === 'primary'
        ? isLightVariant
          ? 'bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200'
          : 'bg-white text-gray-900 hover:bg-gray-100'
        : isLightVariant
          ? 'border border-gray-300 text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800'
          : 'border border-white/40 bg-white/10 text-white hover:bg-white/20';

    const styleOverride = variantType === 'primary' ? primaryButtonStyle : undefined;

    return (
      <Link
        key={`${variantType}-${label}`}
        href={href}
        target={action.openInNewTab ? '_blank' : undefined}
        rel={action.openInNewTab ? 'noreferrer' : undefined}
        className={`inline-flex items-center rounded-full px-6 py-3 text-sm font-semibold transition-colors ${buttonClass}`}
        style={styleOverride}
      >
        {label}
      </Link>
    );
  };

  const content = (
    <div className={`relative overflow-hidden ${containerRadiusClass} ${backgroundClass}`} style={inlineBackgroundStyle}>
      {hasBackgroundImage && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `rgba(15, 23, 42, ${overlayOpacity})` }}
        />
      )}
      <div className={`relative z-10 ${paddingClass}`}>
        <div className={`flex w-full flex-col gap-6 ${textAlignClass} ${contentWidthClass}`}>
          {badgeText && (
            <span
              className={`inline-flex items-center rounded-full border px-4 py-1 text-xs font-semibold tracking-[0.3em] ${isLightVariant ? 'text-gray-600 border-gray-200 bg-gray-100/70 dark:text-gray-300 dark:border-gray-700 dark:bg-gray-800/60' : 'text-white/75 border-white/30 bg-white/10'}`}
              style={badgeStyle}
            >
              {badgeText.toUpperCase()}
            </span>
          )}
          {headingText && (
            <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight ${isLightVariant ? 'text-gray-900 dark:text-gray-100' : 'text-white'}`} style={headingStyle}>
              {headingText}
            </h2>
          )}
          {descriptionText && (
            <p
              className={`text-lg ${isLightVariant ? 'text-gray-600 dark:text-gray-300' : 'text-white/80'}`}
              style={descriptionStyle}
            >
              {descriptionText}
            </p>
          )}
          <div className={`mt-4 flex flex-wrap gap-3 ${actionAlignmentClass}`}>
            {renderLink(primaryAction, 'primary')}
            {secondaryAction && renderLink(secondaryAction, 'secondary')}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-4 lg:py-16 dark:bg-gray-950" style={{ backgroundColor: 'var(--storefront-surface)' }}>
      {layout === 'container' ? (
        <SectionContainer className="max-w-6xl">{content}</SectionContainer>
      ) : (
        <SectionContainer fullWidth disablePadding>{content}</SectionContainer>
      )}
    </section>
  );
};

export default CTABannerSection;
