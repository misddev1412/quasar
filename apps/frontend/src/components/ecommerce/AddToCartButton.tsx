'use client';

import React, { useState } from 'react';
import { Button } from '@heroui/react';
import { Product } from './ProductCard';

interface AddToCartButtonProps {
  product: Product;
  onAddToCart?: (product: Product, quantity?: number) => void;
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
  const [isLoading, setIsLoading] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(quantity);

  const handleAddToCart = async () => {
    if (!product.inStock || disabled) return;

    setIsLoading(true);
    try {
      if (onAddToCart) {
        await onAddToCart(product, selectedQuantity);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedQuantity(parseInt(e.target.value));
  };

  const isDisabled = disabled || !product.inStock || isLoading;

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
        <span className="text-lg">🛒</span>
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
        startContent={!isLoading && !iconOnly && <span className="text-lg">🛒</span>}
      >
        {!isLoading && !iconOnly && <>{!product.inStock ? 'Out of Stock' : 'Add to Cart'}</>}
      </Button>
    </div>
  );
};

export default AddToCartButton;
