import React from 'react';
import Link from 'next/link';
import { Button, Image, Input } from '@heroui/react';
import { FiMinus, FiPlus, FiX } from 'react-icons/fi';
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

  const handleQuantityChange = (nextQuantity: number) => {
    const clamped = Math.min(Math.max(nextQuantity, 1), maxQuantity);
    if (clamped !== quantity) {
      onUpdateQuantity(id, clamped);
    }
  };

  const handleQuantityInputChange = (value: string) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      return;
    }
    handleQuantityChange(parsed);
  };

  const handleQuantityStep = (delta: number) => {
    handleQuantityChange(quantity + delta);
  };

  const canDecrease = quantity > 1;
  const canIncrease = quantity < maxQuantity;

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
    <div
      className={`flex gap-3 rounded-md border border-gray-200 bg-white p-3 transition-colors hover:border-primary-300 hover:shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:hover:border-primary-500/60 dark:hover:bg-gray-900/70 ${
        !inStock ? 'opacity-80' : ''
      } ${className}`}
    >
      {/* Product Image */}
      {showImage && (
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
          <Link href={slug ? `/products/${slug}` : '#'}>
            <Image
              src={getProductImage()}
              alt={name}
              className="h-full w-full object-cover"
              removeWrapper
            />
          </Link>
        </div>
      )}

      {/* Product Details */}
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={slug ? `/products/${slug}` : '#'}
              className="block truncate text-sm font-medium text-gray-900 transition-colors hover:text-primary-500 dark:text-white"
            >
              {name}
            </Link>
            {variantText && (
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">{variantText}</p>
            )}
            {lowStock && inStock && (
              <span className="mt-1 inline-block text-xs text-amber-500">Low stock</span>
            )}
            {!inStock && (
              <span className="mt-1 inline-block text-xs text-red-500">Unavailable</span>
            )}
          </div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            <PriceDisplay price={totalPrice} currency={currency} />
          </div>
        </div>

        {showControls && (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-transparent bg-white px-2 py-1 dark:bg-gray-900">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="h-7 w-7 min-w-0 rounded-md bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:bg-transparent dark:text-gray-300 dark:hover:bg-gray-800"
                onPress={() => handleQuantityStep(-1)}
                isDisabled={!inStock || !canDecrease}
                aria-label="Decrease quantity"
              >
                <FiMinus className="text-sm" />
              </Button>
              <Input
                type="number"
                size="sm"
                variant="flat"
                min={1}
                max={maxQuantity}
                value={String(quantity)}
                onValueChange={handleQuantityInputChange}
                classNames={{
                  inputWrapper:
                    'h-8 w-16 min-w-[4rem] border border-transparent bg-transparent px-0 shadow-none data-[focus=true]:border-primary-200 data-[focus=true]:bg-transparent dark:data-[focus=true]:border-primary-500/40 data-[hover=true]:border-transparent data-[hover=true]:bg-transparent',
                  input: 'text-center text-sm font-semibold text-gray-900 dark:text-white',
                }}
                isDisabled={!inStock}
                aria-label="Cart item quantity"
              />
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="h-7 w-7 min-w-0 rounded-md bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:bg-transparent dark:text-gray-300 dark:hover:bg-gray-800"
                onPress={() => handleQuantityStep(1)}
                isDisabled={!inStock || !canIncrease}
                aria-label="Increase quantity"
              >
                <FiPlus className="text-sm" />
              </Button>
            </div>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="danger"
              onPress={handleRemove}
              className="text-red-500 hover:text-red-600"
            >
              <FiX className="text-base" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartItem;
