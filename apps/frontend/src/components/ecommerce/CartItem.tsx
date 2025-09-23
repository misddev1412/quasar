import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Image } from '@heroui/react';
import PriceDisplay from './PriceDisplay';
import { CartItemData } from './ShoppingCart';

interface CartItemProps {
  item: CartItemData;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  currency?: string;
  className?: string;
  showImage?: boolean;
  showControls?: boolean;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  currency = '$',
  className = '',
  showImage = true,
  showControls = true,
}) => {
  const { id, product, quantity, selectedVariant, price } = item;
  const { name, images, slug } = product;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      onUpdateQuantity(id, newQuantity);
    }
  };

  const handleIncrement = () => {
    handleQuantityChange(quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      handleQuantityChange(quantity - 1);
    }
  };

  const handleRemove = () => {
    onRemove(id);
  };

  const variantText = selectedVariant ? `${selectedVariant.name}: ${selectedVariant.value}` : '';

  return (
    <div className={`flex gap-4 p-4 border border-gray-200 rounded-lg ${className}`}>
      {/* Product Image */}
      {showImage && (
        <div className="flex-shrink-0 w-20 h-20">
          <Link to={`/products/${slug}`}>
            <Image
              src={images[0] || '/placeholder-product.png'}
              alt={name}
              className="w-full h-full object-cover rounded-md"
              removeWrapper
            />
          </Link>
        </div>
      )}

      {/* Product Details */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1">
          <Link 
            to={`/products/${slug}`}
            className="font-medium text-gray-900 hover:text-primary-500 transition-colors"
          >
            {name}
          </Link>
          
          {variantText && (
            <p className="text-sm text-gray-500 mt-1">{variantText}</p>
          )}
          
          <div className="mt-2">
            <PriceDisplay price={price} currency={currency} />
          </div>
        </div>

        {/* Quantity Controls */}
        {showControls && (
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                onPress={handleDecrement}
                isDisabled={quantity <= 1}
              >
                <span className="text-lg">-</span>
              </Button>
              
              <span className="w-8 text-center">{quantity}</span>
              
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                onPress={handleIncrement}
              >
                <span className="text-lg">+</span>
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">
                {currency}{(price * quantity).toFixed(2)}
              </span>
              
              <Button
                isIconOnly
                size="sm"
                variant="light"
                color="danger"
                onPress={handleRemove}
              >
                <span className="text-lg">🗑️</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartItem;