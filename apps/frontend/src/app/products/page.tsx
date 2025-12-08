import { Metadata } from 'next';
import Layout from '../../components/layout/Layout';
import ProductsContainer from '../../components/ecommerce/ProductsContainer';
import { fetchSections } from '../../services/sections.service';
import { renderSections } from '../../components/sections';
import { getPreferredLocale } from '../../lib/server-locale';

// Generate metadata for products page
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Products - Quasar',
    description: 'Browse our extensive collection of high-quality products at competitive prices',
    keywords: 'products, shop, online store, buy, deals',
    openGraph: {
      title: 'Products - Quasar',
      description: 'Browse our extensive collection of high-quality products at competitive prices',
      url: 'http://localhost:3001/products',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Products - Quasar',
      description: 'Browse our extensive collection of high-quality products at competitive prices',
    },
  };
}

const renderDefaultProductHero = () => (
  <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 py-16 lg:py-20 -mt-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          Discover Our
          <span className="block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent mt-2">
            Premium Products
          </span>
        </h1>
        <p className="text-lg md:text-xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
          Explore our carefully curated collection of high-quality products designed to elevate your everyday experience
        </p>
      </div>
    </div>
  </section>
);

interface ProductsPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedSearchParams = await searchParams;
  const locale = await getPreferredLocale(resolvedSearchParams);
  const sections = await fetchSections('product', locale);
  const orderedSections = [...sections].sort((a, b) => a.position - b.position);
  const renderedSections = renderSections(orderedSections);

  return (
    <Layout>
      {renderedSections.length > 0 ? (
        <div className="space-y-12">{renderedSections}</div>
      ) : (
        renderDefaultProductHero()
      )}

      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProductsContainer />
        </div>
      </section>
    </Layout>
  );
}
