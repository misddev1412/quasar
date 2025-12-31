'use client';

import React from 'react';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useCurrencyFormatter } from '../../hooks/useCurrencyFormatter';
import { useTranslation } from 'react-i18next';

interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  currency?: string;
  decimalPlaces?: number;
  symbol?: string;
  format?: string;
  locale?: string;
  size?: 'sm' | 'md' | 'lg';
  showDiscount?: boolean;
  className?: string;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  originalPrice,
  discountPercentage,
  currency,
  decimalPlaces,
  symbol,
  format,
  locale,
  size = 'md',
  showDiscount = true,
  className = '',
}) => {
  const { t } = useTranslation();
  const { currency: globalCurrency } = useCurrency();
  const { formatCurrency } = useCurrencyFormatter({
    currency: currency || globalCurrency.code,
    decimalPlaces: decimalPlaces ?? globalCurrency.decimalPlaces,
    symbol: symbol ?? globalCurrency.symbol,
    format: format ?? globalCurrency.format,
    locale,
  });

  const formatAmount = (value: number) => formatCurrency(value);
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
          {formatAmount(0)}
        </span>
      </div>
    );
  }

  // Handle 0 price as "Updating"
  if (price === 0) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className={`${sizeClasses[size]} ${currentPriceClasses[size]} text-gray-500`}>
          {t('ecommerce.product.priceUpdating', 'Giá đang cập nhật')}
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
      <span className={`${sizeClasses[size]} ${currentPriceClasses[size]} text-gray-900`}>
        {formatAmount(normalizedPrice)}
      </span>

      {hasDiscount && normalizedOriginalPrice !== undefined && (
        <span className={`${originalPriceClasses[size]} text-gray-500 line-through`}>
          {formatAmount(normalizedOriginalPrice)}
        </span>
      )}

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
