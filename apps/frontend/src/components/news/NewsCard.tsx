'use client';

import React from 'react';
import Link from 'next/link';
import clsx from 'clsx';

export interface NewsCardItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  category?: string;
  publishDate?: string;
  image?: string;
  author?: string;
}

export type NewsCardLayout = 'grid' | 'horizontal' | 'compact';

export interface NewsCardConfig {
  layout?: NewsCardLayout;
  showCategory?: boolean;
  showPublishDate?: boolean;
  showExcerpt?: boolean;
  showAuthor?: boolean;
  showReadMore?: boolean;
  clampTitleLines?: number;
  clampExcerptLines?: number;
  ctaText?: string;
  imageHeight?: string;
  badgeTone?: 'primary' | 'neutral' | 'emphasis';
}

const BADGE_TONE_CLASS: Record<NonNullable<NewsCardConfig['badgeTone']>, string> = {
  primary: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200',
  neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200',
  emphasis: 'bg-black/80 text-white dark:bg-white/20 dark:text-white',
};

const DEFAULT_CONFIG: Required<NewsCardConfig> = {
  layout: 'grid',
  showCategory: true,
  showPublishDate: true,
  showExcerpt: true,
  showAuthor: false,
  showReadMore: true,
  clampTitleLines: 2,
  clampExcerptLines: 3,
  ctaText: 'Read story',
  imageHeight: '12rem',
  badgeTone: 'primary',
};

const getClampStyle = (lines: number) => ({
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical' as const,
  overflow: 'hidden',
});

export interface NewsCardProps {
  item: NewsCardItem;
  config?: NewsCardConfig;
  className?: string;
}

export const NewsCard: React.FC<NewsCardProps> = ({ item, config, className }) => {
  const merged = { ...DEFAULT_CONFIG, ...config };
  const metadata = [
    merged.showCategory ? item.category : undefined,
    merged.showPublishDate && item.publishDate ? new Date(item.publishDate).toLocaleDateString() : undefined,
  ]
    .filter(Boolean)
    .join(' • ');

  const layoutClass =
    merged.layout === 'horizontal'
      ? 'md:flex md:h-full md:gap-8'
      : merged.layout === 'compact'
        ? 'flex flex-col gap-4'
        : 'flex flex-col';

  return (
    <article
      className={clsx(
        'group overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/40 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:hover:shadow-primary/20',
        className,
      )}
    >
      <Link href={`/news/${item.slug}`} className="flex h-full flex-col">
        {merged.imageHeight && (
          <div
            className={clsx(
              'relative w-full overflow-hidden bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-900/10',
              merged.layout === 'horizontal' ? 'md:h-full md:min-w-[220px] md:max-w-[320px]' : '',
            )}
            style={{ height: merged.layout === 'horizontal' ? undefined : merged.imageHeight }}
          >
            {item.image ? (
              <img
                src={item.image}
                alt={item.title}
                className={clsx('h-full w-full object-cover transition duration-500 group-hover:scale-105', {
                  'md:h-full md:w-auto': merged.layout === 'horizontal',
                })}
                loading="lazy"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            {merged.showPublishDate && item.publishDate && merged.badgeTone !== 'neutral' && (
              <span
                className={clsx(
                  'absolute bottom-4 left-4 rounded-full px-3 py-1 text-xs font-medium shadow',
                  BADGE_TONE_CLASS[merged.badgeTone],
                )}
              >
                {new Date(item.publishDate).toLocaleDateString()}
              </span>
            )}
          </div>
        )}

        <div className={clsx('flex flex-1 flex-col gap-3 px-6 py-5', layoutClass)}>
          {merged.showCategory && metadata && (
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">{metadata}</p>
          )}

          <h4
            className="text-xl font-semibold text-gray-900 dark:text-gray-100"
            style={getClampStyle(Math.max(1, merged.clampTitleLines))}
          >
            {item.title}
          </h4>

          {merged.showExcerpt && item.excerpt && (
            <p
              className="text-sm text-gray-600 dark:text-gray-400"
              style={getClampStyle(Math.max(1, merged.clampExcerptLines))}
            >
              {item.excerpt}
            </p>
          )}

          {merged.showAuthor && item.author && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{item.author}</p>
          )}

          {merged.showReadMore && (
            <div className="mt-auto inline-flex items-center text-sm font-medium text-indigo-600 transition group-hover:gap-2 dark:text-indigo-300">
              {merged.ctaText}
              <span aria-hidden="true" className="ml-1 transition group-hover:translate-x-0.5">
                →
              </span>
            </div>
          )}
        </div>
      </Link>
    </article>
  );
};

export default NewsCard;
