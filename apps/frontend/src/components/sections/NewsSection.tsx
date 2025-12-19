'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { SectionTranslationContent } from './HeroSlider';
import type { ApiResponse } from '../../types/api';
import SectionContainer from './SectionContainer';

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

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishDate: string;
  category: string;
  image?: string;
}

interface NewsListResponse {
  items: NewsItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface RowState {
  items: NewsItem[];
  isLoading: boolean;
  error?: string;
}

export const NewsSection: React.FC<NewsSectionProps> = ({ config, translation }) => {
  const { t } = useTranslation();
  const rows = useMemo(() => parseNewsRows(config), [config]);
  const primaryRow = rows[0];
  const limit = ensurePositiveNumber(primaryRow?.limit ?? config?.limit, DEFAULT_NEWS_LIMIT);
  const derivedCategories = rows
    .map((row) => row.title || row.categoryId)
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
  const fallbackCategories = useMemo(
    () =>
      Array.isArray(config.categories)
        ? config.categories.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
        : [],
    [config.categories],
  );
  const categories = derivedCategories.length > 0 ? derivedCategories : fallbackCategories;
  const strategy = normalizeNewsStrategy(primaryRow?.strategy ?? config?.strategy);
  const strategyLabelMap: Record<NewsSectionStrategy, string> = {
    latest: t('sections.news.strategy.latest', 'Latest news'),
    most_viewed: t('sections.news.strategy.mostViewed', 'Most viewed'),
    featured: t('sections.news.strategy.featured', 'Editor picks'),
  };
  const strategyLabel = strategyLabelMap[strategy];
  const baseRows = useMemo(() => {
    if (rows.length > 0) {
      return rows;
    }
    return [
      {
        id: 'news-row-default',
        categoryId: fallbackCategories[0],
        title: translation?.title || undefined,
        strategy,
        limit,
      },
    ];
  }, [rows, fallbackCategories, translation?.title, strategy, limit]);
  const normalizedRowConfigs = useMemo(
    () =>
      baseRows.map((row, index) => ({
        id: row.id || `news-row-${index}`,
        categoryId: typeof row.categoryId === 'string' && row.categoryId.trim().length > 0 ? row.categoryId.trim() : undefined,
        title: row.title,
        strategy: normalizeNewsStrategy(row.strategy),
        limit: ensurePositiveNumber(row.limit ?? limit, DEFAULT_NEWS_LIMIT),
      })),
    [baseRows, limit],
  );
  const [rowStates, setRowStates] = useState<Record<string, RowState>>(() =>
    normalizedRowConfigs.reduce<Record<string, RowState>>((acc, row) => {
      acc[row.id] = { items: [], isLoading: true };
      return acc;
    }, {}),
  );
  const errorFallback = t('sections.news.error_loading', 'Unable to load news at the moment.');
  const emptyMessage = t('sections.news.empty_category', 'Không có tin tức trong mục này');

  useEffect(() => {
    let isSubscribed = true;

    setRowStates(
      normalizedRowConfigs.reduce<Record<string, RowState>>((acc, row) => {
        acc[row.id] = { items: [], isLoading: true };
        return acc;
      }, {}),
    );

    const loadRows = async () => {
      const { trpcClient } = await import('../../utils/trpc');

      const results = await Promise.all(
        normalizedRowConfigs.map(async (row) => {
          try {
            const response = (await (trpcClient as any).clientNews.getNews.query({
              page: 1,
              limit: row.limit,
              category: row.categoryId,
              sortBy: row.strategy === 'featured' ? 'sortOrder' : 'publishDate',
              sortOrder: 'desc',
              isActive: true,
            })) as ApiResponse<NewsListResponse>;

            const items =
              response && response.status === 'OK' && Array.isArray(response.data?.items) ? response.data.items : [];

            return {
              id: row.id,
              items,
            };
          } catch (error) {
            return {
              id: row.id,
              items: [],
              error: error instanceof Error ? error.message : errorFallback,
            };
          }
        }),
      );

      if (!isSubscribed) {
        return;
      }

      setRowStates(
        normalizedRowConfigs.reduce<Record<string, RowState>>((acc, row) => {
          const result = results.find((item) => item.id === row.id);
          acc[row.id] = {
            items: result?.items ?? [],
            isLoading: false,
            error: result?.error,
          };
          return acc;
        }, {}),
      );
    };

    loadRows();

    return () => {
      isSubscribed = false;
    };
  }, [normalizedRowConfigs, errorFallback]);

  // null means field is hidden by admin, undefined/empty means visible but no value
  const sectionTitle = translation?.title === null ? '' : (translation?.title || t('sections.news.latest_stories', 'Latest stories'));
  const sectionDescription = translation?.description === null ? '' : (translation?.description || '');
  const hasHeaderContent = sectionTitle || sectionDescription;

  return (
    <section className="py-16 bg-white dark:bg-gray-950">
      <SectionContainer paddingClassName="px-6 lg:px-8">
        {hasHeaderContent && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
            <div>
              {sectionTitle && (
                <h2 className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">
                  {sectionTitle}
                </h2>
              )}
              {sectionDescription && <p className="mt-2 text-gray-500 dark:text-gray-400">{sectionDescription}</p>}
            </div>
            <Link
              href="/news"
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
            {t('sections.news.view_newsroom', 'View newsroom')}
          </Link>
          </div>
        )}

        <div className="space-y-10">
          {normalizedRowConfigs.map((row) => {
            const state = rowStates[row.id] || { items: [], isLoading: true };
            const rowHeading = row.title || row.categoryId || t('sections.news.latest_news', 'Latest news');

            const viewAllHref = row.categoryId
              ? `/news?category=${encodeURIComponent(row.categoryId)}`
              : '/news';

            return (
              <div key={row.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{rowHeading}</h3>
                  <Link
                    href={viewAllHref}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200"
                  >
                    {t('sections.news.view_all', 'View all news')}
                  </Link>
                </div>
                <div className="space-y-6">
                  {state.error && (
                    <div className="rounded-lg border border-red-200 dark:border-red-500/40 bg-red-50 dark:bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-200">
                      {state.error}
                    </div>
                  )}
                  {state.isLoading
                    ? Array.from({ length: row.limit }).map((_, index) => (
                        <article
                          key={`skeleton-${row.id}-${index}`}
                          className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/40 p-6 shadow-sm animate-pulse"
                        >
                          <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
                          <div className="mt-3 h-5 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
                          <div className="mt-4 h-16 rounded bg-gray-100 dark:bg-gray-800" />
                          <div className="mt-6 h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                        </article>
                      ))
                    : state.items.length > 0
                    ? state.items.map((post) => {
                        const metadata = [
                          post.category,
                          post.publishDate ? new Date(post.publishDate).toLocaleDateString() : undefined,
                        ]
                          .filter(Boolean)
                          .join(' • ');
                        return (
                          <article
                            key={post.id}
                            className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/40 shadow-sm p-6 hover:shadow-md dark:hover:shadow-lg transition"
                          >
                            <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">{metadata}</p>
                            <h4 className="mt-2 text-xl font-semibold text-gray-900 dark:text-gray-100">{post.title}</h4>
                            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{post.excerpt}</p>
                            <Link
                              href={`/news/${post.slug}`}
                              className="mt-4 inline-flex text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200"
                            >
                              {t('sections.news.read_story', 'Read story →')}
                            </Link>
                          </article>
                        );
                      })
                    : (
                      <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
                        {emptyMessage}
                      </div>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      </SectionContainer>
    </section>
  );
};

export default NewsSection;
