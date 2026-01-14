'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@heroui/react';
import { FiSearch, FiX, FiChevronDown, FiChevronUp, FiStar, FiTag, FiDollarSign, FiFilter } from 'react-icons/fi';
import type { ProductFilters } from '../../types/product';
import { useTranslation } from 'react-i18next';

interface FilterState {
  search: string;
  category: string;
  brand: string;
  minPrice: number | undefined;
  maxPrice: number | undefined;
  isActive: boolean;
  isFeatured: boolean | undefined;
  inStock: boolean | undefined;
  hasDiscount: boolean | undefined;
  tags: string[];
  rating: number | undefined;
}

interface ProductFilterSidebarProps {
  filters: FilterState;
  availableFilters: ProductFilters;
  onFilterChange: (filterType: string, value: any) => void;
  onClearFilters: () => void;
  className?: string;
}

const ProductFilterSidebar: React.FC<ProductFilterSidebarProps> = ({
  filters,
  availableFilters,
  onFilterChange,
  onClearFilters,
  className = ''
}) => {
  const { t } = useTranslation();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    search: true,
    categories: true,
    brands: true,
    price: true,
    features: true,
    rating: true,
    tags: true
  });

  const [priceRange, setPriceRange] = useState({
    min: filters.minPrice || availableFilters.priceRange.min,
    max: filters.maxPrice || availableFilters.priceRange.max
  });

  const [searchTerm, setSearchTerm] = useState(filters.search);
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      onFilterChange('search', searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Update price range when filters change
  useEffect(() => {
    setPriceRange({
      min: filters.minPrice || availableFilters.priceRange.min,
      max: filters.maxPrice || availableFilters.priceRange.max
    });
  }, [filters, availableFilters.priceRange]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    setPriceRange(prev => ({ ...prev, [type]: numValue || availableFilters.priceRange[type] }));
    onFilterChange(type === 'min' ? 'minPrice' : 'maxPrice', numValue);
  };

  const hasActiveFilters = () => {
    return filters.search ||
           filters.category ||
           filters.brand ||
           filters.minPrice !== undefined ||
           filters.maxPrice !== undefined ||
           filters.isFeatured ||
           filters.inStock ||
           filters.hasDiscount ||
           filters.rating !== undefined;
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category) count++;
    if (filters.brand) count++;
    if (filters.minPrice !== undefined) count++;
    if (filters.maxPrice !== undefined) count++;
    if (filters.isFeatured) count++;
    if (filters.inStock) count++;
    if (filters.hasDiscount) count++;
    if (filters.rating !== undefined) count++;
    return count;
  };

  const SectionHeader: React.FC<{
    title: string;
    section: string;
    icon?: React.ReactNode;
    count?: number
  }> = ({ title, section, icon, count }) => (
    <div
      className="flex items-center justify-between cursor-pointer py-2 px-1 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
      onClick={() => toggleSection(section)}
    >
      <div className="flex items-center gap-2">
        {icon && <span className="flex items-center">{icon}</span>}
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-0">
          {title}
        </h4>
        {count !== undefined && count > 0 && (
          <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
            {count}
          </span>
        )}
      </div>
      {expandedSections[section] ? (
        <FiChevronUp className="text-gray-500" />
      ) : (
        <FiChevronDown className="text-gray-500" />
      )}
    </div>
  );

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="flex items-center">
            <FiFilter className="text-gray-600 dark:text-gray-400" />
          </span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-0">
            Filters
          </h3>
          {hasActiveFilters() && (
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
              {getActiveFiltersCount()}
            </span>
          )}
        </div>
        {hasActiveFilters() && (
          <button
            onClick={onClearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
          >
            <FiX size={14} />
            Clear
          </button>
        )}
      </div>

      {/* Search Section */}
      <div className="mb-6">
        <SectionHeader title={t('common.searchBar.label')} section="search" icon={<FiSearch />} />
        {expandedSections.search && (
          <div className="mt-2">
            <div className="relative">
              <input
                type="text"
                placeholder={t('common.searchBar.placeholder')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <FiX size={16} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Categories Section */}
      <div className="mb-6">
        <SectionHeader
          title="Categories"
          section="categories"
          icon={<FiTag />}
          count={availableFilters.categories.length}
        />
        {expandedSections.categories && (
          <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
            {availableFilters.categories.map((category) => (
              <label
                key={category.id}
                className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="category"
                    className="rounded text-blue-600 focus:ring-blue-500"
                    checked={filters.category === category.id}
                    onChange={(e) => onFilterChange('category', e.target.checked ? category.id : '')}
                  />
                  <span>{category.name}</span>
                </div>
                <span className="text-xs text-gray-500">({category.count})</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Brands Section */}
      <div className="mb-6">
        <SectionHeader
          title="Brands"
          section="brands"
          icon={<FiTag />}
          count={availableFilters.brands.length}
        />
        {expandedSections.brands && (
          <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
            {availableFilters.brands.map((brand) => (
              <label
                key={brand.id}
                className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="brand"
                    className="rounded text-blue-600 focus:ring-blue-500"
                    checked={filters.brand === brand.id}
                    onChange={(e) => onFilterChange('brand', e.target.checked ? brand.id : '')}
                  />
                  <span>{brand.name}</span>
                </div>
                <span className="text-xs text-gray-500">({brand.count})</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range Section */}
      <div className="mb-6">
        <SectionHeader title="Price Range" section="price" icon={<FiDollarSign />} />
        {expandedSections.price && (
          <div className="mt-2 space-y-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Min</label>
                <input
                  type="number"
                  min={availableFilters.priceRange.min}
                  max={availableFilters.priceRange.max}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={priceRange.min || ''}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Max</label>
                <input
                  type="number"
                  min={availableFilters.priceRange.min}
                  max={availableFilters.priceRange.max}
                  placeholder="Max"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={priceRange.max || ''}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                />
              </div>
            </div>
            <div className="text-xs text-gray-500 text-center">
              Range: ${availableFilters.priceRange.min} - ${availableFilters.priceRange.max}
            </div>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="mb-6">
        <SectionHeader title="Features" section="features" />
        {expandedSections.features && (
          <div className="mt-2 space-y-3">
            <label className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded cursor-pointer transition-colors">
              <input
                type="checkbox"
                className="rounded text-blue-600 focus:ring-blue-500"
                checked={filters.isFeatured === true}
                onChange={(e) => onFilterChange('isFeatured', e.target.checked ? true : undefined)}
              />
              <span className="ml-2">Featured Products</span>
            </label>
            <label className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded cursor-pointer transition-colors">
              <input
                type="checkbox"
                className="rounded text-blue-600 focus:ring-blue-500"
                checked={filters.inStock === true}
                onChange={(e) => onFilterChange('inStock', e.target.checked ? true : undefined)}
              />
              <span className="ml-2">In Stock Only</span>
            </label>
            <label className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded cursor-pointer transition-colors">
              <input
                type="checkbox"
                className="rounded text-blue-600 focus:ring-blue-500"
                checked={filters.hasDiscount === true}
                onChange={(e) => onFilterChange('hasDiscount', e.target.checked ? true : undefined)}
              />
              <span className="ml-2">On Sale</span>
            </label>
          </div>
        )}
      </div>

      {/* Rating Section */}
      <div className="mb-6">
        <SectionHeader title="Rating" section="rating" icon={<FiStar />} />
        {expandedSections.rating && (
          <div className="mt-2 space-y-2">
            {[4, 3, 2].map((rating) => (
              <label
                key={rating}
                className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name="rating"
                  className="rounded text-blue-600 focus:ring-blue-500"
                  checked={filters.rating === rating}
                  onChange={(e) => onFilterChange('rating', e.target.checked ? rating : undefined)}
                />
                <span className="ml-2 flex items-center gap-1">
                  {Array.from({ length: rating }, (_, i) => (
                    <FiStar key={i} className="text-yellow-400 fill-current" size={14} />
                  ))}
                  <span className="text-xs text-gray-500">& up</span>
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="bordered"
          size="sm"
          className="w-full"
          onClick={onClearFilters}
          isDisabled={!hasActiveFilters()}
        >
          Clear All Filters
        </Button>
      </div>
    </div>
  );
};

export default ProductFilterSidebar;
