'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SectionContainer from './SectionContainer';
import type { SectionTranslationContent } from './HeroSlider';
import { BrandService } from '../../services/brand.service';
import type { BrandSummary, BrandShowcaseStrategy } from '../../types/brand';

export interface BrandShowcaseConfig {
  layout?: 'grid' | 'slider';
  strategy?: BrandShowcaseStrategy;
  limit?: number;
  columns?: number;
  brandIds?: string[];
  logoShape?: 'rounded' | 'circle' | 'square';
  backgroundStyle?: 'surface' | 'muted' | 'contrast';
  sliderAutoplay?: boolean;
  sliderInterval?: number;
}

interface BrandShowcaseSectionProps {
  config: BrandShowcaseConfig;
  translation?: SectionTranslationContent | null;
}

const clampColumns = (value?: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 4;
  }
  return Math.min(Math.max(Math.round(value), 1), 6);
};

const clampLimit = (value?: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 8;
  }
  return Math.min(Math.max(Math.round(value), 1), 30);
};

const backgroundVariants: Record<string, string> = {
  surface: 'bg-white dark:bg-gray-950',
  muted: 'bg-gray-50 dark:bg-gray-900',
  contrast: 'bg-slate-900 text-white',
};

const logoShapeVariants: Record<string, string> = {
  rounded: 'rounded-2xl',
  circle: 'rounded-full',
  square: 'rounded-lg',
};

const deriveBrandIds = (ids?: unknown): string[] => {
  if (!Array.isArray(ids)) {
    return [];
  }
  return ids.filter((id): id is string => typeof id === 'string' && Boolean(id));
};

export const BrandShowcaseSection: React.FC<BrandShowcaseSectionProps> = ({ config, translation }) => {
  const { t } = useTranslation();
  const brandIds = useMemo(() => deriveBrandIds(config.brandIds), [config.brandIds]);
  const brandIdsKey = brandIds.join('|');
  const strategy: BrandShowcaseStrategy = (config.strategy as BrandShowcaseStrategy) || 'newest';
  const layout = config.layout === 'slider' ? 'slider' : 'grid';
  const columns = clampColumns(config.columns);
  const backgroundStyle = config.backgroundStyle || 'surface';
  const sliderAutoplay = config.sliderAutoplay !== false;
  const sliderInterval = Math.max(Number(config.sliderInterval) || 6000, 2000);
  const logoShapeClass = logoShapeVariants[config.logoShape || 'rounded'] || logoShapeVariants.rounded;
  const shouldPromptForCustom = strategy === 'custom' && brandIds.length === 0;
  const requestLimit = strategy === 'custom' ? Math.max(brandIds.length, 1) : clampLimit(config.limit);

  const [brands, setBrands] = useState<BrandSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shouldPromptForCustom) {
      setBrands([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    BrandService.getShowcaseBrands({
      strategy,
      limit: requestLimit,
      brandIds: strategy === 'custom' ? brandIds : undefined,
    })
      .then((items) => {
        if (!cancelled) {
          setBrands(items);
        }
      })
      .catch((err: any) => {
        if (!cancelled) {
          setError(err?.message || t('sections.brands.error_loading', 'Unable to load brands right now.'));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [strategy, requestLimit, brandIdsKey, shouldPromptForCustom, brandIds, t]);

  useEffect(() => {
    if (!sliderAutoplay || layout !== 'slider' || brands.length <= 1) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (sliderRef.current) {
        sliderRef.current.scrollBy({
          left: sliderRef.current.clientWidth * 0.8,
          behavior: 'smooth',
        });
      }
    }, sliderInterval);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [sliderAutoplay, sliderInterval, layout, brands.length]);

  const sectionTitle = translation?.title === null ? '' : (translation?.title || t('sections.brands.title'));
  const sectionSubtitle = translation?.subtitle === null ? '' : (translation?.subtitle || t('sections.brands.subtitle'));
  const sectionDescription = translation?.description === null ? '' : (translation?.description || t('sections.brands.description'));
  const backgroundClass = backgroundVariants[backgroundStyle] || backgroundVariants.surface;
  const isContrast = backgroundStyle === 'contrast';
  const subtleTextClass = isContrast ? 'text-gray-300' : 'text-gray-500';
  const mutedTextClass = isContrast ? 'text-white/70' : 'text-gray-500';
  const cardShellClass = isContrast
    ? 'rounded-3xl border border-white/10 bg-white/5 p-8 shadow-inner'
    : 'rounded-3xl border border-gray-100 bg-white p-8 shadow-sm';
  const logoTileBaseClass = 'flex min-h-[96px] w-full items-center justify-center py-4';
  const logoTilePlaceholderClass = `${logoTileBaseClass} rounded-2xl ${
    isContrast ? 'bg-white/10' : 'bg-gray-100'
  } animate-pulse`;
  const logoFallbackBadgeClass = isContrast ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-600';
  const wrapWithCard = (content: React.ReactNode, extraClass?: string) => (
    <div className={`${cardShellClass}${extraClass ? ` ${extraClass}` : ''}`}>
      {content}
    </div>
  );

  const gridTemplate = useMemo(() => {
    if (columns <= 1) return 'grid-cols-1';
    if (columns === 2) return 'grid-cols-1 sm:grid-cols-2';
    if (columns === 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    if (columns === 5) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5';
    if (columns >= 6) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6';
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
  }, [columns]);

  const LogoTile: React.FC<{ brand: BrandSummary }> = ({ brand }) => {
    const brandName = brand.name || t('sections.brands.untitled', 'Untitled brand');
    const fallbackInitials =
      brandName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || '★';

    return (
      <div className={logoTileBaseClass} title={brandName || undefined} data-testid="brand-logo-tile">
        {brand.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={brand.logo}
            alt={brandName}
            className={`h-20 w-auto max-w-full object-contain ${logoShapeClass}`}
          />
        ) : (
          <div className={`flex h-20 w-20 items-center justify-center text-xl font-semibold ${logoShapeClass} ${logoFallbackBadgeClass}`} aria-hidden>
            {fallbackInitials}
          </div>
        )}
        <span className="sr-only">{brandName}</span>
      </div>
    );
  };

  const renderContent = () => {
    if (shouldPromptForCustom) {
      return wrapWithCard(
        <p className={`text-center text-sm ${mutedTextClass}`}>
          {t('sections.brands.empty_custom')}
        </p>
      );
    }

    if (error) {
      return wrapWithCard(
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/60 dark:bg-red-500/10 dark:text-red-200">
          {error}
        </div>
      );
    }

    if (isLoading) {
      const placeholderCount = layout === 'slider' ? Math.min(requestLimit, 4) : Math.min(columns * 2, 6);
      const placeholderContent =
        layout === 'slider' ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: placeholderCount }).map((_, idx) => (
              <div key={`brand-loading-${idx}`} className="min-w-[170px] flex-1">
                <div className={logoTilePlaceholderClass} />
              </div>
            ))}
          </div>
        ) : (
          <div className={`grid gap-4 ${gridTemplate}`}>
            {Array.from({ length: placeholderCount }).map((_, idx) => (
              <div key={`brand-loading-${idx}`} className={logoTilePlaceholderClass} />
            ))}
          </div>
        );
      return wrapWithCard(placeholderContent);
    }

    if (!brands || brands.length === 0) {
      return wrapWithCard(
        <p className={`text-center text-sm ${mutedTextClass}`}>
          {t('sections.brands.empty')}
        </p>
      );
    }

    if (layout === 'slider') {
      return wrapWithCard(
        <>
          <div ref={sliderRef} className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pt-1">
            {brands.map((brand) => (
              <div key={brand.id} className="min-w-[180px] snap-start">
                <LogoTile brand={brand} />
              </div>
            ))}
          </div>
          {brands.length > 1 && (
            <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between">
              <button
                type="button"
                onClick={() => sliderRef.current?.scrollBy({ left: -320, behavior: 'smooth' })}
                className="pointer-events-auto hidden h-10 w-10 -translate-x-4 items-center justify-center rounded-full border border-white/10 bg-white/80 text-gray-700 shadow dark:bg-gray-900/60 lg:inline-flex"
                aria-label={t('sections.brands.carousel_prev')}
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => sliderRef.current?.scrollBy({ left: 320, behavior: 'smooth' })}
                className="pointer-events-auto hidden h-10 w-10 translate-x-4 items-center justify-center rounded-full border border-white/10 bg-white/80 text-gray-700 shadow dark:bg-gray-900/60 lg:inline-flex"
                aria-label={t('sections.brands.carousel_next')}
              >
                ›
              </button>
            </div>
          )}
        </>,
        'relative'
      );
    }

    return wrapWithCard(
      <div className={`grid gap-4 ${gridTemplate}`}>
        {brands.map((brand) => (
          <LogoTile key={brand.id} brand={brand} />
        ))}
      </div>
    );
  };

  const hasHeaderContent = sectionTitle || sectionSubtitle || sectionDescription;

  return (
    <section className={`${backgroundClass} py-16`}>
      <SectionContainer>
        {hasHeaderContent && (
          <div className="mb-12 flex flex-col gap-2">
            {sectionSubtitle && (
              <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${isContrast ? 'text-blue-200' : 'text-blue-600'}`}>
                {sectionSubtitle}
              </p>
            )}
            {sectionTitle && (
              <h2 className={`text-3xl font-semibold ${isContrast ? 'text-white' : 'text-gray-900'}`}>
                {sectionTitle}
              </h2>
            )}
            {sectionDescription && (
              <p className={`text-base ${subtleTextClass}`}>
                {sectionDescription}
              </p>
            )}
          </div>
        )}
        {renderContent()}
      </SectionContainer>
    </section>
  );
};

export default BrandShowcaseSection;
