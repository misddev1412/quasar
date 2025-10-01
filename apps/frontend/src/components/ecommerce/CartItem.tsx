import React from 'react';
import Link from 'next/link';
import { Button, Image, Chip } from '@heroui/react';
import PriceDisplay from './PriceDisplay';
import type { CartItemDetails } from '../../types/cart';

interface CartItemProps {
  item: CartItemDetails;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  currency?: string;
  className?: string;
  showImage?: boolean;
  showControls?: boolean;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  currency = '$',
  className = '',
  showImage = true,
  showControls = true,
}) => {
  const { id, product, quantity, variant, unitPrice, totalPrice, inStock, lowStock, maxQuantity } = item;
  const { name, media, slug } = product;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      onUpdateQuantity(id, newQuantity);
    }
  };

  const handleIncrement = () => {
    handleQuantityChange(quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      handleQuantityChange(quantity - 1);
    }
  };

  const handleRemove = () => {
    onRemove(id);
  };

  const getProductImage = () => {
    if (media && media.length > 0) {
      const primaryMedia = media.find(m => m.isPrimary);
      return primaryMedia?.url || media[0].url;
    }
    return '/placeholder-product.png';
  };

  const variantText = variant ? variant.name : '';

  return (
    <div className={`flex gap-4 p-4 border ${!inStock ? 'border-red-200 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-700'} rounded-lg ${className}`}>
      {/* Product Image */}
      {showImage && (
        <div className="flex-shrink-0 w-20 h-20">
          <Link href={slug ? `/products/${slug}` : '#'}>
            <Image
              src={getProductImage()}
              alt={name}
              className="w-full h-full object-cover rounded-md"
              removeWrapper
            />
          </Link>
        </div>
      )}

      {/* Product Details */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Link
                href={slug ? `/products/${slug}` : '#'}
                className="font-medium text-gray-900 dark:text-white hover:text-primary-500 transition-colors"
              >
                {name}
              </Link>

              {variantText && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{variantText}</p>
              )}

              <div className="mt-2 flex items-center gap-2">
                <PriceDisplay price={unitPrice} currency={currency} />
                {lowStock && inStock && (
                  <Chip color="warning" variant="flat" size="sm">
                    Only {maxQuantity} left
                  </Chip>
                )}
                {!inStock && (
                  <Chip color="danger" variant="flat" size="sm">
                    Out of Stock
                  </Chip>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quantity Controls */}
        {showControls && (
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                onPress={handleDecrement}
                isDisabled={quantity <= 1 || !inStock}
              >
                <span className="text-lg">−</span>
              </Button>

              <span className="w-8 text-center font-medium">{quantity}</span>

              <Button
                isIconOnly
                size="sm"
                variant="flat"
                onPress={handleIncrement}
                isDisabled={quantity >= maxQuantity || !inStock}
              >
                <span className="text-lg">+</span>
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="font-medium text-gray-900 dark:text-white">
                  {currency}
                  {totalPrice.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {currency}{unitPrice.toFixed(2)} each
                </div>
              </div>

              <Button
                isIconOnly
                size="sm"
                variant="light"
                color="danger"
                onPress={handleRemove}
                className="text-red-500 hover:text-red-600"
              >
                <span className="text-lg">🗑️</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartItem;
