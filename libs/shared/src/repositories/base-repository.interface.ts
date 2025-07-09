import { FindOptionsWhere, FindManyOptions, DeepPartial, FindOneOptions } from 'typeorm';
import { BaseEntity } from '../entities/base.entity';

// Temporary inline types to get build working
interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface IBaseRepository<T extends BaseEntity> {
  // Basic CRUD operations
  create(entity: DeepPartial<T>): T;
  save(entity: DeepPartial<T>): Promise<T>;
  saveMultiple(entities: DeepPartial<T>[]): Promise<T[]>;

  // Find operations
  findById(id: string): Promise<T | null>;
  findByIds(ids: string[]): Promise<T[]>;
  findOne(options?: FindOneOptions<T>): Promise<T | null>;
  findAll(options?: FindManyOptions<T>): Promise<T[]>;
  findWithPagination(options: PaginationOptions & FindManyOptions<T>): Promise<PaginatedResult<T>>;

  // Update operations
  update(id: string, updateData: DeepPartial<T>): Promise<T | null>;
  updateMultiple(criteria: FindOptionsWhere<T>, updateData: DeepPartial<T>): Promise<number>;

  // Delete operations
  delete(id: string): Promise<boolean>;
  deleteMultiple(ids: string[]): Promise<number>;
  softDelete(id: string): Promise<boolean>;
  softDeleteMultiple(ids: string[]): Promise<number>;
  restore(id: string): Promise<boolean>;
  restoreMultiple(ids: string[]): Promise<number>;

  // Query operations
  count(options?: FindManyOptions<T>): Promise<number>;
  exists(id: string): Promise<boolean>;
  existsByCondition(where: FindOptionsWhere<T>): Promise<boolean>;

  // Transaction support
  getQueryRunner(): any;
  createQueryBuilder(alias?: string): any;
} 