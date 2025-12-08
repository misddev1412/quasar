'use client';

import React, { useMemo } from 'react';
import { Card, Divider, Image } from '@heroui/react';
import { PriceDisplay } from './PriceDisplay';
import type { CartItemDetails } from '../../types/cart';
import { useTranslations } from 'next-intl';

interface OrderSummaryProps {
  cartItems: CartItemDetails[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  currency?: string;
  discount?: {
    amount: number;
    code?: string;
    description?: string;
  };
  className?: string;
  showItems?: boolean;
  showCouponCode?: boolean;
  onApplyCoupon?: (code: string) => void;
  onRemoveCoupon?: () => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  cartItems,
  subtotal,
  shippingCost,
  tax,
  total,
  currency = '$',
  discount,
  className = '',
  showItems = true,
  showCouponCode = true,
  onApplyCoupon,
  onRemoveCoupon,
}) => {
  const [couponCode, setCouponCode] = React.useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = React.useState(false);
  const t = useTranslations('ecommerce.checkout.orderSummary');
  const summaryT = useTranslations('ecommerce.cart.summary');

  const itemsForDisplay = useMemo(
    () =>
      cartItems.map((item) => {
        const variantLabel = (() => {
          if (!item.variant) {
            return undefined;
          }

          const attributeParts = item.variant.variantItems?.map((variantItem) => {
            const attributeName = variantItem.attribute?.displayName || variantItem.attribute?.name;
            const attributeValue =
              variantItem.attributeValue?.displayValue || variantItem.attributeValue?.value;

            if (attributeName && attributeValue) {
              return `${attributeName}: ${attributeValue}`;
            }
            if (attributeValue) {
              return attributeValue;
            }
            return attributeName || item.variant?.name;
          })?.filter((value): value is string => Boolean(value));

          if (attributeParts && attributeParts.length > 0) {
            return attributeParts.join(', ');
          }

          return item.variant.name;
        })();

        const imageSrc = (() => {
          if (item.variant?.image) {
            return item.variant.image;
          }

          const mediaItems = item.product.media;
          if (mediaItems && mediaItems.length > 0) {
            const primary = mediaItems.find((media) => media.isPrimary && media.url);
            if (primary?.url) {
              return primary.url;
            }

            const firstImage = mediaItems.find((media) => media.isImage && media.url) ?? mediaItems[0];
            if (firstImage?.url) {
              return firstImage.url;
            }
          }

          if (item.product.images && item.product.images.length > 0) {
            return item.product.images[0];
          }

          return '/placeholder-product.png';
        })();

        return {
          ...item,
          variantLabel,
          imageSrc,
        };
      }),
    [cartItems]
  );

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !onApplyCoupon) return;

    setIsApplyingCoupon(true);
    try {
      await onApplyCoupon(couponCode.trim());
    } catch (error) {
      console.error('Error applying coupon:', error);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    if (onRemoveCoupon) {
      onRemoveCoupon();
    }
  };

  const handleCouponCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCouponCode(e.target.value);
  };

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleApplyCoupon();
  };

  return (
    <Card className={`p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">{t('title')}</h3>

      {/* Order Items */}
      {showItems && (
        <>
          <div className="space-y-3 mb-4">
            {itemsForDisplay.map((item) => (
              <div key={item.id} className="flex items-center gap-3 text-sm">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100 dark:border-gray-700">
                  <Image
                    src={item.imageSrc}
                    alt={item.product.name}
                    className="h-full w-full object-cover"
                    removeWrapper
                  />
                </div>
                <div className="flex flex-1 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{item.product.name}</div>
                    {item.variantLabel && (
                      <div className="text-xs text-gray-500">{item.variantLabel}</div>
                    )}
                    <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                  </div>
                  <div className="font-medium whitespace-nowrap">
                    <PriceDisplay
                      price={item.unitPrice * item.quantity}
                      currency={currency}
                      className="justify-end"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Divider className="my-4" />
        </>
      )}

      {/* Coupon Code */}
      {showCouponCode && (
        <div className="mb-4">
          <form onSubmit={handleCouponSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder={t('coupon.placeholder')}
              value={couponCode}
              onChange={handleCouponCodeChange}
              disabled={!!discount || isApplyingCoupon}
              className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!couponCode.trim() || !!discount || isApplyingCoupon}
              className="px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isApplyingCoupon ? t('coupon.applying') : t('coupon.apply')}
            </button>
          </form>

          {discount && (
            <div className="mt-3 flex justify-between items-center">
              <div>
                <div className="text-sm font-medium text-green-600">
                  {discount.code
                    ? t('coupon.applied_with_code', { code: discount.code })
                    : t('coupon.applied')}
                </div>
                {discount.description && (
                  <div className="text-xs text-gray-500">{discount.description}</div>
                )}
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-sm text-red-500 hover:text-red-700"
              >
                {t('coupon.remove')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Order Totals */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{summaryT('subtotal')}</span>
          <PriceDisplay price={subtotal} currency={currency} className="justify-end" />
        </div>

        {discount && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{summaryT('discount')}</span>
            <span className="text-green-600 font-medium">
              -{currency}
              {discount.amount.toFixed(2)}
            </span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{summaryT('shipping')}</span>
          <PriceDisplay price={shippingCost} currency={currency} className="justify-end" />
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{summaryT('tax')}</span>
          <PriceDisplay price={tax} currency={currency} className="justify-end" />
        </div>

        <Divider className="my-2" />

        <div className="flex justify-between font-semibold">
          <span>{summaryT('total')}</span>
          <PriceDisplay price={total} currency={currency} size="lg" className="justify-end" />
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 space-y-1">
          <div>• {t('notes.free_shipping')}</div>
          <div>• {t('notes.money_back')}</div>
          <div>• {t('notes.secure_checkout')}</div>
        </div>
      </div>
    </Card>
  );
};

export default OrderSummary;
