import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumb } from 'ui';
import Layout from '../../../components/layout/Layout';
import PageBreadcrumbs from '../../../components/common/PageBreadcrumbs';
import type { SiteContent } from '../../../types/site-content';
import {
  buildMetadataFromSiteContent,
  extractSummary,
  fetchSiteContentBySlug,
  fetchSiteContentList,
  formatCategoryLabel,
  resolvePreferredLocale,
} from '../_lib/site-content.server';

interface SiteContentPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: SiteContentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await resolvePreferredLocale();
  const siteContent = await fetchSiteContentBySlug(slug, locale);

  if (!siteContent) {
    return {
      title: 'Page Not Found | Quasar',
      description: 'The requested page could not be found on the Quasar storefront.',
    };
  }

  return buildMetadataFromSiteContent(siteContent);
}

const formatDate = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatDateTime = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const SiteContentBody = ({ siteContent }: { siteContent: SiteContent }) => {
  if (!siteContent.content) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center shadow-sm">
        <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8c1.104 0 2-.672 2-1.5S13.104 5 12 5s-2 .672-2 1.5S10.896 8 12 8zm0 2c-2.21 0-4 1.343-4 3v3h8v-3c0-1.657-1.79-3-4-3z"
          />
        </svg>
        <h2 className="mt-6 text-xl font-semibold text-gray-900 dark:text-gray-100">
          Content coming soon
        </h2>
        <p className="mt-3 text-gray-600 dark:text-gray-400">
          This page has been published but does not yet contain any written content.
        </p>
      </div>
    );
  }

  return (
    <article className="prose prose-lg prose-slate max-w-none dark:prose-invert">
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 px-6 sm:px-10 py-10"
        dangerouslySetInnerHTML={{ __html: siteContent.content }}
      />
    </article>
  );
};

export default async function SiteContentPage({ params }: SiteContentPageProps) {
  const { slug } = await params;
  const locale = await resolvePreferredLocale();
  const siteContent = await fetchSiteContentBySlug(slug, locale);

  if (!siteContent) {
    notFound();
  }

  const relatedList = await fetchSiteContentList({
    locale,
    limit: 6,
    sortBy: 'displayOrder',
    sortOrder: 'asc',
  });

  const relatedItems = (relatedList?.items ?? [])
    .filter((item) => item.id !== siteContent.id)
    .slice(0, 3);

  const publishedDate = formatDate(siteContent.publishedAt);
  const updatedDateTime = formatDateTime(siteContent.updatedAt);
  const summary = extractSummary(siteContent, 220);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 text-white overflow-hidden">
    
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
            {/* Category Badge */}
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 px-4 py-2 rounded-full text-sm font-medium text-blue-100">
                <span className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse" />
                {formatCategoryLabel(siteContent.category)}
              </span>
              {siteContent.languageCode && (
                <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-full text-xs font-medium text-white/80">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  {siteContent.languageCode.toUpperCase()}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="mt-8 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              <span className="block bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                {siteContent.title}
              </span>
            </h1>

            {/* Summary */}
            {summary && (
              <p className="mt-6 text-lg md:text-xl text-blue-100 max-w-4xl leading-relaxed">
                {summary}
              </p>
            )}

            {/* Metadata */}
            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-8">
                {publishedDate && (
                  <div className="flex items-center gap-2.5 text-blue-200">
                    <div className="p-1.5 bg-white/10 rounded-lg">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10m-9 4h10m-9 4h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">Published</div>
                      <div className="text-xs text-blue-300/70">{publishedDate}</div>
                    </div>
                  </div>
                )}

                {updatedDateTime && (
                  <div className="flex items-center gap-2.5 text-blue-200">
                    <div className="p-1.5 bg-white/10 rounded-lg">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">Updated</div>
                      <div className="text-xs text-blue-300/70">{updatedDateTime}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2.5 text-blue-200">
                  <div className="p-1.5 bg-white/10 rounded-lg">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">Path</div>
                    <div className="text-xs text-blue-300/70">/pages/{siteContent.slug}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </section>

        <PageBreadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Pages', href: '/pages' },
            { label: siteContent.title, isCurrent: true },
          ]}
          fullWidth={true}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <section className="mb-16">
            <SiteContentBody siteContent={siteContent} />
          </section>

          {relatedItems.length > 0 && (
            <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  More helpful pages
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Continue learning with related guides and policies.
                </p>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {relatedItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/pages/${item.slug}`}
                    className="block px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors"
                  >
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {item.title}
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      {item.languageCode?.toUpperCase()}
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {extractSummary(item, 120)}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </Layout>
  );
}
