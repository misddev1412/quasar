import React, { useEffect, useMemo, useState } from 'react';
import { ProductVariant } from '../../types/product';
import { Modal } from '../common/Modal';
import { FormInput } from '../common/FormInput';
import { Toggle } from '../common/Toggle';
import { Button } from '../common/Button';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';

interface ProductVariantQuickEditModalProps {
  variant: ProductVariant | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    id: string;
    name: string;
    sku?: string | null;
    barcode?: string | null;
    price: number;
    compareAtPrice?: number | null;
    costPrice?: number | null;
    stockQuantity: number;
    lowStockThreshold?: number | null;
    trackInventory: boolean;
    allowBackorders: boolean;
    isActive: boolean;
  }) => Promise<void>;
  isSubmitting?: boolean;
}

interface VariantFormState {
  name: string;
  sku: string;
  barcode: string;
  price: string;
  compareAtPrice: string;
  costPrice: string;
  stockQuantity: string;
  lowStockThreshold: string;
  trackInventory: boolean;
  allowBackorders: boolean;
  isActive: boolean;
}

const numberOrNull = (value: string): number | null => {
  if (value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const numberOrZero = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const ProductVariantQuickEditModal: React.FC<ProductVariantQuickEditModalProps> = ({
  variant,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const { t } = useTranslationWithBackend();
  const [formState, setFormState] = useState<VariantFormState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (variant && isOpen) {
      setFormState({
        name: variant.name || '',
        sku: variant.sku || '',
        barcode: variant.barcode || '',
        price: variant.price !== undefined ? String(variant.price) : '0',
        compareAtPrice: variant.compareAtPrice !== null && variant.compareAtPrice !== undefined ? String(variant.compareAtPrice) : '',
        costPrice: variant.costPrice !== null && variant.costPrice !== undefined ? String(variant.costPrice) : '',
        stockQuantity: variant.stockQuantity !== undefined ? String(variant.stockQuantity) : '0',
        lowStockThreshold: variant.lowStockThreshold !== null && variant.lowStockThreshold !== undefined ? String(variant.lowStockThreshold) : '',
        trackInventory: variant.trackInventory ?? true,
        allowBackorders: variant.allowBackorders ?? false,
        isActive: variant.isActive ?? true,
      });
      setError(null);
    }
  }, [variant, isOpen]);

  const combination = useMemo(() => {
    if (!variant?.variantItems || variant.variantItems.length === 0) {
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

    return parts.length > 0 ? parts.join(' • ') : null;
  }, [variant]);

  if (!variant || !formState) {
    return null;
  }

  const handleChange = (field: keyof VariantFormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => prev ? { ...prev, [field]: event.target.value } : prev);
  };

  const handleToggle = (field: keyof VariantFormState) => (checked: boolean) => {
    setFormState((prev) => prev ? { ...prev, [field]: checked } : prev);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formState) return;

    if (!formState.name.trim()) {
      setError(t('products.variant_name_required', 'Variant name is required'));
      return;
    }

    const payload = {
      id: variant.id,
      name: formState.name.trim(),
      sku: formState.sku.trim() || null,
      barcode: formState.barcode.trim() || null,
      price: numberOrZero(formState.price),
      compareAtPrice: numberOrNull(formState.compareAtPrice),
      costPrice: numberOrNull(formState.costPrice),
      stockQuantity: numberOrZero(formState.stockQuantity),
      lowStockThreshold: numberOrNull(formState.lowStockThreshold),
      trackInventory: formState.trackInventory,
      allowBackorders: formState.allowBackorders,
      isActive: formState.isActive,
    };

    setError(null);
    await onSubmit(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" modalId="product-variant-quick-edit">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {t('products.quick_edit_variant', 'Quick Edit Variant')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {combination || t('products.quick_edit_variant_description', 'Update pricing, inventory, and status in a single step.')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            id="variant-name"
            type="text"
            label={t('products.variant_name', 'Variant Name')}
            value={formState.name}
            onChange={handleChange('name')}
            required
          />
          <FormInput
            id="variant-sku"
            type="text"
            label={t('products.sku', 'SKU')}
            value={formState.sku}
            onChange={handleChange('sku')}
          />
          <FormInput
            id="variant-barcode"
            type="text"
            label={t('products.barcode', 'Barcode')}
            value={formState.barcode}
            onChange={handleChange('barcode')}
          />
          <FormInput
            id="variant-price"
            type="number"
            label={t('products.price', 'Price')}
            value={formState.price}
            onChange={handleChange('price')}
            min="0"
            step="0.01"
          />
          <FormInput
            id="variant-compare-price"
            type="number"
            label={t('products.compare_at_price', 'Compare at Price')}
            value={formState.compareAtPrice}
            onChange={handleChange('compareAtPrice')}
            min="0"
            step="0.01"
          />
          <FormInput
            id="variant-cost-price"
            type="number"
            label={t('products.cost_price', 'Cost Price')}
            value={formState.costPrice}
            onChange={handleChange('costPrice')}
            min="0"
            step="0.01"
          />
          <FormInput
            id="variant-stock"
            type="number"
            label={t('products.stock_quantity', 'Stock Quantity')}
            value={formState.stockQuantity}
            onChange={handleChange('stockQuantity')}
            min="0"
            step="1"
          />
          <FormInput
            id="variant-low-stock"
            type="number"
            label={t('products.low_stock_threshold', 'Low Stock Threshold')}
            value={formState.lowStockThreshold}
            onChange={handleChange('lowStockThreshold')}
            min="0"
            step="1"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Toggle
            checked={formState.trackInventory}
            onChange={handleToggle('trackInventory')}
            label={t('products.track_inventory', 'Track Inventory')}
            description={t('products.track_inventory_help', 'Track the stock quantity for this variant')}
          />
          <Toggle
            checked={formState.allowBackorders}
            onChange={handleToggle('allowBackorders')}
            label={t('products.allow_backorders', 'Allow Backorders')}
            description={t('products.allow_backorders_help', 'Allow customers to order when out of stock')}
          />
          <Toggle
            checked={formState.isActive}
            onChange={handleToggle('isActive')}
            label={t('products.active_variant', 'Active Variant')}
            description={t('products.active_variant_help', 'Make this variant available for purchase')}
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('common.saving', 'Saving...') : t('common.save_changes', 'Save Changes')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductVariantQuickEditModal;
