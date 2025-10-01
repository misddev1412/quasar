import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Layout from '../../../components/layout/Layout';
import { serverTrpc } from '../../../utils/trpc-server';
import { Breadcrumb } from 'ui';

// News item interface
interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  publishDate: string;
  category: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// Related news interface
interface RelatedNewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  publishDate: string;
  category: string;
  image?: string;
}

interface NewsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate metadata for server-side SEO
export async function generateMetadata({ params }: NewsPageProps): Promise<Metadata> {
  const { slug } = await params;

  // Fetch news data server-side
  const newsResponse = await serverTrpc.clientNews.getNewsBySlug.query({ slug }) as any;
  const newsItem = newsResponse?.data?.news as NewsItem | undefined;

  if (!newsItem) {
    notFound();
  }

  const pathname = `/news/${slug}`;

  // Use news-specific SEO fields with fallbacks
  const title = newsItem.title;
  const description = newsItem.excerpt || `Read the latest news: ${newsItem.title}. Stay updated with our announcements and updates.`;
  const keywords = `${newsItem.title}, ${newsItem.category}, news, updates, announcements`;
  const imageUrl = newsItem.image;

  const siteName = 'Quasar';
  const formattedTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;

  return {
    title: formattedTitle,
    description,
    keywords,
    openGraph: {
      title: formattedTitle,
      description,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}${pathname}`,
      type: 'article',
      publishedTime: newsItem.publishDate,
      authors: [newsItem.author],
      section: newsItem.category,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: formattedTitle,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

// Server component for news detail page
async function NewsPageContent({ params }: NewsPageProps) {
  const { slug } = await params;

  // Fetch news data server-side
  const newsResponse = await serverTrpc.clientNews.getNewsBySlug.query({ slug }) as any;
  const newsItem = newsResponse?.data?.news as NewsItem | undefined;

  if (!newsItem) {
    notFound();
  }

  // Fetch related news server-side (latest news from same category or general latest)
  const relatedNewsResponse = await serverTrpc.clientNews.getNews.query({
    page: 1,
    limit: 4,
    category: newsItem.category,
    isActive: true,
    sortBy: 'publishDate',
    sortOrder: 'desc',
  }) as any;

  const relatedNews = relatedNewsResponse?.data?.items?.filter((item: NewsItem) => item.id !== newsItem.id).slice(0, 3) as RelatedNewsItem[] || [];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Breadcrumb */}
        <div className="bg-white/80 dark:bg-gray-900/70 border-b border-gray-200/70 dark:border-gray-800/70 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Breadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: 'News', href: '/news' },
                { label: newsItem.title, isCurrent: true },
              ]}
              linkComponent={Link}
              className="max-w-4xl bg-white/95 p-3 dark:bg-neutral-900/80"
            />
          </div>
        </div>

        {/* News Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              {/* Category */}
              <div className="mb-4">
                <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-semibold px-3 py-1 rounded-full">
                  {newsItem.category}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                {newsItem.title}
              </h1>

              {/* Meta information */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-gray-600 dark:text-gray-400 text-sm mb-6">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{newsItem.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{new Date(newsItem.publishDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              </div>

              {/* Excerpt */}
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                {newsItem.excerpt}
              </p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-12">
            {/* Featured Image */}
            {newsItem.image && (
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img
                  src={newsItem.image}
                  alt={newsItem.title}
                  className="w-full h-auto"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Article Content */}
            <article className="prose prose-lg prose-gray dark:prose-invert max-w-none">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 lg:p-12">
                <div
                  className="text-gray-800 dark:text-gray-200 leading-relaxed space-y-6"
                  dangerouslySetInnerHTML={{ __html: newsItem.content }}
                />
              </div>
            </article>

            {/* Share Section */}
            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Share this article</h2>
              <div className="flex flex-wrap gap-4">
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  Twitter
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </button>
              </div>
            </section>

            {/* Related News */}
            {relatedNews.length > 0 && (
              <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related News</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {relatedNews.map((item) => (
                    <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <a href={`/news/${item.slug}`} className="block">
                        <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <svg className="w-12 h-12 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                            <span>{item.category}</span>
                            <span className="mx-2">•</span>
                            <span>{new Date(item.publishDate).toLocaleDateString()}</span>
                          </div>
                          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                            {item.excerpt}
                          </p>
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>

        {/* Back to News */}
        <section className="bg-gray-100 dark:bg-gray-800 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <a
              href="/news"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to News
            </a>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default NewsPageContent;
