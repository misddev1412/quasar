import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getServerSideSEOWithFallback } from '../../../lib/seo-server';
import { SEOPageLayout } from '../../../components/layout/SEOPageLayout';
import ProductDetailClient from '../../../components/ecommerce/ProductDetailClient';
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

  return (
    <SEOPageLayout
      fallback={productSEOFallback}
      serverSEOData={serverSEOData}
    >
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <ProductDetailClient slug={slug} />
      </div>
    </SEOPageLayout>
  );
}

export default ProductPageContent;