'use client';

import React, { useEffect, useState } from 'react';
import { CartProvider as CartContextProvider } from '../../contexts/CartContext';
import { useCart } from '../../contexts/CartContext';
import ShoppingCart from './ShoppingCart';
import CartDropdown from './CartDropdown';
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { FiShoppingCart } from 'react-icons/fi';
import { useTranslations } from 'next-intl';

interface CartProviderProps {
  children: React.ReactNode;
  currency?: string;
  taxRate?: number;
  defaultShippingCost?: number;
  maxQuantity?: number;
}

interface CartButtonProps {
  className?: string;
  showItemCount?: boolean;
  variant?: 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const CartProvider: React.FC<CartProviderProps> = ({
  children,
  ...cartProps
}) => {
  return <CartContextProvider {...cartProps}>{children}</CartContextProvider>;
};

export const CartButton: React.FC<CartButtonProps> = ({
  className = '',
  showItemCount = true,
  variant = 'solid',
  color = 'primary',
  size = 'md',
}) => {
  const { summary, openCart } = useCart();

  return (
    <Button
      variant={variant}
      color={color}
      size={size}
      onPress={openCart}
      className={className}
      startContent={<FiShoppingCart className="text-lg" />}
    >
      {showItemCount && summary.totalItems > 0 && (
        <span className="ml-1">
          {summary.totalItems}
        </span>
      )}
    </Button>
  );
};

export const CartIcon: React.FC<{ className?: string }> = ({ className = '' }) => {
  const t = useTranslations('ecommerce.cart');
  const { summary, openCart } = useCart();

  const cartLabel =
    summary.totalItems > 0
      ? t('aria_labels.cart_button', { count: summary.totalItems })
      : t('aria_labels.cart_button_empty');

  return (
    <button
      onClick={openCart}
      className={`relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
      aria-label={cartLabel}
    >
      <FiShoppingCart className="text-xl" />
      {summary.totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {summary.totalItems > 99 ? '99+' : summary.totalItems}
        </span>
      )}
    </button>
  );
};

export const CartDropdownIcon: React.FC<{ className?: string }> = ({ className = '' }) => {
  const t = useTranslations('ecommerce.cart');
  const { summary } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const cartLabel =
    summary.totalItems > 0
      ? t('aria_labels.cart_button', { count: summary.totalItems })
      : t('aria_labels.cart_button_empty');

  // Function to restore body scroll
  const restoreBodyScroll = () => {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    document.documentElement.style.overflow = '';
    document.body.classList.remove('overflow-hidden');
    document.documentElement.classList.remove('overflow-hidden');
  };

  // Monitor and restore scroll when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      // Use multiple timeouts to ensure HeroUI has finished its cleanup
      const timeout1 = setTimeout(() => {
        restoreBodyScroll();
      }, 0);
      
      const timeout2 = setTimeout(() => {
        restoreBodyScroll();
      }, 50);
      
      const timeout3 = setTimeout(() => {
        restoreBodyScroll();
      }, 200);

      // Also use MutationObserver to catch any late changes
      const observer = new MutationObserver(() => {
        if (document.body.style.overflow === 'hidden' || 
            document.documentElement.style.overflow === 'hidden') {
          restoreBodyScroll();
        }
      });

      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['style', 'class'],
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['style', 'class'],
      });

      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
        clearTimeout(timeout3);
        observer.disconnect();
        restoreBodyScroll();
      };
    }
  }, [isOpen]);

  return (
    <Dropdown 
      placement="bottom-end"
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          // Immediately restore scroll when closing
          restoreBodyScroll();
        }
      }}
    >
      <DropdownTrigger>
        <button
          className={`relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
          aria-label={cartLabel}
        >
          <FiShoppingCart className="text-xl" />
          {summary.totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {summary.totalItems > 99 ? '99+' : summary.totalItems}
            </span>
          )}
        </button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label={t('aria_labels.cart_dropdown')}
        variant="flat"
        className="min-w-[0] border-none bg-transparent p-0 shadow-none"
      >
        <DropdownItem
          key="cart"
          textValue={t('title')}
          isReadOnly
          className="rounded-2xl bg-transparent px-0 py-0 data-[hover=true]:bg-transparent"
        >
          <CartDropdown />
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export const CartSidebar: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isOpen, closeCart } = useCart();

  return (
    <ShoppingCart
      isOpen={isOpen}
      onClose={closeCart}
      isModal={false}
      className={`fixed right-0 top-0 h-full w-96 shadow-2xl z-50 ${className}`}
    />
  );
};

// Convenience wrapper that includes both cart context and cart UI
export const CartWrapper: React.FC<CartProviderProps & {
  showCartButton?: boolean;
  cartButtonProps?: CartButtonProps;
}> = ({
  children,
  showCartButton = false,
  cartButtonProps = {},
  ...cartProps
}) => {
  return (
    <CartProvider {...cartProps}>
      {children}
      {showCartButton && <CartButton {...cartButtonProps} />}
      <ShoppingCart />
    </CartProvider>
  );
};

// Export ShoppingCart for convenience
export { default as ShoppingCart } from './ShoppingCart';

// Export useCart hook for convenience
export { useCart } from '../../contexts/CartContext';
export default CartProvider;
