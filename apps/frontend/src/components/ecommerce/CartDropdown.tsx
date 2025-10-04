'use client';

import React, { useState, useCallback } from 'react';
import { Button, Card, Input, Chip, Alert, Divider } from '@heroui/react';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { Card as CustomCard, CardHeader, CardBody, CardFooter } from '../common/Card';
import Modal from '../common/Modal';
import CartItem from './CartItem';
import { PriceDisplay } from './PriceDisplay';
import { useCart } from '../../contexts/CartContext';
import { useTranslations } from 'next-intl';
import type { ShippingOption } from '../../types/cart';

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
    }
    closeCart();
  };

  const renderEmptyCart = () => (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      <div className="text-4xl mb-3">🛒</div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('empty.title')}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">{t('empty.description')}</p>
      <Button color="primary" size="sm" onPress={closeCart}>
        {t('empty.continue')}
      </Button>
    </div>
  );

  const renderValidationAlerts = () => {
    if (validation.errors.length === 0 && validation.warnings.length === 0) {
      return null;
    }

    return (
      <div className="space-y-2 mb-3">
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
      <div className="space-y-2 mb-4">
        <h4 className="font-medium text-sm text-gray-900 dark:text-white">{t('shipping.title')}</h4>
        <div className="space-y-1">
          {shippingOptions.map((option) => (
            <label
              key={option.id}
              className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="shipping"
                  checked={shippingOption?.id === option.id}
                  onChange={() => setShippingOption(option)}
                  className="text-primary-500"
                />
                <div>
                  <div className="font-medium text-sm text-gray-900 dark:text-white">{option.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{option.description}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-sm text-gray-900 dark:text-white">
                  ${option.cost.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{t('shipping.days', { days: option.estimatedDays })}</div>
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
      <div className="space-y-2 mb-4">
        <h4 className="font-medium text-sm text-gray-900 dark:text-white">{t('discount.title')}</h4>
        <div className="flex gap-1">
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
          <div key={index} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Chip color="success" variant="flat" size="sm">
                {discount.code}
              </Chip>
              <span className="text-xs text-gray-600 dark:text-gray-300">{discount.description}</span>
            </div>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="danger"
              onPress={() => removeDiscount(discount.code)}
              aria-label={t('discount.remove')}
            >
              <span className="text-lg">✕</span>
            </Button>
          </div>
        ))}
      </div>
    );
  };

  const renderCartContent = () => (
    <div className="w-80 max-h-96 overflow-y-auto">
      {/* Cart Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {cartLabel}
          </h3>
        </div>
      </div>

      {/* Cart Items */}
      <div className="p-4">
        {summary.isEmpty ? (
          renderEmptyCart()
        ) : (
          <div className="space-y-3">
            {renderValidationAlerts()}
            <div className="space-y-3 max-h-48 overflow-y-auto">
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
          </div>
        )}
      </div>

      {/* Cart Footer */}
      {!summary.isEmpty && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
          {/* Cart Summary */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{t('summary.subtotal')}</span>
              <PriceDisplay price={summary.totals.subtotal} currency={summary.totals.currency} />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{t('summary.shipping')}</span>
              <PriceDisplay price={summary.totals.shipping} currency={summary.totals.currency} />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{t('summary.tax')}</span>
              <PriceDisplay price={summary.totals.tax} currency={summary.totals.currency} />
            </div>
            {summary.totals.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                <span>{t('summary.discount')}</span>
                <span>-${summary.totals.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />
            <div className="flex justify-between font-semibold">
              <span>{t('summary.total')}</span>
              <PriceDisplay price={summary.totals.total} currency={summary.totals.currency} />
            </div>
          </div>

          {/* Cart Actions */}
          <div className="flex flex-col gap-2">
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
