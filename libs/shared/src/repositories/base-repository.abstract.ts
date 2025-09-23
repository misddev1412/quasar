import { Repository, FindOptionsWhere, FindManyOptions, DeepPartial, FindOneOptions, QueryRunner } from 'typeorm';
import { BaseEntity } from '../entities/base.entity';
import { SoftDeletableEntity } from '../entities/base.entity';
import { IBaseRepository } from './base-repository.interface';
import { PaginationOptions, PaginatedResult } from '../types/common.types';
import { SortOrder } from '../enums/common.enums';

export abstract class BaseRepository<T extends BaseEntity> implements IBaseRepository<T> {
  protected repository: Repository<T>;

  constructor(repository: Repository<T>) {
    this.repository = repository;
  }

  // Basic CRUD operations
  create(entity: DeepPartial<T>): T {
    return this.repository.create(entity);
  }

  async save(entity: DeepPartial<T>): Promise<T> {
    return await this.repository.save(entity);
  }

  async saveMultiple(entities: DeepPartial<T>[]): Promise<T[]> {
    return await this.repository.save(entities);
  }

  // Find operations
  async findById(id: string): Promise<T | null> {
    return await this.repository.findOne({ where: { id } as FindOptionsWhere<T> });
  }

  async findByIds(ids: string[]): Promise<T[]> {
    return await this.repository.findByIds(ids);
  }

  async findOne(options?: FindOneOptions<T>): Promise<T | null> {
    if (!options) {
      return null;
    }
    return await this.repository.findOne(options);
  }

  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return await this.repository.find(options);
  }

  async findWithPagination(options: PaginationOptions & FindManyOptions<T>): Promise<PaginatedResult<T>> {
    const { page = 1, limit = 10, sortBy, sortOrder = SortOrder.ASC, ...findOptions } = options;
    
    const skip = (page - 1) * limit;
    const take = limit;

    let order: any = {};
    if (sortBy) {
      order[sortBy] = sortOrder;
    } else {
      order.createdAt = SortOrder.DESC;
    }

    const [data, total] = await this.repository.findAndCount({
      ...findOptions,
      skip,
      take,
      order,
    });

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrevious,
      },
    };
  }

  // Update operations
  async update(id: string, updateData: DeepPartial<T>): Promise<T | null> {
    await this.repository.update(id, updateData as any);
    return await this.findById(id);
  }

  async updateMultiple(criteria: FindOptionsWhere<T>, updateData: DeepPartial<T>): Promise<number> {
    const result = await this.repository.update(criteria, updateData as any);
    return result.affected || 0;
  }

  // Delete operations
  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected || 0) > 0;
  }

  async deleteMultiple(ids: string[]): Promise<number> {
    const result = await this.repository.delete(ids);
    return result.affected || 0;
  }

  async softDelete(id: string): Promise<boolean> {
    // Check if entity supports soft delete
    const entity = await this.findById(id);
    if (!entity) return false;

    if (this.isSoftDeletable(entity)) {
      const result = await this.repository.softDelete(id);
      return (result.affected || 0) > 0;
    } else {
      // Fallback to hard delete if soft delete is not supported
      return await this.delete(id);
    }
  }

  async softDeleteMultiple(ids: string[]): Promise<number> {
    // Check if any entity supports soft delete
    const entities = await this.findByIds(ids);
    if (entities.length === 0) return 0;

    if (entities.some(entity => this.isSoftDeletable(entity))) {
      const result = await this.repository.softDelete(ids);
      return result.affected || 0;
    } else {
      // Fallback to hard delete if soft delete is not supported
      return await this.deleteMultiple(ids);
    }
  }

  async restore(id: string): Promise<boolean> {
    const result = await this.repository.restore(id);
    return (result.affected || 0) > 0;
  }

  async restoreMultiple(ids: string[]): Promise<number> {
    const result = await this.repository.restore(ids);
    return result.affected || 0;
  }

  // Query operations
  async count(options?: FindManyOptions<T>): Promise<number> {
    return await this.repository.count(options);
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.repository.count({ where: { id } as FindOptionsWhere<T> });
    return count > 0;
  }

  async existsByCondition(where: FindOptionsWhere<T>): Promise<boolean> {
    const count = await this.repository.count({ where });
    return count > 0;
  }

  // Transaction support
  getQueryRunner(): QueryRunner {
    return this.repository.manager.connection.createQueryRunner();
  }

  createQueryBuilder(alias?: string) {
    return this.repository.createQueryBuilder(alias);
  }

  // Protected helper methods
  protected isSoftDeletable(entity: any): entity is SoftDeletableEntity {
    return entity instanceof SoftDeletableEntity || 'deletedAt' in entity;
  }

  protected getRepository(): Repository<T> {
    return this.repository;
  }
} 