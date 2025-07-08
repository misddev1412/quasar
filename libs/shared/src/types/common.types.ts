import { SortOrder } from '../enums';

/**
 * Generic ID type - can be string or number
 */
export type ID = string | number;

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Sort parameters
 */
export interface SortParams {
  field: string;
  order: SortOrder;
}

/**
 * Search parameters
 */
export interface SearchParams {
  query: string;
  fields?: string[];
}

/**
 * Filter parameters - generic filter interface
 */
export interface FilterParams {
  [key: string]: any;
}

/**
 * Query parameters combining pagination, sorting, searching, and filtering
 */
export interface QueryParams {
  pagination?: PaginationParams;
  sort?: SortParams[];
  search?: SearchParams;
  filters?: FilterParams;
}

/**
 * Date range filter
 */
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Audit information for tracking changes
 */
export interface AuditInfo {
  createdAt: Date;
  createdBy?: string;
  updatedAt: Date;
  updatedBy?: string;
  version: number;
}

/**
 * Soft delete information
 */
export interface SoftDeleteInfo {
  deletedAt?: Date;
  deletedBy?: string;
  isDeleted: boolean;
}

/**
 * Generic key-value pair
 */
export interface KeyValue<K = string, V = any> {
  key: K;
  value: V;
}

/**
 * Generic option type for dropdowns, selects, etc.
 */
export interface Option<T = any> {
  label: string;
  value: T;
  disabled?: boolean;
  metadata?: Record<string, any>;
}

/**
 * File upload information
 */
export interface FileInfo {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  url?: string;
  metadata?: Record<string, any>;
}

/**
 * Coordinate/location information
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

/**
 * Address information
 */
export interface Address {
  street: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  coordinates?: Coordinates;
}

/**
 * Contact information
 */
export interface ContactInfo {
  email?: string;
  phone?: string;
  address?: Address;
  website?: string;
  socialMedia?: Record<string, string>;
}

/**
 * Money/Currency amount
 */
export interface Money {
  amount: number;
  currency: string;
  formatted?: string;
}

/**
 * Time range
 */
export interface TimeRange {
  start: Date;
  end: Date;
  duration?: number; // in milliseconds
}

/**
 * Error details
 */
export interface ErrorDetails {
  code: string;
  message: string;
  field?: string;
  context?: Record<string, any>;
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  value: any;
  constraints: Record<string, string>;
}

/**
 * Generic result type for operations that can succeed or fail
 */
export type Result<T, E = Error> = {
  success: true;
  data: T;
} | {
  success: false;
  error: E;
};

/**
 * Utility type to make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Utility type to make specific properties required
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Utility type to exclude properties by type
 */
export type ExcludeByType<T, U> = {
  [K in keyof T]: T[K] extends U ? never : K;
}[keyof T];

/**
 * Utility type to pick properties by type
 */
export type PickByType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T]; 