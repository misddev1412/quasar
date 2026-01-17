'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SectionTranslationContent } from './HeroSlider';
import SectionContainer from './SectionContainer';

export interface FeatureItemConfig {
  id?: string;
  title?: string;
  description?: string;
  supporting?: string;
  badge?: string;
  icon?: string;
  mediaUrl?: string;
  linkLabel?: string;
  linkHref?: string;
}

export interface FeatureHighlightConfig {
  eyebrow?: string;
  title?: string;
  description?: string;
  accentColor?: string;
  badge?: string;
}

export interface FeaturesSectionConfig {
  layout?: 'grid' | 'list' | 'tabs';
  columns?: number;
  highlight?: FeatureHighlightConfig;
  items?: FeatureItemConfig[];
  cardBackground?: string;
  cardBorderColor?: string;
}

interface FeaturesSectionProps {
  config: FeaturesSectionConfig;
  translation?: SectionTranslationContent | null;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const fallbackItems: FeatureItemConfig[] = [
  {
    id: 'fast-fulfillment',
    icon: '⚡',
    title: 'Lightning-fast fulfillment',
    description: 'Orders leave the warehouse within 24 hours with proactive status notifications.',
    supporting: 'Same-day handling in key cities',
  },
  {
    id: 'localized-support',
    icon: '🌏',
    title: 'Localized shopping journeys',
    description: 'Region-specific pricing, copy, and promotions to lift conversion in every market.',
    supporting: 'Auto-syncs with campaigns and experiments',
  },
  {
    id: 'secure-payments',
    icon: '🔐',
    title: 'Trusted payment stack',
    description: 'Support for COD, BNPL, and enterprise invoicing with PCI-compliant gateways.',
    supporting: 'Multi-provider fallback routing',
  },
];

const sanitizeItems = (items?: FeatureItemConfig[]): FeatureItemConfig[] => {
  if (!Array.isArray(items) || items.length === 0) {
    return fallbackItems;
  }
  const filtered = items.filter((item) => (item?.title || item?.description));
  return filtered.length > 0 ? filtered : fallbackItems;
};

const FeatureCard: React.FC<{ item: FeatureItemConfig; accentColor?: string; background?: string; borderColor?: string }>
  = ({ item, accentColor, background, borderColor }) => {
    const inlineStyles: React.CSSProperties = {};
    if (background && background.trim() !== '') {
      inlineStyles.background = background;
    }
    if (borderColor && borderColor.trim() !== '') {
      inlineStyles.borderColor = borderColor;
    }

    return (
      <article
        className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
        style={inlineStyles}
      >
        <div className="flex items-center gap-3">
          {item.icon && (
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl dark:bg-blue-500/20"
              style={accentColor ? { color: accentColor } : undefined}
            >
              {item.icon}
            </div>
          )}
          {item.badge && (
            <span className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">
              {item.badge}
            </span>
          )}
        </div>
        {item.title && <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{item.title}</h3>}
        {item.description && <p className="text-gray-600 dark:text-gray-400">{item.description}</p>}
        {item.supporting && <p className="text-sm text-gray-500 dark:text-gray-500">{item.supporting}</p>}
        {item.linkLabel && item.linkHref && (
          <a
            href={item.linkHref}
            className="text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-300"
          >
            {item.linkLabel}
          </a>
        )}
      </article>
    );
  };

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ config, translation }) => {
  const { t } = useTranslation();
  const layout = config.layout === 'list' || config.layout === 'tabs' ? config.layout : 'grid';
  const columns = clamp(config.columns ?? 3, 1, 4);
  const accentColor = config.highlight?.accentColor?.trim() || undefined;
  const eyebrow = config.highlight?.eyebrow;
  const highlightDescription = translation?.description === null
    ? ''
    : (translation?.description || config.highlight?.description || t('sections.features.description'));
  const highlightTitle = translation?.title === null
    ? ''
    : (translation?.title || config.highlight?.title || t('sections.features.title'));
  const highlightSubtitle = translation?.subtitle === null
    ? ''
    : (translation?.subtitle || config.highlight?.badge || t('sections.features.subtitle'));

  const items = useMemo(() => sanitizeItems(config.items), [config.items]);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleTabChange = (index: number) => setActiveIndex(index);

  const gridColumnClass = useMemo(() => {
    switch (columns) {
      case 1:
        return 'lg:grid-cols-1';
      case 2:
        return 'lg:grid-cols-2';
      case 4:
        return 'lg:grid-cols-4';
      default:
        return 'lg:grid-cols-3';
    }
  }, [columns]);

  const renderGrid = () => (
    <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 ${gridColumnClass}`}>
      {items.map((item, idx) => (
        <FeatureCard
          key={item.id || `feature-${idx}`}
          item={item}
          accentColor={accentColor}
          background={config.cardBackground}
          borderColor={config.cardBorderColor}
        />
      ))}
    </div>
  );

  const renderList = () => (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div
          key={item.id || `feature-list-${idx}`}
          className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white/70 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/60"
        >
          <div className="flex items-start gap-4">
            {item.icon && (
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-2xl font-semibold dark:bg-blue-500/20"
                style={accentColor ? { color: accentColor } : undefined}
              >
                {item.icon}
              </div>
            )}
            <div className="flex-1">
              {item.title && <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{item.title}</h3>}
              {item.description && <p className="text-gray-600 dark:text-gray-400">{item.description}</p>}
              {item.supporting && <p className="text-sm text-gray-500 dark:text-gray-500">{item.supporting}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTabs = () => (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="rounded-2xl border border-gray-200 bg-white/80 p-4 dark:border-gray-800 dark:bg-gray-900/60">
        <div className="space-y-2">
          {items.map((item, idx) => (
            <button
              key={item.id || `feature-tab-${idx}`}
              type="button"
              onClick={() => handleTabChange(idx)}
              className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${idx === activeIndex
                  ? 'bg-blue-600/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200'
                  : 'text-gray-600 hover:bg-gray-100/80 dark:text-gray-400 dark:hover:bg-gray-800/60'
                }`}
            >
              {item.title || t('sections.features.untitledCard')}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900 lg:col-span-2">
        {items[activeIndex] ? (
          <div className="space-y-3">
            {items[activeIndex].badge && (
              <span className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">
                {items[activeIndex].badge}
              </span>
            )}
            {items[activeIndex].title && <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{items[activeIndex].title}</h3>}
            {items[activeIndex].description && (
              <p className="text-base text-gray-600 dark:text-gray-300">{items[activeIndex].description}</p>
            )}
            {items[activeIndex].supporting && (
              <p className="text-sm text-gray-500 dark:text-gray-500">{items[activeIndex].supporting}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-500">{t('sections.features.empty')}</p>
        )}
      </div>
    </div>
  );

  return (
    <section className="py-4 lg:py-16">
      <SectionContainer>
        <div className="mb-12 max-w-3xl">
          {eyebrow && <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">{eyebrow}</p>}
          {highlightSubtitle && (
            <p className="mt-2 text-sm font-semibold text-blue-500 dark:text-blue-300">{highlightSubtitle}</p>
          )}
          {highlightTitle && <h2 className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">{highlightTitle}</h2>}
          {highlightDescription && <p className="mt-4 text-base text-gray-600 dark:text-gray-400">{highlightDescription}</p>}
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/70 p-10 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-400">
            {t('sections.features.empty')}
          </div>
        ) : layout === 'list' ? (
          renderList()
        ) : layout === 'tabs' ? (
          renderTabs()
        ) : (
          renderGrid()
        )}
      </SectionContainer>
    </section>
  );
};

export default FeaturesSection;
