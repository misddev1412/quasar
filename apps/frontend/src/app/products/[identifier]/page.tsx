import type { Metadata } from 'next';
import ProductDetailClient from '../ProductDetailClient';
import Layout from '../../../components/layout/Layout';
import {
  buildProductDetailProps,
  buildProductMetadata,
  fetchProductByIdentifier,
} from '../productPageUtils';

interface ProductPageProps {
  params: Promise<{
    identifier: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { identifier } = await params;
  const product = await fetchProductByIdentifier(identifier);
  return buildProductMetadata(product, `/products/${identifier}`);
}

async function ProductPageContent({ params }: ProductPageProps) {
  const { identifier } = await params;
  const [product, detailProps] = await Promise.all([
    fetchProductByIdentifier(identifier),
    buildProductDetailProps(),
  ]);

  return (
    <Layout>
      <ProductDetailClient
        product={product}
        relatedProducts={detailProps.relatedProducts}
        frequentlyBoughtTogether={detailProps.frequentlyBoughtTogether}
        recommendedProducts={detailProps.recommendedProducts}
        trendingProducts={detailProps.trendingProducts}
        reviews={detailProps.reviews}
        comments={detailProps.comments}
      />
    </Layout>
  );
}

export default ProductPageContent;
