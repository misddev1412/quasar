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
  console.log('=== Testing URL Filter Expansion (FIXED VERSION) ===\n');

  // Test Case 1: Basic filters (existing functionality)
  console.log('Test Case 1: Basic filters');
  const basicParams = createMockSearchParams({
    dateFrom: '2025-08-11',
    dateTo: '2025-08-12',
    page: '1',
    role: 'admin',
    isActive: 'true'
  });
  const basicFilters = parseUrlToFilters(basicParams);
  console.log('URL: ?dateFrom=2025-08-11&dateTo=2025-08-12&page=1&role=admin&isActive=true');
  console.log('Parsed filters:', JSON.stringify(basicFilters, null, 2));
  console.log('');

  // Test Case 2: Expanded filters with additional parameters
  console.log('Test Case 2: Expanded filters');
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
  console.log('URL: ?dateFrom=2025-08-01&dateTo=2025-08-31&email=@company.com&username=admin&hasProfile=true&isVerified=false&country=United States&city=New York&lastLoginFrom=2025-08-10&lastLoginTo=2025-08-12&page=2&sortBy=email');
  console.log('Parsed filters:', JSON.stringify(expandedFilters, null, 2));
  console.log('');

  // Test Case 3: Alternative date parameter names (createdFrom/createdTo)
  console.log('Test Case 3: Alternative date parameters');
  const altDateParams = createMockSearchParams({
    createdFrom: '2025-07-01',
    createdTo: '2025-07-31',
    role: 'user',
    page: '1'
  });
  const altDateFilters = parseUrlToFilters(altDateParams);
  console.log('URL: ?createdFrom=2025-07-01&createdTo=2025-07-31&role=user&page=1');
  console.log('Parsed filters:', JSON.stringify(altDateFilters, null, 2));
  console.log('');

  // Test Case 4: Mixed valid and invalid parameters
  console.log('Test Case 4: Mixed valid and invalid parameters');
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
  console.log('URL: ?dateFrom=2025-08-11&dateTo=invalid-date&role=invalid-role&isActive=maybe&email=  @valid.com  &username=&hasProfile=true&page=1');
  console.log('Parsed filters:', JSON.stringify(mixedFilters, null, 2));
  console.log('Note: Invalid values are filtered out, whitespace is trimmed');
  console.log('');

  // Test Case 5: All possible filter combinations
  console.log('Test Case 5: All possible filters');
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
    // Non-filter parameters (should be ignored by filter parsing)
    page: '3',
    limit: '25',
    sortBy: 'createdAt',
    sortOrder: 'asc'
  });
  const allFilters = parseUrlToFilters(allParams);
  console.log('URL with all possible filters + pagination/sorting parameters');
  console.log('Parsed filters:', JSON.stringify(allFilters, null, 2));
  console.log('Note: dateFrom takes precedence over createdFrom when both are present');
  console.log('');

  console.log('=== Filter Expansion Test Complete ===');
  
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
