import React, { useState, useCallback } from 'react';
import { Button, Input, Chip } from '@heroui/react';
import Modal from '../common/Modal';
import { Card as CustomCard, CardHeader, CardBody, CardFooter } from '../common/Card';
import CartItem from './CartItem';
import { PriceDisplay } from './PriceDisplay';
import { useCart } from '../../contexts/CartContext';
import { useTranslations } from 'next-intl';
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

const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const CreditCardIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
  </svg>
);

const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const ShoppingBagIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
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
  onCheckout,
}) => {
  const t = useTranslations('ecommerce.cart');
  const router = useRouter();
  const {
    items,
    summary,
    isLoading,
    validation,
    updateQuantity,
    removeItem,
    clearCart,
    closeCart: contextCloseCart,
    isOpen: contextIsOpen,
  } = useCart();

  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const { formatCurrency } = useCurrencyFormatter({ currency: summary.totals.currency });

  const cartLabel =
    summary.totalItems > 0
      ? t('aria_labels.cart_button', { count: summary.totalItems })
      : t('aria_labels.cart_button_empty');
  const hasCartItems = !summary.isEmpty;
  const formatMoney = (value: number) => formatCurrency(value);

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

  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout();
    } else {
      router.push('/checkout');
    }
    closeCartAndNotify();
  };

  const renderEmptyCart = () => (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white/50 px-4 py-12 text-center dark:border-gray-700 dark:bg-gray-900/40">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-400 shadow-sm dark:bg-gray-800 dark:text-gray-500">
        <CartIcon className="h-6 w-6" />
      </div>
      <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-white">{t('empty.title')}</h3>
      <p className="mb-6 max-w-xs text-xs text-gray-500 dark:text-gray-400">{t('empty.description')}</p>
      <Button
        color="primary"
        onPress={closeCartAndNotify}
        size="md"
        className="px-6 font-medium shadow-md shadow-primary/20"
        startContent={<ShoppingBagIcon className="h-4 w-4" />}
      >
        {t('empty.continue')}
      </Button>
    </div>
  );

  const renderValidationAlerts = () => {
    if (validation.errors.length === 0 && validation.warnings.length === 0) {
      return null;
    }

    return (
      <div className="mb-4 space-y-2">
        {validation.errors.map((error, index) => (
          <div
            key={`error-${index}`}
            className="flex items-start gap-2 rounded-lg border border-danger-100 bg-danger-50/50 p-3 text-xs text-danger-600 dark:border-danger-500/30 dark:bg-danger-500/10 dark:text-danger-400"
          >
            <AlertIcon className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span className="font-medium leading-relaxed">{error.message}</span>
          </div>
        ))}
        {validation.warnings.map((warning, index) => (
          <div
            key={`warning-${index}`}
            className="flex items-start gap-2 rounded-lg border border-warning-100 bg-warning-50/50 p-3 text-xs text-warning-700 dark:border-warning-500/30 dark:bg-warning-500/10 dark:text-warning-400"
          >
            <InfoIcon className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span className="font-medium leading-relaxed">{warning.message}</span>
          </div>
        ))}
      </div>
    );
  };

  /* Removed renderCartHighlights as per user request */

  const renderCartContent = () => (
    <div className="flex h-full max-h-[85vh] min-h-[50vh] flex-col bg-white dark:bg-gray-900">
      {/* Cart Header */}
      <div className="flex-shrink-0 border-b border-gray-100 bg-white px-5 py-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 shadow-sm dark:bg-primary-500/20 dark:text-primary-300">
              <CartIcon className="h-5 w-5" />
            </div>
            <h2 className="m-0 text-lg font-bold leading-none text-gray-900 dark:text-white">
              {t('title')}
            </h2>
          </div>
          {onClose && (
            <Button
              isIconOnly
              variant="light"
              onPress={closeCartAndNotify}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              radius="full"
              size="sm"
            >
              <CloseIcon className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
        {summary.isEmpty ? (
          renderEmptyCart()
        ) : (
          <div className="space-y-4 pb-2">
            <div className="space-y-3">
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
            </div>
          </div>
        )}
      </div>

      {/* Cart Footer */}
      {hasCartItems && (
        <div className="flex-shrink-0 flex-col gap-3 border-t border-gray-100 bg-white px-5 py-4 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)] dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
          {/* Cart Summary */}
          <div className="space-y-2 mb-5">
            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
              <span className="capitalize">{t('items_count_single', { count: '' }).replace(/\d+/, '').trim() || 'Items'}</span>
              <span className="text-base font-semibold text-gray-900 dark:text-white">{summary.totalItems}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
              <span>{t('summary.subtotal')}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                <PriceDisplay price={summary.totals.subtotal} currency={summary.totals.currency} />
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{t('summary.tax')}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                <PriceDisplay price={summary.totals.tax} currency={summary.totals.currency} />
              </span>
            </div>
            <div className="my-2 h-px bg-dashed border-t border-gray-200 dark:border-gray-700" />
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-gray-900 dark:text-white">{t('summary.total')}</span>
              <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                <PriceDisplay price={summary.totals.total} currency={summary.totals.currency} size="lg" />
              </div>
            </div>
          </div>

          {/* Cart Actions */}
          <div className="flex w-full flex-col gap-3">
            {showCheckoutButton && (
              <Button
                color="primary"
                size="md"
                onPress={handleCheckout}
                isLoading={isLoading}
                isDisabled={!summary.isValid || summary.hasOutOfStockItems}
                className="w-full font-bold shadow-md shadow-primary/20"
                startContent={!isLoading && <CreditCardIcon className="h-4 w-4" />}
                endContent={!isLoading && <ArrowRightIcon className="h-4 w-4" />}
              >
                {t('actions.checkout')}
              </Button>
            )}

            <div className="grid grid-cols-2 gap-3">
              {showClearButton && (
                <Button
                  variant="flat"
                  color="danger"
                  size="sm"
                  onPress={() => setIsConfirmingClear(true)}
                  className="w-full font-medium"
                  startContent={<TrashIcon className="h-4 w-4" />}
                >
                  {t('actions.clear')}
                </Button>
              )}
              {isModal && (
                <Button
                  variant="bordered"
                  size="sm"
                  onPress={closeCartAndNotify}
                  className="w-full font-medium"
                  startContent={<ShoppingBagIcon className="h-4 w-4" />}
                >
                  {t('actions.continue')}
                </Button>
              )}
            </div>
          </div>
        </div>
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
          <div className="overflow-hidden bg-white dark:bg-gray-900 sm:rounded-2xl">
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
          <CustomCard padding="lg" className="border-0 shadow-none">
            <CardHeader>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('clear.title')}</h3>
            </CardHeader>
            <CardBody>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {t('clear.message')}
              </p>
            </CardBody>
            <CardFooter>
              <div className="flex justify-end gap-3 w-full">
                <Button
                  variant="flat"
                  onPress={() => setIsConfirmingClear(false)}
                  className="font-medium"
                >
                  {t('clear.cancel')}
                </Button>
                <Button
                  color="danger"
                  onPress={handleClearCart}
                  isLoading={isLoading}
                  className="font-medium shadow-lg shadow-danger/20"
                >
                  {t('clear.confirm')}
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
      <div className={`overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900 ${className}`}>
        {renderCartContent()}
      </div>

      {/* Clear Cart Confirmation Modal */}
      <Modal
        isOpen={isConfirmingClear}
        onClose={() => setIsConfirmingClear(false)}
        size="sm"
        backdrop="blur"
      >
        <CustomCard padding="lg" className="border-0 shadow-none">
          <CardHeader>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('clear.title')}</h3>
          </CardHeader>
          <CardBody>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('clear.message')}
            </p>
          </CardBody>
          <CardFooter>
            <div className="flex justify-end gap-3 w-full">
              <Button
                variant="flat"
                onPress={() => setIsConfirmingClear(false)}
                className="font-medium"
              >
                {t('clear.cancel')}
              </Button>
              <Button
                color="danger"
                onPress={handleClearCart}
                isLoading={isLoading}
                className="font-medium shadow-lg shadow-danger/20"
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

export default ShoppingCart;
