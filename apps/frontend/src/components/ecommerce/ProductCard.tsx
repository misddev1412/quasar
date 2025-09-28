import React from 'react';
import Link from 'next/link';
import { Button, Image } from '@heroui/react';
import PriceDisplay from './PriceDisplay';
import Rating from './Rating';
import AddToCartButton from './AddToCartButton';

// Use the backend Product interface
export interface Product {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
  price?: number;
  stockQuantity?: number;
  isActive: boolean;
  isFeatured: boolean;
  isDigital?: boolean;
  images?: string[];
  media?: ProductMedia[];
  brand?: Brand | string;
  category?: Category | string;
  categories?: Category[] | string[];
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  slug?: string;
}

export interface ProductMedia {
  id: string;
  productId: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'other';
  url: string;
  altText?: string;
  caption?: string;
  sortOrder: number;
  fileSize?: number;
  mimeType?: string;
  width?: number;
  height?: number;
  duration?: number;
  thumbnailUrl?: string;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Brand {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  level: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean;
  showWishlist?: boolean;
  showQuickView?: boolean;
  className?: string;
  imageHeight?: string;
  onAddToCart?: (product: Product, quantity?: number) => void;
  onWishlistToggle?: (productId: string) => void;
  onQuickView?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  showAddToCart = true,
  showWishlist = true,
  showQuickView = false,
  className = '',
  imageHeight = 'h-48',
  onAddToCart,
  onWishlistToggle,
  onQuickView,
}) => {
  const {
    id,
    name,
    description,
    price,
    images,
    media,
    stockQuantity,
    isActive,
    status,
    slug,
    category,
    categories,
    brand,
  } = product;

  // Get primary image or first image
  const getPrimaryImage = () => {
    if (media && media.length > 0) {
      const primaryMedia = media.find(m => m.isPrimary);
      return primaryMedia?.url || media[0].url;
    }
    if (images && images.length > 0) {
      return images[0];
    }
    return '/placeholder-product.png';
  };

  // Check if product is in stock
  const inStock = isActive && status === 'ACTIVE' && (stockQuantity === undefined || stockQuantity > 0);

  // Generate slug if not provided
  const productSlug = slug || name?.toLowerCase().replace(/\s+/g, '-') || id;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onWishlistToggle) {
      onWishlistToggle(id);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  return (
    <div
      className={`group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 ${className}`}
    >
      {/* Product Image */}
      <div className={`relative overflow-hidden ${imageHeight} bg-gray-100 dark:bg-gray-700`}>
        <Link href={`/products/${productSlug}`}>
          <Image
            src={getPrimaryImage()}
            alt={name || 'Product'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            removeWrapper
          />
        </Link>

        {/* Featured Badge */}
        {product.isFeatured && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            <span className="flex items-center gap-1">
              ⭐ Featured
            </span>
          </div>
        )}

        {/* Out of Stock Badge */}
        {!inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center">
            <span className="text-white font-bold text-lg bg-red-600 px-4 py-2 rounded-lg">
              Out of Stock
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0">
          {showWishlist && (
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="bg-white dark:bg-gray-800 rounded-full shadow-lg hover:scale-110 transition-transform duration-200 border border-gray-200 dark:border-gray-600"
              onClick={handleWishlistToggle}
            >
              <span className="text-lg text-red-500">❤️</span>
            </Button>
          )}
          {showQuickView && (
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="bg-white dark:bg-gray-800 rounded-full shadow-lg hover:scale-110 transition-transform duration-200 border border-gray-200 dark:border-gray-600"
              onClick={handleQuickView}
            >
              <span className="text-lg text-blue-600">👁️</span>
            </Button>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5 space-y-3">
        {/* Category */}
        {(category || categories) && (
          <Link
            href={
              typeof category === 'object' && category?.slug
                ? `/categories/${category.slug}`
                : typeof categories === 'object' && categories?.[0]?.slug
                ? `/categories/${categories[0].slug}`
                : '#'
            }
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors uppercase tracking-wide"
          >
            {typeof category === 'object' ? category?.name :
             Array.isArray(categories) && categories[0] ? categories[0].name :
             typeof category === 'string' ? category : ''}
          </Link>
        )}

        {/* Product Name */}
        <Link href={`/products/${productSlug}`} className="block">
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-lg leading-tight">
            {name}
          </h3>
        </Link>

        {/* Product Description */}
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Brand */}
        {typeof brand === 'object' && brand?.name && (
          <div className="text-sm text-gray-700 dark:text-gray-400 font-medium">
            Brand: <span className="text-gray-900 dark:text-gray-200">{brand.name}</span>
          </div>
        )}

        {/* SKU */}
        {product.sku && (
          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded inline-block">
            SKU: {product.sku}
          </div>
        )}

        {/* Price */}
        {price && (
          <div className="mt-2">
            <PriceDisplay price={price} size="lg" />
          </div>
        )}

        {/* Stock */}
        {stockQuantity !== undefined && (
          <div className="text-xs font-medium">
            {stockQuantity > 0 ? (
              <span className="text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                ✅ {stockQuantity} in stock
              </span>
            ) : (
              <span className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full">
                ❌ Out of stock
              </span>
            )}
          </div>
        )}

        {/* Add to Cart Button */}
        {showAddToCart && inStock && (
          <div className="mt-4">
            <AddToCartButton
              product={product}
              onAddToCart={onAddToCart}
              fullWidth
              size="md"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
