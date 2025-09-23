import React, { useState } from 'react';
import { Button, Card, Divider, Modal, Alert } from '@heroui/react';
import { Product } from './ProductCard';
import ProductCard from './ProductCard';

interface WishlistProps {
  products: Product[];
  onRemoveFromWishlist: (productId: string) => void;
  onAddToCart?: (product: Product, quantity?: number) => void;
  onMoveAllToCart?: () => void;
  onClearWishlist?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  isModal?: boolean;
  className?: string;
  emptyMessage?: string;
  showAddToCart?: boolean;
  showClearButton?: boolean;
  showMoveAllButton?: boolean;
  loading?: boolean;
}

const Wishlist: React.FC<WishlistProps> = ({
  products,
  onRemoveFromWishlist,
  onAddToCart,
  onMoveAllToCart,
  onClearWishlist,
  isOpen = true,
  onClose,
  isModal = true,
  className = '',
  emptyMessage = 'Your wishlist is empty.',
  showAddToCart = true,
  showClearButton = true,
  showMoveAllButton = true,
  loading = false,
}) => {
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [isConfirmingMoveAll, setIsConfirmingMoveAll] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleRemoveFromWishlist = (productId: string) => {
    onRemoveFromWishlist(productId);
    setSuccessMessage('Product removed from wishlist');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleAddToCart = (product: Product, quantity?: number) => {
    if (onAddToCart) {
      onAddToCart(product, quantity);
      setSuccessMessage('Product added to cart');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleClearWishlist = () => {
    onClearWishlist?.();
    setIsConfirmingClear(false);
    setSuccessMessage('Wishlist cleared');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleMoveAllToCart = () => {
    onMoveAllToCart?.();
    setIsConfirmingMoveAll(false);
    setSuccessMessage('All products moved to cart');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const renderEmptyWishlist = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-5xl mb-4">❤️</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
      <p className="text-gray-500 mb-6">Add products to your wishlist to keep track of items you love</p>
      <Button color="primary" onPress={onClose}>
        Continue Shopping
      </Button>
    </div>
  );

  const renderWishlistContent = () => (
    <div className="flex flex-col h-full">
      {/* Wishlist Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <h2 className="text-xl font-semibold text-gray-900">
          My Wishlist ({products.length} {products.length === 1 ? 'item' : 'items'})
        </h2>
        {isModal && onClose && (
          <Button isIconOnly variant="light" size="sm" onPress={onClose}>
            <span className="text-lg">✕</span>
          </Button>
        )}
      </div>

      {/* Success Message */}
      {showSuccess && (
        <Alert
          color="success"
          variant="flat"
          className="mb-4"
          onClose={() => setShowSuccess(false)}
        >
          {successMessage}
        </Alert>
      )}

      {/* Wishlist Items */}
      <div className="flex-1 overflow-y-auto py-4">
        {products.length === 0 ? (
          renderEmptyWishlist()
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                showAddToCart={showAddToCart}
                showWishlist={false}
                onAddToCart={handleAddToCart}
                onWishlistToggle={() => handleRemoveFromWishlist(product.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Wishlist Actions */}
      {products.length > 0 && (
        <>
          <Divider className="my-4" />
          
          <div className="flex flex-col gap-2 pt-4 border-t">
            {showMoveAllButton && onMoveAllToCart && (
              <Button
                color="primary"
                onPress={() => setIsConfirmingMoveAll(true)}
                isLoading={loading}
                className="w-full"
              >
                Move All to Cart
              </Button>
            )}
            {showClearButton && onClearWishlist && (
              <Button
                variant="flat"
                color="danger"
                onPress={() => setIsConfirmingClear(true)}
                className="w-full"
              >
                Clear Wishlist
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
          size="4xl"
          scrollBehavior="inside"
          className={className}
        >
          <Card className="p-6">
            {renderWishlistContent()}
          </Card>
        </Modal>

        {/* Clear Wishlist Confirmation Modal */}
        <Modal
          isOpen={isConfirmingClear}
          onClose={() => setIsConfirmingClear(false)}
          size="sm"
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Clear Wishlist</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove all items from your wishlist? This action cannot be undone.
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
                onPress={handleClearWishlist}
              >
                Clear Wishlist
              </Button>
            </div>
          </Card>
        </Modal>

        {/* Move All to Cart Confirmation Modal */}
        <Modal
          isOpen={isConfirmingMoveAll}
          onClose={() => setIsConfirmingMoveAll(false)}
          size="sm"
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Move All to Cart</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to move all items from your wishlist to your cart?
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="flat"
                onPress={() => setIsConfirmingMoveAll(false)}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleMoveAllToCart}
              >
                Move All to Cart
              </Button>
            </div>
          </Card>
        </Modal>
      </>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      {renderWishlistContent()}
    </Card>
  );
};

export default Wishlist;