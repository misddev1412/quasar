import type { Metadata } from 'next';
import ProductDetailClient from '../ProductDetailClient';
import Layout from '../../../components/layout/Layout';
import {
  buildProductDetailProps,
  buildProductMetadata,
  fetchProductByIdentifier,
} from '../productPageUtils';
import { fetchSections } from '../../../services/sections.service';
import { renderSections } from '../../../components/sections';
import { getPreferredLocale } from '../../../lib/server-locale';

interface ProductPageProps {
  params: Promise<{
    identifier: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { identifier } = await params;
  const product = await fetchProductByIdentifier(identifier);
  return buildProductMetadata(product, `/products/${identifier}`);
}

async function ProductPageContent({ params, searchParams }: ProductPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const locale = await getPreferredLocale(resolvedSearchParams);
  const sectionsPromise = fetchSections('product_detail', locale);

  const [product, detailProps, sections] = await Promise.all([
    fetchProductByIdentifier(resolvedParams.identifier),
    buildProductDetailProps(),
    sectionsPromise,
  ]);

  const orderedSections = [...sections].sort((a, b) => a.position - b.position);
  // Filter out product_detail specific sections from generic rendering if they need special handling client-side
  // or just pass all sections to client and let client render?
  // Current decision: Pass ALL sections to Client, and remove server-side renderSections for this page
  // to ensure correct order interleaving.

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
        sections={orderedSections} // Pass sections to client
      />
    </Layout>
  );
}

export default ProductPageContent;
