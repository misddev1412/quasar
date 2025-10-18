import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, X, Search, Check, Tag, Folder } from 'lucide-react';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { trpc } from '../../utils/trpc';
import { InputWithIcon } from './InputWithIcon';

interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  level: number;
  isActive: boolean;
}

interface CategoryMultiSelectProps {
  value?: string[];
  onChange?: (selectedCategories: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  description?: string;
  required?: boolean;
  className?: string;
  maxSelectedItems?: number;
}

export const CategoryMultiSelect: React.FC<CategoryMultiSelectProps> = ({
  value = [],
  onChange,
  placeholder = 'Select categories...',
  disabled = false,
  error,
  label,
  description,
  required = false,
  className = '',
  maxSelectedItems = 10,
}) => {
  const { t } = useTranslationWithBackend();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch categories from API
  const { data: categoriesData, isLoading } = trpc.adminProductCategories.getTree.useQuery({
    includeInactive: false,
  });

  // Flatten the tree structure to work with the existing logic
  const flattenCategories = (categories: any[], level = 0): Category[] => {
    const result: Category[] = [];
    categories.forEach(cat => {
      result.push({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        parentId: cat.parentId,
        parent: cat.parent,
        children: cat.children,
        level,
        isActive: cat.isActive,
      });
      if (cat.children && cat.children.length > 0) {
        result.push(...flattenCategories(cat.children, level + 1));
      }
    });
    return result;
  };

  const categories = (categoriesData as any)?.data ? flattenCategories((categoriesData as any).data) : [];

  // Filter categories based on search term
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get selected categories for display
  const selectedCategories = categories.filter((category) => value.includes(category.id));

  // Handle category selection toggle
  const handleCategoryToggle = (categoryId: string) => {
    if (disabled) return;

    const isSelected = value.includes(categoryId);
    let newValue: string[];

    if (isSelected) {
      newValue = value.filter(id => id !== categoryId);
    } else {
      if (value.length >= maxSelectedItems) {
        return; // Don't add more if max reached
      }
      newValue = [...value, categoryId];
    }

    onChange?.(newValue);
  };

  // Handle removing a selected category
  const handleRemoveCategory = (categoryId: string, event?: React.MouseEvent) => {
    event?.stopPropagation();
    if (disabled) return;

    const newValue = value.filter(id => id !== categoryId);
    onChange?.(newValue);
  };

  // Handle clearing all selections
  const handleClearAll = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (disabled) return;
    onChange?.([]);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  // Note: InputWithIcon doesn't support ref forwarding yet

  // Keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (event.key) {
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        setFocusedIndex(-1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(prev =>
          prev < filteredCategories.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex(prev =>
          prev > 0 ? prev - 1 : filteredCategories.length - 1
        );
        break;
      case 'Enter':
        event.preventDefault();
        if (focusedIndex >= 0 && filteredCategories[focusedIndex]) {
          handleCategoryToggle(filteredCategories[focusedIndex].id);
        }
        break;
    }
  };

  // Generate category display name with hierarchy
  const getCategoryDisplayName = (category: Category) => {
    if (category.level === 0) {
      return category.name;
    }

    // Add indentation based on level
    const indent = '  '.repeat(category.level);
    return `${indent}${category.name}`;
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {selectedCategories.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3 py-1.5 text-xs text-neutral-600 bg-neutral-100 hover:bg-primary hover:text-white dark:text-neutral-400 dark:bg-neutral-700 dark:hover:bg-primary dark:hover:text-white rounded-md transition-all duration-200 font-medium"
              disabled={disabled}
            >
              {t('common.clear_all', 'Clear All')}
            </button>
          )}
        </div>
      )}

      {/* Main Selection Area */}
      <div
        className={`relative min-h-[36px] p-2 bg-white dark:bg-neutral-900 border rounded-lg shadow-sm transition-all duration-200 cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 ${
          isOpen
            ? 'border-primary ring-1 ring-primary'
            : error
              ? 'border-red-500 ring-1 ring-red-500'
              : 'border-neutral-300 dark:border-neutral-700'
        } ${
          disabled ? 'cursor-not-allowed opacity-60 bg-neutral-50 dark:bg-neutral-800' : ''
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {selectedCategories.length === 0 ? (
          /* Placeholder with Arrow */
          <div className="flex items-center justify-between">
            <span className="text-neutral-500 dark:text-neutral-400 py-0.5">
              {placeholder}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-neutral-400 transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        ) : (
          <>
            {/* Selected Categories Display */}
            <div className="flex flex-wrap gap-1 mb-1">
              {selectedCategories.map((category) => (
                <div
                  key={category.id}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 text-primary text-sm rounded-md border border-primary/20 hover:bg-primary/15 transition-colors"
                >
                  <Folder className="w-3.5 h-3.5" />
                  <span className="font-medium">{category.name}</span>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveCategory(category.id, e)}
                    className="hover:text-primary/70 transition-colors rounded-full p-0.5 hover:bg-primary/20"
                    disabled={disabled}
                    aria-label={`Remove ${category.name}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Selection Count & Toggle Icon */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {selectedCategories.length} selected
                {maxSelectedItems < Infinity && ` / ${maxSelectedItems} max`}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-neutral-400 transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </>
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg shadow-lg max-h-64 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-neutral-200 dark:border-neutral-700">
            <InputWithIcon
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('common.search', 'Search categories...')}
              leftIcon={<Search className="w-4 h-4 text-neutral-400" />}
              iconSpacing="compact"
              className="text-sm bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Categories List */}
          <ul className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600 scrollbar-track-transparent">
            {isLoading ? (
              <li className="p-4 text-center text-neutral-500 dark:text-neutral-400">
                {t('common.loading', 'Loading categories...')}
              </li>
            ) : filteredCategories.length === 0 ? (
              <li className="p-4 text-center text-neutral-500 dark:text-neutral-400">
                {searchTerm ? t('common.no_results_found', 'No categories found') : t('common.no_data', 'No categories available')}
              </li>
            ) : (
              filteredCategories.map((category, index) => {
                const isSelected = value.includes(category.id);
                const isFocused = index === focusedIndex;

                return (
                  <li
                    key={category.id}
                    className={`px-3 py-2 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center gap-2 text-sm transition-colors text-neutral-700 dark:text-neutral-300 ${
                      isFocused ? 'bg-neutral-100 dark:bg-neutral-700' : ''
                    }`}
                    onClick={() => handleCategoryToggle(category.id)}
                    onMouseEnter={() => setFocusedIndex(index)}
                  >
                    {/* Selection Checkbox */}
                    <div className={`w-4 h-4 border rounded flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? 'bg-neutral-200 border-neutral-400 text-neutral-700 dark:bg-neutral-600 dark:border-neutral-500 dark:text-neutral-200'
                        : 'border-neutral-300 dark:border-neutral-600'
                    }`}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>

                    {/* Category Icon */}
                    <Folder className={`w-4 h-4 flex-shrink-0 text-neutral-400`} style={{ marginLeft: `${category.level * 16}px` }} />

                    {/* Category Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{category.name}</div>
                      {category.description && (
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                          {category.description}
                        </div>
                      )}
                    </div>

                    {/* Level Indicator for nested categories */}
                    {category.level > 0 && (
                      <span className="text-xs px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded">
                        L{category.level}
                      </span>
                    )}
                  </li>
                );
              })
            )}
          </ul>

          {/* Footer Info */}
          {selectedCategories.length > 0 && (
            <div className="p-2 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
              <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
                <span>{selectedCategories.length} categories selected</span>
                {maxSelectedItems < Infinity && (
                  <span>
                    {maxSelectedItems - selectedCategories.length} remaining
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Description */}
      {description && (
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          {description}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <X className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
};
