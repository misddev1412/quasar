import React, { useEffect } from 'react';
import { FiX, FiPlus } from 'react-icons/fi';
import { trpc } from '../../utils/trpc';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { Badge } from '../common/Badge';

interface AttributeValuesSelectorProps {
  attributeId: string;
  selectedValueIds: string[];
  onValueIdsChange: (valueIds: string[]) => void;
  onValueNamesLoad?: (valueNames: Record<string, string>) => void;
  disabled?: boolean;
}

export const AttributeValuesSelector: React.FC<AttributeValuesSelectorProps> = ({
  attributeId,
  selectedValueIds,
  onValueIdsChange,
  onValueNamesLoad,
  disabled = false,
}) => {
  const { t } = useTranslationWithBackend();

  // Fetch attribute values for this specific attribute
  const { data: valuesData, isLoading } = trpc.adminProductAttributes.getAttributeValues.useQuery(
    { attributeId },
    { enabled: !!attributeId }
  );

  const values = (valuesData as any)?.data || [];

  // Notify parent about value names when loaded (optional)
  useEffect(() => {
    if (values.length > 0 && onValueNamesLoad) {
      const valueNames: Record<string, string> = {};
      values.forEach((value: any) => {
        valueNames[value.id] = value.displayValue || value.value;
      });
      onValueNamesLoad(valueNames);
    }
  }, [values, onValueNamesLoad]);

  const handleValueAdd = (valueId: string) => {
    if (!selectedValueIds.includes(valueId)) {
      onValueIdsChange([...selectedValueIds, valueId]);
    }
  };

  const handleValueRemove = (valueId: string) => {
    onValueIdsChange(selectedValueIds.filter(id => id !== valueId));
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        </div>
      </div>
    );
  }

  if (!attributeId) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {t('products.select_attribute_first', 'Select an attribute first')}
      </div>
    );
  }

  if (values.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {t('products.no_values_available', 'No values available for this attribute')}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Selected Values as Tags */}
      {selectedValueIds.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            {t('products.selected_values', 'Selected Values')}
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedValueIds.map((valueId) => {
              const value = values.find((v: any) => v.id === valueId);
              const displayName = value?.displayValue || value?.value || valueId;
              return (
                <Badge
                  key={valueId}
                  variant="default"
                  className="flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 border-primary-200 dark:bg-primary-900/20 dark:text-primary-200 dark:border-primary-800"
                >
                  <span className="text-sm">{displayName}</span>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => handleValueRemove(valueId)}
                      className="ml-1 hover:bg-primary-200 dark:hover:bg-primary-800 rounded-full p-0.5 transition-colors"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Values to Add */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          {t('products.available_values', 'Available Values')}
        </div>
        <div className="flex flex-wrap gap-2">
          {values.map((value: any) => {
            const isSelected = selectedValueIds.includes(value.id);
            if (isSelected) return null; // Don't show selected values in available section

            return (
              <button
                key={value.id}
                type="button"
                onClick={() => handleValueAdd(value.id)}
                disabled={disabled}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiPlus className="w-3 h-3" />
                <span>{value.displayValue || value.value}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty state when no available values */}
      {values.filter((v: any) => !selectedValueIds.includes(v.id)).length === 0 && values.length > 0 && (
        <div className="text-center py-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {t('products.all_values_selected', 'All available values have been selected')}
          </div>
        </div>
      )}
    </div>
  );
};