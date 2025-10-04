import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';
import Layout from '../../../components/layout/Layout';
import { serverTrpc } from '../../../utils/trpc-server';
import type { Product } from '../../../types/product';
import type { Review } from '../../../components/ecommerce/ReviewList';
import type { Comment } from '../../../components/ecommerce/CommentSection';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate metadata for server-side SEO
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  // Fetch product data server-side
  const productResponse = await serverTrpc.clientProducts.getProductBySlug.query({ slug }) as any;
  const product = productResponse?.data?.product as Product | undefined;

  if (!product) {
    notFound();
  }
  const pathname = `/products/${slug}`;

  // Use product-specific SEO fields with fallbacks
  const title = product.metaTitle || product.name;
  const description = product.metaDescription || product.description || `Buy ${product.name} at our store. High-quality product with excellent value.`;
  const keywords = product.metaKeywords || `${product.name}, ${product.category || 'product'}, shopping, online store`;
  const primaryImage = product.media?.find(m => m.isPrimary) || product.media?.[0];
  const imageUrl = primaryImage?.url;

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
      type: 'website',
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

// Server component for product page
async function ProductPageContent({ params }: ProductPageProps) {
  const { slug } = await params;

  // Fetch product data server-side
  const productResponse = await serverTrpc.clientProducts.getProductBySlug.query({ slug }) as any;
  const product = productResponse?.data?.product as Product | undefined;

  if (!product) {
    notFound();
  }

  // Fetch related products server-side
  const relatedProductsResponse = await serverTrpc.clientProducts.getFeaturedProducts.query() as any;
  const relatedProducts = relatedProductsResponse?.data?.items as Product[] || [];

  // Mock data for reviews and comments (would come from API in real implementation)
  const mockReviews: Review[] = [];
  const mockComments: Comment[] = [];

  return (
    <Layout>
      <ProductDetailClient
        product={product}
        relatedProducts={relatedProducts}
        frequentlyBoughtTogether={relatedProducts.slice(0, 2)}
        recommendedProducts={relatedProducts}
        trendingProducts={relatedProducts}
        reviews={mockReviews}
        comments={mockComments}
      />
    </Layout>
  );
}

export default ProductPageContent;
