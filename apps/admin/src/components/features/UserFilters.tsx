import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiX, FiFilter } from 'react-icons/fi';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Select, SelectOption } from '../common/Select';
import { DateInput } from '../common/DateInput';
import { FormInput } from '../common/FormInput';
import { UserFiltersType, UserRole } from '../../types/user';
import { QuickDateFilters } from './QuickDateFilters';
import { QuickDateFiltersDropdown } from './QuickDateFiltersDropdown';
import { QuickDateFiltersButtonGroup } from './QuickDateFiltersButtonGroup';
import { ComprehensiveQuickFilters } from './ComprehensiveQuickFilters';
import { getQuickFilterDateRange, QuickFilterKey, QUICK_FILTER_OPTIONS } from '../../utils/dateUtils';
import { QUICK_DATE_FILTER_CATEGORIES } from '../../utils/filterUtils';

interface UserFiltersProps {
  filters: UserFiltersType;
  onFiltersChange: (filters: UserFiltersType) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
  quickFilterLayout?: 'compact' | 'dropdown' | 'button-group' | 'expanded' | 'date-focused';
}

const USER_STATUS_OPTIONS: SelectOption[] = [
  { value: '', label: 'All Statuses' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

const USER_ROLE_OPTIONS: SelectOption[] = [
  { value: '', label: 'All Roles' },
  { value: UserRole.SUPER_ADMIN, label: 'Super Admin' },
  { value: UserRole.ADMIN, label: 'Admin' },
  { value: UserRole.MANAGER, label: 'Manager' },
  { value: UserRole.USER, label: 'User' },
  { value: UserRole.GUEST, label: 'Guest' },
];

const USER_VERIFICATION_OPTIONS: SelectOption[] = [
  { value: '', label: 'All Users' },
  { value: 'true', label: 'Verified' },
  { value: 'false', label: 'Unverified' },
];

const USER_PROFILE_OPTIONS: SelectOption[] = [
  { value: '', label: 'All Users' },
  { value: 'true', label: 'Has Profile' },
  { value: 'false', label: 'No Profile' },
];

export const UserFilters: React.FC<UserFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  activeFilterCount,
  quickFilterLayout = 'date-focused',
}) => {
  const { t } = useTranslation();

  // Track active quick filter (date-focused only)
  const [activeQuickFilter, setActiveQuickFilter] = useState<QuickFilterKey | null>(null);

  // Clear quick filter when date filters are cleared externally
  useEffect(() => {
    if (!filters.dateFrom && !filters.dateTo && activeQuickFilter) {
      setActiveQuickFilter(null);
    }
  }, [filters.dateFrom, filters.dateTo, activeQuickFilter]);

  // Detect if current date filters match any quick filter option
  useEffect(() => {
    if (filters.dateFrom && filters.dateTo && !activeQuickFilter) {
      // Check if current date range matches any quick filter
      for (const option of QUICK_FILTER_OPTIONS) {
        const quickRange = getQuickFilterDateRange(option.key);
        if (quickRange.dateFrom === filters.dateFrom && quickRange.dateTo === filters.dateTo) {
          setActiveQuickFilter(option.key);
          break;
        }
      }
    }
  }, [filters.dateFrom, filters.dateTo, activeQuickFilter]);

  const handleFilterChange = (key: keyof UserFiltersType, value: string) => {
    const newFilters = { ...filters };
    
    if (key === 'isActive') {
      // Handle boolean conversion for isActive
      if (value === '') {
        delete newFilters.isActive;
      } else {
        newFilters.isActive = value === 'true';
      }
    } else if (key === 'role') {
      // Handle role filter
      if (value === '') {
        delete newFilters.role;
      } else {
        newFilters.role = value as UserRole;
      }
    } else {
      // Handle string filters
      if (value === '') {
        delete newFilters[key];
      } else {
        (newFilters as any)[key] = value;
      }
    }
    
    onFiltersChange(newFilters);
  };

  // Handle quick filter selection (date-focused)
  const handleQuickFilterSelect = (filterKey: QuickFilterKey) => {
    const dateRange = getQuickFilterDateRange(filterKey);
    const newFilters = {
      ...filters,
      dateFrom: dateRange.dateFrom,
      dateTo: dateRange.dateTo,
    };

    setActiveQuickFilter(filterKey);
    onFiltersChange(newFilters);
  };

  // Handle quick filter clear (date-focused)
  const handleQuickFilterClear = () => {
    const newFilters = { ...filters };
    delete newFilters.dateFrom;
    delete newFilters.dateTo;

    setActiveQuickFilter(null);
    onFiltersChange(newFilters);
  };

  // Handle manual date change (clear quick filter when user manually changes dates)
  const handleDateChange = (key: 'dateFrom' | 'dateTo' | 'lastLoginFrom' | 'lastLoginTo' | 'createdFrom' | 'createdTo', value: string) => {
    // Clear quick filter when manually changing registration dates
    if (key === 'dateFrom' || key === 'dateTo' || key === 'createdFrom' || key === 'createdTo') {
      setActiveQuickFilter(null);
    }
    handleFilterChange(key, value);
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
              Filter Users
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
            Clear All
          </Button>
        )}
      </div>

      {/* Quick Date Filters */}
      {quickFilterLayout === 'date-focused' && (
        <ComprehensiveQuickFilters
          activeFilter={activeQuickFilter}
          onFilterSelect={(filterKey) => handleQuickFilterSelect(filterKey as QuickFilterKey)}
          onClearFilter={handleQuickFilterClear}
          className="mb-4"
          mode="date-only"
          categories={QUICK_DATE_FILTER_CATEGORIES}
          title={t('filters.quick_filters.registration_date_title')}
          subtitle={t('filters.quick_filters.date_subtitle')}
        />
      )}

      {quickFilterLayout === 'dropdown' && (
        <QuickDateFiltersDropdown
          activeFilter={activeQuickFilter}
          onFilterSelect={handleQuickFilterSelect}
          onClearFilter={handleQuickFilterClear}
          className="mb-4"
        />
      )}

      {quickFilterLayout === 'button-group' && (
        <QuickDateFiltersButtonGroup
          activeFilter={activeQuickFilter}
          onFilterSelect={handleQuickFilterSelect}
          onClearFilter={handleQuickFilterClear}
          className="mb-4"
        />
      )}

      {(quickFilterLayout === 'compact' || quickFilterLayout === 'expanded') && (
        <QuickDateFilters
          activeFilter={activeQuickFilter}
          onFilterSelect={handleQuickFilterSelect}
          onClearFilter={handleQuickFilterClear}
          className="mb-4"
          compact={quickFilterLayout === 'compact'}
        />
      )}

      {/* Filter Controls Grid - Enhanced alignment and consistent spacing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Status Filter */}
        <div className="flex flex-col justify-start items-stretch h-full">
          <Select
            id="status-filter"
            label="Status"
            value={filters.isActive !== undefined ? filters.isActive.toString() : ''}
            onChange={(value) => handleFilterChange('isActive', value)}
            options={USER_STATUS_OPTIONS}
            placeholder="Select status..."
            size="md"
            className="flex-1"
          />
        </div>

        {/* Role Filter */}
        <div className="flex flex-col justify-start items-stretch h-full">
          <Select
            id="role-filter"
            label="Role"
            value={filters.role || ''}
            onChange={(value) => handleFilterChange('role', value)}
            options={USER_ROLE_OPTIONS}
            placeholder="Select role..."
            size="md"
            className="flex-1"
          />
        </div>

        {/* Date From Filter */}
        <div className="flex flex-col justify-start items-stretch h-full">
          <DateInput
            id="date-from"
            label="Registered From"
            value={filters.dateFrom || ''}
            onChange={(value) => handleDateChange('dateFrom', value)}
            max={filters.dateTo || today}
            min={oneYearAgo}
            size="md"
            className="flex-1"
          />
        </div>

        {/* Date To Filter */}
        <div className="flex flex-col justify-start items-stretch h-full">
          <DateInput
            id="date-to"
            label="Registered To"
            value={filters.dateTo || ''}
            onChange={(value) => handleDateChange('dateTo', value)}
            min={filters.dateFrom || oneYearAgo}
            max={today}
            size="md"
            className="flex-1"
          />
        </div>
      </div>

      {/* Additional Filters Grid - Second Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mt-4">
        {/* Verification Status Filter */}
        <div className="flex flex-col justify-start items-stretch h-full">
          <Select
            id="verification-filter"
            label="Verification Status"
            value={filters.isVerified !== undefined ? filters.isVerified.toString() : ''}
            onChange={(value) => handleFilterChange('isVerified', value)}
            options={USER_VERIFICATION_OPTIONS}
            placeholder="Select verification..."
            size="md"
            className="flex-1"
          />
        </div>

        {/* Profile Completion Filter */}
        <div className="flex flex-col justify-start items-stretch h-full">
          <Select
            id="profile-filter"
            label="Profile Status"
            value={filters.hasProfile !== undefined ? filters.hasProfile.toString() : ''}
            onChange={(value) => handleFilterChange('hasProfile', value)}
            options={USER_PROFILE_OPTIONS}
            placeholder="Select profile status..."
            size="md"
            className="flex-1"
          />
        </div>

        {/* Email Domain Filter */}
        <div className="flex flex-col justify-start items-stretch h-full">
          <FormInput
            id="email-filter"
            type="text"
            label="Email Domain"
            value={filters.email || ''}
            onChange={(e) => handleFilterChange('email', e.target.value)}
            placeholder="e.g., @company.com"
            size="md"
            className="flex-1"
          />
        </div>

        {/* Username Pattern Filter */}
        <div className="flex flex-col justify-start items-stretch h-full">
          <FormInput
            id="username-filter"
            type="text"
            label="Username Pattern"
            value={filters.username || ''}
            onChange={(e) => handleFilterChange('username', e.target.value)}
            placeholder="Username contains..."
            size="md"
            className="flex-1"
          />
        </div>
      </div>

      {/* Location Filters Grid - Third Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mt-4">
        {/* Country Filter */}
        <div className="flex flex-col justify-start items-stretch h-full">
          <FormInput
            id="country-filter"
            type="text"
            label="Country"
            value={filters.country || ''}
            onChange={(e) => handleFilterChange('country', e.target.value)}
            placeholder="Country name..."
            size="md"
            className="flex-1"
          />
        </div>

        {/* City Filter */}
        <div className="flex flex-col justify-start items-stretch h-full">
          <FormInput
            id="city-filter"
            type="text"
            label="City"
            value={filters.city || ''}
            onChange={(e) => handleFilterChange('city', e.target.value)}
            placeholder="City name..."
            size="md"
            className="flex-1"
          />
        </div>

        {/* Last Login From Filter */}
        <div className="flex flex-col justify-start items-stretch h-full">
          <DateInput
            id="last-login-from"
            label="Last Login From"
            value={filters.lastLoginFrom || ''}
            onChange={(value) => handleDateChange('lastLoginFrom', value)}
            max={filters.lastLoginTo || today}
            min={oneYearAgo}
            size="md"
            className="flex-1"
          />
        </div>

        {/* Last Login To Filter */}
        <div className="flex flex-col justify-start items-stretch h-full">
          <DateInput
            id="last-login-to"
            label="Last Login To"
            value={filters.lastLoginTo || ''}
            onChange={(value) => handleDateChange('lastLoginTo', value)}
            min={filters.lastLoginFrom || oneYearAgo}
            max={today}
            size="md"
            className="flex-1"
          />
        </div>
      </div>

      {/* Filter Summary - Professional styling with improved visual hierarchy */}
      {activeFilterCount > 0 && (
        <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-600">
          <div className="flex flex-wrap gap-2">
            {filters.isActive !== undefined && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 transition-colors">
                Status: {filters.isActive ? 'Active' : 'Inactive'}
                <button
                  onClick={() => handleFilterChange('isActive', '')}
                  className="ml-1 hover:text-emerald-900 dark:hover:text-emerald-100 transition-colors rounded-full p-0.5 hover:bg-emerald-100 dark:hover:bg-emerald-800/50"
                  aria-label="Remove status filter"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.role && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border border-violet-200 dark:border-violet-700 transition-colors">
                Role: {filters.role}
                <button
                  onClick={() => handleFilterChange('role', '')}
                  className="ml-1 hover:text-violet-900 dark:hover:text-violet-100 transition-colors rounded-full p-0.5 hover:bg-violet-100 dark:hover:bg-violet-800/50"
                  aria-label="Remove role filter"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}

            {(filters.dateFrom || filters.dateTo) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-700 transition-colors">
                Date: {filters.dateFrom || '...'} to {filters.dateTo || '...'}
                <button
                  onClick={() => {
                    handleDateChange('dateFrom', '');
                    handleDateChange('dateTo', '');
                  }}
                  className="ml-1 hover:text-amber-900 dark:hover:text-amber-100 transition-colors rounded-full p-0.5 hover:bg-amber-100 dark:hover:bg-amber-800/50"
                  aria-label="Remove date range filter"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.isVerified !== undefined && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700 transition-colors">
                Verified: {filters.isVerified ? 'Yes' : 'No'}
                <button
                  onClick={() => handleFilterChange('isVerified', '')}
                  className="ml-1 hover:text-blue-900 dark:hover:text-blue-100 transition-colors rounded-full p-0.5 hover:bg-blue-100 dark:hover:bg-blue-800/50"
                  aria-label="Remove verification filter"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.hasProfile !== undefined && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 transition-colors">
                Profile: {filters.hasProfile ? 'Complete' : 'Incomplete'}
                <button
                  onClick={() => handleFilterChange('hasProfile', '')}
                  className="ml-1 hover:text-indigo-900 dark:hover:text-indigo-100 transition-colors rounded-full p-0.5 hover:bg-indigo-100 dark:hover:bg-indigo-800/50"
                  aria-label="Remove profile filter"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.email && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 border border-pink-200 dark:border-pink-700 transition-colors">
                Email: {filters.email}
                <button
                  onClick={() => handleFilterChange('email', '')}
                  className="ml-1 hover:text-pink-900 dark:hover:text-pink-100 transition-colors rounded-full p-0.5 hover:bg-pink-100 dark:hover:bg-pink-800/50"
                  aria-label="Remove email filter"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.username && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-700 transition-colors">
                Username: {filters.username}
                <button
                  onClick={() => handleFilterChange('username', '')}
                  className="ml-1 hover:text-cyan-900 dark:hover:text-cyan-100 transition-colors rounded-full p-0.5 hover:bg-cyan-100 dark:hover:bg-cyan-800/50"
                  aria-label="Remove username filter"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.country && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border border-teal-200 dark:border-teal-700 transition-colors">
                Country: {filters.country}
                <button
                  onClick={() => handleFilterChange('country', '')}
                  className="ml-1 hover:text-teal-900 dark:hover:text-teal-100 transition-colors rounded-full p-0.5 hover:bg-teal-100 dark:hover:bg-teal-800/50"
                  aria-label="Remove country filter"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.city && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-700 transition-colors">
                City: {filters.city}
                <button
                  onClick={() => handleFilterChange('city', '')}
                  className="ml-1 hover:text-orange-900 dark:hover:text-orange-100 transition-colors rounded-full p-0.5 hover:bg-orange-100 dark:hover:bg-orange-800/50"
                  aria-label="Remove city filter"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}

            {(filters.lastLoginFrom || filters.lastLoginTo) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-700 transition-colors">
                Last Login: {filters.lastLoginFrom || '...'} to {filters.lastLoginTo || '...'}
                <button
                  onClick={() => {
                    handleDateChange('lastLoginFrom', '');
                    handleDateChange('lastLoginTo', '');
                  }}
                  className="ml-1 hover:text-purple-900 dark:hover:text-purple-100 transition-colors rounded-full p-0.5 hover:bg-purple-100 dark:hover:bg-purple-800/50"
                  aria-label="Remove last login filter"
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
