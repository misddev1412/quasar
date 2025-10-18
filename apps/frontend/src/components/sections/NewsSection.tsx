'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { SectionTranslationContent } from './HeroSlider';

export type NewsSectionStrategy = 'latest' | 'most_viewed' | 'featured';

export interface NewsSectionRowConfig {
  id?: string;
  categoryId?: string;
  title?: string;
  strategy?: NewsSectionStrategy;
  limit?: number;
}

export interface NewsSectionConfig {
  rows?: NewsSectionRowConfig[];
  limit?: number;
  categories?: string[];
  strategy?: NewsSectionStrategy;
}

const DEFAULT_NEWS_LIMIT = 3;

const ensurePositiveNumber = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.floor(parsed);
  }
  return fallback;
};

const normalizeNewsStrategy = (value?: string): NewsSectionStrategy => {
  const raw = typeof value === 'string' ? value.trim().toLowerCase() : '';
  switch (raw) {
    case 'most_viewed':
    case 'popular':
    case 'views':
      return 'most_viewed';
    case 'featured':
    case 'editor_pick':
      return 'featured';
    default:
      return 'latest';
  }
};

const parseNewsRows = (config: NewsSectionConfig): NewsSectionRowConfig[] => {
  const rows = Array.isArray(config?.rows) ? config.rows : [];
  const baseLimit = ensurePositiveNumber(config?.limit, DEFAULT_NEWS_LIMIT);

  if (rows.length > 0) {
    return rows.map((row, index) => ({
      id: typeof row?.id === 'string' && row.id.trim().length > 0 ? row.id : `news-row-${index}`,
      categoryId: typeof row?.categoryId === 'string' && row.categoryId.trim().length > 0 ? row.categoryId : undefined,
      title: typeof row?.title === 'string' && row.title.trim().length > 0 ? row.title : undefined,
      strategy: normalizeNewsStrategy(row?.strategy ?? config?.strategy),
      limit: ensurePositiveNumber(row?.limit, baseLimit),
    }));
  }

  const legacyCategories = Array.isArray(config?.categories)
    ? config.categories.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    : [];

  if (legacyCategories.length > 0) {
    const strategy = normalizeNewsStrategy(config?.strategy);
    return legacyCategories.map((categoryId, index) => ({
      id: `legacy-${index}`,
      categoryId,
      title: undefined,
      strategy,
      limit: baseLimit,
    }));
  }

  return [];
};

interface NewsSectionProps {
  config: NewsSectionConfig;
  translation?: SectionTranslationContent | null;
}

export const NewsSection: React.FC<NewsSectionProps> = ({ config, translation }) => {
  const { t } = useTranslation();
  const rows = parseNewsRows(config);
  const primaryRow = rows[0];
  const limit = ensurePositiveNumber(primaryRow?.limit ?? config?.limit, DEFAULT_NEWS_LIMIT);
  const derivedCategories = rows
    .map((row) => row.title || row.categoryId)
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
  const fallbackCategories = Array.isArray(config.categories)
    ? config.categories.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    : [];
  const categories = derivedCategories.length > 0 ? derivedCategories : fallbackCategories;
  const strategy = normalizeNewsStrategy(primaryRow?.strategy ?? config?.strategy);
  const strategyLabelMap: Record<NewsSectionStrategy, string> = {
    latest: t('sections.news.strategy.latest', 'Latest news'),
    most_viewed: t('sections.news.strategy.mostViewed', 'Most viewed'),
    featured: t('sections.news.strategy.featured', 'Editor picks'),
  };
  const strategyLabel = strategyLabelMap[strategy];
  const placeholderPosts = Array.from({ length: limit }).map((_, index) => ({
    id: `news-${index}`,
    title: `${t('sections.news.editorial_update', 'Editorial update')} ${index + 1}`,
    excerpt: t('sections.news.news_description', 'Share company milestones, product launch notes, or curated editorials for your community.'),
    date: new Date(Date.now() - index * 1000 * 60 * 60 * 24).toLocaleDateString(),
  }));

  return (
    <section className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-indigo-500">
              {categories.length > 0 ? categories.join(', ') : t('sections.news.latest_news', 'Latest news')}
              {strategyLabel ? ` • ${strategyLabel}` : ''}
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-gray-900">
              {translation?.title || t('sections.news.latest_stories', 'Latest stories')}
            </h2>
            {translation?.description && <p className="mt-2 text-gray-500">{translation.description}</p>}
          </div>
          <Link
            href="/news"
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {t('sections.news.view_newsroom', 'View newsroom')}
          </Link>
        </div>

        <div className="space-y-6">
          {placeholderPosts.map((post) => (
            <article key={post.id} className="rounded-xl border border-gray-100 bg-white shadow-sm p-6 hover:shadow-md transition">
              <p className="text-xs uppercase tracking-wide text-gray-400">{post.date}</p>
              <h3 className="mt-2 text-xl font-semibold text-gray-900">{post.title}</h3>
              <p className="mt-3 text-sm text-gray-600">{post.excerpt}</p>
              <Link href={`/news/${post.id}`} className="mt-4 inline-flex text-sm font-medium text-indigo-600 hover:text-indigo-700">
                {t('sections.news.read_story', 'Read story →')}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
