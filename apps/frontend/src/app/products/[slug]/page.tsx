import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getServerSideSEOWithFallback } from '../../../lib/seo-server';
import { SEOPageLayout } from '../../../components/SEOPageLayout';
import type { SEOData } from '../../../types/trpc';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Fallback SEO data for product pages
const productSEOFallback: SEOData = {
  title: 'Products',
  description: 'Browse our wide range of high-quality products',
  keywords: 'products, shopping, online store, quality',
};

// Generate metadata for server-side SEO
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const pathname = `/products/${slug}`;
  const seoData = await getServerSideSEOWithFallback(pathname, productSEOFallback);

  const siteName = 'Your Site Name';
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
      url: `${process.env.NEXT_PUBLIC_SITE_URL}${pathname}`,
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

// Server component for product page
async function ProductPageContent({ params }: ProductPageProps) {
  const { slug } = await params;
  // Fetch SEO data server-side
  const pathname = `/products/${slug}`;
  const serverSEOData = await getServerSideSEOWithFallback(pathname, productSEOFallback);

  // Simulate fetching product data (replace with actual product fetching logic)
  const product = {
    name: slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
    description: 'High-quality product with excellent features and benefits.',
    price: 99.99,
  };

  if (!product) {
    notFound();
  }

  return (
    <SEOPageLayout
      fallback={productSEOFallback}
      serverSEOData={serverSEOData}
    >
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
          <p className="text-lg text-gray-600 mb-6">{product.description}</p>
          <div className="text-3xl font-bold text-blue-600 mb-8">
            ${product.price.toFixed(2)}
          </div>
          <div className="prose max-w-none">
            <h2>Product Details</h2>
            <p>This is a detailed description of the product. The SEO metadata for this page is loaded server-side to ensure Google robots can properly index it.</p>

            <h3>Key Features</h3>
            <ul>
              <li>High-quality materials</li>
              <li>Durable construction</li>
              <li>Modern design</li>
              <li>Excellent value</li>
            </ul>
          </div>
        </div>
      </div>
    </SEOPageLayout>
  );
}

export default ProductPageContent;