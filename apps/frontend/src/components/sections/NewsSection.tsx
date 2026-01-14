'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SectionHeader } from './SectionHeader';
import { SectionTranslationContent } from './HeroSlider';
import type { ApiResponse } from '../../types/api';
import type { ViewMoreButtonConfig } from '@shared/types/component.types';
import SectionContainer from './SectionContainer';
import { ViewMoreButton } from '../common/ViewMoreButton';
import NewsCard, { type NewsCardConfig, type NewsCardLayout } from '../news/NewsCard';

export type NewsSectionStrategy = 'latest' | 'most_viewed' | 'featured';

export interface NewsSectionRowConfig {
  id?: string;
  categoryId?: string;
  title?: string;
  strategy?: NewsSectionStrategy;
  limit?: number;
  columns?: number;
  card?: NewsCardConfig;
  headingStyle?: 'default' | 'banner';
  headingBackgroundColor?: string;
  headingTextColor?: string;
  headingTextTransform?: 'none' | 'uppercase' | 'capitalize' | 'lowercase';
  headingTitleSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  headingBarHeight?: number;
}

export interface NewsSectionConfig {
  rows?: NewsSectionRowConfig[];
  limit?: number;
  categories?: string[];
  strategy?: NewsSectionStrategy;
  card?: NewsCardConfig;
  headingStyle?: 'default' | 'banner';
  headingBackgroundColor?: string;
  headingTextColor?: string;
  headingTextTransform?: 'none' | 'uppercase' | 'capitalize' | 'lowercase';
  headingTitleSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  headingBarHeight?: number;
}

const DEFAULT_NEWS_LIMIT = 3;
const MIN_COLUMNS = 1;
const MAX_COLUMNS = 6;
const GRID_COLUMN_CLASSES: Record<number, string> = {
  1: 'md:grid-cols-1 lg:grid-cols-1',
  2: 'md:grid-cols-2 lg:grid-cols-2',
  3: 'md:grid-cols-3 lg:grid-cols-3',
  4: 'md:grid-cols-4 lg:grid-cols-4',
  5: 'md:grid-cols-5 lg:grid-cols-5',
  6: 'md:grid-cols-6 lg:grid-cols-6',
};

const ensurePositiveNumber = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.floor(parsed);
  }
  return fallback;
};

const clampColumns = (value: unknown, fallback: number): number => {
  const parsed = ensurePositiveNumber(value, fallback);
  return Math.max(MIN_COLUMNS, Math.min(MAX_COLUMNS, parsed));
};

const VALID_CARD_LAYOUTS: NewsCardLayout[] = ['grid', 'horizontal', 'compact'];
const VALID_BADGE_TONES: NonNullable<NewsCardConfig['badgeTone']>[] = ['primary', 'neutral', 'emphasis'];
const VALID_HEADING_TRANSFORMS = ['none', 'uppercase', 'capitalize', 'lowercase'] as const;
const VALID_HEADING_SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

const parseBoolean = (value: unknown, fallback: boolean): boolean =>
  typeof value === 'boolean' ? value : fallback;

const parseOptionalString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;

const parseHeadingTransform = (
  value: unknown,
): NewsSectionRowConfig['headingTextTransform'] | undefined => {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim().toLowerCase();
  return VALID_HEADING_TRANSFORMS.includes(normalized as (typeof VALID_HEADING_TRANSFORMS)[number])
    ? (normalized as NewsSectionRowConfig['headingTextTransform'])
    : undefined;
};

const parseHeadingTitleSize = (
  value: unknown,
): NewsSectionRowConfig['headingTitleSize'] | undefined => {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim().toLowerCase();
  return VALID_HEADING_SIZES.includes(normalized as (typeof VALID_HEADING_SIZES)[number])
    ? (normalized as NewsSectionRowConfig['headingTitleSize'])
    : undefined;
};

const parseHeadingBarHeight = (value: unknown): number | undefined => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : undefined;
};

const parseCardLayout = (value: unknown, fallback: NewsCardLayout): NewsCardLayout => {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (VALID_CARD_LAYOUTS.includes(normalized as NewsCardLayout)) {
    return normalized as NewsCardLayout;
  }
  return fallback;
};

const parseBadgeTone = (
  value: unknown,
  fallback: NonNullable<NewsCardConfig['badgeTone']>,
): NonNullable<NewsCardConfig['badgeTone']> => {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (VALID_BADGE_TONES.includes(normalized as NonNullable<NewsCardConfig['badgeTone']>)) {
    return normalized as NonNullable<NewsCardConfig['badgeTone']>;
  }
  return fallback;
};

const sanitizeCardConfig = (value: unknown): NewsCardConfig | undefined => {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const raw = value as Record<string, unknown>;
  const config: NewsCardConfig = {
    layout: parseCardLayout(raw.layout, 'grid'),
    showCategory: parseBoolean(raw.showCategory, true),
    showPublishDate: parseBoolean(raw.showPublishDate, true),
    showExcerpt: parseBoolean(raw.showExcerpt, true),
    showReadMore: parseBoolean(raw.showReadMore, true),
    badgeTone: parseBadgeTone(raw.badgeTone, 'primary'),
  };

  const clampTitleLines =
    typeof raw.clampTitleLines === 'number' ? ensurePositiveNumber(raw.clampTitleLines, 2) : undefined;
  const clampExcerptLines =
    typeof raw.clampExcerptLines === 'number' ? ensurePositiveNumber(raw.clampExcerptLines, 3) : undefined;
  const imageHeight = parseOptionalString(raw.imageHeight);
  const ctaText = parseOptionalString(raw.ctaText);

  if (clampTitleLines) {
    config.clampTitleLines = clampTitleLines;
  }
  if (clampExcerptLines) {
    config.clampExcerptLines = clampExcerptLines;
  }
  if (imageHeight) {
    config.imageHeight = imageHeight;
  }
  if (ctaText) {
    config.ctaText = ctaText;
  }

  return config;
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
  const baseColumns = clampColumns((config as any)?.columns, baseLimit);
  const baseCard = sanitizeCardConfig((config as any)?.card);
  const baseHeadingTransform = parseHeadingTransform(config?.headingTextTransform);
  const baseHeadingTitleSize = parseHeadingTitleSize(config?.headingTitleSize);
  const baseHeadingBarHeight = parseHeadingBarHeight(config?.headingBarHeight);

  if (rows.length > 0) {
    return rows.map((row, index) => ({
      id: typeof row?.id === 'string' && row.id.trim().length > 0 ? row.id : `news-row-${index}`,
      categoryId: typeof row?.categoryId === 'string' && row.categoryId.trim().length > 0 ? row.categoryId : undefined,
      title: typeof row?.title === 'string' && row.title.trim().length > 0 ? row.title : undefined,
      strategy: normalizeNewsStrategy(row?.strategy ?? config?.strategy),
      limit: ensurePositiveNumber(row?.limit, baseLimit),
      columns: clampColumns((row as any)?.columns, row?.limit ?? baseColumns),
      card: sanitizeCardConfig((row as any)?.card) ?? baseCard,
      headingStyle: (row?.headingStyle === 'banner' ? 'banner' : 'default'),
      headingBackgroundColor: typeof row?.headingBackgroundColor === 'string' ? row.headingBackgroundColor : undefined,
      headingTextColor: typeof row?.headingTextColor === 'string' ? row.headingTextColor : undefined,
      headingTextTransform: parseHeadingTransform(row?.headingTextTransform) ?? baseHeadingTransform,
      headingTitleSize: parseHeadingTitleSize(row?.headingTitleSize) ?? baseHeadingTitleSize,
      headingBarHeight: parseHeadingBarHeight(row?.headingBarHeight) ?? baseHeadingBarHeight,
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
      columns: baseColumns,
      card: baseCard,
    }));
  }

  return [];
};

interface NewsSectionProps {
  config: NewsSectionConfig;
  translation?: SectionTranslationContent | null;
  viewMoreButtonConfig?: ViewMoreButtonConfig;
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

export const NewsSection: React.FC<NewsSectionProps> = ({ config, translation, viewMoreButtonConfig }) => {
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
        headingStyle: (config?.headingStyle === 'banner' ? 'banner' : 'default'),
        headingBackgroundColor: config?.headingBackgroundColor,
        headingTextColor: config?.headingTextColor,
        headingTextTransform: parseHeadingTransform(config?.headingTextTransform),
        headingTitleSize: parseHeadingTitleSize(config?.headingTitleSize),
        headingBarHeight: parseHeadingBarHeight(config?.headingBarHeight),
      } as NewsSectionRowConfig,
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
        columns: clampColumns(row.columns ?? row.limit ?? limit, row.limit ?? limit),
        card: sanitizeCardConfig(row.card),
        headingStyle: row.headingStyle,
        headingBackgroundColor: row.headingBackgroundColor,
        headingTextColor: row.headingTextColor,
        headingTextTransform: row.headingTextTransform,
        headingTitleSize: row.headingTitleSize,
        headingBarHeight: row.headingBarHeight,
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
  const showSectionHeader = normalizedRowConfigs.length === 0 && hasHeaderContent;

  return (
    <section className="py-16 bg-white dark:bg-gray-950">
      <SectionContainer paddingClassName="px-6 lg:px-8">
        {showSectionHeader && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
            <div>
              {sectionTitle && (
                <h2 className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">
                  {sectionTitle}
                </h2>
              )}
              {sectionDescription && <p className="mt-2 text-gray-500 dark:text-gray-400">{sectionDescription}</p>}
            </div>
            <ViewMoreButton
              href="/news"
              label={t('sections.news.view_newsroom', 'View newsroom')}
              config={viewMoreButtonConfig}
            />
          </div>
        )}

        <div className="space-y-10">
          {normalizedRowConfigs.map((row) => {
            const state = rowStates[row.id] || { items: [], isLoading: true };
            const rowHeading = row.title || row.categoryId || t('sections.news.latest_news', 'Latest news');
            const viewAllHref = row.categoryId
              ? `/news?category=${encodeURIComponent(row.categoryId)}`
              : '/news';
            const desiredColumns = clampColumns(
              row.columns ?? row.limit ?? config.limit ?? DEFAULT_NEWS_LIMIT,
              row.limit ?? config.limit ?? DEFAULT_NEWS_LIMIT,
            );
            const gridClass = GRID_COLUMN_CLASSES[desiredColumns] ?? 'md:grid-cols-3 lg:grid-cols-3';
            const cardConfig: NewsCardConfig = row.card
              ? {
                ...row.card,
                ctaText: row.card?.ctaText || t('sections.news.read_story', 'Read story'),
              }
              : { ctaText: t('sections.news.read_story', 'Read story') };

            return (
              <div key={row.id} className="space-y-4">
                <SectionHeader
                  title={rowHeading}
                  ctaLabel={row.categoryId
                    ? t('sections.news.view_category', { category: rowHeading })
                    : t('sections.news.view_more', 'View more news')}
                  ctaLink={viewAllHref}
                  headingStyle={row.headingStyle}
                  headingBackgroundColor={row.headingBackgroundColor}
                  headingTextColor={row.headingTextColor}
                  headingTextTransform={row.headingTextTransform}
                  headingTitleSize={row.headingTitleSize}
                  headingBarHeight={row.headingBarHeight}
                />
                <div className="space-y-6">
                  {state.error && (
                    <div className="rounded-lg border border-red-200 dark:border-red-500/40 bg-red-50 dark:bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-200">
                      {state.error}
                    </div>
                  )}
                  {state.isLoading ? (
                    <div className={`grid gap-6 grid-cols-1 sm:grid-cols-2 ${GRID_COLUMN_CLASSES[desiredColumns] ?? 'md:grid-cols-3 lg:grid-cols-3'}`}>
                      {Array.from({ length: row.limit }).map((_, index) => (
                        <div
                          key={`skeleton-${row.id}-${index}`}
                          className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/40 shadow-sm animate-pulse"
                        >
                          <div className="h-48 w-full rounded-t-2xl bg-gray-100 dark:bg-gray-800" />
                          <div className="space-y-3 p-6">
                            <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
                            <div className="h-5 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
                            <div className="h-4 w-full rounded bg-gray-100 dark:bg-gray-800" />
                            <div className="h-4 w-1/2 rounded bg-gray-100 dark:bg-gray-800" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : state.items.length > 0 ? (
                    <div className={`grid gap-6 grid-cols-1 sm:grid-cols-2 ${gridClass}`}>
                      {state.items.map((post) => (
                        <NewsCard
                          key={post.id}
                          item={{
                            id: post.id,
                            title: post.title,
                            slug: post.slug,
                            excerpt: post.excerpt,
                            category: post.category,
                            publishDate: post.publishDate,
                            image: post.image,
                          }}
                          config={cardConfig}
                        />
                      ))}
                    </div>
                  ) : (
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
