'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@heroui/react';
import { FiShoppingCart, FiPlus, FiCheck, FiLoader } from 'react-icons/fi';
import type { Product } from '../../types/product';
import type { ProductVariant } from '../../types/product';
import { useCart } from '../../contexts/CartContext';
import VariantSelectionModal from './VariantSelectionModal';

interface AddToCartButtonProps {
  product: Product;
  onAddToCart?: (product: Product, quantity?: number) => void;
  onVariantAddToCart?: (variant: ProductVariant, quantity?: number) => void;
  quantity?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  fullWidth?: boolean;
  className?: string;
  disabled?: boolean;
  showQuantitySelector?: boolean;
  iconOnly?: boolean;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  onAddToCart,
  onVariantAddToCart,
  quantity = 1,
  size = 'md',
  variant = 'solid',
  color = 'primary',
  fullWidth = false,
  className = '',
  disabled = false,
  showQuantitySelector = false,
  iconOnly = false,
}) => {
  const { addItem, isInCart, getItemQuantity, canAddToCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(quantity);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const mountedRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getStockQuantity = () => {
    // Check if product has variants
    if (product.variants && product.variants.length > 0) {
      // Return the sum of all variant stock quantities
      return product.variants.reduce((total, variant) => total + variant.stockQuantity, 0);
    }
    // For products without variants, assume they're in stock if active
    return product.isActive ? 1 : 0;
  };

  const handleAddToCart = async () => {
    // Check if product has variants
    if (product.variants && product.variants.length > 0) {
      setShowVariantModal(true);
      return;
    }

    const stockQuantity = getStockQuantity();
    if (stockQuantity <= 0 || disabled || !mountedRef.current) return;

    setIsLoading(true);
    try {
      if (mountedRef.current) {
        await addItem(product.id, selectedQuantity);

        // Call custom handler if provided
        if (onAddToCart) {
          await onAddToCart(product, selectedQuantity);
        }

        setIsAdded(true);
        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => setIsAdded(false), 2000);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleVariantAddToCart = async (variant: ProductVariant, quantity: number) => {
    if (!mountedRef.current) return;

    setIsLoading(true);
    try {
      await addItem(product.id, quantity, variant.id);

      // Call custom handler if provided
      if (onVariantAddToCart) {
        await onVariantAddToCart(variant, quantity);
      }

      setIsAdded(true);
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => setIsAdded(false), 2000);
    } catch (error) {
      console.error('Error adding variant to cart:', error);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  React.useEffect(() => {
    return () => {
      mountedRef.current = false;
      // Clean up timeout when component unmounts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedQuantity(parseInt(e.target.value));
  };

  const stockQuantity = getStockQuantity();
  const currentQuantity = getItemQuantity(product.id);
  const isAlreadyInCart = isInCart(product.id);
  const canAdd = canAddToCart(product.id, selectedQuantity);
  const isDisabled = disabled || stockQuantity <= 0 || isLoading || !canAdd;

  if (iconOnly) {
    return (
      <Button
        isIconOnly
        size={size}
        variant={variant}
        color={color}
        className={className}
        onPress={handleAddToCart}
        isLoading={isLoading}
        isDisabled={isDisabled}
        aria-label="Add to cart"
      >
        {isLoading ? (
          <FiLoader className="animate-spin text-lg" />
        ) : isAdded ? (
          <FiCheck className="text-lg text-green-500" />
        ) : (
          <FiShoppingCart className="text-lg" />
        )}
      </Button>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${fullWidth ? 'w-full' : ''}`}>
      {showQuantitySelector && (
        <select
          value={selectedQuantity}
          onChange={handleQuantityChange}
          className={`border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            size === 'sm' ? 'h-8' : size === 'lg' ? 'h-10' : 'h-9'
          }`}
          disabled={isDisabled}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((qty) => (
            <option key={qty} value={qty}>
              {qty}
            </option>
          ))}
        </select>
      )}

      <Button
        size={size}
        variant={variant}
        color={color}
        className={`${className} ${fullWidth ? 'flex-1' : ''}`}
        onPress={handleAddToCart}
        isLoading={isLoading}
        isDisabled={isDisabled}
        startContent={
          !isLoading && !iconOnly && (
            isAdded ? (
              <FiCheck className="text-lg text-green-500" />
            ) : (
              <FiShoppingCart className="text-lg" />
            )
          )
        }
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <FiLoader className="animate-spin" />
            <span>Adding...</span>
          </div>
        ) : isAdded ? (
          <div className="flex items-center gap-2">
            <FiCheck className="text-green-500" />
            <span>Added!</span>
          </div>
        ) : stockQuantity <= 0 ? (
          'Out of Stock'
        ) : product.variants && product.variants.length > 0 ? (
          <div className="flex items-center gap-2">
            <span>Select Options</span>
          </div>
        ) : isAlreadyInCart ? (
          <div className="flex items-center gap-2">
            <span>In Cart ({currentQuantity})</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span>Add to Cart</span>
          </div>
        )}
      </Button>

      {/* Variant Selection Modal */}
      <VariantSelectionModal
        isOpen={showVariantModal}
        onOpenChange={setShowVariantModal}
        product={product}
        onVariantSelect={handleVariantAddToCart}
      />
    </div>
  );
};

export default AddToCartButton;
