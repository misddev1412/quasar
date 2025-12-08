import React from 'react';
import clsx from 'clsx';
import { Button } from '@heroui/react';
import { useTranslations } from 'next-intl';
import type { ProductVariant } from '../../types/product';

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onVariantSelect: (variant: ProductVariant) => void;
}

const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedVariant,
  onVariantSelect,
}) => {
  const t = useTranslations('product.detail');

  if (!variants || variants.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {variants.map((variant) => {
        const isSelected = selectedVariant?.id === variant.id;
        const variantPrice = typeof variant.price === 'number' ? variant.price : Number(variant.price || 0);

        return (
          <button
            key={variant.id}
            onClick={() => onVariantSelect(variant)}
            disabled={variant.stockQuantity <= 0}
            className={`w-full rounded-lg border-2 p-4 text-left transition-all duration-200 ${
              isSelected
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            } ${
              variant.stockQuantity <= 0
                ? 'cursor-not-allowed opacity-50'
                : 'hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{variant.name}</h4>
                {variant.sku && <p className="text-sm text-gray-500">SKU: {variant.sku}</p>}
              </div>
              <div className="text-right">
                <p className="font-semibold">${variantPrice.toFixed(2)}</p>
                <p className={`text-sm ${variant.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {variant.stockQuantity > 0
                    ? t('variants.inStock', { count: variant.stockQuantity })
                    : t('variants.outOfStock')}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default VariantSelector;