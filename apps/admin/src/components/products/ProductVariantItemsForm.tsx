import React, { useState, useEffect } from 'react';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import { useToast } from '@admin/contexts/ToastContext';
import { trpc } from '@admin/utils/trpc';
import { Button } from '@admin/components/common/Button';
import { Select } from '@admin/components/common/Select';
import { Card } from '@admin/components/common/Card';
import { FormInput } from '@admin/components/common/FormInput';
import { FiPlus, FiX, FiMove } from 'react-icons/fi';
import { Attribute, AttributeValue } from '@admin/types/product';

export interface VariantItem {
  id?: string;
  attributeId: string;
  attributeValueId: string;
  sortOrder: number;
}

export interface ProductVariantItemsFormProps {
  variantItems: VariantItem[];
  onVariantItemsChange: (items: VariantItem[]) => void;
  productId?: string;
}

export const ProductVariantItemsForm: React.FC<ProductVariantItemsFormProps> = ({
  variantItems,
  onVariantItemsChange,
  productId,
}) => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();

  // Fetch attributes
  const { data: attributesData, isLoading: attributesLoading } = trpc.adminProductAttributes.getSelectAttributes.useQuery();
  const attributes = (attributesData as any)?.data || [];

  // State for attribute values for each attribute
  const [attributeValues, setAttributeValues] = useState<Record<string, AttributeValue[]>>({});
  const [customValueByIndex, setCustomValueByIndex] = useState<Record<number, string>>({});
  const [localValueNameById, setLocalValueNameById] = useState<Record<string, string>>({});
  const utils = trpc.useUtils();
  const createValueMutation = trpc.adminProductAttributes.createAttributeValue.useMutation();

  // Group attribute values by attribute ID from select-attributes payload
  useEffect(() => {
    const valuesMap: Record<string, AttributeValue[]> = {};

    attributes.forEach((attr: any) => {
      const attrValues = Array.isArray(attr?.values) ? attr.values : [];
      valuesMap[attr.id] = attrValues;
    });

    setAttributeValues(valuesMap);
  }, [attributes]);

  const addVariantItem = () => {
    const newItem: VariantItem = {
      attributeId: '',
      attributeValueId: '',
      sortOrder: variantItems.length,
    };
    onVariantItemsChange([...variantItems, newItem]);
  };

  const removeVariantItem = (index: number) => {
    const newItems = variantItems.filter((_, i) => i !== index);
    // Recalculate sort orders
    const reorderedItems = newItems.map((item, i) => ({
      ...item,
      sortOrder: i,
    }));
    onVariantItemsChange(reorderedItems);
  };

  const updateVariantItem = (index: number, field: keyof VariantItem, value: string | number) => {
    const newItems = [...variantItems];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    // If attribute changed, reset attribute value
    if (field === 'attributeId') {
      newItems[index].attributeValueId = '';
      setCustomValueByIndex(prev => ({ ...prev, [index]: '' }));
    }

    onVariantItemsChange(newItems);
  };

  const moveVariantItem = (fromIndex: number, toIndex: number) => {
    const newItems = [...variantItems];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);

    // Update sort orders
    const reorderedItems = newItems.map((item, i) => ({
      ...item,
      sortOrder: i,
    }));
    onVariantItemsChange(reorderedItems);
  };

  const getAvailableAttributes = (currentIndex: number) => {
    const usedAttributeIds = variantItems
      .filter((_, index) => index !== currentIndex)
      .map(item => item.attributeId);

    return attributes.filter(attr => !usedAttributeIds.includes(attr.id));
  };

  const getAttributeValues = (attributeId: string) => {
    return attributeValues[attributeId] || [];
  };

  const isPredefinedOptionsType = (attributeId: string) => {
    const attribute = attributes.find(attr => attr.id === attributeId);
    const type = (attribute?.type || '').toUpperCase();
    return type === 'SELECT' || type === 'MULTISELECT';
  };

  const createCustomValueForItem = async (index: number) => {
    const item = variantItems[index];
    const customValue = (customValueByIndex[index] || '').trim();

    if (!item?.attributeId || !customValue || createValueMutation.isPending) {
      return;
    }

    try {
      const currentValues = getAttributeValues(item.attributeId);
      const result = await createValueMutation.mutateAsync({
        attributeId: item.attributeId,
        value: customValue,
        displayValue: customValue,
        sortOrder: currentValues.length,
        scope: 'LOCAL',
      });

      const createdValue = (result as any)?.data;
      if (createdValue?.id) {
        setLocalValueNameById(prev => ({ ...prev, [createdValue.id]: customValue }));
        updateVariantItem(index, 'attributeValueId', createdValue.id);
      }

      setCustomValueByIndex(prev => ({ ...prev, [index]: '' }));
      await utils.adminProductAttributes.getSelectAttributes.invalidate();
    } catch (error) {
      addToast({
        type: 'error',
        title: t('common.error', 'Error'),
        description: t('products.failed_to_create_attribute_value', 'Failed to create attribute value'),
      });
    }
  };

  const getAttributeName = (attributeId: string) => {
    const attribute = attributes.find(attr => attr.id === attributeId);
    return attribute?.displayName || attribute?.name || 'Unknown Attribute';
  };

  const getAttributeValueName = (attributeId: string, valueId: string) => {
    const values = getAttributeValues(attributeId);
    const value = values.find(val => val.id === valueId);
    return value?.displayValue || value?.value || localValueNameById[valueId] || 'Unknown Value';
  };

  if (attributesLoading) {
    return (
      <Card>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {t('products.variant_attributes', 'Variant Attributes')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t('products.variant_attributes_description', 'Define the attributes that differentiate this variant (e.g., Color, Size, Storage).')}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addVariantItem}
            disabled={variantItems.length >= attributes.length}
          >
            <FiPlus className="w-4 h-4 mr-2" />
            {t('products.add_attribute', 'Add Attribute')}
          </Button>
        </div>

        {variantItems.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 dark:text-gray-500 text-sm">
              {t('products.no_variant_attributes', 'No variant attributes defined.')}
            </div>
            <div className="text-gray-400 dark:text-gray-500 text-xs mt-1">
              {t('products.add_attributes_to_differentiate', 'Add attributes to differentiate this variant from others.')}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {variantItems.map((item, index) => {
              const availableAttributes = getAvailableAttributes(index);
              const availableValues = getAttributeValues(item.attributeId);
              const shouldShowValueSelect = isPredefinedOptionsType(item.attributeId);

              return (
                <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  {/* Move handles */}
                  <div className="flex flex-col space-y-1">
                    <button
                      type="button"
                      onClick={() => moveVariantItem(index, index - 1)}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiMove className="w-3 h-3 rotate-180" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveVariantItem(index, index + 1)}
                      disabled={index === variantItems.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiMove className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Attribute Selection */}
                  <div className="flex-1">
                    <Select
                      value={item.attributeId}
                      onChange={(value) => updateVariantItem(index, 'attributeId', value)}
                      placeholder={t('products.select_attribute', 'Select attribute...')}
                      options={availableAttributes.map(attr => ({
                        value: attr.id,
                        label: attr.displayName || attr.name,
                      }))}
                    />
                  </div>

                  {/* Value Selection */}
                  <div className="flex-1">
                    {shouldShowValueSelect ? (
                      <Select
                        value={item.attributeValueId}
                        onChange={(value) => updateVariantItem(index, 'attributeValueId', value)}
                        placeholder={t('products.select_value', 'Select value...')}
                        disabled={!item.attributeId}
                        options={availableValues.map(value => ({
                          value: value.id,
                          label: value.displayValue || value.value,
                        }))}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <FormInput
                          id={`variant-item-custom-value-${index}`}
                          label=""
                          type="text"
                          value={customValueByIndex[index] || ''}
                          onChange={(e) =>
                            setCustomValueByIndex(prev => ({ ...prev, [index]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              void createCustomValueForItem(index);
                            }
                          }}
                          placeholder={t('products.enter_attribute_value', 'Type a value and press Enter')}
                          disabled={!item.attributeId || createValueMutation.isPending}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => void createCustomValueForItem(index)}
                          disabled={!item.attributeId || !(customValueByIndex[index] || '').trim() || createValueMutation.isPending}
                        >
                          <FiPlus className="w-3 h-3 mr-1" />
                          {t('common.add', 'Add')}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVariantItem(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FiX className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {/* Preview */}
        {variantItems.length > 0 && variantItems.every(item => item.attributeId && item.attributeValueId) && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              {t('products.variant_preview', 'Variant Preview')}
            </h4>
            <div className="flex flex-wrap gap-2">
              {variantItems.map((item, index) => (
                <div
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-sm"
                >
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {getAttributeName(item.attributeId)}:
                  </span>
                  <span className="ml-1 text-gray-900 dark:text-gray-100">
                    {getAttributeValueName(item.attributeId, item.attributeValueId)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {attributes.length === 0 && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              {t('products.no_attributes_available', 'No attributes are available. Please create attributes first to define variant characteristics.')}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
