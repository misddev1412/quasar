import React from 'react';
import Link from 'next/link';
import { Button, Image, Input } from '@heroui/react';
import PriceDisplay from './PriceDisplay';
import type { CartItemDetails } from '../../types/cart';

const MinusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true" {...props}>
    <path d="M5 12h14" />
  </svg>
);

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true" {...props}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
);

const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="m6 6 12 12" />
    <path d="M6 18 18 6" />
  </svg>
);

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
  currency = 'USD',
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
      className={`flex gap-3 rounded-lg border border-gray-200/80 bg-white/90 px-3 py-3 text-sm transition-colors hover:border-primary-300 dark:border-gray-700 dark:bg-gray-900/70 ${
        !inStock ? 'opacity-80' : ''
      } ${className}`}
    >
      {/* Product Image */}
      {showImage && (
        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
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
              className="block text-sm font-medium text-gray-900 transition-colors hover:text-primary-500 dark:text-white line-clamp-2 leading-tight break-words"
            >
              {name}
            </Link>
            {variantText && (
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{variantText}</p>
            )}
            {lowStock && inStock && (
              <span className="mt-0.5 inline-block text-[0.65rem] uppercase tracking-wide text-amber-500">Low stock</span>
            )}
            {!inStock && (
              <span className="mt-0.5 inline-block text-[0.65rem] uppercase tracking-wide text-red-500">Unavailable</span>
            )}
          </div>
          <div className="shrink-0 text-right text-sm font-semibold text-gray-900 dark:text-white">
            <PriceDisplay price={totalPrice} currency={currency} />
          </div>
        </div>

        {showControls && (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-1 py-0.5 dark:border-gray-700 dark:bg-gray-900">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="h-6 w-6 min-w-0 rounded-md bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                onPress={() => handleQuantityStep(-1)}
                isDisabled={!inStock || !canDecrease}
                aria-label="Decrease quantity"
              >
                <MinusIcon className="h-3 w-3" />
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
                    'h-7 w-11 min-w-[2.5rem] border border-transparent bg-transparent px-0 shadow-none data-[focus=true]:border-primary-200 dark:data-[focus=true]:border-primary-500/40',
                  input: 'text-center text-xs font-semibold text-gray-900 dark:text-white',
                }}
                isDisabled={!inStock}
                aria-label="Cart item quantity"
              />
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="h-6 w-6 min-w-0 rounded-md bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                onPress={() => handleQuantityStep(1)}
                isDisabled={!inStock || !canIncrease}
                aria-label="Increase quantity"
              >
                <PlusIcon className="h-3 w-3" />
              </Button>
            </div>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="danger"
              onPress={handleRemove}
              className="text-red-500 hover:text-red-600"
              aria-label="Remove item"
            >
              <CloseIcon className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartItem;
