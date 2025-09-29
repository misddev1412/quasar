import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Image, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from '@heroui/react';
import PriceDisplay from './PriceDisplay';
import Rating from './Rating';
import AddToCartButton from './AddToCartButton';

// ProductVariant interface from backend entity
export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku?: string;
  barcode?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stockQuantity: number;
  lowStockThreshold?: number;
  trackInventory: boolean;
  allowBackorders: boolean;
  weight?: number;
  dimensions?: string;
  image?: string;
  attributes?: Record<string, unknown>;
  isActive: boolean;
  sortOrder: number;
  isInStock: boolean;
  isLowStock: boolean;
  isOutOfStock: boolean;
  canPurchase: boolean;
  discountPercentage?: number;
  profitMargin?: number;
}

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
  variants?: ProductVariant[];
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
  onAddToCart?: (product: Product, quantity?: number, variant?: ProductVariant | null) => void;
  onWishlistToggle?: (productId: string) => void;
  onQuickView?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  showAddToCart = true,
  showWishlist = true,
  showQuickView = false,
  className = '',
  imageHeight = 'h-64',
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
    variants,
  } = product;

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isImageHovered, setIsImageHovered] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(variants?.[0] || null);

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
  const inStock = selectedVariant
    ? selectedVariant.canPurchase
    : isActive && status === 'ACTIVE' && (stockQuantity === undefined || stockQuantity > 0);

  // Get current price and stock
  const currentPrice = selectedVariant?.price || price;
  const currentStock = selectedVariant?.stockQuantity || stockQuantity;

  // Generate slug if not provided
  const productSlug = slug || name?.toLowerCase().replace(/\s+/g, '-') || id;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product, 1, selectedVariant);
    }
  };

  const handleVariantChange = (variantId: string) => {
    const variant = variants?.find(v => v.id === variantId) || null;
    setSelectedVariant(variant);
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

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onOpen();
  };

  return (
    <div
      className={`group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 ${className}`}
    >
      {/* Product Image */}
      <div className={`relative overflow-hidden ${imageHeight} bg-white dark:bg-gray-800`}>
        <Link href={`/products/${productSlug}`}>
          <Image
            src={getPrimaryImage()}
            alt={name || 'Product'}
            className={`w-full h-full object-cover transition-transform duration-500 cursor-pointer rounded-t-xl ${
              isImageHovered ? 'scale-110' : 'scale-100'
            }`}
            removeWrapper
            onClick={handleImageClick}
            onMouseEnter={() => setIsImageHovered(true)}
            onMouseLeave={() => setIsImageHovered(false)}
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
              category && typeof category === 'object' && 'slug' in category && category.slug
                ? `/categories/${category.slug}`
                : Array.isArray(categories) && categories[0] && typeof categories[0] === 'object' && 'slug' in categories[0] && categories[0].slug
                ? `/categories/${categories[0].slug}`
                : '#'
            }
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors uppercase tracking-wide"
          >
            {category && typeof category === 'object' && 'name' in category ? category.name :
             Array.isArray(categories) && categories[0] && typeof categories[0] === 'object' && 'name' in categories[0] ? categories[0].name :
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

        {/* Variant Selector */}
        {variants && variants.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Variant:
            </label>
            <select
              value={selectedVariant?.id || ''}
              onChange={(e) => handleVariantChange(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={!inStock}
            >
              {variants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.name} - ${variant.price}
                  {variant.sku && ` (${variant.sku})`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Price */}
        {currentPrice && (
          <div className="mt-2">
            <PriceDisplay price={currentPrice} size="lg" />
          </div>
        )}

        {/* Stock */}
        {currentStock !== undefined && (
          <div className="text-xs font-medium">
            {currentStock > 0 ? (
              <span className="text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                ✅ {currentStock} in stock
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
              onAddToCart={(product, qty) => onAddToCart?.(product, qty, selectedVariant)}
              quantity={1}
              fullWidth
              size="md"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
            />
          </div>
        )}
      </div>

      {/* Large Image Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="5xl"
        backdrop="blur"
        className="dark:bg-gray-900"
      >
        <ModalContent className="p-0">
          <ModalHeader className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {name || 'Product Image'}
            </h2>
          </ModalHeader>
          <ModalBody className="p-0">
            <div className="flex items-center justify-center bg-black min-h-[400px]">
              <Image
                src={getPrimaryImage()}
                alt={name || 'Product'}
                className="max-w-full max-h-[70vh] object-contain"
                removeWrapper
              />
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ProductCard;
