import React, { useState, useCallback } from 'react';
import { Button, Card, Divider, Input, Chip, Alert } from '@heroui/react';
import Modal from '../common/Modal';
import { Card as CustomCard, CardHeader, CardBody, CardFooter } from '../common/Card';
import CartItem from './CartItem';
import { PriceDisplay } from './PriceDisplay';
import { useCart } from '../../contexts/CartContext';
import { useTranslations } from 'next-intl';
import type { ShippingOption } from '../../types/cart';

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
    }
    closeCartAndNotify();
  };

  const renderEmptyCart = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-6xl mb-4">🛒</div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('empty.title')}</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6">{t('empty.description')}</p>
      <Button color="primary" onPress={closeCartAndNotify}>
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
      <div className="space-y-3 mb-6">
        <h4 className="font-medium text-gray-900 dark:text-white">Shipping Options</h4>
        <div className="space-y-2">
          {shippingOptions.map((option) => (
            <label
              key={option.id}
              className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
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
        {appliedDiscounts.map((discount, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
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
    );
  };

  const renderCartContent = () => (
    <div className="flex flex-col h-full max-h-[80vh]">
      {/* Cart Header */}
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between w-full">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('title')} ({summary.totalItems === 1 ? t('items_count_single', { count: summary.totalItems }) : t('items_count', { count: summary.totalItems })})
          </h2>
          {isModal && (
            <Button isIconOnly variant="light" size="sm" onPress={closeCartAndNotify}>
              <span className="text-lg">✕</span>
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Cart Items */}
      <CardBody className="flex-1 overflow-y-auto py-4">
        {summary.isEmpty ? (
          renderEmptyCart()
        ) : (
          <div className="space-y-4">
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
      {!summary.isEmpty && (
        <CardFooter className="flex-col gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Cart Summary */}
          <div className="w-full space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
              <PriceDisplay price={summary.totals.subtotal} currency={summary.totals.currency} />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Shipping</span>
              <PriceDisplay price={summary.totals.shipping} currency={summary.totals.currency} />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Tax</span>
              <PriceDisplay price={summary.totals.tax} currency={summary.totals.currency} />
            </div>
            {summary.totals.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                <span>Discount</span>
                <span>-${summary.totals.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <PriceDisplay price={summary.totals.total} currency={summary.totals.currency} size="lg" />
            </div>
          </div>

          {/* Cart Actions */}
          <div className="flex flex-col gap-2 w-full">
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
