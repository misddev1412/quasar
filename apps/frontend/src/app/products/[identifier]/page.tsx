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
  const renderedSections = await renderSections(orderedSections);

  return (
    <Layout>
      {renderedSections.length > 0 && (
        <div className="mb-12 space-y-12">{renderedSections}</div>
      )}
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
