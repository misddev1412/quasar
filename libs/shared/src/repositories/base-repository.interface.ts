import { DeepPartial, FindManyOptions, FindOneOptions } from 'typeorm';
import { 
  PaginatedResponse, 
  PaginationParams, 
  SortParams, 
  FilterParams,
  QueryParams,
  Result
} from '../types/common.types';
import { 
  RepositoryQueryOptions, 
  RepositoryFindOneOptions,
  BulkOperationOptions,
  TransactionOptions
} from '../types/database.types';

/**
 * Base repository interface defining common operations for all repositories
 */
export interface IBaseRepository<T, ID = string> {
  // ========== CREATE OPERATIONS ==========
  
  /**
   * Create a new entity
   */
  create(entityData: DeepPartial<T>): Promise<T>;

  /**
   * Create multiple entities
   */
  createMany(entitiesData: DeepPartial<T>[]): Promise<T[]>;

  /**
   * Create or update entity (upsert)
   */
  upsert(entityData: DeepPartial<T>, conflictFields: (keyof T)[]): Promise<T>;

  /**
   * Bulk create with options
   */
  bulkCreate(entitiesData: DeepPartial<T>[], options?: BulkOperationOptions): Promise<T[]>;

  // ========== READ OPERATIONS ==========

  /**
   * Find entity by ID
   */
  findById(id: ID, options?: RepositoryFindOneOptions<T>): Promise<T | null>;

  /**
   * Find one entity by criteria
   */
  findOne(options: RepositoryFindOneOptions<T>): Promise<T | null>;

  /**
   * Find multiple entities
   */
  findMany(options?: RepositoryQueryOptions<T>): Promise<T[]>;

  /**
   * Find all entities with pagination
   */
  findPaginated(params: PaginationParams, options?: RepositoryQueryOptions<T>): Promise<PaginatedResponse<T>>;

  /**
   * Find entities with advanced query parameters
   */
  findWithQuery(queryParams: QueryParams): Promise<PaginatedResponse<T>>;

  /**
   * Find entities by IDs
   */
  findByIds(ids: ID[], options?: RepositoryQueryOptions<T>): Promise<T[]>;

  /**
   * Check if entity exists by ID
   */
  existsById(id: ID): Promise<boolean>;

  /**
   * Check if entity exists by criteria
   */
  exists(where: FilterParams): Promise<boolean>;

  /**
   * Count entities matching criteria
   */
  count(where?: FilterParams): Promise<number>;

  /**
   * Count entities with query parameters
   */
  countWithQuery(queryParams: Omit<QueryParams, 'pagination'>): Promise<number>;

  // ========== UPDATE OPERATIONS ==========

  /**
   * Update entity by ID
   */
  updateById(id: ID, updateData: DeepPartial<T>): Promise<T | null>;

  /**
   * Update one entity by criteria
   */
  updateOne(where: FilterParams, updateData: DeepPartial<T>): Promise<T | null>;

  /**
   * Update multiple entities
   */
  updateMany(where: FilterParams, updateData: DeepPartial<T>): Promise<T[]>;

  /**
   * Bulk update with options
   */
  bulkUpdate(updates: Array<{ id: ID; data: DeepPartial<T> }>, options?: BulkOperationOptions): Promise<T[]>;

  // ========== DELETE OPERATIONS ==========

  /**
   * Delete entity by ID
   */
  deleteById(id: ID): Promise<boolean>;

  /**
   * Delete one entity by criteria
   */
  deleteOne(where: FilterParams): Promise<boolean>;

  /**
   * Delete multiple entities
   */
  deleteMany(where: FilterParams): Promise<number>;

  /**
   * Delete entities by IDs
   */
  deleteByIds(ids: ID[]): Promise<number>;

  /**
   * Bulk delete with options
   */
  bulkDelete(ids: ID[], options?: BulkOperationOptions): Promise<number>;

  // ========== UTILITY OPERATIONS ==========

  /**
   * Get repository metadata
   */
  getMetadata(): any;

  /**
   * Get entity name
   */
  getEntityName(): string;

  /**
   * Get primary key field name
   */
  getPrimaryKeyField(): string;

  /**
   * Clear repository cache
   */
  clearCache(): Promise<void>;

  /**
   * Reload entity from database
   */
  reload(entity: T): Promise<T>;

  /**
   * Get fresh instance of entity from database
   */
  refresh(id: ID): Promise<T | null>;

  // ========== ADVANCED OPERATIONS ==========

  /**
   * Execute raw query
   */
  query(sql: string, parameters?: any[]): Promise<any>;

  /**
   * Execute operation in transaction
   */
  transaction<R>(operation: (repository: IBaseRepository<T, ID>) => Promise<R>, options?: TransactionOptions): Promise<R>;

  /**
   * Get query builder
   */
  createQueryBuilder(alias?: string): any;

  /**
   * Execute custom query with query builder
   */
  executeQuery(builderCallback: (qb: any) => any): Promise<T[]>;

  // ========== AGGREGATION OPERATIONS ==========

  /**
   * Get minimum value of a field
   */
  min(field: keyof T, where?: FilterParams): Promise<number | null>;

  /**
   * Get maximum value of a field
   */
  max(field: keyof T, where?: FilterParams): Promise<number | null>;

  /**
   * Get average value of a field
   */
  avg(field: keyof T, where?: FilterParams): Promise<number | null>;

  /**
   * Get sum of a field
   */
  sum(field: keyof T, where?: FilterParams): Promise<number | null>;

  /**
   * Group by field and count
   */
  groupBy(field: keyof T, where?: FilterParams): Promise<Array<{ [key: string]: any; count: number }>>;
}

/**
 * Read-only repository interface
 */
export interface IReadOnlyRepository<T, ID = string> extends Pick<IBaseRepository<T, ID>, 
  | 'findById' 
  | 'findOne' 
  | 'findMany' 
  | 'findPaginated' 
  | 'findWithQuery'
  | 'findByIds'
  | 'existsById' 
  | 'exists' 
  | 'count' 
  | 'countWithQuery'
  | 'getMetadata'
  | 'getEntityName'
  | 'getPrimaryKeyField'
  | 'query'
  | 'createQueryBuilder'
  | 'executeQuery'
  | 'min'
  | 'max'
  | 'avg'
  | 'sum'
  | 'groupBy'
> {}

/**
 * Write-only repository interface
 */
export interface IWriteOnlyRepository<T, ID = string> extends Pick<IBaseRepository<T, ID>,
  | 'create'
  | 'createMany'
  | 'upsert'
  | 'bulkCreate'
  | 'updateById'
  | 'updateOne'
  | 'updateMany'
  | 'bulkUpdate'
  | 'deleteById'
  | 'deleteOne'
  | 'deleteMany'
  | 'deleteByIds'
  | 'bulkDelete'
  | 'transaction'
> {} 