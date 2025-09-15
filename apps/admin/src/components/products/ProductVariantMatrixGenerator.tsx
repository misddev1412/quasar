import React, { useState, useEffect } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../context/ToastContext';
import { trpc } from '../../utils/trpc';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Select } from '../common/Select';
import { FormInput } from '../common/FormInput';
import { Badge } from '../common/Badge';
import { Attribute, AttributeValue } from '../../types/product';
import { AttributeValuesSelector } from './AttributeValuesSelector';

export interface VariantMatrixItem {
  id?: string;
  attributeCombination: Record<string, string>; // attributeId -> attributeValueId
  combinationDisplay: string; // Human-readable combination like "Color: Red, Size: Large"
  price: number;
  quantity: number;
  sku?: string;
  isEnabled: boolean;
}

export interface ProductVariantMatrixGeneratorProps {
  variants: VariantMatrixItem[];
  onVariantsChange: (variants: VariantMatrixItem[]) => void;
  productId?: string;
}

interface SelectedAttribute {
  attributeId: string;
  valueIds: string[];
}

export const ProductVariantMatrixGenerator: React.FC<ProductVariantMatrixGeneratorProps> = ({
  variants,
  onVariantsChange,
  productId,
}) => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();

  // Selected attributes for matrix generation
  const [selectedAttributes, setSelectedAttributes] = useState<SelectedAttribute[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch attributes
  const { data: attributesData, isLoading: attributesLoading } = trpc.adminProductAttributes.getSelectAttributes.useQuery();
  const attributes = (attributesData as any)?.data || [];

  // Initialize selected attributes from existing variants when editing
  useEffect(() => {
    if (!isInitialized && attributes.length > 0 && variants.length > 0) {
      const existingAttributeSelections = new Map<string, Set<string>>();

      // Collect all attribute-value combinations from existing variants
      variants.forEach(variant => {
        Object.entries(variant.attributeCombination).forEach(([attributeId, valueId]) => {
          if (!existingAttributeSelections.has(attributeId)) {
            existingAttributeSelections.set(attributeId, new Set());
          }
          existingAttributeSelections.get(attributeId)!.add(valueId);
        });
      });

      // Convert to SelectedAttribute format
      const initialSelections: SelectedAttribute[] = Array.from(existingAttributeSelections.entries()).map(([attributeId, valueIds]) => ({
        attributeId,
        valueIds: Array.from(valueIds),
      }));

      if (initialSelections.length > 0) {
        setSelectedAttributes(initialSelections);
      }
      setIsInitialized(true);
    } else if (!isInitialized && attributes.length > 0) {
      // No existing variants, just mark as initialized
      setIsInitialized(true);
    }
  }, [attributes, variants, isInitialized]);

  // Helper function to get attribute values from the selector components
  const getAttributeValues = (attributeId: string): AttributeValue[] => {
    // This will be handled by the AttributeValuesSelector component
    return [];
  };

  // Add new attribute selection
  const addAttributeSelection = () => {
    const newAttribute: SelectedAttribute = {
      attributeId: '',
      valueIds: [],
    };
    setSelectedAttributes([...selectedAttributes, newAttribute]);
  };

  // Remove attribute selection
  const removeAttributeSelection = (index: number) => {
    const newAttributes = selectedAttributes.filter((_, i) => i !== index);
    setSelectedAttributes(newAttributes);
  };

  // Update attribute selection
  const updateAttributeSelection = (index: number, field: keyof SelectedAttribute, value: any) => {
    const newAttributes = [...selectedAttributes];
    newAttributes[index] = {
      ...newAttributes[index],
      [field]: value,
    };

    // If attribute changed, reset values
    if (field === 'attributeId') {
      newAttributes[index].valueIds = [];
    }

    setSelectedAttributes(newAttributes);
  };

  // Get available attributes (not already selected)
  const getAvailableAttributes = (currentIndex: number) => {
    const usedAttributeIds = selectedAttributes
      .filter((_, index) => index !== currentIndex)
      .map(attr => attr.attributeId);

    return attributes.filter(attr => !usedAttributeIds.includes(attr.id));
  };

  // Get attribute name
  const getAttributeName = (attributeId: string) => {
    const attribute = attributes.find(attr => attr.id === attributeId);
    return attribute?.displayName || attribute?.name || 'Unknown';
  };



  // Simple effect that only triggers matrix generation based on attribute selections
  useEffect(() => {
    if (!isInitialized) return;

    if (selectedAttributes.length === 0) {
      onVariantsChange([]);
      return;
    }

    // Check if all attributes have selections
    const allAttributesSelected = selectedAttributes.every(attr => attr.attributeId && attr.valueIds.length > 0);
    if (!allAttributesSelected) return;

    // Generate combinations directly here without external dependencies
    const combinations: string[][] = [];

    const buildCombinations = (current: string[], attrIndex: number) => {
      if (attrIndex >= selectedAttributes.length) {
        combinations.push([...current]);
        return;
      }

      const attr = selectedAttributes[attrIndex];
      for (const valueId of attr.valueIds) {
        current.push(valueId);
        buildCombinations(current, attrIndex + 1);
        current.pop();
      }
    };

    buildCombinations([], 0);

    // Create simple variants without checking existing ones initially
    const newVariants: VariantMatrixItem[] = combinations.map((combination) => {
      const attributeCombination: Record<string, string> = {};
      const displayParts: string[] = [];

      combination.forEach((valueId, attrIndex) => {
        const attr = selectedAttributes[attrIndex];
        attributeCombination[attr.attributeId] = valueId;

        // Simple display generation
        const attrName = attributes.find(a => a.id === attr.attributeId)?.displayName ||
                         attributes.find(a => a.id === attr.attributeId)?.name || 'Unknown';
        displayParts.push(`${attrName}: ${valueId}`);
      });

      return {
        attributeCombination,
        combinationDisplay: displayParts.join(', '),
        price: 0,
        quantity: 0,
        sku: '',
        isEnabled: true,
      };
    });

    onVariantsChange(newVariants);
  }, [selectedAttributes, isInitialized, attributes]);

  // Update variant field
  const updateVariant = (index: number, field: keyof VariantMatrixItem, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = {
      ...newVariants[index],
      [field]: value,
    };
    onVariantsChange(newVariants);
  };

  // Toggle variant enabled state
  const toggleVariant = (index: number) => {
    updateVariant(index, 'isEnabled', !variants[index].isEnabled);
  };

  // Apply bulk pricing
  const applyBulkPricing = (price: number) => {
    const newVariants = variants.map(variant => ({
      ...variant,
      price: variant.isEnabled ? price : variant.price,
    }));
    onVariantsChange(newVariants);
  };

  if (attributesLoading) {
    return (
      <Card>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Attribute Selection */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {t('products.attribute_matrix_generator', 'Attribute Matrix Generator')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t('products.matrix_generator_desc', 'Select attributes and their values to automatically generate all possible variant combinations (N×M matrix).')}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addAttributeSelection}
              disabled={selectedAttributes.length >= attributes.length}
            >
              <FiPlus className="w-4 h-4 mr-2" />
              {t('products.add_attribute', 'Add Attribute')}
            </Button>
          </div>

          {/* Matrix calculation preview */}
          {selectedAttributes.length > 0 && (
            <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <div className="flex-shrink-0 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  ∏
                </div>
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {t('products.matrix_calculation', 'Matrix Calculation')}
                </h4>
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                {selectedAttributes.map((attr, index) => {
                  const attributeName = getAttributeName(attr.attributeId);
                  const valueCount = attr.valueIds.length;
                  return (
                    <span key={attr.attributeId}>
                      {attributeName} ({valueCount} {t('products.values', 'values')})
                      {index < selectedAttributes.length - 1 ? ' × ' : ''}
                    </span>
                  );
                })}
                {selectedAttributes.every(attr => attr.attributeId && attr.valueIds.length > 0) && (
                  <span className="ml-2 font-semibold">
                    = {selectedAttributes.reduce((total, attr) => total * attr.valueIds.length, 1)} {t('products.variants', 'variants')}
                  </span>
                )}
              </div>
            </div>
          )}

          {selectedAttributes.length === 0 ? (
            <div className="text-center py-16">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
              </div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                {t('products.start_building_matrix', 'Start Building Your Variant Matrix')}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6 leading-relaxed">
                {t('products.matrix_explanation', 'Add attributes like Color, Size, or Material. Each combination of values will automatically create a unique variant.')}
              </p>
              <div className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                {t('products.matrix_example', 'Example: Color (Red, Blue) × Size (S, M, L) = 6 variants')}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {selectedAttributes.map((attr, index) => {
                const availableAttributes = getAvailableAttributes(index);

                return (
                  <div key={index} className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-start space-x-6">
                      {/* Attribute Selection */}
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          {t('products.attribute', 'Attribute')}
                        </label>
                        <div className="min-h-[40px] flex items-center">
                          <Select
                            value={attr.attributeId}
                            onChange={(value) => updateAttributeSelection(index, 'attributeId', value)}
                            placeholder={t('products.select_attribute', 'Select attribute...')}
                            options={availableAttributes.map(a => ({
                              value: a.id,
                              label: a.displayName || a.name,
                            }))}
                          />
                        </div>
                      </div>

                      {/* Values Selection */}
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          {t('products.values', 'Values')}
                        </label>
                        <div className="min-h-[40px]">
                          <AttributeValuesSelector
                            attributeId={attr.attributeId}
                            selectedValueIds={attr.valueIds}
                            onValueIdsChange={(valueIds) => updateAttributeSelection(index, 'valueIds', valueIds)}
                            disabled={!attr.attributeId}
                          />
                        </div>
                      </div>

                      {/* Remove Button */}
                      <div className="flex items-start pt-8">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttributeSelection(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-md transition-colors"
                        >
                          <FiX className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </Card>

      {/* Variant Matrix */}
      {variants.length > 0 && (
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                  <span>{t('products.auto_generated_matrix', 'Auto-Generated Variant Matrix')}</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
                    N×M
                  </Badge>
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t('products.matrix_readonly_desc', 'These variants are automatically generated from your attribute combinations. You can only configure pricing, inventory, and SKUs.')}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {variants.filter(v => v.isEnabled).length} / {variants.length} {t('products.variants_enabled', 'enabled')}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {t('products.combinations_auto_generated', 'Combinations auto-generated')}
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                {t('products.bulk_actions', 'Bulk Actions')}
              </h4>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <FormInput
                    id="bulk-price"
                    label=""
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-32"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement;
                      const price = parseFloat(input?.value || '0');
                      if (price > 0) {
                        applyBulkPricing(price);
                        input.value = '';
                      }
                    }}
                    className="h-10 px-4"
                  >
                    {t('products.apply_to_enabled', 'Apply to Enabled')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('products.variant', 'Variant')}
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
                      {t('products.enabled', 'Enabled')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {variants.map((variant, index) => (
                    <tr key={index} className={!variant.isEnabled ? 'opacity-50' : ''}>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {variant.combinationDisplay}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <FormInput
                          id={`price-${index}`}
                          label=""
                          type="number"
                          min="0"
                          step="0.01"
                          value={variant.price.toString()}
                          onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className="w-24"
                          disabled={!variant.isEnabled}
                        />
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <FormInput
                          id={`quantity-${index}`}
                          label=""
                          type="number"
                          min="0"
                          value={variant.quantity.toString()}
                          onChange={(e) => updateVariant(index, 'quantity', parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className="w-20"
                          disabled={!variant.isEnabled}
                        />
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <FormInput
                          id={`sku-${index}`}
                          label=""
                          type="text"
                          value={variant.sku || ''}
                          onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                          placeholder="Optional"
                          className="w-32"
                          disabled={!variant.isEnabled}
                        />
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <input
                          type="checkbox"
                          checked={variant.isEnabled}
                          onChange={() => toggleVariant(index)}
                          className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};