'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import type { SectionTranslationContent } from './HeroSlider';
import SectionContainer from './SectionContainer';

export interface StatItemConfig {
  id?: string;
  label?: string;
  value?: number;
  suffix?: string;
  prefix?: string;
  description?: string;
  sourceType?: 'manual' | 'metric';
  metricId?: string;
}

export interface StatsSectionConfig {
  layout?: 'grid' | 'counter';
  columns?: number;
  background?: 'surface' | 'primary' | 'dark';
  stats?: StatItemConfig[];
}

interface StatsSectionProps {
  config: StatsSectionConfig;
  translation?: SectionTranslationContent | null;
}

const fallbackStats: StatItemConfig[] = [
  { id: 'orders', label: 'Orders shipped', value: 12000, suffix: '+', description: 'Since launch', sourceType: 'manual' },
  { id: 'countries', label: 'Cities served', value: 48, description: 'Nationwide coverage', sourceType: 'manual' },
  { id: 'returning', label: 'Returning customers', value: 65, suffix: '%', description: 'Quarterly avg.', sourceType: 'manual' },
  { id: 'rating', label: 'Average rating', value: 4.9, suffix: '/5', description: 'Based on 1,200+ reviews', sourceType: 'manual' },
];

const clampColumns = (value?: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 4;
  }
  return Math.min(Math.max(Math.round(value), 1), 6);
};

const gridColumnClassMap: Record<number, string> = {
  1: 'sm:grid-cols-1 lg:grid-cols-1',
  2: 'sm:grid-cols-2 lg:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
  5: 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
  6: 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
};

const formatValue = (value?: number, suffix?: string, prefix?: string) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—';
  }
  const formatted = value >= 1000 ? Intl.NumberFormat('en-US').format(value) : value;
  return `${prefix ?? ''}${formatted}${suffix ?? ''}`;
};

const backgroundVariants: Record<string, string> = {
  surface: 'bg-gray-50 dark:bg-gray-900',
  primary: 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white',
  dark: 'bg-gray-900 text-white',
};

export const StatsSection: React.FC<StatsSectionProps> = ({ config, translation }) => {
  const { t } = useTranslation();
  const stats = Array.isArray(config.stats) && config.stats.length > 0 ? config.stats : fallbackStats;
  const layout = config.layout === 'counter' ? 'counter' : 'grid';
  const columns = clampColumns(config.columns);
  const backgroundClass = backgroundVariants[config.background || 'surface'] || backgroundVariants.surface;

  const title = translation?.title === null ? '' : (translation?.title || t('sections.stats.title'));
  const subtitle = translation?.subtitle === null ? '' : (translation?.subtitle || t('sections.stats.subtitle'));
  const description = translation?.description === null ? '' : (translation?.description || t('sections.stats.description'));

  const gridClass = gridColumnClassMap[columns] || gridColumnClassMap[4];

  return (
    <section className={`${backgroundClass} py-16`}>
      <SectionContainer>
        <div className="mb-12 max-w-3xl">
          {subtitle && <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500 dark:text-blue-300">{subtitle}</p>}
          {title && <h2 className="mt-3 text-3xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>}
          {description && <p className="mt-4 text-base text-gray-600 dark:text-gray-300">{description}</p>}
        </div>

        <div className={`grid grid-cols-1 gap-6 ${gridClass}`}>
          {stats.map((stat) => (
            <div
              key={stat.id || stat.label}
              className={
                layout === 'counter'
                  ? 'rounded-2xl border border-white/10 bg-white/5 p-6 text-white shadow-lg backdrop-blur'
                  : 'rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950'
              }
            >
              <p className="text-sm uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">{stat.label || t('sections.stats.untitled')}</p>
              <p className="mt-4 text-4xl font-bold text-gray-900 dark:text-gray-50">
                {formatValue(stat.value, stat.suffix, stat.prefix)}
              </p>
              {stat.description && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{stat.description}</p>
              )}
            </div>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
};

export default StatsSection;
