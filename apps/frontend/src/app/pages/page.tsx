import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb } from 'ui';
import Layout from '../../components/layout/Layout';
import PageBreadcrumbs from '../../components/common/PageBreadcrumbs';
import { SiteContentCategory } from '@shared/enums/site-content.enums';
import { getPublicSiteName } from '../../lib/site-name';
import {
  extractSummary,
  fetchSiteContentList,
  formatCategoryLabel,
  resolvePreferredLocale,
} from './_lib/site-content.server';

const siteName = getPublicSiteName();

export const metadata: Metadata = {
  title: `Site Pages | ${siteName}`,
  description:
    `Browse published informational pages including guides, policies, FAQs, and more curated for the ${siteName} storefront.`,
};

interface SiteContentListPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

const getSingleParam = (
  params: Record<string, string | string[] | undefined> | undefined,
  key: string,
): string | undefined => {
  if (!params) {
    return undefined;
  }

  const value = params[key];
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

const parseIntegerParam = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseBooleanParam = (value: string | undefined): boolean | undefined => {
  if (value === undefined) return undefined;
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;
  return undefined;
};

const parseCategoryParam = (value: string | undefined): SiteContentCategory | undefined => {
  if (!value) return undefined;
  const lowered = value.toLowerCase();
  return (Object.values(SiteContentCategory) as string[]).includes(lowered)
    ? (lowered as SiteContentCategory)
    : undefined;
};

export default async function SiteContentListPage({ searchParams }: SiteContentListPageProps) {
  const resolvedSearchParams = await searchParams;

  const pageParam = getSingleParam(resolvedSearchParams, 'page');
  const categoryParam = getSingleParam(resolvedSearchParams, 'category');
  const isFeaturedParam = getSingleParam(resolvedSearchParams, 'featured');

  const page = parseIntegerParam(pageParam, 1);
  const limit = 12;
  const category = parseCategoryParam(categoryParam);
  const isFeatured = parseBooleanParam(isFeaturedParam);
  const locale = await resolvePreferredLocale(resolvedSearchParams);

  const listResult = await fetchSiteContentList({
    locale,
    page,
    limit,
    category,
    isFeatured,
    sortBy: 'displayOrder',
    sortOrder: 'asc',
  });
  const items = listResult?.items ?? [];
  const pagination = listResult?.pagination ?? {
    page,
    limit,
    total: items.length,
    totalPages: items.length > 0 ? 1 : 0,
    hasNext: false,
    hasPrevious: page > 1,
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-sm uppercase tracking-wide">
              <span className="w-2 h-2 bg-emerald-400 rounded-full" />
              Storefront Pages
            </span>
            <h1 className="mt-6 text-3xl md:text-4xl font-bold tracking-tight">
              Discover Helpful Resources
            </h1>
            <p className="mt-4 text-base md:text-lg text-white/80">
              Explore published guides, policies, FAQs, and informational pages curated by our team. Each page is
              localized to your preferred language when available.
            </p>
          </div>
        </div>

        <PageBreadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Pages', isCurrent: true },
          ]}
          fullWidth={true}
        />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {items.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-12 text-center shadow-sm">
              <svg
                className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8c1.104 0 2-.672 2-1.5S13.104 5 12 5s-2 .672-2 1.5S10.896 8 12 8zm0 2c-2.21 0-4 1.343-4 3v3h8v-3c0-1.657-1.79-3-4-3z"
                />
              </svg>
              <h2 className="mt-6 text-xl font-semibold text-gray-900 dark:text-gray-100">
                No pages available yet
              </h2>
              <p className="mt-3 text-gray-600 dark:text-gray-400">
                Published site content will appear here once created by the content team.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 lg:gap-8 grid-cols-1 md:grid-cols-2">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="inline-flex items-center gap-2 font-medium text-primary-600 dark:text-primary-400">
                        <span className="w-2 h-2 rounded-full bg-primary-500" />
                        {formatCategoryLabel(item.category)}
                      </span>
                      {item.publishedAt && (
                        <time className="text-gray-500 dark:text-gray-400">
                          {new Date(item.publishedAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </time>
                      )}
                    </div>

                    <h2 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      <Link href={`/pages/${item.slug}`} prefetch>
                        {item.title}
                      </Link>
                    </h2>

                    {item.languageCode && (
                      <p className="mt-2 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        {item.languageCode.toUpperCase()}
                      </p>
                    )}

                    <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                      {extractSummary(item)}
                    </p>

                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 6v6l3 3"
                          />
                        </svg>
                        <span>Updated {new Date(item.updatedAt).toLocaleDateString()}</span>
                      </div>
                      <Link
                        href={`/pages/${item.slug}`}
                        className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
                      >
                        Read more
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-300">
              <span>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <span className="hidden sm:inline">•</span>
              <span>{pagination.total} pages available</span>
            </div>
          )}
        </main>
      </div>
    </Layout>
  );
}
