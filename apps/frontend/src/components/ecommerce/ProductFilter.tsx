import React, { useState } from 'react';
import { Button, Card, Checkbox, Divider, Slider, Accordion, AccordionItem } from '@heroui/react';

export interface FilterOption {
  id: string;
  name: string;
  count?: number;
}

export interface FilterSection {
  id: string;
  title: string;
  type: 'checkbox' | 'radio' | 'range' | 'color';
  options: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
  value?: number[];
  selectedValues?: string[];
}

interface ProductFilterProps {
  sections: FilterSection[];
  onFilterChange: (sectionId: string, values: string[] | number[]) => void;
  onClearFilters?: () => void;
  className?: string;
  isCollapsible?: boolean;
  defaultExpanded?: string[];
}

const ProductFilter: React.FC<ProductFilterProps> = ({
  sections,
  onFilterChange,
  onClearFilters,
  className = '',
  isCollapsible = true,
  defaultExpanded = [],
}) => {
  const [expandedItems, setExpandedItems] = useState<string[]>(defaultExpanded);
  const [filterValues, setFilterValues] = useState<Record<string, string[] | number[]>>(() => {
    const initialValues: Record<string, string[] | number[]> = {};
    sections.forEach((section) => {
      if (section.type === 'range' && section.value) {
        initialValues[section.id] = section.value;
      } else if (section.selectedValues) {
        initialValues[section.id] = section.selectedValues;
      } else {
        initialValues[section.id] = [];
      }
    });
    return initialValues;
  });

  const handleAccordionChange = (keys: Set<string>) => {
    setExpandedItems(Array.from(keys));
  };

  const handleCheckboxChange = (sectionId: string, optionId: string, isChecked: boolean) => {
    const currentValues = (filterValues[sectionId] as string[]) || [];
    let newValues: string[];

    if (isChecked) {
      newValues = [...currentValues, optionId];
    } else {
      newValues = currentValues.filter((id) => id !== optionId);
    }

    setFilterValues((prev) => ({ ...prev, [sectionId]: newValues }));
    onFilterChange(sectionId, newValues);
  };

  const handleRadioChange = (sectionId: string, optionId: string) => {
    const newValues = [optionId];
    setFilterValues((prev) => ({ ...prev, [sectionId]: newValues }));
    onFilterChange(sectionId, newValues);
  };

  const handleRangeChange = (sectionId: string, values: number[]) => {
    setFilterValues((prev) => ({ ...prev, [sectionId]: values }));
    onFilterChange(sectionId, values);
  };

  const handleClearFilters = () => {
    const resetValues: Record<string, string[] | number[]> = {};
    sections.forEach((section) => {
      if (section.type === 'range' && section.min !== undefined && section.max !== undefined) {
        resetValues[section.id] = [section.min, section.max];
      } else {
        resetValues[section.id] = [];
      }
    });

    setFilterValues(resetValues);

    if (onClearFilters) {
      onClearFilters();
    }
  };

  const renderFilterSection = (section: FilterSection) => {
    const currentValues = filterValues[section.id] || [];

    switch (section.type) {
      case 'checkbox':
        return (
          <div className="space-y-2">
            {section.options.map((option) => (
              <Checkbox
                key={option.id}
                isSelected={(currentValues as string[]).includes(option.id)}
                onValueChange={(isChecked) =>
                  handleCheckboxChange(section.id, option.id, isChecked)
                }
                size="sm"
              >
                <div className="flex items-center justify-between w-full">
                  <span>{option.name}</span>
                  {option.count !== undefined && (
                    <span className="text-xs text-gray-500">({option.count})</span>
                  )}
                </div>
              </Checkbox>
            ))}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {section.options.map((option) => (
              <div key={option.id} className="flex items-center">
                <input
                  type="radio"
                  id={`${section.id}-${option.id}`}
                  name={section.id}
                  checked={(currentValues as string[]).includes(option.id)}
                  onChange={() => handleRadioChange(section.id, option.id)}
                  className="mr-2"
                />
                <label
                  htmlFor={`${section.id}-${option.id}`}
                  className="flex items-center justify-between w-full cursor-pointer"
                >
                  <span>{option.name}</span>
                  {option.count !== undefined && (
                    <span className="text-xs text-gray-500">({option.count})</span>
                  )}
                </label>
              </div>
            ))}
          </div>
        );

      case 'range':
        if (section.min === undefined || section.max === undefined) return null;

        const rangeValues = (currentValues as number[]) || [section.min, section.max];

        return (
          <div className="space-y-4">
            <Slider
              label=""
              stepValue={section.step || 1}
              minValue={section.min}
              maxValue={section.max}
              value={rangeValues}
              onChange={(values) => handleRangeChange(section.id, values as number[])}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{section.min}</span>
              <span>{section.max}</span>
            </div>
            <div className="text-center text-sm font-medium">
              {rangeValues[0]} - {rangeValues[1]}
            </div>
          </div>
        );

      case 'color':
        return (
          <div className="flex flex-wrap gap-2">
            {section.options.map((option) => (
              <button
                key={option.id}
                className={`w-8 h-8 rounded-full border-2 ${
                  (currentValues as string[]).includes(option.id)
                    ? 'border-primary-500'
                    : 'border-gray-300'
                }`}
                style={{ backgroundColor: option.id }}
                onClick={() =>
                  handleCheckboxChange(
                    section.id,
                    option.id,
                    !(currentValues as string[]).includes(option.id)
                  )
                }
                title={option.name}
                aria-label={option.name}
              />
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const hasActiveFilters = Object.values(filterValues).some((values) => {
    if (Array.isArray(values)) {
      return values.length > 0;
    }
    return false;
  });

  if (isCollapsible) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Filters</h3>
          {hasActiveFilters && (
            <Button variant="light" size="sm" onPress={handleClearFilters}>
              Clear All
            </Button>
          )}
        </div>

        <Accordion
          selectedKeys={new Set(expandedItems)}
          onSelectionChange={(keys) => handleAccordionChange(keys as Set<string>)}
          selectionMode="multiple"
          variant="splitted"
        >
          {sections.map((section) => (
            <AccordionItem key={section.id} title={section.title} className="py-2">
              {renderFilterSection(section)}
            </AccordionItem>
          ))}
        </Accordion>
      </Card>
    );
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button variant="light" size="sm" onPress={handleClearFilters}>
            Clear All
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.id}>
            <h4 className="font-medium mb-3">{section.title}</h4>
            {renderFilterSection(section)}
            <Divider className="mt-4" />
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ProductFilter;
