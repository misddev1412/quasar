import { Logger } from '@nestjs/common';
import { BaseEntity } from '../entities/base.entity';
import { IBaseRepository } from '../repositories/base-repository.interface';
import { FindManyOptions, FindOneOptions, DeepPartial } from 'typeorm';
import { PaginationOptions, PaginatedResult } from '../types/common.types';

export abstract class BaseService<T extends BaseEntity> {
  protected readonly logger: Logger;
  protected readonly repository: IBaseRepository<T>;

  constructor(
    repository: IBaseRepository<T>,
    context: string
  ) {
    this.repository = repository;
    this.logger = new Logger(context);
  }

  // Create operations
  async create(createData: DeepPartial<T>): Promise<T> {
    try {
      this.logger.debug(`Creating new entity with data: ${JSON.stringify(createData)}`);
      const entity = this.repository.create(createData);
      const savedEntity = await this.repository.save(entity);
      this.logger.debug(`Successfully created entity with ID: ${savedEntity.id}`);
      return savedEntity;
    } catch (error) {
      this.logger.error(`Failed to create entity: ${error.message}`, error.stack);
      throw error;
    }
  }

  async createMultiple(createDataArray: DeepPartial<T>[]): Promise<T[]> {
    try {
      this.logger.debug(`Creating ${createDataArray.length} entities`);
      const entities = createDataArray.map(data => this.repository.create(data));
      const savedEntities = await this.repository.saveMultiple(entities);
      this.logger.debug(`Successfully created ${savedEntities.length} entities`);
      return savedEntities;
    } catch (error) {
      this.logger.error(`Failed to create multiple entities: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Read operations
  async findById(id: string): Promise<T | null> {
    try {
      this.logger.debug(`Finding entity by ID: ${id}`);
      const entity = await this.repository.findById(id);
      if (!entity) {
        this.logger.debug(`Entity with ID ${id} not found`);
      }
      return entity;
    } catch (error) {
      this.logger.error(`Failed to find entity by ID ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findByIdOrFail(id: string): Promise<T> {
    const entity = await this.findById(id);
    if (!entity) {
      const error = new Error(`Entity with ID ${id} not found`);
      this.logger.error(error.message);
      throw error;
    }
    return entity;
  }

  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    try {
      this.logger.debug('Finding all entities with options:', JSON.stringify(options));
      const entities = await this.repository.findAll(options);
      this.logger.debug(`Found ${entities.length} entities`);
      return entities;
    } catch (error) {
      this.logger.error(`Failed to find all entities: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    try {
      this.logger.debug('Finding one entity with options:', JSON.stringify(options));
      return await this.repository.findOne(options);
    } catch (error) {
      this.logger.error(`Failed to find one entity: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findWithPagination(options: PaginationOptions & FindManyOptions<T>): Promise<PaginatedResult<T>> {
    try {
      this.logger.debug('Finding entities with pagination:', JSON.stringify(options));
      const result = await this.repository.findWithPagination(options);
      this.logger.debug(`Found ${result.data.length} entities out of ${result.meta.total} total`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to find entities with pagination: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Update operations
  async update(id: string, updateData: DeepPartial<T>): Promise<T | null> {
    try {
      this.logger.debug(`Updating entity ${id} with data:`, JSON.stringify(updateData));
      const entity = await this.repository.update(id, updateData);
      if (entity) {
        this.logger.debug(`Successfully updated entity with ID: ${id}`);
      } else {
        this.logger.warn(`Entity with ID ${id} not found for update`);
      }
      return entity;
    } catch (error) {
      this.logger.error(`Failed to update entity ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateOrFail(id: string, updateData: DeepPartial<T>): Promise<T> {
    const entity = await this.update(id, updateData);
    if (!entity) {
      const error = new Error(`Entity with ID ${id} not found for update`);
      this.logger.error(error.message);
      throw error;
    }
    return entity;
  }

  // Delete operations
  async delete(id: string): Promise<boolean> {
    try {
      this.logger.debug(`Deleting entity with ID: ${id}`);
      const deleted = await this.repository.delete(id);
      if (deleted) {
        this.logger.debug(`Successfully deleted entity with ID: ${id}`);
      } else {
        this.logger.warn(`Entity with ID ${id} not found for deletion`);
      }
      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete entity ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async softDelete(id: string): Promise<boolean> {
    try {
      this.logger.debug(`Soft deleting entity with ID: ${id}`);
      const deleted = await this.repository.softDelete(id);
      if (deleted) {
        this.logger.debug(`Successfully soft deleted entity with ID: ${id}`);
      } else {
        this.logger.warn(`Entity with ID ${id} not found for soft deletion`);
      }
      return deleted;
    } catch (error: any) {
      this.logger.error(`Failed to soft delete entity ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async restore(id: string): Promise<boolean> {
    try {
      this.logger.debug(`Restoring entity with ID: ${id}`);
      const restored = await this.repository.restore(id);
      if (restored) {
        this.logger.debug(`Successfully restored entity with ID: ${id}`);
      } else {
        this.logger.warn(`Entity with ID ${id} not found for restoration`);
      }
      return restored;
    } catch (error) {
      this.logger.error(`Failed to restore entity ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Utility operations
  async exists(id: string): Promise<boolean> {
    try {
      return await this.repository.exists(id);
    } catch (error) {
      this.logger.error(`Failed to check if entity ${id} exists: ${error.message}`, error.stack);
      throw error;
    }
  }

  async count(options?: FindManyOptions<T>): Promise<number> {
    try {
      const count = await this.repository.count(options);
      this.logger.debug(`Counted ${count} entities`);
      return count;
    } catch (error) {
      this.logger.error(`Failed to count entities: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Protected helper methods for subclasses
  protected logOperation(operation: string, data?: any): void {
    this.logger.debug(`${operation}:`, data ? JSON.stringify(data) : '');
  }

  protected logError(operation: string, error: Error): void {
    this.logger.error(`${operation} failed: ${error.message}`, error.stack);
  }
} 