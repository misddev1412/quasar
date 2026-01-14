'use client';

import React from 'react';
import { Search, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface FilterOption {
  value: string;
  label: string;
}

export interface SearchFilterProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: FilterOption[];
  filterPlaceholder?: string;
  className?: string;
}

export function SearchFilter({
  searchValue = '',
  onSearchChange,
  searchPlaceholder,
  filterValue = '',
  onFilterChange,
  filterOptions = [],
  filterPlaceholder = 'Filter...',
  className = ''
}: SearchFilterProps) {
  const { t } = useTranslation();
  const resolvedSearchPlaceholder = searchPlaceholder ?? t('common.searchBar.placeholder');
  return (
    <div className={`flex flex-col md:flex-row gap-4 ${className}`}>
      {onSearchChange && (
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={resolvedSearchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      )}

      {onFilterChange && filterOptions.length > 0 && (
        <div className="flex items-center space-x-2">
          <select
            value={filterValue}
            onChange={(e) => onFilterChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">{filterPlaceholder}</option>
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
