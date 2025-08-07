/**
 * Comprehensive filter utilities for user management
 */

import { FiCalendar, FiUser, FiShield, FiMail, FiCheckCircle } from 'react-icons/fi';
import { getQuickFilterDateRange, QuickFilterKey } from './dateUtils';
import { UserRole } from '../types/user';

// Filter types
export type FilterType = 'date' | 'status' | 'role' | 'verification' | 'custom';

// All possible filter keys
export type AllFilterKeys = QuickFilterKey | UserStatusFilterKey | UserRoleFilterKey | VerificationFilterKey;

// User status filter keys
export type UserStatusFilterKey = 'active_users' | 'inactive_users' | 'all_users';

// User role filter keys  
export type UserRoleFilterKey = 'super_admin_role' | 'admin_role' | 'manager_role' | 'user_role' | 'guest_role';

// Verification status filter keys
export type VerificationFilterKey = 'verified_users' | 'unverified_users' | 'pending_verification';

// Filter option interface
export interface FilterOption {
  key: string;
  translationKey: string;
  type: FilterType;
  category: string;
  value?: any; // The actual filter value to apply
}

// Filter category interface
export interface FilterCategory {
  key: string;
  titleKey: string;
  icon?: React.ComponentType<{ className?: string }>;
  filters: FilterOption[];
}

// Enhanced date filter categories with more convenient options
const DATE_FILTER_CATEGORIES: FilterCategory[] = [
  {
    key: 'current_period',
    titleKey: 'filters.categories.current_period',
    icon: FiCalendar,
    filters: [
      { key: 'today', translationKey: 'filters.date.today', type: 'date', category: 'current_period' },
      { key: 'this_week', translationKey: 'filters.date.this_week', type: 'date', category: 'current_period' },
      { key: 'this_month', translationKey: 'filters.date.this_month', type: 'date', category: 'current_period' },
    ],
  },
  {
    key: 'recent_period',
    titleKey: 'filters.categories.recent_period',
    icon: FiCalendar,
    filters: [
      { key: 'last_7_days', translationKey: 'filters.date.last_7_days', type: 'date', category: 'recent_period' },
      { key: 'last_30_days', translationKey: 'filters.date.last_30_days', type: 'date', category: 'recent_period' },
      { key: 'last_90_days', translationKey: 'filters.date.last_90_days', type: 'date', category: 'recent_period' },
      { key: 'last_year', translationKey: 'filters.date.last_year', type: 'date', category: 'recent_period' },
    ],
  },
];

// Quick date filter categories (focused on convenience)
export const QUICK_DATE_FILTER_CATEGORIES: FilterCategory[] = DATE_FILTER_CATEGORIES;

// Legacy: Keep for backward compatibility but focus on date-only
export const DATE_ONLY_FILTER_CATEGORIES: FilterCategory[] = DATE_FILTER_CATEGORIES;
export const ALL_FILTER_CATEGORIES: FilterCategory[] = DATE_FILTER_CATEGORIES;

// Filter application functions
export interface FilterValues {
  dateFrom?: string;
  dateTo?: string;
  isActive?: boolean;
  role?: UserRole;
  isVerified?: boolean;
}

/**
 * Apply a filter and return the filter values to be used in API calls
 */
export const applyFilter = (filterKey: AllFilterKeys): Partial<FilterValues> => {
  // Find the filter option
  const filterOption = ALL_FILTER_CATEGORIES
    .flatMap(category => category.filters)
    .find(filter => filter.key === filterKey);

  if (!filterOption) {
    return {};
  }

  switch (filterOption.type) {
    case 'date':
      const dateRange = getQuickFilterDateRange(filterKey as QuickFilterKey);
      return {
        dateFrom: dateRange.dateFrom,
        dateTo: dateRange.dateTo,
      };

    case 'status':
      return {
        isActive: filterOption.value,
      };

    case 'role':
      return {
        role: filterOption.value,
      };

    case 'verification':
      return {
        isVerified: filterOption.value === true ? true : filterOption.value === false ? false : undefined,
      };

    default:
      return {};
  }
};

/**
 * Get filter option by key
 */
export const getFilterOption = (filterKey: AllFilterKeys): FilterOption | undefined => {
  return ALL_FILTER_CATEGORIES
    .flatMap(category => category.filters)
    .find(filter => filter.key === filterKey);
};

/**
 * Get filter category by key
 */
export const getFilterCategory = (categoryKey: string): FilterCategory | undefined => {
  return ALL_FILTER_CATEGORIES.find(category => category.key === categoryKey);
};

/**
 * Check if a filter key is a date filter
 */
export const isDateFilter = (filterKey: AllFilterKeys): boolean => {
  const filterOption = getFilterOption(filterKey);
  return filterOption?.type === 'date';
};

/**
 * Get all filter keys of a specific type
 */
export const getFilterKeysByType = (type: FilterType): string[] => {
  return ALL_FILTER_CATEGORIES
    .flatMap(category => category.filters)
    .filter(filter => filter.type === type)
    .map(filter => filter.key);
};

/**
 * Get filter display name
 */
export const getFilterDisplayName = (filterKey: AllFilterKeys, t: (key: string) => string): string => {
  const filterOption = getFilterOption(filterKey);
  return filterOption ? t(filterOption.translationKey) : filterKey;
};
