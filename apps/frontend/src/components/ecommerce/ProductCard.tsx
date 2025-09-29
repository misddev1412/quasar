import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Image, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from '@heroui/react';
import PriceDisplay from './PriceDisplay';
import Rating from './Rating';
import AddToCartButton from './AddToCartButton';
import type { Product, ProductMedia, ProductVariant } from '../../types/product';

// Legacy ProductVariant interface for backward compatibility
export interface LegacyProductVariant {
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

// Re-export Product and ProductMedia for backward compatibility
export type { ProductMedia, ProductVariant };
export type { Product };

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
  imageHeight = 'h-72',
  onAddToCart,
  onWishlistToggle,
  onQuickView,
}) => {
  const {
    id,
    name,
    sku,
    status,
    isActive,
    isFeatured,
    variants,
    media,
  } = product;

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isImageHovered, setIsImageHovered] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);

  // Get primary image or first image
  const getPrimaryImage = () => {
    if (media && media.length > 0) {
      const primaryMedia = media.find(m => m.isPrimary);
      return primaryMedia?.url || media[0].url;
    }
    return '/placeholder-product.png';
  };

  // Check if product is in stock
  const inStock = isActive && status === 'ACTIVE';

  // Get current price from variants (show lowest price if multiple variants)
  const currentPrice = variants && variants.length > 0 ? Math.min(...variants.map(v => v.price)) : null;

  // Generate slug if not provided
  const productSlug = name?.toLowerCase().replace(/\s+/g, '-') || id;

  const handleAddToCartDirect = (product: Product, quantity?: number) => {
    if (variants && variants.length > 0) {
      setShowVariantModal(true);
    } else if (onAddToCart) {
      onAddToCart(product, quantity || 1, null);
    }
  };

  const handleVariantSelect = (variant: ProductVariant, quantity: number) => {
    if (onAddToCart) {
      onAddToCart(product, quantity, variant);
    }
    setShowVariantModal(false);
  };

  const handleWishlistToggle = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (onWishlistToggle) {
      onWishlistToggle(id);
    }
  };

  const handleQuickView = (e: any) => {
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
        {isFeatured && (
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
              onPress={handleWishlistToggle}
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
              onPress={handleQuickView}
            >
              <span className="text-lg text-blue-600">👁️</span>
            </Button>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5 space-y-3">
        {/* Product Name */}
        <Link href={`/products/${productSlug}`} className="block">
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-lg leading-tight h-14 overflow-hidden">
            {name}
          </h3>
        </Link>

        {/* SKU */}
        {sku && (
          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded inline-block">
            SKU: {sku}
          </div>
        )}

      {/* Price */}
      <div className="h-16">
        {currentPrice && (
          <div className="mt-2">
            <PriceDisplay price={currentPrice} size="lg" />
            {variants && variants.length > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Starting from ${currentPrice}
              </p>
            )}
          </div>
        )}
      </div>

        {/* Add to Cart Button */}
        <div className="h-16 flex items-end">
          {showAddToCart && inStock && (
            <AddToCartButton
              product={product}
              onAddToCart={handleAddToCartDirect}
              quantity={1}
              fullWidth
              size="md"
              className="relative group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] before:transition-transform before:duration-700 hover:before:translate-x-[100%] overflow-hidden"
            />
          )}
        </div>
      </div>

      {/* Variant Selection Modal */}
      {showVariantModal && variants && variants.length > 0 && (
        <Modal
          isOpen={showVariantModal}
          onClose={() => setShowVariantModal(false)}
          size="2xl"
          backdrop="blur"
          className="dark:bg-gray-900"
        >
          <ModalContent className="p-0">
            <ModalHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <Image
                  src={getPrimaryImage()}
                  alt={name || 'Product'}
                  className="w-16 h-16 object-cover rounded-lg"
                  removeWrapper
                />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {name}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Select variant and quantity
                  </p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody className="p-6">
              <div className="space-y-6">
                {/* Variant Selection */}
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Select Variant
                  </h3>
                  <div className="grid gap-3">
                    {variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => handleVariantSelect(variant, 1)}
                        disabled={variant.stockQuantity <= 0}
                        className={`w-full p-4 border rounded-lg text-left transition-all duration-200 ${
                          variant.stockQuantity <= 0
                            ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {variant.name}
                            </h4>
                            {variant.sku && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                SKU: {variant.sku}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              ${variant.price}
                            </p>
                            <p className={`text-sm ${
                              variant.stockQuantity > 0
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {variant.stockQuantity > 0
                                ? `${variant.stockQuantity} in stock`
                                : 'Out of stock'
                              }
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

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