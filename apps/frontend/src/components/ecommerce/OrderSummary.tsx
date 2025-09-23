import React from 'react';
import { Card, Divider } from '@heroui/react';
import { PriceDisplay } from './PriceDisplay';
import { CartItemData } from './ShoppingCart';

interface OrderSummaryProps {
  cartItems: CartItemData[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  currency?: string;
  discount?: {
    amount: number;
    code?: string;
    description?: string;
  };
  className?: string;
  showItems?: boolean;
  showCouponCode?: boolean;
  onApplyCoupon?: (code: string) => void;
  onRemoveCoupon?: () => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  cartItems,
  subtotal,
  shippingCost,
  tax,
  total,
  currency = '$',
  discount,
  className = '',
  showItems = true,
  showCouponCode = true,
  onApplyCoupon,
  onRemoveCoupon,
}) => {
  const [couponCode, setCouponCode] = React.useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = React.useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !onApplyCoupon) return;
    
    setIsApplyingCoupon(true);
    try {
      await onApplyCoupon(couponCode.trim());
    } catch (error) {
      console.error('Error applying coupon:', error);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    if (onRemoveCoupon) {
      onRemoveCoupon();
    }
  };

  const handleCouponCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCouponCode(e.target.value);
  };

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleApplyCoupon();
  };

  return (
    <Card className={`p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
      
      {/* Order Items */}
      {showItems && (
        <>
          <div className="space-y-3 mb-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.product.name}</div>
                  {item.selectedVariant && (
                    <div className="text-xs text-gray-500">
                      {item.selectedVariant.name}: {item.selectedVariant.value}
                    </div>
                  )}
                  <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                </div>
                <div className="font-medium">
                  {currency}{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          <Divider className="my-4" />
        </>
      )}
      
      {/* Coupon Code */}
      {showCouponCode && (
        <div className="mb-4">
          <form onSubmit={handleCouponSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Coupon code"
              value={couponCode}
              onChange={handleCouponCodeChange}
              disabled={!!discount || isApplyingCoupon}
              className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!couponCode.trim() || !!discount || isApplyingCoupon}
              className="px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isApplyingCoupon ? 'Applying...' : 'Apply'}
            </button>
          </form>
          
          {discount && (
            <div className="mt-3 flex justify-between items-center">
              <div>
                <div className="text-sm font-medium text-green-600">
                  {discount.code && `Coupon "${discount.code}" applied`}
                </div>
                {discount.description && (
                  <div className="text-xs text-gray-500">{discount.description}</div>
                )}
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Order Totals */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <PriceDisplay price={subtotal} currency={currency} />
        </div>
        
        {discount && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Discount</span>
            <span className="text-green-600">
              -{currency}{discount.amount.toFixed(2)}
            </span>
          </div>
        )}
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <PriceDisplay price={shippingCost} currency={currency} />
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
      
      {/* Additional Info */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 space-y-1">
          <div>• Free shipping on orders over $50</div>
          <div>• 30-day money-back guarantee</div>
          <div>• Secure checkout</div>
        </div>
      </div>
    </Card>
  );
};

export default OrderSummary;