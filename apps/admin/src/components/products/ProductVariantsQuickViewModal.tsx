import React, { useMemo } from 'react';
import { Product, ProductVariant } from '../../types/product';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Toggle } from '../common/Toggle';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';

interface ProductVariantsQuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onEditVariant: (variant: ProductVariant) => void;
  onToggleVariantActive?: (variant: ProductVariant, nextValue: boolean) => void;
  togglingVariantId?: string | null;
}

const formatVariantCombination = (variant: ProductVariant) => {
  if (!variant.variantItems || variant.variantItems.length === 0) {
    return null;
  }

  const parts = variant.variantItems
    .map((item) => {
      const attributeName = typeof item.attribute === 'string'
        ? item.attribute
        : item.attribute?.displayName || item.attribute?.name;

      const attributeValue = typeof item.attributeValue === 'string'
        ? item.attributeValue
        : item.attributeValue?.displayValue || item.attributeValue?.value;

      if (attributeName && attributeValue) {
        return `${attributeName}: ${attributeValue}`;
      }

      if (attributeValue) {
        return attributeValue;
      }

      return null;
    })
    .filter(Boolean);

  if (parts.length === 0) {
    return null;
  }

  return parts.join(' • ');
};

export const ProductVariantsQuickViewModal: React.FC<ProductVariantsQuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
  onEditVariant,
  onToggleVariantActive,
  togglingVariantId,
}) => {
  const { t } = useTranslationWithBackend();

  const variants = useMemo(() => product?.variants || [], [product]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" modalId="product-variants-quick-view">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {t('products.manage_variants', 'Manage Variants')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t('products.quick_variant_help', 'View and adjust product variants directly from the products list.')}
              {product && (
                <>
                  {' '}
                  <span className="font-medium text-gray-900 dark:text-gray-100">{product.name}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {variants.length === 0 ? (
          <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('products.no_variants_message', 'This product does not have any variants yet.')}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {variants.map((variant) => {
              const combination = formatVariantCombination(variant);
              const isToggling = togglingVariantId === variant.id;

              return (
                <div
                  key={variant.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900 shadow-sm"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          {variant.name || t('products.variant', 'Variant')}
                        </h3>
                        <Badge variant={variant.isActive ? 'default' : 'secondary'} size="sm">
                          {variant.isActive
                            ? t('products.active_variant', 'Active Variant')
                            : t('products.inactive_variant', 'Inactive Variant')}
                        </Badge>
                      </div>
                      {combination && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {combination}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-gray-100 mr-1">
                            {t('products.price', 'Price')}:
                          </span>
                          ${variant.price?.toLocaleString()}
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 dark:text-gray-100 mr-1">
                            {t('products.stock', 'Stock')}:
                          </span>
                          {variant.stockQuantity ?? 0}
                        </div>
                        {variant.sku && (
                          <div>
                            <span className="font-medium text-gray-900 dark:text-gray-100 mr-1">
                              {t('products.sku', 'SKU')}:
                            </span>
                            {variant.sku}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 items-stretch md:items-end md:justify-between">
                      {onToggleVariantActive && (
                        <Toggle
                          checked={variant.isActive}
                          onChange={(next) => onToggleVariantActive(variant, next)}
                          disabled={isToggling}
                          size="sm"
                          aria-label={t('products.toggle_variant_status', 'Toggle variant status')}
                        />
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditVariant(variant)}
                      >
                        {t('products.edit_variant', 'Edit Variant')}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ProductVariantsQuickViewModal;
