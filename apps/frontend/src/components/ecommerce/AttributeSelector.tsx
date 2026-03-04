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
  disabled?: boolean;
  isActiveStep: boolean;
  onSelect: (attributeId: string, valueId: string) => void;
  isOptionDisabled?: (valueId: string) => boolean;
}

const AttributeSelector: React.FC<AttributeSelectorProps> = ({
  attribute,
  selectedValue,
  disabled = false,
  isActiveStep,
  onSelect,
  isOptionDisabled,
}) => {
  return (
    <div className={clsx(
      'flex flex-col gap-2 py-1.5 sm:flex-row sm:items-center sm:gap-3',
      !isActiveStep && 'opacity-80'
    )}>
      <div className="flex items-center justify-between sm:w-[110px] sm:shrink-0 sm:justify-start">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {attribute.name}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {attribute.values.map((value) => {
          const isSelected = selectedValue === value.valueId;
          const optionDisabled = disabled || Boolean(isOptionDisabled?.(value.valueId));

          return (
            <Button
              key={value.valueId}
              size="sm"
              variant={isSelected ? 'solid' : 'bordered'}
              color={isSelected ? 'primary' : 'default'}
              isDisabled={optionDisabled}
              onPress={() => onSelect(attribute.attributeId, value.valueId)}
              className={clsx(
                'h-9 min-w-0 rounded-md px-3 text-sm font-medium transition-all duration-150',
                isSelected
                  ? 'shadow-sm'
                  : 'bg-white/95 text-gray-600 hover:border-gray-300 dark:bg-gray-900/60 dark:text-gray-300',
                optionDisabled && 'opacity-50 pointer-events-none'
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
