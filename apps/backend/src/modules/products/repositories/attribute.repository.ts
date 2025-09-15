import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attribute, AttributeType } from '../entities/attribute.entity';
import { AttributeValue } from '../entities/attribute-value.entity';
import { AttributeTranslation } from '../entities/attribute-translation.entity';

export interface AttributeFilters {
  search?: string;
  type?: AttributeType;
  isRequired?: boolean;
  isFilterable?: boolean;
}

export interface AttributeQueryOptions {
  page?: number;
  limit?: number;
  filters?: AttributeFilters;
  relations?: string[];
}

export interface AttributeFindManyOptions {
  page?: number;
  limit?: number;
  search?: string;
  type?: AttributeType;
  isRequired?: boolean;
  isFilterable?: boolean;
  sortBy?: 'name' | 'displayName' | 'createdAt' | 'updatedAt' | 'sortOrder';
  sortOrder?: 'ASC' | 'DESC';
}

@Injectable()
export class AttributeRepository {
  constructor(
    @InjectRepository(Attribute)
    private readonly attributeRepo: Repository<Attribute>,
    @InjectRepository(AttributeValue)
    private readonly attributeValueRepo: Repository<AttributeValue>,
    @InjectRepository(AttributeTranslation)
    private readonly attributeTranslationRepo: Repository<AttributeTranslation>,
  ) {}

  async findAll(options: AttributeQueryOptions = {}) {
    const { page = 1, limit = 20, filters = {}, relations = [] } = options;
    
    const queryBuilder = this.attributeRepo.createQueryBuilder('attribute');
    
    // Add relations
    relations.forEach(relation => {
      queryBuilder.leftJoinAndSelect(`attribute.${relation}`, relation);
    });
    
    // Apply filters
    if (filters.search) {
      queryBuilder.andWhere(
        '(LOWER(attribute.name) LIKE :search OR LOWER(attribute.displayName) LIKE :search)',
        { search: `%${filters.search.toLowerCase()}%` }
      );
    }
    
    if (filters.type) {
      queryBuilder.andWhere('attribute.type = :type', { type: filters.type });
    }

    if (filters.isRequired !== undefined) {
      queryBuilder.andWhere('attribute.isRequired = :isRequired', { isRequired: filters.isRequired });
    }

    if (filters.isFilterable !== undefined) {
      queryBuilder.andWhere('attribute.isFilterable = :isFilterable', { isFilterable: filters.isFilterable });
    }
    
    // Apply ordering
    queryBuilder.orderBy('attribute.sortOrder', 'ASC')
                 .addOrderBy('attribute.name', 'ASC');
    
    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);
    
    const [items, total] = await queryBuilder.getManyAndCount();
    
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findMany(options: AttributeFindManyOptions) {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      type,
      isRequired,
      isFilterable,
      sortBy = 'sortOrder', 
      sortOrder = 'ASC' 
    } = options;
    
    const queryBuilder = this.attributeRepo.createQueryBuilder('attribute')
      .leftJoinAndSelect('attribute.values', 'values');
    
    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        '(LOWER(attribute.name) LIKE :search OR LOWER(attribute.displayName) LIKE :search)',
        { search: `%${search.toLowerCase()}%` }
      );
    }
    
    if (type) {
      queryBuilder.andWhere('attribute.type = :type', { type });
    }

    if (isRequired !== undefined) {
      queryBuilder.andWhere('attribute.isRequired = :isRequired', { isRequired });
    }

    if (isFilterable !== undefined) {
      queryBuilder.andWhere('attribute.isFilterable = :isFilterable', { isFilterable });
    }
    
    // Apply ordering
    const orderByMap = {
      name: 'attribute.name',
      displayName: 'attribute.displayName',
      createdAt: 'attribute.createdAt',
      updatedAt: 'attribute.updatedAt',
      sortOrder: 'attribute.sortOrder',
    };
    queryBuilder.orderBy(orderByMap[sortBy], sortOrder);
    
    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);
    
    const [attributes, total] = await queryBuilder.getManyAndCount();
    
    return {
      items: attributes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string, relations: string[] = []): Promise<Attribute | null> {
    return this.attributeRepo.findOne({
      where: { id },
      relations,
    });
  }

  async findByName(name: string): Promise<Attribute | null> {
    return this.attributeRepo.findOne({
      where: { name },
    });
  }

  async create(attributeData: Partial<Attribute>): Promise<Attribute> {
    const attribute = this.attributeRepo.create(attributeData);
    return this.attributeRepo.save(attribute);
  }

  async update(id: string, attributeData: Partial<Attribute>): Promise<Attribute | null> {
    await this.attributeRepo.update(id, attributeData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.attributeRepo.delete(id);
    return result.affected > 0;
  }

  // Attribute Value methods
  async findAttributeValues(attributeId: string): Promise<AttributeValue[]> {
    return this.attributeValueRepo.find({
      where: { attributeId },
      order: { sortOrder: 'ASC', value: 'ASC' },
    });
  }

  async createAttributeValue(valueData: Partial<AttributeValue>): Promise<AttributeValue> {
    const attributeValue = this.attributeValueRepo.create(valueData);
    return this.attributeValueRepo.save(attributeValue);
  }

  async updateAttributeValue(id: string, valueData: Partial<AttributeValue>): Promise<AttributeValue | null> {
    await this.attributeValueRepo.update(id, valueData);
    return this.attributeValueRepo.findOne({ where: { id } });
  }

  async deleteAttributeValue(id: string): Promise<boolean> {
    const result = await this.attributeValueRepo.delete(id);
    return result.affected > 0;
  }

  async getSelectAttributes(): Promise<Attribute[]> {
    return this.attributeRepo.find({
      where: [
        { type: AttributeType.SELECT },
        { type: AttributeType.MULTISELECT }
      ],
      relations: ['values'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async getFilterableAttributes(): Promise<Attribute[]> {
    return this.attributeRepo.find({
      where: { isFilterable: true },
      relations: ['values'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async getStats() {
    const attributes = await this.attributeRepo.find({
      relations: ['values', 'productAttributes'],
    });
    
    const totalAttributes = attributes.length;
    const requiredAttributes = attributes.filter(a => a.isRequired).length;
    const filterableAttributes = attributes.filter(a => a.isFilterable).length;
    
    const attributesByType = Object.values(AttributeType).map(type => ({
      type,
      count: attributes.filter(a => a.type === type).length,
    }));

    const totalValues = attributes.reduce((sum, attr) => {
      const values = (attr as any).values || [];
      return sum + values.length;
    }, 0);
    const totalProductUsage = attributes.reduce((sum, attr) => {
      const productAttrs = (attr as any).productAttributes || [];
      return sum + productAttrs.length;
    }, 0);

    return {
      totalAttributes,
      requiredAttributes,
      filterableAttributes,
      attributesByType,
      totalValues,
      totalProductUsage,
      averageValuesPerAttribute: totalAttributes > 0 ? Math.round(totalValues / totalAttributes) : 0,
      recentAttributes: attributes
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5),
    };
  }

  // Translation methods
  async findAttributeTranslations(attributeId: string): Promise<AttributeTranslation[]> {
    return this.attributeTranslationRepo.find({
      where: { attribute_id: attributeId },
      order: { locale: 'ASC' },
    });
  }

  async findAttributeTranslation(attributeId: string, locale: string): Promise<AttributeTranslation | null> {
    return this.attributeTranslationRepo.findOne({
      where: { attribute_id: attributeId, locale },
    });
  }

  async createAttributeTranslation(translationData: Partial<AttributeTranslation>): Promise<AttributeTranslation> {
    const translation = this.attributeTranslationRepo.create(translationData);
    return this.attributeTranslationRepo.save(translation);
  }

  async updateAttributeTranslation(
    attributeId: string, 
    locale: string, 
    translationData: Partial<AttributeTranslation>
  ): Promise<AttributeTranslation | null> {
    await this.attributeTranslationRepo.update({ attribute_id: attributeId, locale }, translationData);
    return this.findAttributeTranslation(attributeId, locale);
  }

  async deleteAttributeTranslation(attributeId: string, locale: string): Promise<boolean> {
    const result = await this.attributeTranslationRepo.delete({ attribute_id: attributeId, locale });
    return result.affected > 0;
  }

  async findByIdWithTranslations(id: string, locale?: string): Promise<Attribute | null> {
    const query = this.attributeRepo.createQueryBuilder('attribute')
      .leftJoinAndSelect('attribute.translations', 'translations')
      .leftJoinAndSelect('attribute.values', 'values')
      .where('attribute.id = :id', { id });

    if (locale) {
      query.andWhere('translations.locale = :locale', { locale });
    }

    return query.getOne();
  }

  async findManyWithTranslations(options: AttributeFindManyOptions, locale?: string) {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      type,
      isRequired,
      isFilterable,
      sortBy = 'sortOrder', 
      sortOrder = 'ASC' 
    } = options;
    
    const queryBuilder = this.attributeRepo.createQueryBuilder('attribute')
      .leftJoinAndSelect('attribute.translations', 'translations')
      .leftJoinAndSelect('attribute.values', 'values');
    
    if (locale) {
      queryBuilder.andWhere('(translations.locale = :locale OR translations.locale IS NULL)', { locale });
    }
    
    // Apply filters - now also search in translations
    if (search) {
      queryBuilder.andWhere(
        '(LOWER(attribute.name) LIKE :search OR LOWER(attribute.displayName) LIKE :search OR LOWER(translations.displayName) LIKE :search)',
        { search: `%${search.toLowerCase()}%` }
      );
    }
    
    if (type) {
      queryBuilder.andWhere('attribute.type = :type', { type });
    }

    if (isRequired !== undefined) {
      queryBuilder.andWhere('attribute.isRequired = :isRequired', { isRequired });
    }

    if (isFilterable !== undefined) {
      queryBuilder.andWhere('attribute.isFilterable = :isFilterable', { isFilterable });
    }
    
    // Apply ordering
    const orderByMap = {
      name: 'attribute.name',
      displayName: 'attribute.displayName',
      createdAt: 'attribute.createdAt',
      updatedAt: 'attribute.updatedAt',
      sortOrder: 'attribute.sortOrder',
    };
    queryBuilder.orderBy(orderByMap[sortBy], sortOrder);
    
    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);
    
    const [attributes, total] = await queryBuilder.getManyAndCount();
    
    return {
      items: attributes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}