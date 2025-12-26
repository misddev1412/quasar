import React, { useState, useCallback } from 'react';
import { Button, Input, Chip } from '@heroui/react';
import Modal from '../common/Modal';
import { Card as CustomCard, CardHeader, CardBody, CardFooter } from '../common/Card';
import CartItem from './CartItem';
import { PriceDisplay } from './PriceDisplay';
import { useCart } from '../../contexts/CartContext';
import { useTranslations } from 'next-intl';
import type { ShippingOption } from '../../types/cart';
import { useRouter } from 'next/navigation';
import { useCurrencyFormatter } from '../../hooks/useCurrencyFormatter';

const CartIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <circle cx="9" cy="19" r="1.3" />
    <circle cx="17" cy="19" r="1.3" />
    <path d="M5 5h2l2.2 11h9.6L21 7H7" />
  </svg>
);

const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="m6 6 12 12" />
    <path d="M6 18 18 6" />
  </svg>
);

const TagIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M3 10V5a2 2 0 0 1 2-2h5l11 11-7 7L3 10Z" />
    <circle cx="8.5" cy="7.5" r="1.25" />
  </svg>
);

const TruckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M3 7h11v7H3z" />
    <path d="M14 10h3l3 4v3h-2" />
    <circle cx="7" cy="18" r="1.4" />
    <circle cx="17" cy="18" r="1.4" />
  </svg>
);

const AlertIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
    <path d="m10.29 3.86-8.47 15.13A1 1 0 0 0 2.71 21h18.58a1 1 0 0 0 .89-1.48L13.71 3.86a1 1 0 0 0-1.74 0Z" />
  </svg>
);

const InfoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5" />
    <path d="M12 8h.01" />
  </svg>
);

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
  const { formatCurrency } = useCurrencyFormatter({ currency: summary.totals.currency });

  const cartLabel =
    summary.totalItems > 0
      ? t('aria_labels.cart_button', { count: summary.totalItems })
      : t('aria_labels.cart_button_empty');
  const hasCartItems = !summary.isEmpty;
  const hasDiscount = summary.totals.discount > 0;
  const formatMoney = (value: number) => formatCurrency(value);

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
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white/70 px-4 py-10 text-center dark:border-gray-700 dark:bg-gray-900/40">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
        <CartIcon className="h-5 w-5" />
      </div>
      <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-white">{t('empty.title')}</h3>
      <p className="mb-4 max-w-xs text-sm text-gray-500 dark:text-gray-400">{t('empty.description')}</p>
      <Button color="primary" onPress={closeCartAndNotify} size="md" className="px-6">
        {t('empty.continue')}
      </Button>
    </div>
  );

  const renderValidationAlerts = () => {
    if (validation.errors.length === 0 && validation.warnings.length === 0) {
      return null;
    }

    return (
      <div className="mb-3 space-y-2 text-sm">
        {validation.errors.map((error, index) => (
          <div
            key={`error-${index}`}
            className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50/80 px-3 py-2 text-red-600 dark:border-red-500/30 dark:bg-red-500/5 dark:text-red-200"
          >
            <AlertIcon className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span className="leading-snug">{error.message}</span>
          </div>
        ))}
        {validation.warnings.map((warning, index) => (
          <div
            key={`warning-${index}`}
            className="flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50/80 px-3 py-2 text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/5 dark:text-amber-200"
          >
            <InfoIcon className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span className="leading-snug">{warning.message}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderShippingOptions = () => {
    if (!showShippingOptions || summary.isEmpty) return null;

    return (
      <div className="mb-5 rounded-xl border border-gray-200/70 bg-white/80 px-3 py-3 text-sm dark:border-gray-700 dark:bg-gray-900/60">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">
          <TruckIcon className="h-3.5 w-3.5" />
          Shipping
        </div>
        <div className="space-y-2">
          {shippingOptions.map((option) => {
            const isSelected = shippingOption?.id === option.id;

            return (
              <label
                key={option.id}
                className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 ${isSelected
                  ? 'border-primary-200 bg-primary-50/70 dark:border-primary-500/40 dark:bg-primary-500/10'
                  : 'border-gray-200 bg-white/70 hover:border-primary-100 dark:border-gray-700 dark:bg-gray-900/40'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    checked={isSelected}
                    onChange={() => setShippingOption(option)}
                    className="text-primary-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{option.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{option.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatMoney(option.cost)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{option.estimatedDays} days</div>
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
      <div className="mb-5 space-y-3 text-sm">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">
          <TagIcon className="h-3.5 w-3.5" />
          Discount
        </div>
        <div className="flex gap-2">
          <Input
            type="text"
            size="sm"
            placeholder="Enter code"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleApplyDiscount()}
            className="flex-1"
          />
          <Button
            color="primary"
            variant="flat"
            size="sm"
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
              className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/80 px-3 py-2 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
            >
              <div className="flex items-center gap-2">
                <Chip color="success" variant="flat" size="sm">
                  {discount.code}
                </Chip>
                <span className="text-xs">{discount.description}</span>
              </div>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                color="danger"
                onPress={() => removeDiscount(discount.code)}
              >
                <CloseIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCartHighlights = () => {
    if (!hasCartItems) return null;

    return (
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900/60">
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Items</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{summary.totalItems}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-right dark:border-gray-700 dark:bg-gray-900/60">
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Total</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatMoney(summary.totals.total)}
          </p>
        </div>
        {hasDiscount && (
          <div className="col-span-2 rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200">
            <p className="text-[0.65rem] uppercase tracking-[0.2em]">Savings</p>
            <p className="text-base font-semibold">-{formatMoney(summary.totals.discount)}</p>
          </div>
        )}
      </div>
    );
  };

  const renderCartContent = () => (
    <div className="flex h-full max-h-[78vh] min-h-[55vh] flex-col">
      {/* Cart Header */}
      <CardHeader className="flex-shrink-0 border-b border-gray-100 px-4 py-4 sm:px-6 dark:border-gray-800">
        <div className="flex w-full items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-primary-500 dark:border-gray-700 dark:bg-gray-900">
              <CartIcon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">{t('title')}</p>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{cartLabel}</h2>
              {hasCartItems && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {summary.totalItems} {summary.totalItems === 1 ? 'item' : 'items'} · {formatMoney(summary.totals.subtotal)}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasCartItems && (
              <span className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 dark:border-gray-700 dark:text-gray-300">
                {summary.totalItems}
              </span>
            )}

          </div>
        </div>
        {renderCartHighlights()}
      </CardHeader>

      {/* Cart Items */}
      <CardBody className="flex-1 min-h-0 overflow-y-auto px-4 py-4 sm:px-6">
        {summary.isEmpty ? (
          renderEmptyCart()
        ) : (
          <div className="space-y-4 pb-4">
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
        <CardFooter className="flex-shrink-0 flex-col gap-3 border-t border-gray-100 px-4 py-4 sm:px-6 dark:border-gray-800">
          {/* Cart Summary */}
          <div className="w-full space-y-2 rounded-xl border border-gray-200 bg-white/80 p-3 text-sm dark:border-gray-700 dark:bg-gray-900/60">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <PriceDisplay price={summary.totals.subtotal} currency={summary.totals.currency} />
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Shipping</span>
              <PriceDisplay price={summary.totals.shipping} currency={summary.totals.currency} />
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Tax</span>
              <PriceDisplay price={summary.totals.tax} currency={summary.totals.currency} />
            </div>
            {summary.totals.discount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Discount</span>
                <span>-{formatMoney(summary.totals.discount)}</span>
              </div>
            )}
            <div className="h-px bg-gray-200 dark:bg-gray-700" />
            <div className="flex items-center justify-between text-base font-semibold text-gray-900 dark:text-white">
              <span>Total</span>
              <PriceDisplay price={summary.totals.total} currency={summary.totals.currency} size="lg" />
            </div>
          </div>

          {/* Cart Actions */}
          <div className="flex w-full flex-col gap-2">
            {showCheckoutButton && (
              <Button
                color="primary"
                size="md"
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
                size="md"
                onPress={() => setIsConfirmingClear(true)}
                className="w-full"
              >
                {t('actions.clear')}
              </Button>
            )}
            {isModal && (
              <Button variant="light" size="md" onPress={closeCartAndNotify} className="w-full">
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
          size="xl"
          backdrop="blur"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
            {renderCartContent()}
          </div>
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
      <CustomCard variant="default" padding="none" className={`max-h-[82vh] ${className}`}>
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
