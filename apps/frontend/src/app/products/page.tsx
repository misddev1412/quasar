import { Metadata } from 'next';
import Header from '../../components/layout/Header';
import ProductsContainer from '../../components/ecommerce/ProductsContainer';

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

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 py-16 lg:py-20">
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

      {/* Products Section */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProductsContainer />
        </div>
      </section>
    </div>
  );
}