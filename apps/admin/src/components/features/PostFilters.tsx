import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { FormInput } from '../common/FormInput';
import { Select, SelectOption } from '../common/Select';
import { DateInput } from '../common/DateInput';
import { Card } from '../common/Card';
import { FiX, FiFilter } from 'react-icons/fi';
import { PostStatus, PostType, PostFiltersType } from '../../types/post';

interface PostFiltersProps {
  filters: PostFiltersType;
  onFiltersChange: (filters: PostFiltersType) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

const POST_STATUS_OPTIONS: SelectOption[] = [
  { value: '', label: 'All Statuses' },
  { value: PostStatus.DRAFT, label: 'Draft' },
  { value: PostStatus.PUBLISHED, label: 'Published' },
  { value: PostStatus.ARCHIVED, label: 'Archived' },
  { value: PostStatus.SCHEDULED, label: 'Scheduled' },
];

const POST_TYPE_OPTIONS: SelectOption[] = [
  { value: '', label: 'All Types' },
  { value: PostType.POST, label: 'Post' },
  { value: PostType.PAGE, label: 'Page' },
  { value: PostType.NEWS, label: 'News' },
  { value: PostType.EVENT, label: 'Event' },
];

const FEATURED_OPTIONS: SelectOption[] = [
  { value: '', label: 'All Posts' },
  { value: 'true', label: 'Featured Only' },
  { value: 'false', label: 'Not Featured' },
];

export const PostFilters: React.FC<PostFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  activeFilterCount,
}) => {
  const handleFilterChange = (key: keyof PostFiltersType, value: string) => {
    const newFilters = { ...filters };
    
    if (key === 'isFeatured') {
      // Handle boolean conversion for isFeatured
      if (value === '') {
        delete newFilters.isFeatured;
      } else {
        newFilters.isFeatured = value === 'true';
      }
    } else if (key === 'status') {
      // Handle status filter
      if (value === '') {
        delete newFilters.status;
      } else {
        newFilters.status = value as PostStatus;
      }
    } else if (key === 'type') {
      // Handle type filter
      if (value === '') {
        delete newFilters.type;
      } else {
        newFilters.type = value as PostType;
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
              Filter Posts
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

      {/* Filter Controls Grid - Enhanced alignment and consistent spacing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Status Filter */}
        <div className="flex flex-col justify-start items-stretch h-full">
          <Select
            id="status-filter"
            label="Status"
            value={filters.status || ''}
            onChange={(value) => handleFilterChange('status', value)}
            options={POST_STATUS_OPTIONS}
            placeholder="Select status..."
            size="md"
            className="flex-1"
          />
        </div>

        {/* Type Filter */}
        <div className="flex flex-col justify-start items-stretch h-full">
          <Select
            id="type-filter"
            label="Type"
            value={filters.type || ''}
            onChange={(value) => handleFilterChange('type', value)}
            options={POST_TYPE_OPTIONS}
            placeholder="Select type..."
            size="md"
            className="flex-1"
          />
        </div>

        {/* Featured Filter */}
        <div className="flex flex-col justify-start items-stretch h-full">
          <Select
            id="featured-filter"
            label="Featured"
            value={filters.isFeatured !== undefined ? filters.isFeatured.toString() : ''}
            onChange={(value) => handleFilterChange('isFeatured', value)}
            options={FEATURED_OPTIONS}
            placeholder="Select featured status..."
            size="md"
            className="flex-1"
          />
        </div>

        {/* Title Filter */}
        <div className="flex flex-col justify-start items-stretch h-full">
          <FormInput
            id="title-filter"
            type="text"
            label="Title"
            value={filters.title || ''}
            onChange={(e) => handleFilterChange('title', e.target.value)}
            placeholder="Filter by title..."
            size="md"
            className="flex-1"
          />
        </div>
      </div>

      {/* Additional Filters Grid - Second Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mt-4">
        {/* Date From Filter */}
        <div className="flex flex-col justify-start items-stretch h-full">
          <DateInput
            id="date-from"
            label="Created From"
            value={filters.dateFrom || ''}
            onChange={(value) => handleFilterChange('dateFrom', value)}
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
            label="Created To"
            value={filters.dateTo || ''}
            onChange={(value) => handleFilterChange('dateTo', value)}
            min={filters.dateFrom || oneYearAgo}
            max={today}
            size="md"
            className="flex-1"
          />
        </div>

        {/* Published From Filter */}
        <div className="flex flex-col justify-start items-stretch h-full">
          <DateInput
            id="published-from"
            label="Published From"
            value={filters.publishedFrom || ''}
            onChange={(value) => handleFilterChange('publishedFrom', value)}
            max={filters.publishedTo || today}
            min={oneYearAgo}
            size="md"
            className="flex-1"
          />
        </div>

        {/* Published To Filter */}
        <div className="flex flex-col justify-start items-stretch h-full">
          <DateInput
            id="published-to"
            label="Published To"
            value={filters.publishedTo || ''}
            onChange={(value) => handleFilterChange('publishedTo', value)}
            min={filters.publishedFrom || oneYearAgo}
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
                Status: {filters.status}
                <button
                  onClick={() => handleFilterChange('status', '')}
                  className="ml-1 hover:text-emerald-900 dark:hover:text-emerald-100 transition-colors rounded-full p-0.5 hover:bg-emerald-100 dark:hover:bg-emerald-800/50"
                  aria-label="Remove status filter"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.type && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border border-violet-200 dark:border-violet-700 transition-colors">
                Type: {filters.type}
                <button
                  onClick={() => handleFilterChange('type', '')}
                  className="ml-1 hover:text-violet-900 dark:hover:text-violet-100 transition-colors rounded-full p-0.5 hover:bg-violet-100 dark:hover:bg-violet-800/50"
                  aria-label="Remove type filter"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.isFeatured !== undefined && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-700 transition-colors">
                Featured: {filters.isFeatured ? 'Yes' : 'No'}
                <button
                  onClick={() => handleFilterChange('isFeatured', '')}
                  className="ml-1 hover:text-amber-900 dark:hover:text-amber-100 transition-colors rounded-full p-0.5 hover:bg-amber-100 dark:hover:bg-amber-800/50"
                  aria-label="Remove featured filter"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.title && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700 transition-colors">
                Title: {filters.title}
                <button
                  onClick={() => handleFilterChange('title', '')}
                  className="ml-1 hover:text-blue-900 dark:hover:text-blue-100 transition-colors rounded-full p-0.5 hover:bg-blue-100 dark:hover:bg-blue-800/50"
                  aria-label="Remove title filter"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}

            {(filters.dateFrom || filters.dateTo) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 transition-colors">
                Created: {filters.dateFrom || '...'} to {filters.dateTo || '...'}
                <button
                  onClick={() => {
                    handleFilterChange('dateFrom', '');
                    handleFilterChange('dateTo', '');
                  }}
                  className="ml-1 hover:text-indigo-900 dark:hover:text-indigo-100 transition-colors rounded-full p-0.5 hover:bg-indigo-100 dark:hover:bg-indigo-800/50"
                  aria-label="Remove created date filter"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}

            {(filters.publishedFrom || filters.publishedTo) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 border border-pink-200 dark:border-pink-700 transition-colors">
                Published: {filters.publishedFrom || '...'} to {filters.publishedTo || '...'}
                <button
                  onClick={() => {
                    handleFilterChange('publishedFrom', '');
                    handleFilterChange('publishedTo', '');
                  }}
                  className="ml-1 hover:text-pink-900 dark:hover:text-pink-100 transition-colors rounded-full p-0.5 hover:bg-pink-100 dark:hover:bg-pink-800/50"
                  aria-label="Remove published date filter"
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