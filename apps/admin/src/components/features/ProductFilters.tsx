import React, { useState, useEffect } from 'react';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { FiX, FiFilter } from 'react-icons/fi';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Select, SelectOption } from '../common/Select';
import { DateInput } from '../common/DateInput';
import { FormInput } from '../common/FormInput';
import { trpc } from '../../utils/trpc';

export interface ProductFiltersType {
  search?: string;
  status?: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
  brandId?: string;
  categoryId?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  hasStock?: boolean;
  createdFrom?: string;
  createdTo?: string;
  page?: number;
  limit?: number;
}

interface ProductFiltersProps {
  filters: ProductFiltersType;
  onFiltersChange: (filters: ProductFiltersType) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

const PRODUCT_STATUS_OPTIONS: SelectOption[] = [
  { value: '', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'DISCONTINUED', label: 'Discontinued' },
];

const FEATURED_OPTIONS: SelectOption[] = [
  { value: '', label: 'All Products' },
  { value: 'true', label: 'Featured Only' },
  { value: 'false', label: 'Non-Featured Only' },
];

const STOCK_OPTIONS: SelectOption[] = [
  { value: '', label: 'All Products' },
  { value: 'true', label: 'In Stock' },
  { value: 'false', label: 'Out of Stock' },
];

const ACTIVE_OPTIONS: SelectOption[] = [
  { value: '', label: 'All Products' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  activeFilterCount,
}) => {
  const { t } = useTranslationWithBackend();

  // Fetch brands for the dropdown
  const { data: brandsData } = trpc.adminProductBrands.getAll.useQuery({
    page: 1,
    limit: 100,
  }, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Fetch categories for the dropdown
  const { data: categoriesData } = trpc.adminProductCategories.getTree.useQuery({
    includeInactive: false,
  }, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const brands = (brandsData as any)?.data?.brands || [];
  const categories = (categoriesData as any)?.data?.categories || [];

  // Build brand options
  const brandOptions: SelectOption[] = [
    { value: '', label: t('form.placeholders.all_brands', 'All Brands') },
    ...brands.map((brand: any) => ({
      value: brand.id,
      label: brand.name,
    })),
  ];

  // Build category options (flatten tree structure)
  const buildCategoryOptions = (categories: any[], prefix = ''): SelectOption[] => {
    const options: SelectOption[] = [];
    categories.forEach((category: any) => {
      const label = prefix ? `${prefix} > ${category.name}` : category.name;
      options.push({
        value: category.id,
        label,
      });
      if (category.children && category.children.length > 0) {
        options.push(...buildCategoryOptions(category.children, label));
      }
    });
    return options;
  };

  const categoryOptions: SelectOption[] = [
    { value: '', label: t('form.placeholders.all_categories', 'All Categories') },
    ...buildCategoryOptions(categories),
  ];

  const handleFilterChange = (key: keyof ProductFiltersType, value: string | number) => {
    const newFilters = { ...filters };
    
    if (key === 'isFeatured' || key === 'isActive' || key === 'hasStock') {
      // Handle boolean conversion
      if (value === '' || value === null || value === undefined) {
        delete newFilters[key];
      } else {
        (newFilters as any)[key] = value === 'true';
      }
    } else if (key === 'minPrice' || key === 'maxPrice') {
      // Handle number conversion
      if (value === '' || value === null || value === undefined) {
        delete newFilters[key];
      } else {
        (newFilters as any)[key] = typeof value === 'string' ? parseFloat(value) : value;
      }
    } else {
      // Handle string filters
      if (value === '' || value === null || value === undefined) {
        delete newFilters[key];
      } else {
        (newFilters as any)[key] = value;
      }
    }
    
    onFiltersChange(newFilters);
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const today = formatDate(new Date());
  const oneYearAgo = formatDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000));

  return (
    <Card className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800">
            <FiFilter className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {t('products.filter_products', 'Filter Products')}
            </h3>
            {activeFilterCount > 0 && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied
              </p>
            )}
          </div>
        </div>

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            startIcon={<FiX />}
            className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {t('common.clear_all', 'Clear All')}
          </Button>
        )}
      </div>

      {/* Filter Controls Grid - First Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Status Filter */}
        <div className="flex flex-col justify-start items-stretch h-full">
          <Select
            id="status-filter"
            label={t('common.status', 'Status')}
            value={filters.status || ''}
            onChange={(value) => handleFilterChange('status', value)}
            options={PRODUCT_STATUS_OPTIONS}
            placeholder={t('form.placeholders.select_status', 'Select status...')}
            size="md"
            className="flex-1"
          />
        </div>

        {/* Brand Filter */}
        <div className="flex flex-col justify-start items-stretch h-full">
          <Select
            id="brand-filter"
            label={t('products.brand', 'Brand')}
            value={filters.brandId || ''}
            onChange={(value) => handleFilterChange('brandId', value)}
            options={brandOptions}
            placeholder={t('form.placeholders.select_brand', 'Select brand...')}
            size="md"
            className="flex-1"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-col justify-start items-stretch h-full">
          <Select
            id="category-filter"
            label={t('products.category', 'Category')}
            value={filters.categoryId || ''}
            onChange={(value) => handleFilterChange('categoryId', value)}
            options={categoryOptions}
            placeholder={t('form.placeholders.select_category', 'Select category...')}
            size="md"
            className="flex-1"
          />
        </div>

        {/* Featured Filter */}
        <div className="flex flex-col justify-start items-stretch h-full">
          <Select
            id="featured-filter"
            label={t('posts.isFeatured', 'Featured')}
            value={filters.isFeatured !== undefined ? filters.isFeatured.toString() : ''}
            onChange={(value) => handleFilterChange('isFeatured', value)}
            options={FEATURED_OPTIONS}
            placeholder={t('form.placeholders.select_featured', 'Select featured...')}
            size="md"
            className="flex-1"
          />
        </div>
      </div>

      {/* Filter Controls Grid - Second Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mt-4">
        {/* Active Filter */}
        <div className="flex flex-col justify-start items-stretch h-full">
          <Select
            id="active-filter"
            label={t('common.active', 'Active')}
            value={filters.isActive !== undefined ? filters.isActive.toString() : ''}
            onChange={(value) => handleFilterChange('isActive', value)}
            options={ACTIVE_OPTIONS}
            placeholder={t('form.placeholders.select_active', 'Select active...')}
            size="md"
            className="flex-1"
          />
        </div>

        {/* Stock Filter */}
        <div className="flex flex-col justify-start items-stretch h-full">
          <Select
            id="stock-filter"
            label={t('inventory.stockLevel', 'Stock Level')}
            value={filters.hasStock !== undefined ? filters.hasStock.toString() : ''}
            onChange={(value) => handleFilterChange('hasStock', value)}
            options={STOCK_OPTIONS}
            placeholder={t('form.placeholders.select_stock', 'Select stock...')}
            size="md"
            className="flex-1"
          />
        </div>

        {/* Min Price Filter */}
        <div className="flex flex-col justify-start items-stretch h-full">
          <FormInput
            id="min-price-filter"
            type="number"
            label={t('products.min_price', 'Min Price')}
            value={filters.minPrice?.toString() || ''}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            placeholder={t('products.min_price_placeholder', 'Min price...')}
            size="md"
            className="flex-1"
            min="0"
            step="0.01"
          />
        </div>

        {/* Max Price Filter */}
        <div className="flex flex-col justify-start items-stretch h-full">
          <FormInput
            id="max-price-filter"
            type="number"
            label={t('products.max_price', 'Max Price')}
            value={filters.maxPrice?.toString() || ''}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            placeholder={t('products.max_price_placeholder', 'Max price...')}
            size="md"
            className="flex-1"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {/* Date Filters Grid - Third Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mt-4">
        {/* Created From Filter */}
        <div className="flex flex-col justify-start items-stretch h-full">
          <DateInput
            id="created-from"
            label={t('products.created_from', 'Created From')}
            value={filters.createdFrom || ''}
            onChange={(value) => handleFilterChange('createdFrom', value)}
            max={filters.createdTo || today}
            min={oneYearAgo}
            size="md"
            className="flex-1"
          />
        </div>

        {/* Created To Filter */}
        <div className="flex flex-col justify-start items-stretch h-full">
          <DateInput
            id="created-to"
            label={t('products.created_to', 'Created To')}
            value={filters.createdTo || ''}
            onChange={(value) => handleFilterChange('createdTo', value)}
            min={filters.createdFrom || oneYearAgo}
            max={today}
            size="md"
            className="flex-1"
          />
        </div>
      </div>

      {/* Filter Summary */}
      {activeFilterCount > 0 && (
        <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-600">
          <div className="flex flex-wrap gap-2">
            {filters.status && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 transition-colors">
                {t('common.status', 'Status')}: {t(`products.status.${filters.status.toLowerCase()}`, filters.status)}
                <button
                  onClick={() => handleFilterChange('status', '')}
                  className="ml-1 hover:text-emerald-900 dark:hover:text-emerald-100 transition-colors rounded-full p-0.5 hover:bg-emerald-100 dark:hover:bg-emerald-800/50"
                  aria-label="Remove status filter"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.brandId && brands.find((b: any) => b.id === filters.brandId) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border border-violet-200 dark:border-violet-700 transition-colors">
                {t('products.brand', 'Brand')}: {brands.find((b: any) => b.id === filters.brandId)?.name}
                <button
                  onClick={() => handleFilterChange('brandId', '')}
                  className="ml-1 hover:text-violet-900 dark:hover:text-violet-100 transition-colors rounded-full p-0.5 hover:bg-violet-100 dark:hover:bg-violet-800/50"
                  aria-label="Remove brand filter"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.categoryId && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-700 transition-colors">
                {t('products.category', 'Category')}: {categoryOptions.find(c => c.value === filters.categoryId)?.label}
                <button
                  onClick={() => handleFilterChange('categoryId', '')}
                  className="ml-1 hover:text-amber-900 dark:hover:text-amber-100 transition-colors rounded-full p-0.5 hover:bg-amber-100 dark:hover:bg-amber-800/50"
                  aria-label="Remove category filter"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.isFeatured !== undefined && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700 transition-colors">
                {t('posts.isFeatured', 'Featured')}: {filters.isFeatured ? t('common.yes', 'Yes') : t('common.no', 'No')}
                <button
                  onClick={() => handleFilterChange('isFeatured', '')}
                  className="ml-1 hover:text-blue-900 dark:hover:text-blue-100 transition-colors rounded-full p-0.5 hover:bg-blue-100 dark:hover:bg-blue-800/50"
                  aria-label="Remove featured filter"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.isActive !== undefined && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 transition-colors">
                {t('common.active', 'Active')}: {filters.isActive ? t('common.yes', 'Yes') : t('common.no', 'No')}
                <button
                  onClick={() => handleFilterChange('isActive', '')}
                  className="ml-1 hover:text-indigo-900 dark:hover:text-indigo-100 transition-colors rounded-full p-0.5 hover:bg-indigo-100 dark:hover:bg-indigo-800/50"
                  aria-label="Remove active filter"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.hasStock !== undefined && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 border border-pink-200 dark:border-pink-700 transition-colors">
                {t('inventory.stockLevel', 'Stock')}: {filters.hasStock ? t('inventory.hasStock', 'In Stock') : t('inventory.noStock', 'Out of Stock')}
                <button
                  onClick={() => handleFilterChange('hasStock', '')}
                  className="ml-1 hover:text-pink-900 dark:hover:text-pink-100 transition-colors rounded-full p-0.5 hover:bg-pink-100 dark:hover:bg-pink-800/50"
                  aria-label="Remove stock filter"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}

            {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-700 transition-colors">
                {t('products.price_range', 'Price')}: {filters.minPrice || 0} - {filters.maxPrice || '∞'}
                <button
                  onClick={() => {
                    handleFilterChange('minPrice', '');
                    handleFilterChange('maxPrice', '');
                  }}
                  className="ml-1 hover:text-cyan-900 dark:hover:text-cyan-100 transition-colors rounded-full p-0.5 hover:bg-cyan-100 dark:hover:bg-cyan-800/50"
                  aria-label="Remove price filter"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}

            {(filters.createdFrom || filters.createdTo) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border border-teal-200 dark:border-teal-700 transition-colors">
                {t('products.created_date_range', 'Created')}: {filters.createdFrom || '...'} to {filters.createdTo || '...'}
                <button
                  onClick={() => {
                    handleFilterChange('createdFrom', '');
                    handleFilterChange('createdTo', '');
                  }}
                  className="ml-1 hover:text-teal-900 dark:hover:text-teal-100 transition-colors rounded-full p-0.5 hover:bg-teal-100 dark:hover:bg-teal-800/50"
                  aria-label="Remove date range filter"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};