import React from 'react';

interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg';
  showDiscount?: boolean;
  className?: string;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  originalPrice,
  discountPercentage,
  currency = '$',
  size = 'md',
  showDiscount = true,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const currentPriceClasses = {
    sm: 'font-semibold',
    md: 'font-semibold',
    lg: 'font-bold',
  };

  const originalPriceClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const discountClasses = {
    sm: 'text-xs',
    md: 'text-xs',
    lg: 'text-sm',
  };

  const hasDiscount = originalPrice && originalPrice > price;
  const calculatedDiscount = hasDiscount 
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : discountPercentage;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Current Price */}
      <span className={`${sizeClasses[size]} ${currentPriceClasses[size]} text-gray-900`}>
        {currency}{price.toFixed(2)}
      </span>
      
      {/* Original Price (if discounted) */}
      {hasDiscount && (
        <span className={`${originalPriceClasses[size]} text-gray-500 line-through`}>
          {currency}{originalPrice.toFixed(2)}
        </span>
      )}
      
      {/* Discount Badge */}
      {showDiscount && calculatedDiscount && (
        <span className={`${discountClasses[size]} bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-medium`}>
          -{calculatedDiscount}%
        </span>
      )}
    </div>
  );
};

export default PriceDisplay;