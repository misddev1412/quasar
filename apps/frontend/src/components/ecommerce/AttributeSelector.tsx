import React from 'react';
import clsx from 'clsx';
import { Button } from '@heroui/react';

interface AttributeValue {
  valueId: string;
  label: string;
}

interface VariantAttribute {
  attributeId: string;
  name: string;
  values: AttributeValue[];
}

interface AttributeSelectorProps {
  attribute: VariantAttribute;
  selectedValue?: string;
  disabled: boolean;
  isActiveStep: boolean;
  onSelect: (attributeId: string, valueId: string) => void;
}

const AttributeSelector: React.FC<AttributeSelectorProps> = ({
  attribute,
  selectedValue,
  disabled,
  isActiveStep,
  onSelect,
}) => {
  const selectedLabel = attribute.values.find(
    (value) => value.valueId === selectedValue
  )?.label;

  return (
    <div
      className={clsx(
        'space-y-4 rounded-2xl border p-5 transition-colors',
        isActiveStep
          ? 'border-gray-200 bg-white/95 dark:border-gray-700 dark:bg-gray-900/40'
          : 'border-dashed border-gray-200 bg-gray-50/70 dark:border-gray-700/60 dark:bg-gray-900/30 opacity-80'
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-base font-semibold text-gray-800 dark:text-gray-100">
          {attribute.name}
        </span>
        {selectedLabel && (
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {selectedLabel}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {attribute.values.map((value) => {
          const isSelected = selectedValue === value.valueId;

          return (
            <Button
              key={value.valueId}
              size="sm"
              variant={isSelected ? 'solid' : 'bordered'}
              color={isSelected ? 'primary' : 'default'}
              isDisabled={disabled}
              onPress={() => onSelect(attribute.attributeId, value.valueId)}
              className={clsx(
                'rounded-full px-4 py-1 text-sm font-medium transition-all duration-150',
                isSelected
                  ? 'shadow-sm'
                  : 'bg-white/95 text-gray-600 hover:border-gray-300 dark:bg-gray-900/60 dark:text-gray-300',
                disabled && 'opacity-50 pointer-events-none'
              )}
            >
              {value.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default AttributeSelector;