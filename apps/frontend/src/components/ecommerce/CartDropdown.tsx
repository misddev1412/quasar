'use client';

import React, { useState } from 'react';
import clsx from 'clsx';
import { Button, Input, Chip, Alert } from '@heroui/react';
import { FiShoppingCart, FiTruck, FiTag, FiX, FiAlertTriangle, FiInfo } from 'react-icons/fi';
import { Card as CustomCard, CardHeader, CardBody, CardFooter } from '../common/Card';
import Modal from '../common/Modal';
import CartItem from './CartItem';
import { PriceDisplay } from './PriceDisplay';
import { useCart } from '../../contexts/CartContext';
import { useTranslations } from 'next-intl';
import type { ShippingOption } from '../../types/cart';
import { useRouter } from 'next/navigation';

interface CartDropdownProps {
  showCheckoutButton?: boolean;
  showClearButton?: boolean;
  showShippingOptions?: boolean;
  showDiscountCode?: boolean;
  onCheckout?: () => void;
  className?: string;
}

const CartDropdown: React.FC<CartDropdownProps> = ({
  showCheckoutButton = true,
  showClearButton = false,
  showShippingOptions = false,
  showDiscountCode = false,
  onCheckout,
  className = '',
}) => {
  const t = useTranslations('ecommerce.cart');
  const router = useRouter();
  const {
    items,
    summary,
    isLoading,
    validation,
    shippingOption,
    appliedDiscounts,
    updateQuantity,
    removeItem,
    clearCart,
    applyDiscountCode,
    removeDiscount,
    setShippingOption,
    closeCart,
  } = useCart();

  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  const cartLabel =
    summary.totalItems > 0
      ? t('aria_labels.cart_button', { count: summary.totalItems })
      : t('aria_labels.cart_button_empty');

  // Sample shipping options - in production, these would come from an API
  const shippingOptions: ShippingOption[] = [
    {
      id: 'standard',
      name: t('shipping.standard'),
      description: t('shipping.standard_description'),
      cost: 5.99,
      estimatedDays: '5-7',
      type: 'standard',
    },
    {
      id: 'express',
      name: t('shipping.express'),
      description: t('shipping.express_description'),
      cost: 12.99,
      estimatedDays: '2-3',
      type: 'express',
    },
    {
      id: 'overnight',
      name: t('shipping.overnight'),
      description: t('shipping.overnight_description'),
      cost: 24.99,
      estimatedDays: '1',
      type: 'overnight',
    },
  ];

  const handleClearCart = async () => {
    await clearCart();
    setIsConfirmingClear(false);
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;

    setIsApplyingDiscount(true);
    try {
      await applyDiscountCode(discountCode.trim());
      setDiscountCode('');
    } catch (error) {
      // Error is handled by the cart context
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout();
    } else {
      router.push('/checkout');
    }
    closeCart();
  };

  const renderEmptyCart = () => (
    <div className="flex flex-col items-center justify-center gap-4 py-10 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400 shadow-inner dark:bg-gray-800 dark:text-gray-500">
        <FiShoppingCart className="text-2xl" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('empty.title')}</h3>
        <p className="mx-auto max-w-[15rem] text-sm text-gray-500 dark:text-gray-400">{t('empty.description')}</p>
      </div>
      <Button color="primary" size="sm" className="mt-2" onPress={closeCart}>
        {t('empty.continue')}
      </Button>
    </div>
  );

  const renderValidationAlerts = () => {
    if (validation.errors.length === 0 && validation.warnings.length === 0) {
      return null;
    }

    return (
      <div className="mb-3 space-y-2">
        {validation.errors.map((error, index) => (
          <Alert key={`error-${index}`} color="danger" variant="flat" className="rounded-xl border border-danger-100/60 bg-danger-50/50 px-3 py-2 text-left dark:border-danger-500/30 dark:bg-danger-500/5">
            <div className="flex items-start gap-2 text-sm text-danger-600 dark:text-danger-400">
              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-danger-500/10">
                <FiAlertTriangle className="text-xs" />
              </span>
              <span className="leading-snug">{error.message}</span>
            </div>
          </Alert>
        ))}
        {validation.warnings.map((warning, index) => (
          <Alert key={`warning-${index}`} color="warning" variant="flat" className="rounded-xl border border-warning-100/60 bg-warning-50/40 px-3 py-2 text-left dark:border-warning-500/30 dark:bg-warning-500/5">
            <div className="flex items-start gap-2 text-sm text-warning-600 dark:text-warning-400">
              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-warning-500/10">
                <FiInfo className="text-xs" />
              </span>
              <span className="leading-snug">{warning.message}</span>
            </div>
          </Alert>
        ))}
      </div>
    );
  };

  const renderShippingOptions = () => {
    if (!showShippingOptions || summary.isEmpty) return null;

    return (
      <div className="mb-4 space-y-2">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{t('shipping.title')}</h4>
        <div className="space-y-2">
          {shippingOptions.map((option) => {
            const isSelected = shippingOption?.id === option.id;

            return (
              <label
                key={option.id}
                className={clsx(
                  'flex items-start justify-between gap-4 rounded-xl border px-4 py-3 transition-colors',
                  isSelected
                    ? 'border-primary-200 bg-primary-50/60 ring-2 ring-primary-500/15 dark:border-primary-500/40 dark:bg-primary-500/10'
                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/50'
                )}
              >
                <div className="flex items-start gap-2 text-left">
                  <input
                    type="radio"
                    name="shipping"
                  checked={isSelected}
                  onChange={() => setShippingOption(option)}
                  className="mt-1.5 text-primary-500"
                />
                <div>
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-900 dark:text-white">
                    <span
                      className={clsx(
                        'inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
                        isSelected && 'bg-primary-100 text-primary-600 dark:bg-primary-500/20 dark:text-primary-200'
                      )}
                    >
                      <FiTruck className="text-base" />
                    </span>
                    <span>{option.name}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{option.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">${option.cost.toFixed(2)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{t('shipping.days', { days: option.estimatedDays })}</div>
              </div>
            </label>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDiscountCode = () => {
    if (!showDiscountCode || summary.isEmpty) return null;

    return (
      <div className="mb-4 space-y-3">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{t('discount.title')}</h4>
        <div className="flex gap-3">
          <Input
            type="text"
            placeholder={t('discount.placeholder')}
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleApplyDiscount()}
            className="flex-1"
            size="sm"
          />
          <Button
            color="primary"
            variant="flat"
            onPress={handleApplyDiscount}
            isLoading={isApplyingDiscount}
            isDisabled={!discountCode.trim()}
            size="sm"
          >
            {isApplyingDiscount ? t('discount.applying') : t('discount.apply')}
          </Button>
        </div>
        {appliedDiscounts.map((discount, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-xl border border-gray-200 bg-white/90 px-4 py-2.5 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-900/60"
          >
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
              <FiTag className="text-base text-gray-400" />
              <Chip color="success" variant="flat" size="sm">
                {discount.code}
              </Chip>
              <span className="text-xs text-gray-500 dark:text-gray-400">{discount.description}</span>
            </div>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="danger"
              onPress={() => removeDiscount(discount.code)}
              aria-label={t('discount.remove')}
            >
              <FiX className="text-sm" />
            </Button>
          </div>
        ))}
      </div>
    );
  };

  const renderCartContent = () => {
    const containerClasses = clsx(
      'w-[22rem] max-h-[32rem] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900',
      className
    );

    return (
      <div className={containerClasses}>
        {/* Cart Header */}
        <div
          className="border-b border-gray-100 bg-white px-5 py-4 dark:border-gray-800 dark:bg-gray-900"
          aria-label={cartLabel}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 shadow-inner dark:bg-primary-500/20 dark:text-primary-200">
                <FiShoppingCart className="text-lg" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-0">{t('title')}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {summary.totalItems === 1
                    ? t('items_count_single', { count: summary.totalItems })
                    : t('items_count', { count: summary.totalItems })}
                </p>
              </div>
            </div>
            {!summary.isEmpty && (
              <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                {summary.totalItems}
              </span>
            )}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex flex-col gap-4 px-5 py-4">
          {summary.isEmpty ? (
            renderEmptyCart()
          ) : (
            <>
              {renderValidationAlerts()}
              <div className="flex flex-col gap-3 overflow-y-auto pr-1" style={{ maxHeight: '12rem' }}>
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                    currency={summary.totals.currency}
                  />
                ))}
              </div>
              {renderShippingOptions()}
              {renderDiscountCode()}
            </>
          )}
        </div>

        {/* Cart Footer */}
        {!summary.isEmpty && (
          <div className="border-t border-gray-100 bg-white px-5 py-5 dark:border-gray-800 dark:bg-gray-900">
            {/* Cart Summary */}
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center justify-between">
                <span>{t('summary.subtotal')}</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  <PriceDisplay price={summary.totals.subtotal} currency={summary.totals.currency} />
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>{t('summary.shipping')}</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  <PriceDisplay price={summary.totals.shipping} currency={summary.totals.currency} />
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>{t('summary.tax')}</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  <PriceDisplay price={summary.totals.tax} currency={summary.totals.currency} />
                </span>
              </div>
              {summary.totals.discount > 0 && (
                <div className="flex items-center justify-between text-green-600 dark:text-green-400">
                  <span>{t('summary.discount')}</span>
                  <span className="font-medium">
                    - <PriceDisplay price={summary.totals.discount} currency={summary.totals.currency} />
                  </span>
                </div>
              )}

              <div className="h-px bg-gray-200 dark:bg-gray-700" />
              <div className="flex items-center justify-between text-base font-semibold text-gray-900 dark:text-white">
                <span>{t('summary.total')}</span>
                <PriceDisplay price={summary.totals.total} currency={summary.totals.currency} />
              </div>
            </div>

            {/* Cart Actions */}
            <div className="mt-5 flex flex-col gap-2">
              {showCheckoutButton && (
                <Button
                  color="primary"
                  size="sm"
                  onPress={handleCheckout}
                  isLoading={isLoading}
                  isDisabled={!summary.isValid || summary.hasOutOfStockItems}
                  className="w-full"
                >
                  {t('actions.checkout')}
                </Button>
              )}
              {showClearButton && (
                <Button
                  variant="flat"
                  color="danger"
                  size="sm"
                  onPress={() => setIsConfirmingClear(true)}
                  className="w-full"
                >
                  {t('actions.clear')}
                </Button>
              )}
              <Button variant="light" size="sm" onPress={closeCart} className="w-full">
                {t('actions.continue')}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {renderCartContent()}

      {/* Clear Cart Confirmation Modal */}
      <Modal
        isOpen={isConfirmingClear}
        onClose={() => setIsConfirmingClear(false)}
        size="sm"
        backdrop="blur"
      >
        <CustomCard padding="lg">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('clear.title')}</h3>
          </CardHeader>
          <CardBody>
            <p className="text-gray-600 dark:text-gray-400">
              {t('clear.message')}
            </p>
          </CardBody>
          <CardFooter>
            <div className="flex justify-end gap-2 w-full">
              <Button
                variant="flat"
                onPress={() => setIsConfirmingClear(false)}
              >
                {t('clear.cancel')}
              </Button>
              <Button
                color="danger"
                onPress={handleClearCart}
                isLoading={isLoading}
              >
                {t('clear.confirm')}
              </Button>
            </div>
          </CardFooter>
        </CustomCard>
      </Modal>
    </>
  );
};

export default CartDropdown;
