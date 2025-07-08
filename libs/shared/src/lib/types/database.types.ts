import { FindManyOptions, FindOneOptions, DeepPartial } from 'typeorm';
import { QueryParams, PaginationParams, SortParams, FilterParams } from './common.types';

/**
 * Generic entity type constraint
 */
export type EntityType = { id: string | number };

/**
 * Database connection configuration
 */
export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  schema?: string;
  ssl?: boolean;
  poolSize?: number;
  connectionTimeoutMillis?: number;
  idleTimeoutMillis?: number;
}

/**
 * Query builder options for complex queries
 */
export interface QueryBuilderOptions<T = any> {
  select?: (keyof T)[];
  relations?: string[];
  where?: FilterParams;
  orderBy?: Record<string, 'ASC' | 'DESC'>;
  groupBy?: string[];
  having?: FilterParams;
  limit?: number;
  offset?: number;
}

/**
 * Repository query options extending TypeORM's FindManyOptions
 */
export interface RepositoryQueryOptions<T = any> extends Omit<FindManyOptions<T>, 'skip' | 'take'> {
  pagination?: PaginationParams;
  softDelete?: boolean;
}

/**
 * Repository find one options
 */
export interface RepositoryFindOneOptions<T = any> extends FindOneOptions<T> {
  softDelete?: boolean;
}

/**
 * Bulk operation options
 */
export interface BulkOperationOptions {
  chunkSize?: number;
  skipDuplicates?: boolean;
  onConflict?: 'ignore' | 'update' | 'error';
  transaction?: boolean;
}

/**
 * Transaction options
 */
export interface TransactionOptions {
  isolationLevel?: 'READ_UNCOMMITTED' | 'READ_COMMITTED' | 'REPEATABLE_READ' | 'SERIALIZABLE';
  timeout?: number;
  readOnly?: boolean;
}

/**
 * Database migration information
 */
export interface MigrationInfo {
  id: number;
  timestamp: number;
  name: string;
  instance?: string;
}

/**
 * Database schema information
 */
export interface SchemaInfo {
  tables: TableInfo[];
  views: ViewInfo[];
  functions: FunctionInfo[];
  triggers: TriggerInfo[];
}

/**
 * Table information
 */
export interface TableInfo {
  name: string;
  schema: string;
  columns: ColumnInfo[];
  indexes: IndexInfo[];
  foreignKeys: ForeignKeyInfo[];
}

/**
 * Column information
 */
export interface ColumnInfo {
  name: string;
  type: string;
  length?: number;
  precision?: number;
  scale?: number;
  nullable: boolean;
  default?: any;
  primaryKey: boolean;
  unique: boolean;
  comment?: string;
}

/**
 * Index information
 */
export interface IndexInfo {
  name: string;
  columns: string[];
  unique: boolean;
  primary: boolean;
  spatial: boolean;
  fulltext: boolean;
}

/**
 * Foreign key information
 */
export interface ForeignKeyInfo {
  name: string;
  columnNames: string[];
  referencedTableName: string;
  referencedColumnNames: string[];
  onDelete: string;
  onUpdate: string;
}

/**
 * View information
 */
export interface ViewInfo {
  name: string;
  schema: string;
  definition: string;
}

/**
 * Function information
 */
export interface FunctionInfo {
  name: string;
  schema: string;
  definition: string;
  language: string;
  returnType: string;
}

/**
 * Trigger information
 */
export interface TriggerInfo {
  name: string;
  tableName: string;
  timing: 'BEFORE' | 'AFTER' | 'INSTEAD OF';
  event: 'INSERT' | 'UPDATE' | 'DELETE';
  definition: string;
}

/**
 * Database statistics
 */
export interface DatabaseStats {
  totalTables: number;
  totalRows: number;
  totalSize: number; // in bytes
  averageRowSize: number;
  indexSize: number;
  fragmentationRatio: number;
}

/**
 * Query execution statistics
 */
export interface QueryStats {
  executionTime: number; // in milliseconds
  rowsAffected: number;
  rowsReturned: number;
  memoryUsage: number; // in bytes
  queryPlan?: any;
}

/**
 * Connection pool statistics
 */
export interface ConnectionPoolStats {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  waitingRequests: number;
  maxConnections: number;
}

/**
 * Audit log entry for database changes
 */
export interface AuditLogEntry {
  id: string;
  tableName: string;
  recordId: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changedFields?: string[];
  userId?: string;
  timestamp: Date;
  source: string;
  metadata?: Record<string, any>;
}

/**
 * Database backup information
 */
export interface BackupInfo {
  id: string;
  filename: string;
  size: number;
  timestamp: Date;
  type: 'full' | 'incremental' | 'differential';
  compressed: boolean;
  encrypted: boolean;
  checksum: string;
  metadata?: Record<string, any>;
}

/**
 * Raw query result
 */
export interface RawQueryResult<T = any> {
  records: T[];
  affectedRows: number;
  insertId?: string | number;
  warningCount: number;
  changedRows: number;
  stats?: QueryStats;
} 