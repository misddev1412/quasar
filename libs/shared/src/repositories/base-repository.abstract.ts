import { 
  Repository, 
  DeepPartial, 
  FindManyOptions, 
  FindOneOptions,
  FindOptionsWhere,
  SelectQueryBuilder,
  EntityManager,
  DataSource,
  ObjectLiteral
} from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { IBaseRepository } from './base-repository.interface';
import { 
  PaginatedResponse, 
  PaginationParams, 
  SortParams, 
  QueryParams,
  Result,
  PaginationMeta
} from '../types/common.types';
import { 
  RepositoryQueryOptions, 
  RepositoryFindOneOptions,
  BulkOperationOptions,
  TransactionOptions
} from '../types/database.types';

/**
 * Abstract base repository implementation
 * Provides common CRUD operations for TypeORM entities
 */
@Injectable()
export abstract class BaseRepository<T extends ObjectLiteral, ID = string> implements IBaseRepository<T, ID> {
  protected readonly logger: Logger;
  
  constructor(
    protected readonly repository: Repository<T>,
    protected readonly dataSource: DataSource
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  // ========== CREATE OPERATIONS ==========

  async create(entityData: DeepPartial<T>): Promise<T> {
    try {
      const entity = this.repository.create(entityData);
      const savedEntity = await this.repository.save(entity);
      this.logger.log(`Created ${this.getEntityName()} with ID: ${this.getEntityId(savedEntity)}`);
      return savedEntity;
    } catch (error) {
      this.logger.error(`Failed to create ${this.getEntityName()}:`, error);
      throw error;
    }
  }

  async createMany(entitiesData: DeepPartial<T>[]): Promise<T[]> {
    try {
      const entities = this.repository.create(entitiesData);
      const savedEntities = await this.repository.save(entities);
      this.logger.log(`Created ${savedEntities.length} ${this.getEntityName()}(s)`);
      return savedEntities;
    } catch (error) {
      this.logger.error(`Failed to create multiple ${this.getEntityName()}(s):`, error);
      throw error;
    }
  }

  async upsert(entityData: DeepPartial<T>, conflictFields: (keyof T)[]): Promise<T> {
    try {
      const result = await this.repository.upsert(entityData as any, conflictFields as string[]);
      const entityId = result.identifiers[0];
      const entity = await this.findById(entityId[this.getPrimaryKeyField()] as ID);
      this.logger.log(`Upserted ${this.getEntityName()} with ID: ${this.getEntityId(entity)}`);
      return entity;
    } catch (error) {
      this.logger.error(`Failed to upsert ${this.getEntityName()}:`, error);
      throw error;
    }
  }

  async bulkCreate(entitiesData: DeepPartial<T>[], options: BulkOperationOptions = {}): Promise<T[]> {
    const { chunkSize = 1000, transaction = true } = options;
    
    try {
      if (transaction) {
        return await this.dataSource.transaction(async (manager) => {
          return await this.processBulkCreate(entitiesData, chunkSize, manager.getRepository(this.repository.target));
        });
      } else {
        return await this.processBulkCreate(entitiesData, chunkSize, this.repository);
      }
    } catch (error) {
      this.logger.error(`Failed to bulk create ${this.getEntityName()}(s):`, error);
      throw error;
    }
  }

  private async processBulkCreate(entitiesData: DeepPartial<T>[], chunkSize: number, repo: Repository<T>): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < entitiesData.length; i += chunkSize) {
      const chunk = entitiesData.slice(i, i + chunkSize);
      const entities = repo.create(chunk);
      const savedEntities = await repo.save(entities);
      results.push(...savedEntities);
    }
    
    this.logger.log(`Bulk created ${results.length} ${this.getEntityName()}(s)`);
    return results;
  }

  // ========== READ OPERATIONS ==========

  async findById(id: ID, options: RepositoryFindOneOptions<T> = {}): Promise<T | null> {
    try {
      const { softDelete = false, ...findOptions } = options;
      const whereCondition: any = { [this.getPrimaryKeyField()]: id };
      
      if (softDelete && this.supportsSoftDelete()) {
        whereCondition.deletedAt = null;
      }

      const entity = await this.repository.findOne({
        ...findOptions,
        where: whereCondition as FindOptionsWhere<T>
      });

      return entity;
    } catch (error) {
      this.logger.error(`Failed to find ${this.getEntityName()} by ID ${id}:`, error);
      throw error;
    }
  }

  async findOne(options: RepositoryFindOneOptions<T>): Promise<T | null> {
    try {
      const { softDelete = false, ...findOptions } = options;
      
      if (softDelete && this.supportsSoftDelete()) {
        const where = findOptions.where as any;
        findOptions.where = { ...where, deletedAt: null } as FindOptionsWhere<T>;
      }

      return await this.repository.findOne(findOptions);
    } catch (error) {
      this.logger.error(`Failed to find one ${this.getEntityName()}:`, error);
      throw error;
    }
  }

  async findMany(options: RepositoryQueryOptions<T> = {}): Promise<T[]> {
    try {
      const { pagination, softDelete = false, ...findOptions } = options;
      
      if (softDelete && this.supportsSoftDelete()) {
        const where = (findOptions as any).where;
        (findOptions as any).where = { ...where, deletedAt: null };
      }

      const queryOptions: FindManyOptions<T> = { ...findOptions };

      if (pagination) {
        queryOptions.skip = pagination.offset || (pagination.page - 1) * pagination.limit;
        queryOptions.take = pagination.limit;
      }

      return await this.repository.find(queryOptions);
    } catch (error) {
      this.logger.error(`Failed to find ${this.getEntityName()}(s):`, error);
      throw error;
    }
  }

  async findPaginated(params: PaginationParams, options: RepositoryQueryOptions<T> = {}): Promise<PaginatedResponse<T>> {
    try {
      const { page, limit } = params;
      const { softDelete = false, ...findOptions } = options;
      
      if (softDelete && this.supportsSoftDelete()) {
        const where = (findOptions as any).where;
        (findOptions as any).where = { ...where, deletedAt: null };
      }

      const [data, total] = await this.repository.findAndCount({
        ...findOptions,
        skip: (page - 1) * limit,
        take: limit
      });

      const meta: PaginationMeta = {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1
      };

      return { data, meta };
    } catch (error) {
      this.logger.error(`Failed to find paginated ${this.getEntityName()}(s):`, error);
      throw error;
    }
  }

  async findWithQuery(queryParams: QueryParams): Promise<PaginatedResponse<T>> {
    try {
      let qb = this.repository.createQueryBuilder(this.getEntityName().toLowerCase());

      // Apply query parameters
      this.applyQueryParams(qb, queryParams);

      const { pagination } = queryParams;
      if (pagination) {
        qb = qb.skip((pagination.page - 1) * pagination.limit)
             .take(pagination.limit);
      }

      const [data, total] = await qb.getManyAndCount();

      const meta: PaginationMeta = pagination ? {
        currentPage: pagination.page,
        totalPages: Math.ceil(total / pagination.limit),
        totalItems: total,
        itemsPerPage: pagination.limit,
        hasNextPage: pagination.page * pagination.limit < total,
        hasPreviousPage: pagination.page > 1
      } : {
        currentPage: 1,
        totalPages: 1,
        totalItems: total,
        itemsPerPage: total,
        hasNextPage: false,
        hasPreviousPage: false
      };

      return { data, meta };
    } catch (error) {
      this.logger.error(`Failed to find ${this.getEntityName()}(s) with query:`, error);
      throw error;
    }
  }

  async findByIds(ids: ID[], options: RepositoryQueryOptions<T> = {}): Promise<T[]> {
    try {
      const { softDelete = false, ...findOptions } = options;
      const whereCondition: any = { [this.getPrimaryKeyField()]: ids };
      
      if (softDelete && this.supportsSoftDelete()) {
        whereCondition.deletedAt = null;
      }

      return await this.repository.find({
        ...findOptions,
        where: whereCondition as FindOptionsWhere<T>
      });
    } catch (error) {
      this.logger.error(`Failed to find ${this.getEntityName()}(s) by IDs:`, error);
      throw error;
    }
  }

  async existsById(id: ID): Promise<boolean> {
    try {
      const count = await this.repository.count({ 
        where: { [this.getPrimaryKeyField()]: id } as FindOptionsWhere<T>
      });
      return count > 0;
    } catch (error) {
      this.logger.error(`Failed to check existence of ${this.getEntityName()} with ID ${id}:`, error);
      throw error;
    }
  }

  async exists(where: FindOptionsWhere<T>): Promise<boolean> {
    try {
      const count = await this.repository.count({ where });
      return count > 0;
    } catch (error) {
      this.logger.error(`Failed to check existence of ${this.getEntityName()}:`, error);
      throw error;
    }
  }

  async count(where?: FindOptionsWhere<T>): Promise<number> {
    try {
      return await this.repository.count(where ? { where } : {});
    } catch (error) {
      this.logger.error(`Failed to count ${this.getEntityName()}(s):`, error);
      throw error;
    }
  }

  async countWithQuery(queryParams: Omit<QueryParams, 'pagination'>): Promise<number> {
    try {
      let qb = this.repository.createQueryBuilder(this.getEntityName().toLowerCase());
      
      // Apply query parameters except pagination
      this.applyQueryParams(qb, { ...queryParams, pagination: undefined });
      
      return await qb.getCount();
    } catch (error) {
      this.logger.error(`Failed to count ${this.getEntityName()}(s) with query:`, error);
      throw error;
    }
  }

  // ========== UPDATE OPERATIONS ==========

  async updateById(id: ID, updateData: DeepPartial<T>): Promise<T | null> {
    try {
      await this.repository.update({ [this.getPrimaryKeyField()]: id } as any, updateData as any);
      return await this.findById(id);
    } catch (error) {
      this.logger.error(`Failed to update ${this.getEntityName()} with ID ${id}:`, error);
      throw error;
    }
  }

  async updateOne(where: FindOptionsWhere<T>, updateData: DeepPartial<T>): Promise<T | null> {
    try {
      const entity = await this.repository.findOne({ where });
      if (!entity) return null;
      
      await this.repository.update(where as any, updateData as any);
      return await this.repository.findOne({ where });
    } catch (error) {
      this.logger.error(`Failed to update one ${this.getEntityName()}:`, error);
      throw error;
    }
  }

  async updateMany(where: FindOptionsWhere<T>, updateData: DeepPartial<T>): Promise<T[]> {
    try {
      const entities = await this.repository.find({ where });
      await this.repository.update(where as any, updateData as any);
      return await this.repository.find({ where });
    } catch (error) {
      this.logger.error(`Failed to update multiple ${this.getEntityName()}(s):`, error);
      throw error;
    }
  }

  async bulkUpdate(updates: Array<{ id: ID; data: DeepPartial<T> }>, options: BulkOperationOptions = {}): Promise<T[]> {
    const { transaction = true } = options;
    
    try {
      if (transaction) {
        return await this.dataSource.transaction(async (manager) => {
          return await this.processBulkUpdate(updates, manager.getRepository(this.repository.target));
        });
      } else {
        return await this.processBulkUpdate(updates, this.repository);
      }
    } catch (error) {
      this.logger.error(`Failed to bulk update ${this.getEntityName()}(s):`, error);
      throw error;
    }
  }

  private async processBulkUpdate(updates: Array<{ id: ID; data: DeepPartial<T> }>, repo: Repository<T>): Promise<T[]> {
    const results: T[] = [];
    
    for (const update of updates) {
      await repo.update({ [this.getPrimaryKeyField()]: update.id } as any, update.data as any);
      const updatedEntity = await repo.findOne({ 
        where: { [this.getPrimaryKeyField()]: update.id } as FindOptionsWhere<T>
      });
      if (updatedEntity) results.push(updatedEntity);
    }
    
    this.logger.log(`Bulk updated ${results.length} ${this.getEntityName()}(s)`);
    return results;
  }

  // ========== DELETE OPERATIONS ==========

  async deleteById(id: ID): Promise<boolean> {
    try {
      const result = await this.repository.delete({ [this.getPrimaryKeyField()]: id } as any);
      const deleted = result.affected > 0;
      if (deleted) {
        this.logger.log(`Deleted ${this.getEntityName()} with ID: ${id}`);
      }
      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete ${this.getEntityName()} with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteOne(where: FindOptionsWhere<T>): Promise<boolean> {
    try {
      const result = await this.repository.delete(where as any);
      return result.affected > 0;
    } catch (error) {
      this.logger.error(`Failed to delete one ${this.getEntityName()}:`, error);
      throw error;
    }
  }

  async deleteMany(where: FindOptionsWhere<T>): Promise<number> {
    try {
      const result = await this.repository.delete(where as any);
      return result.affected || 0;
    } catch (error) {
      this.logger.error(`Failed to delete multiple ${this.getEntityName()}(s):`, error);
      throw error;
    }
  }

  async deleteByIds(ids: ID[]): Promise<number> {
    try {
      const result = await this.repository.delete({ [this.getPrimaryKeyField()]: ids } as any);
      const deleted = result.affected || 0;
      this.logger.log(`Deleted ${deleted} ${this.getEntityName()}(s)`);
      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete ${this.getEntityName()}(s) by IDs:`, error);
      throw error;
    }
  }

  async bulkDelete(ids: ID[], options: BulkOperationOptions = {}): Promise<number> {
    const { chunkSize = 1000, transaction = true } = options;
    
    try {
      if (transaction) {
        return await this.dataSource.transaction(async (manager) => {
          return await this.processBulkDelete(ids, chunkSize, manager.getRepository(this.repository.target));
        });
      } else {
        return await this.processBulkDelete(ids, chunkSize, this.repository);
      }
    } catch (error) {
      this.logger.error(`Failed to bulk delete ${this.getEntityName()}(s):`, error);
      throw error;
    }
  }

  private async processBulkDelete(ids: ID[], chunkSize: number, repo: Repository<T>): Promise<number> {
    let totalDeleted = 0;
    
    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunk = ids.slice(i, i + chunkSize);
      const result = await repo.delete({ [this.getPrimaryKeyField()]: chunk } as any);
      totalDeleted += result.affected || 0;
    }
    
    this.logger.log(`Bulk deleted ${totalDeleted} ${this.getEntityName()}(s)`);
    return totalDeleted;
  }

  // ========== UTILITY METHODS ==========

  getMetadata(): any {
    return this.repository.metadata;
  }

  getEntityName(): string {
    return this.repository.metadata.name;
  }

  getPrimaryKeyField(): string {
    return this.repository.metadata.primaryColumns[0]?.propertyName || 'id';
  }

  async clearCache(): Promise<void> {
    if (this.dataSource.queryResultCache) {
      await this.dataSource.queryResultCache.clear();
    }
  }

  async preload(entityData: DeepPartial<T>): Promise<T | undefined> {
    return await this.repository.preload(entityData);
  }

  async reload(entity: T): Promise<T> {
    try {
      const id = this.getEntityId(entity);
      const reloadedEntity = await this.findById(id);
      if (!reloadedEntity) {
        throw new Error(`Entity with ID ${id} not found`);
      }
      return reloadedEntity;
    } catch (error) {
      this.logger.error(`Failed to reload ${this.getEntityName()}:`, error);
      throw error;
    }
  }

  async refresh(id: ID): Promise<T | null> {
    try {
      return await this.findById(id);
    } catch (error) {
      this.logger.error(`Failed to refresh ${this.getEntityName()} with ID ${id}:`, error);
      throw error;
    }
  }

  async query(sql: string, parameters?: any[]): Promise<any> {
    try {
      return await this.dataSource.query(sql, parameters);
    } catch (error) {
      this.logger.error(`Failed to execute raw query:`, error);
      throw error;
    }
  }

  async transaction<R>(operation: (repository: IBaseRepository<T, ID>) => Promise<R>, options?: TransactionOptions): Promise<R> {
    return await this.dataSource.transaction(async (manager) => {
      const transactionalRepo = new (this.constructor as any)(
        manager.getRepository(this.repository.target),
        this.dataSource
      );
      return await operation(transactionalRepo);
    });
  }

  createQueryBuilder(alias?: string): SelectQueryBuilder<T> {
    return this.repository.createQueryBuilder(alias || this.getEntityName().toLowerCase());
  }

  async executeQuery(builderCallback: (qb: SelectQueryBuilder<T>) => SelectQueryBuilder<T>): Promise<T[]> {
    try {
      const qb = this.createQueryBuilder();
      const finalQuery = builderCallback(qb);
      return await finalQuery.getMany();
    } catch (error) {
      this.logger.error(`Failed to execute query builder:`, error);
      throw error;
    }
  }

  // ========== AGGREGATION METHODS ==========

  async min(field: keyof T, where?: FindOptionsWhere<T>): Promise<number | null> {
    try {
      let qb = this.createQueryBuilder().select(`MIN(${String(field)})`, 'min');
      
      if (where) {
        qb = qb.where(where as any);
      }
      
      const result = await qb.getRawOne();
      return result?.min ? Number(result.min) : null;
    } catch (error) {
      this.logger.error(`Failed to get minimum value for field ${String(field)}:`, error);
      throw error;
    }
  }

  async max(field: keyof T, where?: FindOptionsWhere<T>): Promise<number | null> {
    try {
      let qb = this.createQueryBuilder().select(`MAX(${String(field)})`, 'max');
      
      if (where) {
        qb = qb.where(where as any);
      }
      
      const result = await qb.getRawOne();
      return result?.max ? Number(result.max) : null;
    } catch (error) {
      this.logger.error(`Failed to get maximum value for field ${String(field)}:`, error);
      throw error;
    }
  }

  async avg(field: keyof T, where?: FindOptionsWhere<T>): Promise<number | null> {
    try {
      let qb = this.createQueryBuilder().select(`AVG(${String(field)})`, 'avg');
      
      if (where) {
        qb = qb.where(where as any);
      }
      
      const result = await qb.getRawOne();
      return result?.avg ? Number(result.avg) : null;
    } catch (error) {
      this.logger.error(`Failed to get average value for field ${String(field)}:`, error);
      throw error;
    }
  }

  async sum(field: keyof T, where?: FindOptionsWhere<T>): Promise<number | null> {
    try {
      let qb = this.createQueryBuilder().select(`SUM(${String(field)})`, 'sum');
      
      if (where) {
        qb = qb.where(where as any);
      }
      
      const result = await qb.getRawOne();
      return result?.sum ? Number(result.sum) : null;
    } catch (error) {
      this.logger.error(`Failed to get sum value for field ${String(field)}:`, error);
      throw error;
    }
  }

  async groupBy(field: keyof T, where?: FindOptionsWhere<T>): Promise<Array<{ [key: string]: any; count: number }>> {
    try {
      let qb = this.createQueryBuilder()
        .select(`${String(field)}`, 'group_field')
        .addSelect('COUNT(*)', 'count')
        .groupBy(String(field));
      
      if (where) {
        qb = qb.where(where as any);
      }
      
      const results = await qb.getRawMany();
      return results.map(result => ({
        [String(field)]: result.group_field,
        count: Number(result.count)
      }));
    } catch (error) {
      this.logger.error(`Failed to group by field ${String(field)}:`, error);
      throw error;
    }
  }

  // ========== PROTECTED HELPER METHODS ==========

  protected getEntityId(entity: T): ID {
    return entity[this.getPrimaryKeyField() as keyof T] as ID;
  }

  protected supportsSoftDelete(): boolean {
    return this.repository.metadata.columns.some(column => column.propertyName === 'deletedAt');
  }

  protected applyQueryParams(qb: SelectQueryBuilder<T>, queryParams: QueryParams): void {
    const { sort, search, filters } = queryParams;
    
    // Apply search
    if (search?.query && search?.fields?.length) {
      const searchConditions = search.fields.map(field => `${field} ILIKE :searchQuery`).join(' OR ');
      qb.andWhere(`(${searchConditions})`, { searchQuery: `%${search.query}%` });
    }
    
    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          qb.andWhere(`${key} = :${key}`, { [key]: value });
        }
      });
    }
    
    // Apply sorting
    if (sort?.length) {
      sort.forEach((sortParam, index) => {
        if (index === 0) {
          qb.orderBy(sortParam.field, sortParam.order);
        } else {
          qb.addOrderBy(sortParam.field, sortParam.order);
        }
      });
    }
  }
} 