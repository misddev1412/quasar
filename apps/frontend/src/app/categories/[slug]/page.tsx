import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Layout from '../../../components/layout/Layout';
import CategoryDetailPage from '../../../components/ecommerce/CategoryDetailPage';
import Container from '../../../components/common/Container';
import PageBreadcrumbs from '../../../components/common/PageBreadcrumbs';
import Link from 'next/link';
import { Button } from '@heroui/react';
import { serverTrpc } from '../../../utils/trpc-server';
import type { Category } from '../../../types/product';
import type { Product } from '../../../types/product';
import { getPublicSiteName } from '../../../lib/site-name';

const clampOpacity = (value: number) => Math.min(1, Math.max(0, value));

const hexToRgba = (hex: string, alpha: number) => {
  const normalized = hex.replace('#', '').trim();
  if (![3, 6].includes(normalized.length)) {
    return `rgba(15, 23, 42, ${alpha})`;
  }

  const expanded = normalized.length === 3
    ? normalized.split('').map((char) => char + char).join('')
    : normalized;

  const r = parseInt(expanded.slice(0, 2), 16);
  const g = parseInt(expanded.slice(2, 4), 16);
  const b = parseInt(expanded.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate metadata for server-side SEO
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;

  // Fetch category data server-side
  const categoryResponse = await serverTrpc.clientCategories.getCategoryBySlug.query({ slug }) as any;
  const category = categoryResponse?.data as Category | undefined;

  if (!category) {
    notFound();
  }
  const pathname = `/categories/${slug}`;

  // Use category-specific SEO fields with fallbacks
  const title = category.name;
  const description = category.description || `Browse our ${category.name} collection and discover amazing products.`;
  const keywords = `${category.name}, category, shopping, online store, products`;
  const imageUrl = category.image;

  const siteName = getPublicSiteName();
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

// Server component for category page
async function CategoryPageContent({ params }: CategoryPageProps) {
  const { slug } = await params;

  // Fetch category data server-side
  const categoryResponse = await serverTrpc.clientCategories.getCategoryBySlug.query({ slug }) as any;
  const category = categoryResponse?.data as Category | undefined;

  if (!category) {
    notFound();
  }

  // Fetch products in this category server-side
  const productsResponse = await serverTrpc.clientProducts.getProductsByCategory.query({ categoryId: slug }) as any;
  const products = productsResponse?.data?.items as Product[] || [];

  // Fetch subcategories
  const subcategoriesResponse = await serverTrpc.clientCategories.getRootCategories.query({ parentId: category.id }) as any;
  const subcategories = subcategoriesResponse?.data as Category[] || [];

  const numberFormatter = new Intl.NumberFormat();
  const productTotal = typeof category.productCount === 'number' ? category.productCount : products.length;
  const friendlyDescription = category.description || `Explore ${category.name} with curated picks for every style.`;
  const heroBackground = category.heroBackgroundImage || category.image || '';
  const showTitle = category.showTitle ?? true;
  const showProductCount = category.showProductCount ?? true;
  const showSubcategoryCount = category.showSubcategoryCount ?? true;
  const showCta = category.showCta ?? true;
  const heroOverlayEnabled = category.heroOverlayEnabled ?? true;
  const heroOverlayColor = category.heroOverlayColor?.trim() || '#0f172a';
  const heroOverlayOpacity = typeof category.heroOverlayOpacity === 'number'
    ? clampOpacity(category.heroOverlayOpacity / 100)
    : 0.7;
  const ctaLabel = category.ctaLabel?.trim();
  const ctaUrl = category.ctaUrl?.trim();
  const hasCta = showCta && (!!ctaLabel || !!ctaUrl);

  return (
    <Layout>
      <section className="relative overflow-hidden bg-emerald-900 py-16 lg:py-20">
        {heroBackground && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroBackground})` }}
          />
        )}
        {heroOverlayEnabled && (
          <div
            className="absolute inset-0"
            style={{ backgroundColor: hexToRgba(heroOverlayColor, heroOverlayOpacity) }}
          />
        )}
        <div className="absolute -top-24 -left-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-28 -right-10 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl" />
        <Container className="relative z-10">
          <div className="text-center text-white">
          
            {showTitle && (
              <h1 className="mt-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
                {category.name}
              </h1>
            )}
            <p className="mt-4 text-lg text-emerald-100 md:text-xl">
              {friendlyDescription}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {showProductCount && (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold">
                  {numberFormatter.format(productTotal)} products
                </span>
              )}
              {showSubcategoryCount && (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold">
                  {numberFormatter.format(subcategories.length)} subcategories
                </span>
              )}
            
            </div>
            {hasCta && (
              <div className="mt-8 flex justify-center">
                <Link href={ctaUrl || '/products'}>
                  <Button color="primary" variant="solid">
                    {ctaLabel || 'Explore products'}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </Container>
      </section>

      <PageBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Categories', href: '/categories' },
          { label: category.name, isCurrent: true },
        ]}
        fullWidth={true}
      />

      <section className="py-12 lg:py-16">
        <Container>
          <CategoryDetailPage
            category={category}
            categorySlug={slug}
            initialProducts={products}
            subcategories={subcategories}
          />
        </Container>
      </section>
    </Layout>
  );
}

export default CategoryPageContent;
