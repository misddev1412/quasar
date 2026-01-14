import { Metadata } from 'next';
import Layout from '../../components/layout/Layout';
import PageBreadcrumbs from '../../components/common/PageBreadcrumbs';
import CategoriesContainer from '../../components/ecommerce/CategoriesContainer';
import { getPublicSiteName } from '../../lib/site-name';

// Generate metadata for categories page
export async function generateMetadata(): Promise<Metadata> {
  const siteName = getPublicSiteName();
  const title = `Categories - ${siteName}`;

  return {
    title,
    description: 'Browse our product categories and find exactly what you\'re looking for',
    keywords: 'categories, shop, product categories, browse, find products',
    openGraph: {
      title,
      description: 'Browse our product categories and find exactly what you\'re looking for',
      url: 'http://localhost:3001/categories',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: 'Browse our product categories and find exactly what you\'re looking for',
    },
  };
}

export default function CategoriesPage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 via-teal-600 to-cyan-700 py-16 lg:py-20 -mt-8 -mx-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Browse Our
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent mt-2">
                Product Categories
              </span>
            </h1>
            <p className="text-lg md:text-xl text-green-100 max-w-4xl mx-auto leading-relaxed">
              Explore our carefully organized categories to find exactly what you're looking for
            </p>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <PageBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Categories', isCurrent: true },
        ]}
        fullWidth={true}
      />

      {/* Categories Section */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CategoriesContainer />
        </div>
      </section>
    </Layout>
  );
}
