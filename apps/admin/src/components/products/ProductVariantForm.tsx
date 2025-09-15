import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { Button } from '../common/Button';
import { FormInput } from '../common/FormInput';
import { TextareaInput } from '../common/TextareaInput';
import { Toggle } from '../common/Toggle';
import { ProductVariantItemsForm, VariantItem } from './ProductVariantItemsForm';

const variantSchema = z.object({
  name: z.string().min(1, 'Variant name is required'),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  price: z.number().min(0, 'Price must be 0 or greater'),
  compareAtPrice: z.number().min(0, 'Compare at price must be 0 or greater').optional().nullable(),
  costPrice: z.number().min(0, 'Cost price must be 0 or greater').optional().nullable(),
  stockQuantity: z.number().min(0, 'Stock quantity must be 0 or greater'),
  lowStockThreshold: z.number().min(0, 'Low stock threshold must be 0 or greater').optional().nullable(),
  trackInventory: z.boolean(),
  allowBackorders: z.boolean(),
  weight: z.number().min(0, 'Weight must be 0 or greater').optional().nullable(),
  dimensions: z.string().optional(),
  isActive: z.boolean(),
});

export interface ProductVariant {
  id?: string;
  name: string;
  sku?: string;
  barcode?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stockQuantity: number;
  lowStockThreshold?: number;
  trackInventory: boolean;
  allowBackorders: boolean;
  weight?: number;
  dimensions?: string;
  images?: string[];
  isActive: boolean;
  sortOrder: number;
  variantItems: VariantItem[];
}

export interface ProductVariantFormProps {
  variant?: ProductVariant | null;
  onSubmit: (data: ProductVariant) => void;
  onCancel: () => void;
  productId?: string;
}

export const ProductVariantForm: React.FC<ProductVariantFormProps> = ({
  variant,
  onSubmit,
  onCancel,
  productId,
}) => {
  const { t } = useTranslationWithBackend();

  const [variantItems, setVariantItems] = useState<VariantItem[]>(
    variant?.variantItems || []
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      name: variant?.name || '',
      sku: variant?.sku || '',
      barcode: variant?.barcode || '',
      price: variant?.price || 0,
      compareAtPrice: variant?.compareAtPrice || null,
      costPrice: variant?.costPrice || null,
      stockQuantity: variant?.stockQuantity || 0,
      lowStockThreshold: variant?.lowStockThreshold || null,
      trackInventory: variant?.trackInventory ?? true,
      allowBackorders: variant?.allowBackorders ?? false,
      weight: variant?.weight || null,
      dimensions: variant?.dimensions || '',
      isActive: variant?.isActive ?? true,
    },
  });

  const trackInventory = watch('trackInventory');

  const handleFormSubmit = async (data: any) => {
    const submitData: ProductVariant = {
      ...data,
      variantItems,
      sortOrder: variant?.sortOrder || 0,
    };

    onSubmit(submitData);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
            {t('products.basic_information', 'Basic Information')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormInput
                id="variant-name"
                type="text"
                label={t('products.variant_name', 'Variant Name')}
                placeholder={t('products.variant_name_placeholder', 'e.g., iPhone 14 - 256GB - Space Gray')}
                required
                error={errors.name?.message}
                {...register('name')}
              />
            </div>
            <div>
              <FormInput
                id="variant-sku"
                type="text"
                label={t('products.sku', 'SKU')}
                placeholder={t('products.sku_placeholder', 'e.g., IPHONE-14-256GB-GRAY')}
                error={errors.sku?.message}
                {...register('sku')}
              />
            </div>
          </div>

          <div>
            <FormInput
              id="variant-barcode"
              type="text"
              label={t('products.barcode', 'Barcode')}
              placeholder={t('products.barcode_placeholder', 'Enter barcode')}
              error={errors.barcode?.message}
              {...register('barcode')}
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
            {t('products.pricing', 'Pricing')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <FormInput
                id="variant-price"
                label={t('products.price', 'Price')}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                required
                error={errors.price?.message}
                {...register('price', { valueAsNumber: true })}
              />
            </div>
            <div>
              <FormInput
                id="variant-compare-price"
                label={t('products.compare_at_price', 'Compare at Price')}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                error={errors.compareAtPrice?.message}
                {...register('compareAtPrice', {
                  valueAsNumber: true,
                  setValueAs: (value) => value === '' ? null : Number(value)
                })}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('products.compare_at_price_help', 'Original price to show as crossed out')}
              </p>
            </div>
            <div>
              <FormInput
                id="variant-cost-price"
                label={t('products.cost_price', 'Cost Price')}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                error={errors.costPrice?.message}
                {...register('costPrice', {
                  valueAsNumber: true,
                  setValueAs: (value) => value === '' ? null : Number(value)
                })}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('products.cost_price_help', 'Your cost for this variant')}
              </p>
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
            {t('products.inventory', 'Inventory')}
          </h3>

          <div className="space-y-4">
            <Toggle
              label={t('products.track_inventory', 'Track Inventory')}
              description={t('products.track_inventory_help', 'Track the stock quantity for this variant')}
              checked={trackInventory}
              onChange={(checked) => setValue('trackInventory', checked)}
            />

            {trackInventory && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FormInput
                    id="variant-stock-quantity"
                    label={t('products.stock_quantity', 'Stock Quantity')}
                    type="number"
                    min="0"
                    placeholder="0"
                    required
                    error={errors.stockQuantity?.message}
                    {...register('stockQuantity', { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <FormInput
                    id="variant-low-stock-threshold"
                    label={t('products.low_stock_threshold', 'Low Stock Threshold')}
                    type="number"
                    min="0"
                    placeholder="5"
                    error={errors.lowStockThreshold?.message}
                    {...register('lowStockThreshold', {
                      valueAsNumber: true,
                      setValueAs: (value) => value === '' ? null : Number(value)
                    })}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t('products.low_stock_threshold_help', 'Get notified when stock falls below this number')}
                  </p>
                </div>
              </div>
            )}

            <Toggle
              label={t('products.allow_backorders', 'Allow Backorders')}
              description={t('products.allow_backorders_help', 'Allow customers to order when out of stock')}
              checked={watch('allowBackorders')}
              onChange={(checked) => setValue('allowBackorders', checked)}
            />
          </div>
        </div>

        {/* Physical Properties */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
            {t('products.physical_properties', 'Physical Properties')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormInput
                id="variant-weight"
                label={t('products.weight', 'Weight (kg)')}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                error={errors.weight?.message}
                {...register('weight', {
                  valueAsNumber: true,
                  setValueAs: (value) => value === '' ? null : Number(value)
                })}
              />
            </div>
            <div>
              <FormInput
                id="variant-dimensions"
                type="text"
                label={t('products.dimensions', 'Dimensions (L x W x H)')}
                placeholder={t('products.dimensions_placeholder', 'e.g., 10 x 5 x 2 cm')}
                error={errors.dimensions?.message}
                {...register('dimensions')}
              />
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
            {t('products.settings', 'Settings')}
          </h3>

          <Toggle
            label={t('products.active_variant', 'Active Variant')}
            description={t('products.active_variant_help', 'Make this variant available for purchase')}
            checked={watch('isActive')}
            onChange={(checked) => setValue('isActive', checked)}
          />
        </div>

        {/* Variant Attributes */}
        <div>
          <ProductVariantItemsForm
            variantItems={variantItems}
            onVariantItemsChange={setVariantItems}
            productId={productId}
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {variant ? t('products.update_variant', 'Update Variant') : t('products.add_variant', 'Add Variant')}
          </Button>
        </div>
      </form>
    </div>
  );
};