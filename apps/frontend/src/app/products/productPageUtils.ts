import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { serverTrpc } from '../../utils/trpc-server';
import type { Product } from '../../types/product';
import type { Review } from '../../components/ecommerce/ReviewList';
import type { Comment } from '../../components/ecommerce/CommentSection';
import { getPublicSiteName } from '../../lib/site-name';

interface ProductQueryResult {
  data?: {
    product?: Product;
  };
}

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
};

const resolveProductImages = (product: Product): string[] => {
  const mediaImages = Array.isArray(product.media)
    ? product.media.filter((media) => media.isImage).map((media) => media.url)
    : [];
  const imageUrls = Array.isArray((product as any).imageUrls)
    ? (product as any).imageUrls as string[]
    : [];

  if (imageUrls.length > 0) {
    return imageUrls;
  }

  return mediaImages;
};

const resolveProductPrice = (product: Product): number | null => {
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    const variantPrices = product.variants
      .map((variant) => Number(variant.price))
      .filter((price) => Number.isFinite(price));
    if (variantPrices.length > 0) {
      return Math.min(...variantPrices);
    }
  }

  const priceValue = Number(product.price);
  return Number.isFinite(priceValue) ? priceValue : null;
};

const normalizeRatingValue = (value: number | null | undefined): number | null => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null;
  }

  if (value < 0) {
    return 0;
  }

  if (value > 5) {
    return 5;
  }

  return value;
};

export const buildProductJsonLd = (product: Product, pathname: string) => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  const productUrl = siteUrl ? `${siteUrl}${pathname}` : undefined;
  const images = resolveProductImages(product);
  const price = resolveProductPrice(product);
  const ratingValue = normalizeRatingValue(product.averageRating ?? null);
  const reviewCount = typeof product.reviewCount === 'number' ? product.reviewCount : null;
  const inStock = product.isActive && product.status === 'ACTIVE' && (product.totalStock ?? 0) > 0;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    url: productUrl,
    image: images.length > 0 ? images : undefined,
    description: product.metaDescription || product.description || undefined,
    sku: product.sku || undefined,
    brand: (product.brand as any)?.name
      ? {
        '@type': 'Brand',
        name: (product.brand as any).name,
      }
      : undefined,
    offers: price && price > 0 && product.currencyCode
      ? {
        '@type': 'Offer',
        url: productUrl,
        priceCurrency: product.currencyCode,
        price,
        availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      }
      : undefined,
    aggregateRating: ratingValue !== null && reviewCount !== null && reviewCount > 0
      ? {
        '@type': 'AggregateRating',
        ratingValue,
        reviewCount,
      }
      : undefined,
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
