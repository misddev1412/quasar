import { Metadata } from 'next';
import { getServerSideSEOWithFallback } from '../lib/seo-server';
import Layout from '../components/layout/Layout';
import { fetchSections } from '../services/sections.service';
import { renderSections } from '../components/sections';
import type { SectionListItem } from '../types/sections';
import type { SEOData } from '../types/trpc';
import { getPreferredLocale } from '../lib/server-locale';

// Fallback SEO data for home page
const homeSEOFallback: SEOData = {
  title: 'Quasar - Home',
  description: 'Welcome to Quasar - A modern web application platform',
  keywords: 'quasar, home, web application, platform, javascript, typescript, react',
};

// Generate metadata for server-side SEO
export async function generateMetadata(): Promise<Metadata> {
  const seoData = await getServerSideSEOWithFallback('/', homeSEOFallback);

  const siteName = 'Quasar';
  const title = seoData.title.includes(siteName)
    ? seoData.title
    : `${seoData.title} | ${siteName}`;

  return {
    title,
    description: seoData.description || undefined,
    keywords: seoData.keywords || undefined,
    openGraph: {
      title,
      description: seoData.description || undefined,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: seoData.description || undefined,
    },
    other: seoData.additionalMetaTags || undefined,
  };
}

function renderFallbackContent() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 -mt-8 -mx-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Welcome to
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent ml-2">
                Quasar
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Discover amazing products with unbeatable prices and exceptional quality
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Shop Now
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Popular Categories</h2>
            <p className="text-gray-600 dark:text-gray-400">Explore our most popular product categories</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Electronics', icon: '📱', color: 'bg-blue-100' },
              { name: 'Fashion', icon: '👕', color: 'bg-pink-100' },
              { name: 'Home & Garden', icon: '🏠', color: 'bg-green-100' },
              { name: 'Sports', icon: '⚽', color: 'bg-orange-100' },
            ].map((category) => (
              <div key={category.name} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow bg-white dark:bg-gray-900/50 border border-transparent dark:border-gray-800">
                <div className={`${category.color} dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-4 mx-auto`}>
                  {category.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{category.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Shop the latest {category.name.toLowerCase()}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Featured Products</h2>
            <p className="text-gray-600 dark:text-gray-400">Handpicked products just for you</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((product) => (
              <div key={product} className="bg-white dark:bg-gray-900/60 border border-transparent dark:border-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                  <span className="text-4xl">📦</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Product {product}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    High-quality product with amazing features
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-300">
                      ${product * 29.99}
                    </span>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default async function RootPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const locale = await getPreferredLocale(resolvedSearchParams);
  const sections = await fetchSections('home', locale);
  const orderedSections = [...sections].sort((a, b) => a.position - b.position);

  const renderedSections = renderSections(orderedSections);

  return (
    <Layout>
      {renderedSections.length > 0 ? renderedSections : renderFallbackContent()}
    </Layout>
  );
}
