import { Metadata } from 'next';
import Layout from '../../components/layout/Layout';
import Link from 'next/link';
import { serverTrpc } from '../../utils/trpc-server';
import { notFound } from 'next/navigation';
import NewsCard from '../../components/news/NewsCard';
import { getPublicSiteName } from '../../lib/site-name';

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

// News list response interface
interface NewsListResponse {
  items: NewsItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Categories response interface
interface CategoriesResponse {
  categories: Array<{
    name: string;
    count: number;
  }>;
}

// Server-side data fetching function
async function getNewsData(page = 1, limit = 12, category?: string, search?: string): Promise<{
  newsData: NewsListResponse;
  categoriesData: CategoriesResponse;
}> {
  try {
    // Fetch news list and categories in parallel
    const [newsResponse, categoriesResponse] = await Promise.all([
      serverTrpc.clientNews.getNews.query({
        page,
        limit,
        category,
        search,
        isActive: true,
        sortBy: 'publishDate',
        sortOrder: 'desc',
      }) as any,
      serverTrpc.clientNews.getNewsCategories.query() as any,
    ]);

    const newsData = newsResponse?.data as NewsListResponse;
    const categoriesData = categoriesResponse?.data as CategoriesResponse;

    if (!newsData || !categoriesData) {
      throw new Error('Failed to fetch news data');
    }

    return { newsData, categoriesData };
  } catch (error) {
    console.error('Error fetching news data:', error);
    notFound();
  }
}

// Generate metadata for news page
export async function generateMetadata(): Promise<Metadata> {
  const siteName = getPublicSiteName();
  const title = `Latest News - ${siteName}`;

  try {
    const { newsData } = await getNewsData(1, 1); // Get latest news for metadata

    const latestNews = newsData.items[0];
    const description = latestNews
      ? `Stay updated with our latest news: ${latestNews.title}. ${latestNews.excerpt}`
      : 'Stay updated with our latest news, announcements, and company updates';

    return {
      title,
      description,
      keywords: 'news, updates, announcements, company news, press releases',
      openGraph: {
        title,
        description,
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/news`,
        type: 'website',
        images: latestNews?.image ? [{ url: latestNews.image }] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: latestNews?.image ? [latestNews.image] : undefined,
      },
    };
  } catch (error) {
    // Fallback metadata if data fetching fails
    return {
      title,
      description: 'Stay updated with our latest news, announcements, and company updates',
      keywords: 'news, updates, announcements, company news, press releases',
      openGraph: {
        title,
        description: 'Stay updated with our latest news, announcements, and company updates',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/news`,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description: 'Stay updated with our latest news, announcements, and company updates',
      },
    };
  }
}



// Server component for news page
async function NewsPageContent({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Parse search parameters (await the Promise in Next.js 15)
  const resolvedParams = await searchParams;
  const page = resolvedParams?.page ? parseInt(resolvedParams.page as string) : 1;
  const category = resolvedParams?.category as string;
  const search = resolvedParams?.search as string;

  // Fetch news data server-side
  const { newsData, categoriesData } = await getNewsData(page, 12, category, search);

  // Extract categories from the response
  const categories = categoriesData.categories || [];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 py-16 lg:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Latest
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent mt-2">
                News & Updates
              </span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
              Stay informed about our latest announcements, product launches, and company news
            </p>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((categoryItem) => (
              <button
                key={categoryItem.name}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${categoryItem.name === (category || 'All')
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }
                `}
              >
                {categoryItem.name}
                <span className="ml-1 text-xs opacity-75">
                  ({categoryItem.count})
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* News Grid Section */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {newsData.items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {newsData.items.map((item) => (
                  <NewsCard key={item.id} item={item} />
                ))}
              </div>

              {/* Pagination */}
              {newsData.pagination.totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="flex items-center gap-2">
                    {newsData.pagination.page > 1 && (
                      <Link
                        href={`/news?page=${newsData.pagination.page - 1}${category ? `&category=${category}` : ''}${search ? `&search=${search}` : ''}`}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Previous
                      </Link>
                    )}

                    <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
                      Page {newsData.pagination.page} of {newsData.pagination.totalPages}
                    </span>

                    {newsData.pagination.page < newsData.pagination.totalPages && (
                      <Link
                        href={`/news?page=${newsData.pagination.page + 1}${category ? `&category=${category}` : ''}${search ? `&search=${search}` : ''}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Next
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No news articles found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {search || category
                  ? 'Try adjusting your filters or search terms'
                  : 'Check back later for the latest updates'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-gray-100 dark:bg-gray-800 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Subscribe to our newsletter to receive the latest news and updates directly in your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default function NewsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return <NewsPageContent searchParams={searchParams} />;
}
