'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Checkbox, Accordion, AccordionItem, Slider } from '@heroui/react';
import {
  FiChevronRight,
  FiCheck,
  FiDollarSign,
  FiTag,
  FiCircle,
  FiSquare,
  FiSliders
} from 'react-icons/fi';
import { ProductService } from '../../services/product.service';

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

interface FilterSidebarProps {
  sections?: FilterSection[];
  onFilterChange: (sectionId: string, values: string[] | number[]) => void;
  onClearFilters?: () => void;
  className?: string;
  isCollapsible?: boolean;
  defaultExpanded?: string[];
  title?: string;
  fetchFiltersFromBackend?: boolean;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  sections: propSections,
  onFilterChange,
  onClearFilters,
  className = '',
  isCollapsible = true,
  defaultExpanded = ['category', 'price'],
  title = 'Filters',
  fetchFiltersFromBackend = true,
}) => {
  const [expandedItems, setExpandedItems] = useState<string[]>(defaultExpanded);
  const [filterValues, setFilterValues] = useState<Record<string, string[] | number[]>>({});
  const [backendSections, setBackendSections] = useState<FilterSection[]>([]);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  const sections = fetchFiltersFromBackend ? backendSections : propSections || [];

  useEffect(() => {
    if (fetchFiltersFromBackend) {
      fetchFiltersFromBackendData();
    } else if (propSections) {
      initializeFilterValues(propSections);
    }

    return () => {
      mountedRef.current = false;
    };
  }, [fetchFiltersFromBackend, propSections]);

  const fetchFiltersFromBackendData = async () => {
    if (!mountedRef.current) return;

    setLoading(true);
    try {
      const filters = await ProductService.getProductFilters();

      // Check if component is still mounted before processing
      if (!mountedRef.current) return;

      const newSections: FilterSection[] = [
        {
          id: 'category',
          title: 'Categories',
          type: 'checkbox',
          options: filters.categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            count: cat.count,
          })),
        },
        {
          id: 'brand',
          title: 'Brands',
          type: 'checkbox',
          options: filters.brands.map(brand => ({
            id: brand.id,
            name: brand.name,
            count: brand.count,
          })),
        },
        {
          id: 'price',
          title: 'Price Range',
          type: 'range',
          options: [],
          min: filters.priceRange.min,
          max: filters.priceRange.max,
          step: 1,
          value: [filters.priceRange.min, filters.priceRange.max],
        },
      ];

      // Check if component is still mounted before updating state
      if (mountedRef.current) {
        setBackendSections(newSections);
        initializeFilterValues(newSections);
      }
    } catch (error) {
      console.error('Error fetching filters:', error);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const initializeFilterValues = (sectionsToInit: FilterSection[]) => {
    const initialValues: Record<string, string[] | number[]> = {};
    sectionsToInit.forEach((section) => {
      if (section.type === 'range') {
        if (section.value) {
          initialValues[section.id] = section.value;
        } else {
          const min = section.min !== undefined ? section.min : 0;
          const max = section.max !== undefined ? section.max : 100;
          initialValues[section.id] = [min, max];
        }
      } else if (section.selectedValues) {
        initialValues[section.id] = section.selectedValues;
      } else {
        initialValues[section.id] = [];
      }
    });
    setFilterValues(initialValues);
  };

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
              <div key={option.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600">
                <div className="flex items-center flex-1">
                  <Checkbox
                    isSelected={(currentValues as string[]).includes(option.id)}
                    onValueChange={(isChecked) =>
                      handleCheckboxChange(section.id, option.id, isChecked)
                    }
                    size="sm"
                    className="mr-2 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  >
                    <span className="text-xs font-medium text-gray-900 dark:text-gray-100 select-none">
                      {option.name}
                    </span>
                  </Checkbox>
                </div>
                {option.count !== undefined && (
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full min-w-[1.5rem] text-center">
                    {option.count}
                  </span>
                )}
              </div>
            ))}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {section.options.map((option) => (
              <div key={option.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 cursor-pointer">
                <input
                  type="radio"
                  id={`${section.id}-${option.id}`}
                  name={section.id}
                  checked={(currentValues as string[]).includes(option.id)}
                  onChange={() => handleRadioChange(section.id, option.id)}
                  className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600 focus:ring-2"
                />
                <label
                  htmlFor={`${section.id}-${option.id}`}
                  className="flex items-center justify-between w-full cursor-pointer ml-2"
                >
                  <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                    {option.name}
                  </span>
                  {option.count !== undefined && (
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full min-w-[1.5rem] text-center">
                      {option.count}
                    </span>
                  )}
                </label>
              </div>
            ))}
          </div>
        );

      case 'range':
        // Use provided min/max values with fallbacks
        const minValue = section.min !== undefined ? section.min : 0;
        const maxValue = section.max !== undefined ? section.max : 100;
        const rangeValues = currentValues as number[];

        return (
          <div className="space-y-4">
            <Slider
              label=""
              step={section.step || 1}
              minValue={minValue}
              maxValue={maxValue}
              value={rangeValues}
              onChange={(values) => handleRangeChange(section.id, values as number[])}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>${minValue}</span>
              <span>${maxValue}</span>
            </div>
            <div className="text-center text-sm font-medium text-gray-900 dark:text-gray-100">
              ${rangeValues[0]} - ${rangeValues[1]}
            </div>
          </div>
        );

      case 'color':
        return (
          <div className="grid grid-cols-5 gap-2">
            {section.options.map((option) => (
              <div key={option.id} className="flex flex-col items-center gap-1">
                <button
                  className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 relative ${
                    (currentValues as string[]).includes(option.id)
                      ? 'border-blue-500 shadow-md ring-1 ring-blue-200 dark:ring-blue-800'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
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
                >
                  {(currentValues as string[]).includes(option.id) && (
                    <FiCheck className="w-3 h-3 text-white absolute inset-0 flex items-center justify-center drop-shadow" />
                  )}
                </button>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">
                  {option.name}
                </span>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="p-3">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (sections.length === 0 && fetchFiltersFromBackend) {
    return (
      <div className="p-3">
        <div className="text-center text-gray-500 dark:text-gray-400">
          No filters available
        </div>
      </div>
    );
  }

  return (
    <div className="p-3">
        <Accordion
          selectedKeys={new Set(expandedItems)}
          onSelectionChange={(keys) => handleAccordionChange(keys as Set<string>)}
          selectionMode="multiple"
          variant="splitted"
          className="gap-3"
        >
          {sections.map((section) => {
            const currentValues = filterValues[section.id] || [];
            const isExpanded = expandedItems.includes(section.id);
            const getSectionIcon = () => {
              switch (section.type) {
                case 'checkbox':
                  return <FiSquare className="w-4 h-4" />;
                case 'radio':
                  return <FiCircle className="w-4 h-4" />;
                case 'range':
                  return <FiDollarSign className="w-4 h-4" />;
                case 'color':
                  return <FiTag className="w-4 h-4" />;
                default:
                  return <FiSliders className="w-4 h-4" />;
              }
            };

            return (
              <AccordionItem
                key={section.id}
                hideIndicator={true}
                title={
                  <div className="flex items-center gap-2 flex-1">
                    <div className="text-gray-500 dark:text-gray-400">
                      {getSectionIcon()}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                      {section.title}
                    </span>
                    {currentValues && Array.isArray(currentValues) && currentValues.length > 0 && (
                      <span className="ml-auto bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-1.5 py-0.5 rounded-full">
                        {currentValues.length}
                      </span>
                    )}
                  </div>
                }
                className="py-2 px-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 border border-gray-200 dark:border-gray-700 rounded-lg"
                startContent={
                  <FiChevronRight className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''} text-gray-500 dark:text-gray-400`} />
                }
              >
                <div className="py-1.5 px-1">
                  {renderFilterSection(section)}
                </div>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
  );
};

export default FilterSidebar;