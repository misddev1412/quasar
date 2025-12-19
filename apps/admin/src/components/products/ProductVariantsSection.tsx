import React, { useState } from 'react';
import { FiPackage, FiToggleLeft, FiToggleRight, FiEdit, FiTrash2, FiPlus, FiCheck, FiX, FiTag, FiHelpCircle } from 'react-icons/fi';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../context/ToastContext';
import { trpc } from '../../utils/trpc';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Select } from '../common/Select';
import { ProductVariantMatrixGenerator, VariantMatrixItem } from './ProductVariantMatrixGenerator';

export type { VariantMatrixItem };

export interface ProductVariantsSectionProps {
  variants: VariantMatrixItem[];
  onVariantsChange: (variants: VariantMatrixItem[]) => void;
  productId?: string;
}

export const ProductVariantsSection: React.FC<ProductVariantsSectionProps> = ({
  variants,
  onVariantsChange,
  productId,
}) => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();

  // Always show matrix generator - no manual variant creation
  const [showMatrixGenerator] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  // Fetch attributes for attribute management
  const { data: attributesData, isLoading: attributesLoading } = trpc.adminProductAttributes.getSelectAttributes.useQuery();
  const attributes = (attributesData as any)?.data || [];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {t('products.product_variants', 'Product Variants')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t('products.variants_auto_generate_help', 'Variants are automatically generated from attribute combinations. First create attributes with values, then select them below to generate a matrix of all possible combinations.')}
            </p>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              title={t('common.help', 'Help')}
            >
              <FiHelpCircle className="w-5 h-5" />
            </button>

            {/* Help Tooltip */}
            {showHelp && (
              <div className="absolute right-0 top-full mt-2 w-96 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      1
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {t('products.workflow_step_1', 'Step 1: Create Attributes')}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {t('products.workflow_step_1_desc', 'Go to Product Attributes page and create attributes (e.g., Color, Size) with their values (e.g., Red, Blue, Small, Large).')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      2
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {t('products.workflow_step_2', 'Step 2: Select Attributes & Values')}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {t('products.workflow_step_2_desc', 'Choose which attributes apply to this product and select the specific values you want to offer.')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      3
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {t('products.workflow_step_3', 'Step 3: Auto-Generated Matrix')}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {t('products.workflow_step_3_desc', 'Variants will be automatically generated (N×M matrix). Configure pricing and inventory for each combination.')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {attributes.length === 0 ? (
        <Card>
          <div className="p-6 text-center">
            <div className="flex flex-col items-center space-y-4">
              <FiTag className="w-12 h-12 text-amber-400" />
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {t('products.no_attributes_available', 'No Attributes Available')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                  {variants.length > 0
                    ? t('products.existing_variants_no_attributes', 'This product has existing variants, but no attributes are available in the system. Create attributes to manage variant combinations properly.')
                    : t('products.create_attributes_first', 'You need to create product attributes first before you can generate variants. Attributes define the properties that can vary between product versions (like Color, Size, Material, etc.).')
                  }
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => window.open('/admin/products/attributes', '_blank')}
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  {t('products.create_attributes', 'Create Attributes')}
                </Button>
                {variants.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Show existing variants in legacy mode
                    }}
                  >
                    <FiPackage className="w-4 h-4 mr-2" />
                    {t('products.view_existing_variants', 'View Existing Variants')} ({variants.length})
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Show existing variants even without attributes */}
          {variants.length > 0 && (
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="mb-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {t('products.existing_variants_legacy', 'Existing Variants (Legacy Mode)')}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t('products.legacy_variants_desc', 'These variants exist but cannot be managed with the new matrix system until attributes are created and assigned.')}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('products.variant_name', 'Variant Name')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('products.price', 'Price')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('products.quantity', 'Quantity')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('products.sku', 'SKU')}
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('products.image', 'Image')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('common.status', 'Status')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {variants.map((variant, index) => (
                      <tr key={index} className={!variant.isEnabled ? 'opacity-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {variant.combinationDisplay}
                          </div>
                          {Object.keys(variant.attributeCombination).length === 0 && (
                            <div className="text-xs text-amber-600 dark:text-amber-400">
                              {t('products.no_attribute_mapping', 'No attribute mapping')}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {formatPrice(variant.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {variant.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {variant.sku || t('common.not_set', 'Not set')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {variant.image ? (
                            <img
                              src={variant.image}
                              alt={`Variant ${variant.combinationDisplay}`}
                              className="w-10 h-10 object-cover rounded border border-gray-200 dark:border-gray-600 mx-auto"
                            />
                          ) : (
                            <span className="text-xs text-gray-400">
                              {t('common.no_image', 'No image')}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={variant.isEnabled ? 'default' : 'secondary'}>
                            {variant.isEnabled ? t('common.enabled', 'Enabled') : t('common.disabled', 'Disabled')}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>
      ) : (
        <>
          {/* Matrix Generator - Always show when attributes exist */}
          <ProductVariantMatrixGenerator
            variants={variants}
            onVariantsChange={onVariantsChange}
            productId={productId}
          />
        </>
      )}
    </div>
  );
};

