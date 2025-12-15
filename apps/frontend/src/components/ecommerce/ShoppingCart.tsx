import React, { useState, useCallback } from 'react';
import { Button, Card, Divider, Input, Chip, Alert } from '@heroui/react';
import Modal from '../common/Modal';
import { Card as CustomCard, CardHeader, CardBody, CardFooter } from '../common/Card';
import CartItem from './CartItem';
import { PriceDisplay } from './PriceDisplay';
import { useCart } from '../../contexts/CartContext';
import { useTranslations } from 'next-intl';
import type { ShippingOption } from '../../types/cart';
import { useRouter } from 'next/navigation';

interface ShoppingCartProps {
  isOpen?: boolean;
  onClose?: () => void;
  isModal?: boolean;
  className?: string;
  showCheckoutButton?: boolean;
  showClearButton?: boolean;
  showShippingOptions?: boolean;
  showDiscountCode?: boolean;
  onCheckout?: () => void;
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({
  isOpen,
  onClose,
  isModal = true,
  className = '',
  showCheckoutButton = true,
  showClearButton = true,
  showShippingOptions = true,
  showDiscountCode = true,
  onCheckout,
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
    closeCart: contextCloseCart,
    isOpen: contextIsOpen,
  } = useCart();

  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  const cartLabel =
    summary.totalItems > 0
      ? t('aria_labels.cart_button', { count: summary.totalItems })
      : t('aria_labels.cart_button_empty');
  const hasCartItems = !summary.isEmpty;
  const hasDiscount = summary.totals.discount > 0;
  const formatMoney = (value: number) => `${summary.totals.currency}${value.toFixed(2)}`;

  // Sample shipping options - in production, these would come from an API
  const shippingOptions: ShippingOption[] = [
    {
      id: 'standard',
      name: 'Standard Shipping',
      description: '5-7 business days',
      cost: 5.99,
      estimatedDays: '5-7',
      type: 'standard',
    },
    {
      id: 'express',
      name: 'Express Shipping',
      description: '2-3 business days',
      cost: 12.99,
      estimatedDays: '2-3',
      type: 'express',
    },
    {
      id: 'overnight',
      name: 'Overnight Shipping',
      description: 'Next business day',
      cost: 24.99,
      estimatedDays: '1',
      type: 'overnight',
    },
  ];

  const closeCartAndNotify = useCallback(() => {
    contextCloseCart();
    if (onClose) {
      onClose();
    }
  }, [contextCloseCart, onClose]);

  const resolvedIsOpen = typeof isOpen === 'boolean' ? isOpen : contextIsOpen;

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
    closeCartAndNotify();
  };

  const renderEmptyCart = () => (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white/80 px-6 py-12 text-center dark:border-gray-700 dark:bg-gray-900/50">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-3xl dark:bg-primary-500/10">
        🛒
      </div>
      <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">{t('empty.title')}</h3>
      <p className="mb-6 max-w-sm text-sm text-gray-500 dark:text-gray-400">{t('empty.description')}</p>
      <Button color="primary" onPress={closeCartAndNotify} size="lg" className="px-8">
        {t('empty.continue')}
      </Button>
    </div>
  );

  const renderValidationAlerts = () => {
    if (validation.errors.length === 0 && validation.warnings.length === 0) {
      return null;
    }

    return (
      <div className="space-y-2 mb-4">
        {validation.errors.map((error, index) => (
          <Alert key={`error-${index}`} color="danger" variant="flat">
            {error.message}
          </Alert>
        ))}
        {validation.warnings.map((warning, index) => (
          <Alert key={`warning-${index}`} color="warning" variant="flat">
            {warning.message}
          </Alert>
        ))}
      </div>
    );
  };

  const renderShippingOptions = () => {
    if (!showShippingOptions || summary.isEmpty) return null;

    return (
      <div className="mb-6 space-y-3 rounded-2xl border border-gray-200/70 bg-white/80 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/60">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">
          Shipping Options
        </h4>
        <div className="space-y-2">
          {shippingOptions.map((option) => (
            <label
              key={option.id}
              className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all ${
                shippingOption?.id === option.id
                  ? 'border-primary-200 bg-primary-50/70 shadow-sm dark:border-primary-500/40 dark:bg-primary-500/10'
                  : 'border-gray-200 bg-white/70 hover:border-primary-100 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50 dark:hover:border-primary-500/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="shipping"
                  checked={shippingOption?.id === option.id}
                  onChange={() => setShippingOption(option)}
                  className="text-primary-500"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{option.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{option.description}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900 dark:text-white">
                  ${option.cost.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{option.estimatedDays} days</div>
              </div>
            </label>
          ))}
        </div>
      </div>
    );
  };

  const renderDiscountCode = () => {
    if (!showDiscountCode || summary.isEmpty) return null;

    return (
      <div className="space-y-3 mb-6">
        <h4 className="font-medium text-gray-900 dark:text-white">Discount Code</h4>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter discount code"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleApplyDiscount()}
            className="flex-1"
          />
          <Button
            color="primary"
            variant="flat"
            onPress={handleApplyDiscount}
            isLoading={isApplyingDiscount}
            isDisabled={!discountCode.trim()}
          >
            Apply
          </Button>
        </div>
        <div className="space-y-2">
          {appliedDiscounts.map((discount, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/80 p-2 dark:border-emerald-500/40 dark:bg-emerald-500/10"
            >
              <div className="flex items-center gap-2">
                <Chip color="success" variant="flat" size="sm">
                  {discount.code}
                </Chip>
                <span className="text-sm text-gray-600 dark:text-gray-300">{discount.description}</span>
              </div>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                color="danger"
                onPress={() => removeDiscount(discount.code)}
              >
                <span className="text-lg">✕</span>
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCartHighlights = () => {
    if (!hasCartItems) return null;

    const itemLabel = summary.totalItems === 1 ? 'Item' : 'Items';

    return (
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-3 text-white shadow-md">
          <p className="text-xs uppercase tracking-[0.2em] text-white/80">Current total</p>
          <p className="text-2xl font-semibold leading-tight">
            {formatMoney(summary.totals.total)}
          </p>
          <p className="text-xs text-white/70">Tax &amp; shipping included</p>
        </div>
        <div className="rounded-2xl border border-gray-200/70 bg-white/80 px-4 py-3 text-gray-900 shadow-sm dark:border-gray-700 dark:bg-gray-900/80 dark:text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Items</p>
          <p className="text-2xl font-semibold leading-tight">{summary.totalItems}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{itemLabel}</p>
        </div>
        {hasDiscount && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-emerald-700 shadow-sm dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200 sm:col-span-2">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-700/80 dark:text-emerald-200/80">Savings applied</p>
            <p className="text-2xl font-semibold leading-tight">
              -{formatMoney(summary.totals.discount)}
            </p>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-200/80">Automatically deducted from your total.</p>
          </div>
        )}
      </div>
    );
  };

  const renderCartContent = () => (
    <div className="flex h-full max-h-[85vh] min-h-0 flex-col">
      {/* Cart Header */}
      <CardHeader className="border-b border-gray-100 px-4 pb-4 sm:px-6 dark:border-gray-800">
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">{t('title')}</p>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{cartLabel}</h2>
            {hasCartItems && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {summary.totalItems} {summary.totalItems === 1 ? 'item' : 'items'} · {formatMoney(summary.totals.subtotal)} subtotal
              </p>
            )}
          </div>
          {isModal && (
            <Button isIconOnly variant="light" size="sm" onPress={closeCartAndNotify}>
              <span className="text-lg">✕</span>
            </Button>
          )}
        </div>
        {renderCartHighlights()}
      </CardHeader>

      {/* Cart Items */}
      <CardBody className="flex-1 min-h-0 overflow-y-auto px-4 py-4 sm:px-6">
        {summary.isEmpty ? (
          renderEmptyCart()
        ) : (
          <div className="space-y-4 pb-6">
            {renderValidationAlerts()}
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
                currency={summary.totals.currency}
              />
            ))}
            {renderShippingOptions()}
            {renderDiscountCode()}
          </div>
        )}
      </CardBody>

      {/* Cart Footer */}
      {hasCartItems && (
        <CardFooter className="flex-col gap-4 border-t border-gray-100 px-4 pb-6 pt-4 sm:px-6 dark:border-gray-800">
          {/* Cart Summary */}
          <div className="w-full space-y-3 rounded-2xl border border-gray-200/70 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/60">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <PriceDisplay price={summary.totals.subtotal} currency={summary.totals.currency} />
            </div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Shipping</span>
              <PriceDisplay price={summary.totals.shipping} currency={summary.totals.currency} />
            </div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Tax</span>
              <PriceDisplay price={summary.totals.tax} currency={summary.totals.currency} />
            </div>
            {summary.totals.discount > 0 && (
              <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                <span>Discount</span>
                <span>-${summary.totals.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="h-px bg-gray-200 dark:bg-gray-700" />
            <div className="flex items-center justify-between text-lg font-semibold text-gray-900 dark:text-white">
              <span>Total</span>
              <PriceDisplay price={summary.totals.total} currency={summary.totals.currency} size="lg" />
            </div>
          </div>

          {/* Cart Actions */}
          <div className="flex w-full flex-col gap-2">
            {showCheckoutButton && (
              <Button
                color="primary"
                size="lg"
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
                onPress={() => setIsConfirmingClear(true)}
                className="w-full"
              >
                {t('actions.clear')}
              </Button>
            )}
            {isModal && (
              <Button variant="light" onPress={closeCartAndNotify} className="w-full">
                {t('actions.continue')}
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </div>
  );

  if (isModal) {
    return (
      <>
        <Modal
          isOpen={resolvedIsOpen}
          onClose={closeCartAndNotify}
          size="2xl"
          backdrop="blur"
        >
          <CustomCard variant="default" padding="none">
            {renderCartContent()}
          </CustomCard>
        </Modal>

        {/* Clear Cart Confirmation Modal */}
        <Modal
          isOpen={isConfirmingClear}
          onClose={() => setIsConfirmingClear(false)}
          size="sm"
          backdrop="blur"
        >
          <CustomCard padding="lg">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Clear Cart</h3>
            </CardHeader>
            <CardBody>
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to remove all items from your cart? This action cannot be undone.
              </p>
            </CardBody>
            <CardFooter>
              <div className="flex justify-end gap-2 w-full">
                <Button
                  variant="flat"
                  onPress={() => setIsConfirmingClear(false)}
                >
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={handleClearCart}
                  isLoading={isLoading}
                >
                  Clear Cart
                </Button>
              </div>
            </CardFooter>
          </CustomCard>
        </Modal>
      </>
    );
  }

  if (!resolvedIsOpen) {
    return null;
  }

  return (
    <>
      <CustomCard variant="default" padding="none" className={className}>
        {renderCartContent()}
      </CustomCard>

      {/* Clear Cart Confirmation Modal */}
      <Modal
        isOpen={isConfirmingClear}
        onClose={() => setIsConfirmingClear(false)}
        size="sm"
        backdrop="blur"
      >
        <CustomCard padding="lg">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Clear Cart</h3>
          </CardHeader>
          <CardBody>
            <p className="text-gray-600 dark:text-gray-400">
              Are you sure you want to remove all items from your cart? This action cannot be undone.
            </p>
          </CardBody>
          <CardFooter>
            <div className="flex justify-end gap-2 w-full">
              <Button
                variant="flat"
                onPress={() => setIsConfirmingClear(false)}
              >
                Cancel
              </Button>
              <Button
                color="danger"
                onPress={handleClearCart}
                isLoading={isLoading}
              >
                Clear Cart
              </Button>
            </div>
          </CardFooter>
        </CustomCard>
      </Modal>
    </>
  );
};

export default ShoppingCart;
