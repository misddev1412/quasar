'use client';

import React, { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button, Image, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from '@heroui/react';
import PriceDisplay from './PriceDisplay';
import Rating from './Rating';
import AddToCartButton from './AddToCartButton';
import type { Product, ProductMedia, ProductVariant } from '../../types/product';
import { useAddToCart } from '../../hooks/useAddToCart';
import { useTranslation } from 'react-i18next';

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
  onAddToCart?: (product: Product, quantity?: number, variant?: ProductVariant | null) => void | boolean | Promise<void | boolean>;
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
  const displayName = useMemo(() => (name || '').replace(/\s+/g, ' ').trim(), [name]);
  const titleClampStyle = useMemo<React.CSSProperties>(() => {
    const lineHeight = 1.3;
    const height = `calc(${lineHeight}em * 2)`;

    return {
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      lineHeight,
      minHeight: height,
      maxHeight: height,
    };
  }, []);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isImageHovered, setIsImageHovered] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const { addToCart, isAdding } = useAddToCart();
  const { t } = useTranslation();

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

  const attributeGroups = useMemo(() => {
    if (!variants || variants.length === 0) return [] as Array<{ name: string; values: string[] }>;

    const attributeMap = new Map<string, Set<string>>();

    variants.forEach(variant => {
      if (variant.variantItems) {
        variant.variantItems.forEach(item => {
          if (item.attribute && item.attributeValue) {
            const attributeName = item.attribute.displayName || item.attribute.name;
            if (!attributeMap.has(attributeName)) {
              attributeMap.set(attributeName, new Set());
            }
            attributeMap.get(attributeName)!.add(item.attributeValue.displayValue || item.attributeValue.value);
          }
        });
      }
    });

    return Array.from(attributeMap.entries()).map(([name, values]) => ({
      name,
      values: Array.from(values).sort(),
    }));
  }, [variants]);

  const findMatchingVariant = useCallback(() => {
    if (!variants || variants.length === 0) return null;

    if (attributeGroups.length !== Object.keys(selectedAttributes).length) {
      return null;
    }

    return variants.find(variant => {
      if (!variant.variantItems || variant.variantItems.length === 0) return false;

      const variantAttributes = new Map<string, string>();

      variant.variantItems.forEach(item => {
        if (item.attribute && item.attributeValue) {
          const attributeName = item.attribute.displayName || item.attribute.name;
          variantAttributes.set(attributeName, item.attributeValue.displayValue || item.attributeValue.value);
        }
      });

      for (const [attrName, attrValue] of Object.entries(selectedAttributes)) {
        if (variantAttributes.get(attrName) !== attrValue) {
          return false;
        }
      }

      return variant.variantItems.length === attributeGroups.length;
    }) || null;
  }, [attributeGroups, selectedAttributes, variants]);

  const matchingVariant = useMemo(() => findMatchingVariant(), [findMatchingVariant]);

  const isCompleteSelection = useCallback(() => {
    const selectedCount = Object.keys(selectedAttributes).length;
    return attributeGroups.length > 0 && selectedCount === attributeGroups.length;
  }, [attributeGroups, selectedAttributes]);

  const canPurchaseVariant = useCallback((variantOption: ProductVariant | null) => {
    if (!variantOption) return false;
    const available = variantOption.stockQuantity ?? 0;
    if (available > 0) {
      return true;
    }
    if (variantOption.allowBackorders) {
      return true;
    }
    if (!variantOption.trackInventory) {
      return true;
    }
    return false;
  }, []);

  const getVariantStockMessage = useCallback((variantOption: ProductVariant | null) => {
    if (!variantOption) {
      return '';
    }

    const available = variantOption.stockQuantity ?? 0;

    if (available > 0) {
      return `${available} available`;
    }

    if (variantOption.allowBackorders) {
      return 'Available for backorder';
    }

    if (!variantOption.trackInventory) {
      return 'Available';
    }

    return 'Out of stock';
  }, []);

  // Handle attribute selection
  const handleAttributeSelect = (attributeName: string, value: string) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [attributeName]: value
    }));
  };

  // Handle quantity change
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  // Handle add to cart with selected variant
  const handleAddToCartWithVariant = useCallback(async (): Promise<boolean> => {
    const variantToAdd = findMatchingVariant();

    if (!variantToAdd || !canPurchaseVariant(variantToAdd)) {
      return false;
    }

    const result = await addToCart({ product, quantity, variant: variantToAdd });

    if (!result.success) {
      return false;
    }

    if (onAddToCart) {
      const callbackResult = await Promise.resolve(onAddToCart(product, quantity, variantToAdd));
      if (callbackResult === false) {
        return false;
      }
    }

    setShowVariantModal(false);
    setSelectedAttributes({});
    setQuantity(1);
    return true;
  }, [addToCart, canPurchaseVariant, findMatchingVariant, onAddToCart, product, quantity]);

  const handleAddToCartDirect = useCallback(async (selectedProduct: Product, requestedQuantity?: number): Promise<boolean | void> => {
    const nextQuantity = requestedQuantity || 1;

    if (variants && variants.length > 0) {
      setQuantity(nextQuantity);
      setShowVariantModal(true);
      return;
    }

    const result = await addToCart({ product: selectedProduct, quantity: nextQuantity });

    if (!result.success) {
      return false;
    }

    if (onAddToCart) {
      const callbackResult = await Promise.resolve(onAddToCart(selectedProduct, nextQuantity, null));
      if (callbackResult === false) {
        return false;
      }
    }

    return true;
  }, [addToCart, onAddToCart, variants]);

  
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
      className={`group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 flex flex-col h-full ${className}`}
    >
      {/* Product Image */}
      <div className={`relative overflow-hidden ${imageHeight} bg-white dark:bg-gray-800`}>
        <Link href={`/products/${productSlug}`}>
          <Image
            src={getPrimaryImage()}
            alt={displayName || t('ecommerce.productCard.imageAlt', 'Product Image')}
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
              {t('ecommerce.cart.outOfStock', 'Out of Stock')}
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
      <div className="p-5 flex flex-col flex-1">
        <div className="flex flex-col gap-3 flex-1 min-h-[180px] sm:min-h-[200px]">
          {/* Product Name */}
          <Link href={`/products/${productSlug}`} className="block">
            <h3
              className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-lg leading-tight"
              style={titleClampStyle}
            >
              {displayName}
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
                    {t('ecommerce.productCard.startingFrom', { price: `$${currentPrice}` })}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <div className="mt-auto pt-4">
          <div className="h-16 flex items-end">
            {showAddToCart && inStock && (
              <AddToCartButton
                product={product}
                onAddToCart={handleAddToCartDirect}
                quantity={1}
                fullWidth
                size="md"
                useInternalVariantSelection={false}
                className="relative group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] before:transition-transform before:duration-700 hover:before:translate-x-[100%] overflow-hidden"
              />
            )}
          </div>
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
                    {t('product.detail.actions.selectVariant')}
                  </p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody className="p-6">
              <div className="space-y-6">
                {/* Attribute Selection */}
                {attributeGroups.map((attribute) => (
                  <div key={attribute.name} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {attribute.name}
                      </h3>
                      {!selectedAttributes[attribute.name] && (
                        <span className="text-sm text-red-500 font-medium">
                          Required *
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {attribute.values.map((value) => (
                        <button
                          key={value}
                          onClick={() => handleAttributeSelect(attribute.name, value)}
                          className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 font-medium ${
                            selectedAttributes[attribute.name] === value
                              ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Quantity Selection */}
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Quantity
                  </h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      className="w-20 text-center border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                    />
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Price and Stock Display */}
                {matchingVariant && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Price:</span>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${matchingVariant.price}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">{t('ecommerce.productCard.stock', 'Stock')}:</span>
                      <span className={`text-sm font-medium ${
                        canPurchaseVariant(matchingVariant)
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {getVariantStockMessage(matchingVariant)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Validation Message */}
                {!isCompleteSelection() && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      {t('ecommerce.productCard.selectionWarning', {
                        current: Object.keys(selectedAttributes).length,
                        total: attributeGroups.length,
                      })}
                    </p>
                  </div>
                )}

                {/* Add to Cart Button */}
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCartWithVariant}
                    disabled={!isCompleteSelection() || !matchingVariant || !canPurchaseVariant(matchingVariant) || isAdding}
                    className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                      !isCompleteSelection() || !matchingVariant || !canPurchaseVariant(matchingVariant) || isAdding
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transform hover:scale-105 hover:shadow-lg'
                    }`}
                  >
                    {!isCompleteSelection()
                      ? t('ecommerce.cart.selectOptions', 'Select Options')
                      : !matchingVariant
                        ? t('ecommerce.productCard.combinationUnavailable', 'Combination Not Available')
                        : !canPurchaseVariant(matchingVariant)
                          ? t('ecommerce.cart.outOfStock', 'Out of Stock')
                          : isAdding
                            ? t('ecommerce.cart.adding', 'Adding...')
                            : t('ecommerce.cart.addWithPrice', {
                              price: `$${(((matchingVariant.price || 0) * quantity).toFixed(2))}`,
                            })
                  }
                  </button>
                  <button
                    onClick={() => {
                      setShowVariantModal(false);
                      setSelectedAttributes({});
                      setQuantity(1);
                    }}
                    className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      {t('product.detail.common.cancel', 'Cancel')}
                  </button>
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
              {name || t('ecommerce.productCard.imageAlt', 'Product Image')}
            </h2>
          </ModalHeader>
          <ModalBody className="p-0">
            <div className="flex items-center justify-center bg-black min-h-[400px]">
              <Image
                src={getPrimaryImage()}
                alt={name || t('ecommerce.productCard.imageAlt', 'Product Image')}
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
