import { ValidationError } from './common.types';

/**
 * Base DTO interface
 */
export interface BaseDto {
  [key: string]: any;
}

/**
 * Create DTO - for creating new resources
 */
export interface CreateDto<T = any> extends BaseDto {
  data: T;
}

/**
 * Update DTO - for updating existing resources
 */
export interface UpdateDto<T = any> extends BaseDto {
  id: string;
  data: Partial<T>;
}

/**
 * Response DTO - for API responses
 */
export interface ResponseDto<T = any> extends BaseDto {
  id: string;
  data: T;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * List response DTO
 */
export interface ListResponseDto<T = any> {
  items: ResponseDto<T>[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * DTO transformation options
 */
export interface DtoTransformOptions {
  groups?: string[];
  version?: string;
  excludeExtraneousValues?: boolean;
  enableImplicitConversion?: boolean;
  enableCircularCheck?: boolean;
}

/**
 * Serialization options for DTOs
 */
export interface SerializationOptions {
  excludeFields?: string[];
  includeFields?: string[];
  dateFormat?: string;
  numberFormat?: {
    decimals?: number;
    thousandsSeparator?: string;
    decimalSeparator?: string;
  };
  booleanFormat?: 'string' | 'number' | 'boolean';
}

/**
 * DTO metadata for documentation and validation
 */
export interface DtoMetadata {
  name: string;
  description?: string;
  version: string;
  fields: FieldMetadata[];
  examples?: any[];
  deprecated?: boolean;
  deprecationReason?: string;
}

/**
 * Field metadata for DTO fields
 */
export interface FieldMetadata {
  name: string;
  type: string;
  description?: string;
  required: boolean;
  nullable: boolean;
  defaultValue?: any;
  validation?: FieldValidation;
  format?: string;
  example?: any;
  deprecated?: boolean;
}

/**
 * Field validation rules
 */
export interface FieldValidation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  enum?: any[];
  custom?: string;
}

/**
 * Pagination DTO
 */
export interface IPaginationDto {
  page: number;
  limit: number;
  offset?: number;
}

/**
 * Sort DTO
 */
export interface SortDto {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Filter DTO
 */
export interface FilterDto {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'between';
  value: any;
  values?: any[]; // for 'in' and 'between' operators
}

/**
 * Search DTO
 */
export interface SearchDto {
  query: string;
  fields?: string[];
  exact?: boolean;
  caseSensitive?: boolean;
}

/**
 * Query DTO combining pagination, sorting, filtering, and searching
 */
export interface QueryDto {
  pagination?: IPaginationDto;
  sort?: SortDto[];
  filters?: FilterDto[];
  search?: SearchDto;
  include?: string[];
  exclude?: string[];
}

/**
 * Bulk operation DTO
 */
export interface BulkOperationDto<T = any> {
  operation: 'create' | 'update' | 'delete';
  items: T[];
  options?: {
    skipValidation?: boolean;
    continueOnError?: boolean;
    returnResults?: boolean;
  };
}

/**
 * File upload DTO
 */
export interface FileUploadDto {
  filename: string;
  mimetype: string;
  size: number;
  buffer?: Buffer;
  path?: string;
  metadata?: Record<string, any>;
}

/**
 * Import/Export DTO
 */
export interface ImportExportDto {
  format: 'json' | 'csv' | 'xlsx' | 'xml';
  filename: string;
  mapping?: Record<string, string>;
  options?: {
    skipHeader?: boolean;
    delimiter?: string;
    encoding?: string;
    dateFormat?: string;
  };
}

/**
 * Audit DTO for tracking changes
 */
export interface AuditDto {
  action: 'create' | 'update' | 'delete' | 'view';
  resource: string;
  resourceId: string;
  userId?: string;
  changes?: Record<string, { oldValue: any; newValue: any }>;
  metadata?: Record<string, any>;
  timestamp: Date;
  ip?: string;
  userAgent?: string;
}

/**
 * Notification DTO
 */
export interface NotificationDto {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  recipient: string;
  channel: 'email' | 'sms' | 'push' | 'in-app';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledFor?: Date;
  metadata?: Record<string, any>;
}

/**
 * Health check DTO
 */
export interface HealthCheckDto {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  timestamp: Date;
  details?: Record<string, any>;
  dependencies?: HealthCheckDto[];
} 