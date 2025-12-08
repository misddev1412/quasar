import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Layout from '../../../components/layout/Layout';
import CategoryDetailPage from '../../../components/ecommerce/CategoryDetailPage';
import { serverTrpc } from '../../../utils/trpc-server';
import type { Category } from '../../../types/product';
import type { Product } from '../../../types/product';

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
  const productsResponse = await serverTrpc.clientProducts.getProductsByCategory.query({ categoryId: category.id }) as any;
  const products = productsResponse?.data?.items as Product[] || [];

  // Fetch subcategories
  const subcategoriesResponse = await serverTrpc.clientCategories.getRootCategories.query({ parentId: category.id }) as any;
  const subcategories = subcategoriesResponse?.data as Category[] || [];

  return (
    <Layout>
      <CategoryDetailPage
        category={category}
        initialProducts={products}
        subcategories={subcategories}
      />
    </Layout>
  );
}

export default CategoryPageContent;