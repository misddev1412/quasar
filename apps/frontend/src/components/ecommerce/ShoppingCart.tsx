import React, { useState } from 'react';
import { Button, Card, Divider, Modal } from '@heroui/react';
import { Product } from './ProductCard';
import CartItem from './CartItem';
import { PriceDisplay } from './PriceDisplay';

export interface CartItemData {
  id: string;
  product: Product;
  quantity: number;
  selectedVariant?: Product['variants'][0];
  price: number; // This might be different from product.price if variant is selected
}

interface ShoppingCartProps {
  items: CartItemData[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  isModal?: boolean;
  className?: string;
  currency?: string;
  showCheckoutButton?: boolean;
  showClearButton?: boolean;
  loading?: boolean;
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  isOpen = true,
  onClose,
  isModal = true,
  className = '',
  currency = '$',
  showCheckoutButton = true,
  showClearButton = true,
  loading = false,
}) => {
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = items.length > 0 ? 5.99 : 0; // Example flat shipping rate
  const tax = subtotal * 0.08; // Example 8% tax
  const total = subtotal + shipping + tax;

  const handleClearCart = () => {
    onClearCart();
    setIsConfirmingClear(false);
  };

  const renderEmptyCart = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-5xl mb-4">🛒</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
      <p className="text-gray-500 mb-6">Add some products to your cart to continue shopping</p>
      <Button color="primary" onPress={onClose}>
        Continue Shopping
      </Button>
    </div>
  );

  const renderCartContent = () => (
    <div className="flex flex-col h-full">
      {/* Cart Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <h2 className="text-xl font-semibold text-gray-900">Shopping Cart</h2>
        {isModal && onClose && (
          <Button isIconOnly variant="light" size="sm" onPress={onClose}>
            <span className="text-lg">✕</span>
          </Button>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto py-4">
        {items.length === 0 ? (
          renderEmptyCart()
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={onUpdateQuantity}
                onRemove={onRemoveItem}
                currency={currency}
              />
            ))}
          </div>
        )}
      </div>

      {/* Cart Footer */}
      {items.length > 0 && (
        <>
          <Divider className="my-4" />
          
          {/* Cart Summary */}
          <div className="space-y-2 pb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <PriceDisplay price={subtotal} currency={currency} />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <PriceDisplay price={shipping} currency={currency} />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <PriceDisplay price={tax} currency={currency} />
            </div>
            <Divider className="my-2" />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <PriceDisplay price={total} currency={currency} size="lg" />
            </div>
          </div>

          {/* Cart Actions */}
          <div className="flex flex-col gap-2 pt-4 border-t">
            {showCheckoutButton && (
              <Button
                color="primary"
                size="lg"
                onPress={onCheckout}
                isLoading={loading}
                className="w-full"
              >
                Proceed to Checkout
              </Button>
            )}
            {showClearButton && (
              <Button
                variant="flat"
                color="danger"
                onPress={() => setIsConfirmingClear(true)}
                className="w-full"
              >
                Clear Cart
              </Button>
            )}
            {isModal && onClose && (
              <Button
                variant="light"
                onPress={onClose}
                className="w-full"
              >
                Continue Shopping
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );

  if (isModal) {
    return (
      <>
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          size="2xl"
          scrollBehavior="inside"
          className={className}
        >
          <Card className="p-6">
            {renderCartContent()}
          </Card>
        </Modal>

        {/* Clear Cart Confirmation Modal */}
        <Modal
          isOpen={isConfirmingClear}
          onClose={() => setIsConfirmingClear(false)}
          size="sm"
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Clear Cart</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove all items from your cart? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="flat"
                onPress={() => setIsConfirmingClear(false)}
              >
                Cancel
              </Button>
              <Button
                color="danger"
                onPress={handleClearCart}
              >
                Clear Cart
              </Button>
            </div>
          </Card>
        </Modal>
      </>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      {renderCartContent()}
    </Card>
  );
};

export default ShoppingCart;