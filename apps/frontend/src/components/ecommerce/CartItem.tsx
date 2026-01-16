import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button, Image, Input, Tooltip } from '@heroui/react';
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

const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
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
  const t = useTranslations('ecommerce.cart.items');
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
      className={`flex gap-3 rounded-xl border border-gray-100 bg-white p-2.5 transition-all hover:border-gray-300 dark:border-gray-800 dark:bg-gray-800/60 dark:hover:border-gray-700 ${!inStock ? 'opacity-70 grayscale' : ''
        } ${className}`}
    >
      {/* Product Image */}
      {showImage && (
        <div className="h-28 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
          <Link href={slug ? `/products/${slug}` : '#'}>
            <Image
              src={getProductImage()}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              removeWrapper
            />
          </Link>
        </div>
      )}

      {/* Product Details */}
      <div className="flex flex-1 flex-col justify-between py-0.5">
        <div className="flex flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 space-y-1">
              <Tooltip content={name} closeDelay={0}>
                <Link
                  href={slug ? `/products/${slug}` : '#'}
                  className="block text-sm font-semibold text-gray-900 transition-colors hover:text-primary-600 dark:text-white dark:hover:text-primary-400 line-clamp-1 leading-snug"
                >
                  {name}
                </Link>
              </Tooltip>
              {variantText && (
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{variantText}</p>
              )}
            </div>
            <div className="shrink-0 text-right">
              <div className="text-sm font-bold text-gray-900 dark:text-white">
                <PriceDisplay price={totalPrice} currency={currency} />
              </div>
            </div>
          </div>

          <div className="flex gap-1">
            {lowStock && inStock && (
              <span className="inline-flex items-center rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-500/20">
                {t('low_stock')}
              </span>
            )}
            {!inStock && (
              <span className="inline-flex items-center rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-700 ring-1 ring-inset ring-red-600/10 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-500/20">
                {t('unavailable')}
              </span>
            )}
          </div>
        </div>

        {showControls && (
          <div className="flex items-center justify-between gap-2">
            <div className="flex h-8 items-center rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="h-6 w-6 min-w-0 rounded-md bg-white text-gray-600 shadow-sm hover:text-primary-600 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300"
                onPress={() => handleQuantityStep(-1)}
                isDisabled={!inStock || !canDecrease}
                aria-label={t('decrease_quantity')}
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
                    'h-6 w-10 min-w-[2rem] bg-transparent shadow-none px-0 !border-none group-data-[focus=true]:bg-transparent',
                  input: 'text-center text-xs font-semibold text-gray-900 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
                }}
                isDisabled={!inStock}
                aria-label={t('quantity')}
              />
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="h-6 w-6 min-w-0 rounded-md bg-white text-gray-600 shadow-sm hover:text-primary-600 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300"
                onPress={() => handleQuantityStep(1)}
                isDisabled={!inStock || !canIncrease}
                aria-label={t('increase_quantity')}
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
              className="text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
              aria-label={t('remove')}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartItem;
