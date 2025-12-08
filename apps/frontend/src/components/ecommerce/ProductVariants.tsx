import React from 'react';
import { Button } from '@heroui/react';
import { Product } from './ProductCard';

interface ProductVariantsProps {
  variants: Product['variants'];
  selectedVariant?: Product['variants'][0] | null;
  onVariantSelect: (variant: Product['variants'][0]) => void;
  className?: string;
  variantType?: 'button' | 'dropdown' | 'color';
  size?: 'sm' | 'md' | 'lg';
}

const ProductVariants: React.FC<ProductVariantsProps> = ({
  variants,
  selectedVariant,
  onVariantSelect,
  className = '',
  variantType = 'button',
  size = 'md',
}) => {
  if (!variants || variants.length === 0) {
    return null;
  }

  const renderButtonVariants = () => (
    <div className="space-y-3">
      {variants.map((variant) => (
        <div key={variant.id}>
          <h4 className="text-sm font-medium text-gray-700 mb-2">{variant.name}</h4>
          <div className="flex flex-wrap gap-2">
            {variant.value.split(',').map((value, index) => {
              const variantValue = value.trim();
              const isSelected = selectedVariant?.value === variantValue;

              return (
                <Button
                  key={`${variant.id}-${index}`}
                  size={size}
                  variant={isSelected ? 'solid' : 'flat'}
                  color={isSelected ? 'primary' : 'default'}
                  className={`capitalize ${isSelected ? 'border-primary-500' : 'border-gray-300'}`}
                  onPress={() =>
                    onVariantSelect({
                      ...variant,
                      value: variantValue,
                    })
                  }
                >
                  {variantValue}
                </Button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  const renderColorVariants = () => (
    <div className="space-y-3">
      {variants.map((variant) => (
        <div key={variant.id}>
          <h4 className="text-sm font-medium text-gray-700 mb-2">{variant.name}</h4>
          <div className="flex flex-wrap gap-2">
            {variant.value.split(',').map((value, index) => {
              const variantValue = value.trim();
              const isSelected = selectedVariant?.value === variantValue;

              return (
                <button
                  key={`${variant.id}-${index}`}
                  className={`w-8 h-8 rounded-full border-2 ${
                    isSelected ? 'border-primary-500' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: variantValue }}
                  onClick={() =>
                    onVariantSelect({
                      ...variant,
                      value: variantValue,
                    })
                  }
                  title={variantValue}
                  aria-label={variantValue}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  const renderDropdownVariants = () => (
    <div className="space-y-3">
      {variants.map((variant) => (
        <div key={variant.id}>
          <h4 className="text-sm font-medium text-gray-700 mb-2">{variant.name}</h4>
          <select
            value={selectedVariant?.value || ''}
            onChange={(e) => {
              const selectedValue = e.target.value;
              const selectedVariant = variants.find((v) => v.value === selectedValue);
              if (selectedVariant) {
                onVariantSelect(selectedVariant);
              }
            }}
            className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              size === 'sm' ? 'h-8' : size === 'lg' ? 'h-10' : 'h-9'
            }`}
          >
            <option value="">Select {variant.name}</option>
            {variant.value.split(',').map((value, index) => (
              <option key={`${variant.id}-${index}`} value={value.trim()}>
                {value.trim()}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );

  return (
    <div className={className}>
      {variantType === 'color' && renderColorVariants()}
      {variantType === 'dropdown' && renderDropdownVariants()}
      {variantType === 'button' && renderButtonVariants()}
    </div>
  );
};

export default ProductVariants;
