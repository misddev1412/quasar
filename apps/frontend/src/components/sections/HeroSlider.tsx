'use client';

import React, { CSSProperties, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SectionContainer from './SectionContainer';

export interface HeroSlideConfig {
  id?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

export interface HeroSliderOverlayConfig {
  enabled?: boolean;
  color?: string;
  background?: string;
  opacity?: number;
  opacityPercent?: number;
}

export interface HeroSliderFieldVisibility {
  title?: boolean;
  subtitle?: boolean;
  description?: boolean;
  heroDescription?: boolean;
}

export interface HeroSliderButtonVisibility {
  primary?: boolean;
  secondary?: boolean;
}

export interface HeroSliderConfig {
  slides?: HeroSlideConfig[];
  autoplay?: boolean;
  interval?: number;
  overlay?: HeroSliderOverlayConfig;
  overlayBackground?: string;
  layout?: 'full-width' | 'container';
  fieldVisibility?: HeroSliderFieldVisibility;
  buttonVisibility?: HeroSliderButtonVisibility;
}

export interface SectionTranslationContent {
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  heroDescription?: string | null;
}

interface HeroSliderProps {
  config: HeroSliderConfig;
  translation?: SectionTranslationContent | null;
}

const defaultSlides: HeroSlideConfig[] = [
  {
    id: 'default-1',
    title: 'Discover premium experiences',
    subtitle: 'Hand-curated collections for curious explorers',
    imageUrl: 'https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1600&q=80',
    ctaLabel: 'Explore now',
    ctaUrl: '/products',
  },
  {
    id: 'default-2',
    title: 'Designed for modern teams',
    subtitle: 'Flexible workflows, delightful experiences, measurable impact',
    imageUrl: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=1600&q=80',
    ctaLabel: 'See features',
    ctaUrl: '/about',
  },
];

const DEFAULT_BACKGROUND = 'linear-gradient(135deg, #1d4ed8 0%, #4338ca 45%, #0f172a 100%)';
const DEFAULT_OVERLAY_COLOR = 'rgba(15, 23, 42, 0.55)';

type ParsedColor = { r: number; g: number; b: number; a: number };

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const parseHexColor = (hex: string): ParsedColor | null => {
  let normalized = hex.replace('#', '').trim();
  if (![3, 4, 6, 8].includes(normalized.length)) {
    return null;
  }
  if (normalized.length === 3 || normalized.length === 4) {
    normalized = normalized.split('').map((char) => char + char).join('');
  }
  let alpha = 1;
  if (normalized.length === 8) {
    alpha = clamp(parseInt(normalized.slice(6, 8), 16) / 255, 0, 1);
    normalized = normalized.slice(0, 6);
  }
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  if ([r, g, b].some((component) => Number.isNaN(component))) {
    return null;
  }
  return { r, g, b, a: alpha };
};

const parseChannelValue = (value: string): number => {
  if (value.endsWith('%')) {
    return clamp(Math.round((parseFloat(value) / 100) * 255), 0, 255);
  }
  return clamp(Number.parseInt(value, 10), 0, 255);
};

const parseAlphaValue = (value?: string): number => {
  if (!value) {
    return 1;
  }
  if (value.endsWith('%')) {
    return clamp(Number.parseFloat(value) / 100, 0, 1);
  }
  return clamp(Number.parseFloat(value), 0, 1);
};

const parseRgbColor = (color: string): ParsedColor | null => {
  const cleaned = color.trim().replace(/^rgba?\(/i, '').replace(/\)$/i, '');
  const parts = cleaned.split(/\s*,\s*/);
  if (parts.length < 3) {
    return null;
  }
  const [rRaw, gRaw, bRaw, aRaw] = parts;
  const r = parseChannelValue(rRaw);
  const g = parseChannelValue(gRaw);
  const b = parseChannelValue(bRaw);
  const a = parseAlphaValue(aRaw);
  return { r, g, b, a };
};

const parseCssColor = (color: string): ParsedColor | null => {
  if (!color) {
    return null;
  }
  if (color.startsWith('#')) {
    return parseHexColor(color);
  }
  if (color.startsWith('rgb')) {
    return parseRgbColor(color);
  }
  return null;
};

const toRgbaString = ({ r, g, b, a }: ParsedColor) => `rgba(${r}, ${g}, ${b}, ${Number(a.toFixed(3))})`;

const buildOverlayStyle = (color: string, opacity?: number): CSSProperties => {
  const fallback = parseCssColor(DEFAULT_OVERLAY_COLOR);
  if (!color) {
    if (!fallback) {
      return { backgroundColor: DEFAULT_OVERLAY_COLOR };
    }
    const effectiveOpacity = opacity != null ? clamp(opacity, 0, 1) : 1;
    return { backgroundColor: toRgbaString({ ...fallback, a: clamp(fallback.a * effectiveOpacity, 0, 1) }) };
  }
  const trimmed = color.trim();
  if (trimmed.startsWith('linear-gradient') || trimmed.startsWith('radial-gradient')) {
    return { background: trimmed };
  }
  const parsed = parseCssColor(trimmed) || fallback;
  if (!parsed) {
    return { backgroundColor: DEFAULT_OVERLAY_COLOR };
  }
  const effectiveOpacity = opacity != null ? clamp(opacity, 0, 1) : 1;
  const finalAlpha = clamp(parsed.a * effectiveOpacity, 0, 1);
  return { backgroundColor: toRgbaString({ ...parsed, a: finalAlpha }) };
};

export const HeroSlider: React.FC<HeroSliderProps> = ({ config, translation }) => {
  const { t } = useTranslation();
  const slides = Array.isArray(config?.slides) && config.slides.length > 0 ? config.slides : defaultSlides;

  const [activeIndex, setActiveIndex] = useState(0);
  const interval = config.interval ?? 6000;
  const autoplay = config.autoplay ?? true;
  const layout = config.layout === 'full-width' ? 'full-width' : 'container';
  const isFullWidth = layout === 'full-width';

  const overlaySettings = config.overlay ?? {};
  const overlayEnabled = overlaySettings.enabled ?? true;
  const overlayOpacityRaw = typeof overlaySettings.opacity === 'number'
    ? overlaySettings.opacity
    : typeof overlaySettings.opacityPercent === 'number'
      ? overlaySettings.opacityPercent
      : undefined;
  const overlayOpacity = overlayOpacityRaw != null
    ? overlayOpacityRaw > 1
      ? clamp(overlayOpacityRaw / 100, 0, 1)
      : clamp(overlayOpacityRaw, 0, 1)
    : undefined;
  const overlayBackground = (overlaySettings.background || config.overlayBackground || '').trim();
  const baseOverlayColor = (overlaySettings.color && overlaySettings.color.trim()) || DEFAULT_OVERLAY_COLOR;

  const containerStyle: CSSProperties = overlayBackground
    ? overlayBackground.startsWith('linear-gradient') || overlayBackground.startsWith('radial-gradient')
      ? { background: overlayBackground }
      : { backgroundColor: overlayBackground }
    : { background: DEFAULT_BACKGROUND };

  const overlayStyle: CSSProperties | undefined = overlayEnabled ? buildOverlayStyle(baseOverlayColor, overlayOpacity) : undefined;
  const fieldVisibility = config.fieldVisibility ?? {};
  const showTitle = fieldVisibility.title !== false;
  const showSubtitle = fieldVisibility.subtitle !== false;
  const showDescription = fieldVisibility.description !== false;
  const showHeroDescription = fieldVisibility.heroDescription !== false;
  const buttonVisibility = config.buttonVisibility ?? {};
  const showPrimaryButton = buttonVisibility.primary !== false;
  const showSecondaryButton = buttonVisibility.secondary !== false;

  useEffect(() => {
    if (!autoplay) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, interval);
    return () => clearInterval(timer);
  }, [autoplay, interval, slides.length]);

  const activeSlide = slides[activeIndex] ?? slides[0];
  // null means field is hidden by admin, undefined/empty means visible but no value
  const slideHeading = activeSlide?.title?.trim();
  const translationHeading = translation?.title === null ? '' : (translation?.title || defaultSlides[0].title);
  const heading = showTitle ? (slideHeading || translationHeading) : '';

  const slideSubtitle = activeSlide?.subtitle?.trim();
  const translationSubtitle = translation?.subtitle === null ? '' : (translation?.subtitle || t('sections.hero.curated_sections'));
  const subheading = showSubtitle ? (slideSubtitle || translationSubtitle) : '';

  const rawHeroDescription = translation?.heroDescription === null ? '' : translation?.heroDescription?.trim() || '';
  const rawSectionDescription = translation?.description === null ? '' : translation?.description?.trim() || '';
  const rawSlideDescription = activeSlide?.description?.trim() || '';

  const heroDescription = showHeroDescription ? rawHeroDescription : '';
  const fallbackDescription = showDescription
    ? (translation?.description === null && translation?.heroDescription === null ? '' : t('sections.hero.latest_stories'))
    : '';
  const description = heroDescription
    || (showDescription ? (rawSectionDescription || rawSlideDescription || fallbackDescription) : '');
  const secondaryDescription = heroDescription
    && showDescription
    && rawSlideDescription
    && heroDescription !== rawSlideDescription
    ? rawSlideDescription
    : undefined;
  const contentPaddingClass = isFullWidth
    ? 'px-4 sm:px-8 lg:px-12 xl:px-16'
    : 'px-6 sm:px-10 lg:px-16';
  const contentWrapperClass = 'py-12 sm:py-16 lg:py-20 xl:py-24 min-h-[400px] sm:min-h-[450px] md:min-h-[500px] lg:min-h-[550px] xl:min-h-[600px] 2xl:min-h-[650px] flex flex-col justify-center';
  const backgroundImage = activeSlide?.imageUrl?.trim();
  const backgroundImageValue = backgroundImage
    ? `url('${backgroundImage.replace(/'/g, "\\'")}')`
    : undefined;
  const backgroundLayerStyle: CSSProperties | undefined = backgroundImageValue
    ? {
        backgroundImage: backgroundImageValue,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: overlayEnabled ? 0.7 : 1,
        filter: overlayEnabled ? 'grayscale(15%)' : 'none',
        transition: 'opacity 300ms ease',
      }
    : undefined;
  const outerWrapperClass = isFullWidth
    ? 'w-full'
    : 'px-4 sm:px-6 lg:px-8';
  const constrainedWrapperClass = isFullWidth ? '' : 'max-w-6xl mx-auto w-full';
  const heroShellClass = isFullWidth
    ? 'relative overflow-hidden text-white'
    : 'relative overflow-hidden text-white rounded-3xl shadow-2xl border border-white/10 dark:border-white/5';

  const heroContent = (
    <div className={heroShellClass} style={containerStyle}>
      {backgroundLayerStyle && (
        <div className="absolute inset-0" style={backgroundLayerStyle} />
      )}
      {overlayEnabled && <div className="absolute inset-0" style={overlayStyle} />}

      <SectionContainer
        fullWidth
        paddingClassName={contentPaddingClass}
        className={`relative ${contentWrapperClass}`}
      >
        <div className="max-w-2xl space-y-4">
          {subheading && (
            <p className="text-sm uppercase tracking-widest text-blue-100 mb-3">
              {subheading}
            </p>
          )}
          {heading && (
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
              {heading}
            </h1>
          )}
          {description && (
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-blue-100 leading-relaxed">
              {description}
            </p>
          )}
          {secondaryDescription && (
            <p className="mt-3 text-sm sm:text-base text-blue-100/90 leading-relaxed">
              {secondaryDescription}
            </p>
          )}
          {(showPrimaryButton || showSecondaryButton) && (
            <div className="mt-6 sm:mt-8 flex flex-wrap gap-3 sm:gap-4">
              {showPrimaryButton && (activeSlide?.ctaLabel || activeSlide?.ctaUrl) && (
                <a
                  href={activeSlide?.ctaUrl || '#'}
                  className="inline-flex items-center justify-center rounded-lg bg-white/95 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-blue-700 shadow-lg shadow-blue-900/30 backdrop-blur transition hover:bg-white"
                >
                  {activeSlide?.ctaLabel || t('sections.hero.explore_collections')}
                </a>
              )}
              {showSecondaryButton && (
                <a
                  href="#sections"
                  className="inline-flex items-center justify-center rounded-lg border border-white/40 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {t('sections.hero.view_sections')}
                </a>
              )}
            </div>
          )}
        </div>
      </SectionContainer>
      <div className="absolute inset-x-0 bottom-6 flex justify-center px-4">
        <div className="flex items-center gap-3">
          {slides.map((slide, index) => (
            <button
              key={slide.id || index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${index === activeIndex ? 'w-10 bg-white' : 'w-6 bg-white/50 hover:bg-white/80'}`}
              aria-label={`Show slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <section className={outerWrapperClass}>
      {isFullWidth ? (
        heroContent
      ) : (
        <div className={constrainedWrapperClass}>
          {heroContent}
        </div>
      )}
    </section>
  );
};

export default HeroSlider;
