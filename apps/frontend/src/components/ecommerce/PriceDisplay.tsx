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

  if (price === undefined || price === null || Number.isNaN(price)) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className={`${sizeClasses[size]} ${currentPriceClasses[size]} text-gray-500`}>
          {currency}0.00
        </span>
      </div>
    );
  }

  const normalizedPrice = Number(price);
  const normalizedOriginalPrice =
    originalPrice !== undefined && originalPrice !== null ? Number(originalPrice) : undefined;

  const hasDiscount = normalizedOriginalPrice !== undefined && normalizedOriginalPrice > normalizedPrice;
  const calculatedDiscount = hasDiscount
    ? Math.round(((normalizedOriginalPrice - normalizedPrice) / normalizedOriginalPrice) * 100)
    : discountPercentage;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Current Price */}
      <span className={`${sizeClasses[size]} ${currentPriceClasses[size]} text-gray-900`}>
        {currency}
        {normalizedPrice.toFixed(2)}
      </span>

      {/* Original Price (if discounted) */}
      {hasDiscount && normalizedOriginalPrice !== undefined && (
        <span className={`${originalPriceClasses[size]} text-gray-500 line-through`}>
          {currency}
          {normalizedOriginalPrice.toFixed(2)}
        </span>
      )}

      {/* Discount Badge */}
      {showDiscount && calculatedDiscount && (
        <span
          className={`${discountClasses[size]} bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-medium`}
        >
          -{calculatedDiscount}%
        </span>
      )}
    </div>
  );
};

export { PriceDisplay };
export default PriceDisplay;
