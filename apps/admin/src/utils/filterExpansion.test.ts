/**
 * Test file to demonstrate the expanded filter functionality
 * This shows how URL parameters are now expanded and handled
 */

import { UserFiltersType, UserRole } from '../types/user';

// Mock URL search params for testing
const createMockSearchParams = (params: Record<string, string>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.set(key, value);
  });
  return searchParams;
};

// Helper functions (copied from the main component for testing)
const validateUserRole = (role: string | null): UserRole | undefined => {
  if (!role) return undefined;
  return Object.values(UserRole).includes(role as UserRole) ? (role as UserRole) : undefined;
};

const validateBoolean = (value: string | null): boolean | undefined => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
};

const validateDateString = (date: string | null): string | undefined => {
  if (!date) return undefined;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(date) ? date : undefined;
};

const validateString = (value: string | null): string | undefined => {
  return value && value.trim() ? value.trim() : undefined;
};

// Function to parse URL parameters into filters (as implemented in the main component)
const parseUrlToFilters = (searchParams: URLSearchParams): UserFiltersType => {
  return {
    role: validateUserRole(searchParams.get('role')),
    isActive: validateBoolean(searchParams.get('isActive')),
    dateFrom: validateDateString(searchParams.get('dateFrom')) || validateDateString(searchParams.get('createdFrom')),
    dateTo: validateDateString(searchParams.get('dateTo')) || validateDateString(searchParams.get('createdTo')),
    isVerified: validateBoolean(searchParams.get('isVerified')),
    // Additional expanded filters
    email: validateString(searchParams.get('email')),
    username: validateString(searchParams.get('username')),
    hasProfile: validateBoolean(searchParams.get('hasProfile')),
    country: validateString(searchParams.get('country')),
    city: validateString(searchParams.get('city')),
    lastLoginFrom: validateDateString(searchParams.get('lastLoginFrom')),
    lastLoginTo: validateDateString(searchParams.get('lastLoginTo')),
    createdFrom: validateDateString(searchParams.get('createdFrom')),
    createdTo: validateDateString(searchParams.get('createdTo')),
  };
};

// Test cases demonstrating the expanded functionality
export const testFilterExpansion = () => {
  const basicParams = createMockSearchParams({
    dateFrom: '2025-08-11',
    dateTo: '2025-08-12',
    page: '1',
    role: 'admin',
    isActive: 'true'
  });
  const basicFilters = parseUrlToFilters(basicParams);

  const expandedParams = createMockSearchParams({
    dateFrom: '2025-08-01',
    dateTo: '2025-08-31',
    email: '@company.com',
    username: 'admin',
    hasProfile: 'true',
    isVerified: 'false',
    country: 'United States',
    city: 'New York',
    lastLoginFrom: '2025-08-10',
    lastLoginTo: '2025-08-12',
    page: '2',
    sortBy: 'email'
  });
  const expandedFilters = parseUrlToFilters(expandedParams);

  const altDateParams = createMockSearchParams({
    createdFrom: '2025-07-01',
    createdTo: '2025-07-31',
    role: 'user',
    page: '1'
  });
  const altDateFilters = parseUrlToFilters(altDateParams);

  const mixedParams = createMockSearchParams({
    dateFrom: '2025-08-11',
    dateTo: 'invalid-date',
    role: 'invalid-role',
    isActive: 'maybe',
    email: '  @valid.com  ',
    username: '',
    hasProfile: 'true',
    page: '1'
  });
  const mixedFilters = parseUrlToFilters(mixedParams);

  const allParams = createMockSearchParams({
    role: 'super_admin',
    isActive: 'false',
    dateFrom: '2025-01-01',
    dateTo: '2025-12-31',
    isVerified: 'true',
    email: '@enterprise.com',
    username: 'superadmin',
    hasProfile: 'true',
    country: 'Canada',
    city: 'Toronto',
    lastLoginFrom: '2025-08-01',
    lastLoginTo: '2025-08-12',
    createdFrom: '2025-01-01',
    createdTo: '2025-01-31',
    page: '3',
    limit: '25',
    sortBy: 'createdAt',
    sortOrder: 'asc'
  });
  const allFilters = parseUrlToFilters(allParams);

  return {
    basicFilters,
    expandedFilters,
    altDateFilters,
    mixedFilters,
    allFilters
  };
};

// Export for potential use in actual tests
export {
  parseUrlToFilters,
  validateUserRole,
  validateBoolean,
  validateDateString,
  validateString
};
