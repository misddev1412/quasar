import { Metadata } from 'next';
import Layout from '../../components/layout/Layout';
import PageBreadcrumbs from '../../components/common/PageBreadcrumbs';
import ProductsContainer from '../../components/ecommerce/ProductsContainer';
import { fetchSections } from '../../services/sections.service';
import { renderSections } from '../../components/sections';
import { getPreferredLocale } from '../../lib/server-locale';
import { getPublicSiteName } from '../../lib/site-name';
import { SectionType } from '@shared/enums/section.enums';
import { serverTrpc } from '../../utils/trpc-server';

import { getServerSideSEOWithFallback } from '../../lib/seo-server';
import type { SEOData } from '../../types/trpc';
import type { Category } from '../../types/product';
import { getTranslations } from 'next-intl/server';

// Fallback SEO data for products page
const productsSEOFallback: SEOData = {
  title: 'Products',
  description: 'Browse our extensive collection of high-quality products at competitive prices',
  keywords: 'products, shop, online store, buy, deals',
};

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

// Generate metadata for products page
export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const rawCategoryParam = resolvedSearchParams?.category;
  const categoryFilter = typeof rawCategoryParam === 'string'
    ? rawCategoryParam.trim()
    : Array.isArray(rawCategoryParam) && rawCategoryParam.length === 1
      ? (rawCategoryParam[0] || '').trim()
      : '';

  const seoData = await getServerSideSEOWithFallback('/products', productsSEOFallback);
  const siteName = getPublicSiteName();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';

  let categorySeo: {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
  } | null = null;

  if (categoryFilter) {
    try {
      const categoryResponse = await serverTrpc.clientCategories.getCategoryBySlug.query({ slug: categoryFilter }) as any;
      const category = (categoryResponse?.data as Category | undefined) ?? null;

      if (category) {
        const translations = Array.isArray(category.translations) ? category.translations : [];
        const translationWithSlug = translations.find((translation) => translation?.slug === categoryFilter);
        const activeTranslation = translationWithSlug ?? translations[0];
        const seoTitle = activeTranslation?.seoTitle?.trim();
        const seoDescription = activeTranslation?.seoDescription?.trim();
        const seoKeywords = activeTranslation?.metaKeywords?.trim();

        categorySeo = {
          title: seoTitle || category.name,
          description: seoDescription || category.description,
          keywords: seoKeywords,
          image: category.image,
        };
      }
    } catch (error) {
      categorySeo = null;
    }
  }

  const resolvedTitle = categorySeo?.title || seoData.title;
  const title = resolvedTitle.includes(siteName)
    ? resolvedTitle
    : `${resolvedTitle} | ${siteName}`;
  const description = categorySeo?.description || seoData.description || undefined;
  const keywords = categorySeo?.keywords || seoData.keywords || undefined;
  const ogImage = categorySeo?.image || seoData.ogImage || undefined;
  const canonicalPath = categoryFilter ? `/products?category=${encodeURIComponent(categoryFilter)}` : '/products';

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: `${siteUrl}${canonicalPath}`,
      type: 'website',
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedSearchParams = await searchParams;
  const locale = await getPreferredLocale(resolvedSearchParams);
  const tCommon = await getTranslations('common');
  const rawCategoryParam = resolvedSearchParams?.category;
  const categoryFilter = typeof rawCategoryParam === 'string'
    ? rawCategoryParam.trim()
    : Array.isArray(rawCategoryParam) && rawCategoryParam.length === 1
      ? (rawCategoryParam[0] || '').trim()
      : '';
  const sections = await fetchSections('product', locale);
  const orderedSections = [...sections].sort((a, b) => a.position - b.position);
  const renderedSections = await renderSections(orderedSections);
  const hasProductListSection = orderedSections.some((section) => section.type === SectionType.PRODUCT_LIST);
  let filteredCategory: Category | null = null;

  if (categoryFilter) {
    try {
      const categoryResponse = await serverTrpc.clientCategories.getCategoryBySlug.query({ slug: categoryFilter }) as any;
      filteredCategory = (categoryResponse?.data as Category | undefined) ?? null;
    } catch (error) {
      filteredCategory = null;
    }
  }

  const breadcrumbs = filteredCategory
    ? [
      { label: tCommon('home'), href: '/' },
      { label: tCommon('products'), href: '/products' },
      { label: filteredCategory.name, isCurrent: true },
    ]
    : [
      { label: tCommon('home'), href: '/' },
      { label: tCommon('products'), isCurrent: true },
    ];

  return (
    <Layout>
      <PageBreadcrumbs
        items={breadcrumbs}
        fullWidth
      />
      <div className="pt-6 lg:pt-8">
        {renderedSections.length > 0 ? (
          <div className="space-y-12">{renderedSections}</div>
        ) : (
          <>
            {renderDefaultProductHero()}
          </>
        )}
      </div>

      {!hasProductListSection && (
        <section className="py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProductsContainer />
          </div>
        </section>
      )}
    </Layout>
  );
}
