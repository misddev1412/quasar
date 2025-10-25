import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { serverTrpc } from '../../utils/trpc-server';
import type { Product } from '../../types/product';
import type { Review } from '../../components/ecommerce/ReviewList';
import type { Comment } from '../../components/ecommerce/CommentSection';

interface ProductQueryResult {
  data?: {
    product?: Product;
  };
}

const SITE_NAME = 'Quasar';

export const emptyReviews: Review[] = [];
export const emptyComments: Comment[] = [];

const clientProducts = (serverTrpc as any).clientProducts;

const fetchFeaturedProducts = async (): Promise<Product[]> => {
  const relatedProductsResponse = await clientProducts.getFeaturedProducts.query() as any;
  return relatedProductsResponse?.data?.items as Product[] || [];
};

const getProductBySlug = async (slug: string): Promise<Product | undefined> => {
  if (!slug) {
    return undefined;
  }

  try {
    const productResponse = await clientProducts.getProductBySlug.query({ slug }) as ProductQueryResult | undefined;
    return productResponse?.data?.product;
  } catch (error) {
    return undefined;
  }
};

const getProductById = async (id: string): Promise<Product | undefined> => {
  if (!id) {
    return undefined;
  }

  try {
    const productResponse = await clientProducts.getProductById.query({ id }) as ProductQueryResult | undefined;
    return productResponse?.data?.product;
  } catch (error) {
    return undefined;
  }
};

export const fetchProductBySlug = async (slug: string): Promise<Product> => {
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return product;
};

export const fetchProductById = async (id: string): Promise<Product> => {
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return product;
};

export const fetchProductByIdentifier = async (identifier: string): Promise<Product> => {
  const product = await getProductBySlug(identifier) ?? await getProductById(identifier);

  if (!product) {
    notFound();
  }

  return product;
};

export const buildProductMetadata = (product: Product, pathname: string): Metadata => {
  const title = product.metaTitle || product.name;
  const description = product.metaDescription || product.description || `Buy ${product.name} at our store. High-quality product with excellent value.`;
  const keywords = product.metaKeywords || `${product.name}, ${product.category || 'product'}, shopping, online store`;
  const primaryImage = product.media?.find(m => m.isPrimary) || product.media?.[0];
  const imageUrl = primaryImage?.url;

  const formattedTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

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
};

export const buildProductDetailProps = async () => {
  const relatedProducts = await fetchFeaturedProducts();

  return {
    relatedProducts,
    frequentlyBoughtTogether: relatedProducts.slice(0, 2),
    recommendedProducts: relatedProducts,
    trendingProducts: relatedProducts,
    reviews: emptyReviews,
    comments: emptyComments,
  } as const;
};
