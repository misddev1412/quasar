import React from 'react';
import { useTranslations } from 'next-intl';
import type { ProductVariant } from '../../types/product';
import { useCurrencyFormatter } from '../../hooks/useCurrencyFormatter';

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
  const { formatCurrency } = useCurrencyFormatter();

  if (!variants || variants.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1.5">
      {variants.map((variant) => {
        const isSelected = selectedVariant?.id === variant.id;
        const variantPrice = typeof variant.price === 'number' ? variant.price : Number(variant.price || 0);
        const hasStock = variant.stockQuantity > 0;

        return (
          <button
            key={variant.id}
            onClick={() => onVariantSelect(variant)}
            disabled={!hasStock}
            className={`w-full rounded-lg border px-2.5 py-2 text-left transition-all duration-200 ${
              isSelected
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            } ${
              !hasStock
                ? 'cursor-not-allowed opacity-50'
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <h4 className="line-clamp-1 text-sm font-semibold text-gray-900">
                  {variant.name}
                </h4>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-base font-semibold text-gray-900">
                  {formatCurrency(variantPrice)}
                </p>
                <p className={`text-[11px] leading-4 ${hasStock ? 'text-green-600' : 'text-red-600'}`}>
                  {hasStock
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
