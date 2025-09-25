import React from 'react';
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';

export interface SortOption {
  id: string;
  name: string;
  value: string;
  icon?: string;
}

interface ProductSortProps {
  options: SortOption[];
  selectedOption?: string;
  onSortChange: (optionId: string) => void;
  className?: string;
  variant?: 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  label?: string;
  showLabel?: boolean;
  disabled?: boolean;
}

const ProductSort: React.FC<ProductSortProps> = ({
  options,
  selectedOption,
  onSortChange,
  className = '',
  variant = 'light',
  size = 'sm',
  color = 'default',
  label = 'Sort by',
  showLabel = true,
  disabled = false,
}) => {
  const selectedSortOption = options.find((option) => option.id === selectedOption) || options[0];

  const handleSortChange = (keys: Set<string>) => {
    const selectedKey = Array.from(keys)[0];
    if (selectedKey) {
      onSortChange(selectedKey);
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      {showLabel && <span className="text-sm text-gray-600 mr-2">{label}:</span>}

      <Dropdown>
        <DropdownTrigger>
          <Button
            variant={variant}
            size={size}
            color={color}
            className="capitalize"
            endContent={<span className="text-lg">⌄</span>}
            isDisabled={disabled}
          >
            {selectedSortOption?.name || 'Select'}
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Sort options"
          selectionMode="single"
          selectedKeys={[selectedOption || options[0]?.id]}
          onSelectionChange={(keys) => handleSortChange(keys as Set<string>)}
          variant="flat"
          disabledKeys={disabled ? options.map((o) => o.id) : []}
        >
          {options.map((option) => (
            <DropdownItem
              key={option.id}
              startContent={option.icon && <span className="text-lg mr-2">{option.icon}</span>}
            >
              {option.name}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default ProductSort;
