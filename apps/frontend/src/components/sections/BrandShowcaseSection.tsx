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
  showDescription?: boolean;
  showProductCount?: boolean;
  showWebsiteLink?: boolean;
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
  const showDescription = config.showDescription === true;
  const showProductCount = config.showProductCount !== false;
  const showWebsiteLink = config.showWebsiteLink === true;
  const layout = config.layout === 'slider' ? 'slider' : 'grid';
  const columns = clampColumns(config.columns);
  const backgroundStyle = config.backgroundStyle || 'surface';
  const sliderAutoplay = config.sliderAutoplay !== false;
  const sliderInterval = Math.max(Number(config.sliderInterval) || 6000, 2000);
  const logoShape = logoShapeVariants[config.logoShape || 'rounded'] || logoShapeVariants.rounded;
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
  const cardBaseClass = isContrast
    ? 'border border-white/10 bg-white/5 text-white'
    : 'border border-gray-100 bg-white text-gray-900';
  const subtleTextClass = isContrast ? 'text-gray-300' : 'text-gray-500';
  const placeholderClass = isContrast
    ? 'border-white/20 bg-white/5 text-white/80'
    : 'border-gray-200 bg-white text-gray-600';

  const gridTemplate = useMemo(() => {
    if (columns <= 1) return 'grid-cols-1';
    if (columns === 2) return 'grid-cols-1 sm:grid-cols-2';
    if (columns === 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    if (columns === 5) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5';
    if (columns >= 6) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6';
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
  }, [columns]);

  const renderBrandCard = (brand: BrandSummary) => {
    const brandName = brand.name || t('sections.brands.untitled', 'Untitled brand');
    const productCount = typeof brand.productCount === 'number' ? brand.productCount : null;
    const productCountLabel =
      showProductCount && productCount !== null && productCount > 0
        ? t('sections.brands.product_count', { count: productCount })
        : null;

    return (
      <div key={brand.id} className={`flex h-full flex-col justify-between rounded-2xl p-6 shadow-sm ${cardBaseClass}`}>
        <div className="flex items-center gap-4">
          {brand.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brand.logo} alt={brandName} className={`h-16 w-16 object-cover ${logoShape}`} />
          ) : (
            <div className={`flex h-16 w-16 items-center justify-center bg-gradient-to-br from-slate-200 to-slate-100 text-2xl font-semibold text-slate-600 dark:from-slate-700 dark:to-slate-800 ${logoShape}`}>
              {brandName?.[0] || '★'}
            </div>
          )}
          <div>
            <p className="text-lg font-semibold">{brandName}</p>
            {productCountLabel && <p className={`text-sm ${subtleTextClass}`}>{productCountLabel}</p>}
          </div>
        </div>
        {showDescription && brand.description && (
          <p className={`mt-4 text-sm leading-relaxed ${subtleTextClass}`}>{brand.description}</p>
        )}
        {showWebsiteLink && brand.website && (
          <a
            href={brand.website}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            {t('sections.brands.visit')}
            <span aria-hidden className="ml-1">↗</span>
          </a>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (shouldPromptForCustom) {
      return (
        <div className={`rounded-2xl border border-dashed px-6 py-10 text-center text-sm ${placeholderClass}`}>
          {t('sections.brands.empty_custom')}
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-6 text-sm text-red-600 dark:border-red-500/60 dark:bg-red-500/10 dark:text-red-200">
          {error}
        </div>
      );
    }

    if (isLoading) {
      const placeholderCount = layout === 'slider' ? Math.min(requestLimit, 4) : Math.min(columns * 2, 6);
      return (
        <div className={`grid gap-6 ${gridTemplate}`}>
          {Array.from({ length: placeholderCount }).map((_, idx) => (
            <div
              key={`brand-loading-${idx}`}
              className={`animate-pulse rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/40`}
            >
              <div className="flex items-center gap-4">
                <div className={`h-16 w-16 bg-gray-200 dark:bg-gray-700 ${logoShape}`} />
                <div className="space-y-2">
                  <div className="h-4 w-32 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (!brands || brands.length === 0) {
      return (
        <div className={`rounded-2xl border px-6 py-10 text-center text-sm ${placeholderClass}`}>
          {t('sections.brands.empty')}
        </div>
      );
    }

    if (layout === 'slider') {
      return (
        <div className="relative">
          <div
            ref={sliderRef}
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 pt-2"
          >
            {brands.map((brand) => (
              <div key={brand.id} className="min-w-[280px] snap-start">
                {renderBrandCard(brand)}
              </div>
            ))}
          </div>
          {brands.length > 1 && (
            <div className="pointer-events-none absolute inset-y-0 flex w-full items-center justify-between">
              <button
                type="button"
                onClick={() => sliderRef.current?.scrollBy({ left: -320, behavior: 'smooth' })}
                className="pointer-events-auto hidden h-10 w-10 -translate-x-4 items-center justify-center rounded-full border border-white/10 bg-white/70 text-gray-700 shadow dark:bg-gray-900/60 lg:inline-flex"
                aria-label={t('sections.brands.carousel_prev')}
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => sliderRef.current?.scrollBy({ left: 320, behavior: 'smooth' })}
                className="pointer-events-auto hidden h-10 w-10 translate-x-4 items-center justify-center rounded-full border border-white/10 bg-white/70 text-gray-700 shadow dark:bg-gray-900/60 lg:inline-flex"
                aria-label={t('sections.brands.carousel_next')}
              >
                ›
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={`grid gap-6 ${gridTemplate}`}>
        {brands.map((brand) => renderBrandCard(brand))}
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
