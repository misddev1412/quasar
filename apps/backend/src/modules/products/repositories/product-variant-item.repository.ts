import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVariantItem } from '../entities/product-variant-item.entity';
import { ProductVariant } from '../entities/product-variant.entity';
import { Attribute } from '../entities/attribute.entity';
import { AttributeValue } from '../entities/attribute-value.entity';

export interface CreateProductVariantItemDto {
  productVariantId: string;
  attributeId: string;
  attributeValueId: string;
  sortOrder?: number;
}

export interface UpdateProductVariantItemDto {
  attributeValueId?: string;
  sortOrder?: number;
}

export interface ProductVariantItemFilters {
  productVariantId?: string;
  attributeId?: string;
  attributeValueId?: string;
}

export interface ProductVariantItemQueryOptions {
  page?: number;
  limit?: number;
  filters?: ProductVariantItemFilters;
  relations?: string[];
  sortBy?: 'sortOrder' | 'createdAt' | 'updatedAt';
  sortOrder?: 'ASC' | 'DESC';
}

@Injectable()
export class ProductVariantItemRepository {
  constructor(
    @InjectRepository(ProductVariantItem)
    private readonly variantItemRepo: Repository<ProductVariantItem>,
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
    @InjectRepository(Attribute)
    private readonly attributeRepo: Repository<Attribute>,
    @InjectRepository(AttributeValue)
    private readonly attributeValueRepo: Repository<AttributeValue>,
  ) {}

  async findMany(options: ProductVariantItemQueryOptions = {}) {
    const { page = 1, limit = 50, filters = {}, relations = [], sortBy = 'sortOrder', sortOrder = 'ASC' } = options;

    const queryBuilder = this.variantItemRepo.createQueryBuilder('item');

    // Add relations
    const defaultRelations = ['attribute', 'attributeValue', 'productVariant'];
    const allRelations = [...new Set([...defaultRelations, ...relations])];

    allRelations.forEach(relation => {
      queryBuilder.leftJoinAndSelect(`item.${relation}`, relation);
    });

    // Apply filters
    if (filters.productVariantId) {
      queryBuilder.andWhere('item.productVariantId = :productVariantId', {
        productVariantId: filters.productVariantId
      });
    }

    if (filters.attributeId) {
      queryBuilder.andWhere('item.attributeId = :attributeId', {
        attributeId: filters.attributeId
      });
    }

    if (filters.attributeValueId) {
      queryBuilder.andWhere('item.attributeValueId = :attributeValueId', {
        attributeValueId: filters.attributeValueId
      });
    }

    // Add sorting
    queryBuilder.orderBy(`item.${sortBy}`, sortOrder);

    // Add pagination
    if (limit > 0) {
      queryBuilder.skip((page - 1) * limit).take(limit);
    }

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      data: items,
      total,
      page,
      limit,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 1,
    };
  }

  async findById(id: string, relations: string[] = []) {
    const defaultRelations = ['attribute', 'attributeValue', 'productVariant'];
    const allRelations = [...new Set([...defaultRelations, ...relations])];

    return this.variantItemRepo.findOne({
      where: { id },
      relations: allRelations,
    });
  }

  async findByVariantId(productVariantId: string, relations: string[] = []) {
    return this.findMany({
      filters: { productVariantId },
      relations,
      sortBy: 'sortOrder',
      sortOrder: 'ASC',
    });
  }

  async findByAttributeId(attributeId: string, relations: string[] = []) {
    return this.findMany({
      filters: { attributeId },
      relations,
    });
  }

  async findByAttributeValueId(attributeValueId: string, relations: string[] = []) {
    return this.findMany({
      filters: { attributeValueId },
      relations,
    });
  }

  async create(data: CreateProductVariantItemDto) {
    // Validate that the variant, attribute, and attribute value exist
    const variant = await this.variantRepo.findOne({
      where: { id: data.productVariantId }
    });
    if (!variant) {
      throw new Error(`Product variant with ID ${data.productVariantId} not found`);
    }

    const attribute = await this.attributeRepo.findOne({
      where: { id: data.attributeId }
    });
    if (!attribute) {
      throw new Error(`Attribute with ID ${data.attributeId} not found`);
    }

    const attributeValue = await this.attributeValueRepo.findOne({
      where: { id: data.attributeValueId, attributeId: data.attributeId }
    });
    if (!attributeValue) {
      throw new Error(`Attribute value with ID ${data.attributeValueId} not found for attribute ${data.attributeId}`);
    }

    // Check if this variant already has a value for this attribute
    const existing = await this.variantItemRepo.findOne({
      where: {
        productVariantId: data.productVariantId,
        attributeId: data.attributeId,
      },
    });

    if (existing) {
      throw new Error(`Product variant ${data.productVariantId} already has a value for attribute ${data.attributeId}`);
    }

    const variantItem = this.variantItemRepo.create({
      productVariantId: data.productVariantId,
      attributeId: data.attributeId,
      attributeValueId: data.attributeValueId,
      sortOrder: data.sortOrder ?? 0,
    });

    return this.variantItemRepo.save(variantItem);
  }

  async createMany(items: CreateProductVariantItemDto[]) {
    const createdItems = [];

    for (const itemData of items) {
      const item = await this.create(itemData);
      createdItems.push(item);
    }

    return createdItems;
  }

  async update(id: string, data: UpdateProductVariantItemDto) {
    const item = await this.findById(id);
    if (!item) {
      throw new Error(`Product variant item with ID ${id} not found`);
    }

    // If updating attribute value, validate it belongs to the same attribute
    if (data.attributeValueId) {
      const attributeValue = await this.attributeValueRepo.findOne({
        where: { id: data.attributeValueId, attributeId: item.attributeId }
      });
      if (!attributeValue) {
        throw new Error(`Attribute value with ID ${data.attributeValueId} not found for attribute ${item.attributeId}`);
      }
    }

    await this.variantItemRepo.update(id, data);
    return this.findById(id);
  }

  async delete(id: string) {
    const item = await this.findById(id);
    if (!item) {
      throw new Error(`Product variant item with ID ${id} not found`);
    }

    await this.variantItemRepo.delete(id);
    return { deleted: true };
  }

  async deleteByVariantId(productVariantId: string) {
    await this.variantItemRepo.delete({ productVariantId });
    return { deleted: true };
  }

  async replaceVariantItems(productVariantId: string, items: CreateProductVariantItemDto[]) {
    // Delete existing items for this variant
    await this.deleteByVariantId(productVariantId);

    // Create new items
    return this.createMany(items.map(item => ({
      ...item,
      productVariantId,
    })));
  }

  async getVariantAttributesMap(productVariantId: string): Promise<Record<string, any>> {
    const items = await this.variantItemRepo.find({
      where: { productVariantId },
      relations: ['attribute', 'attributeValue'],
      order: { sortOrder: 'ASC' },
    });

    const attributesMap: Record<string, any> = {};

    items.forEach(item => {
      attributesMap[item.attribute.name] = {
        attributeId: item.attributeId,
        attributeName: item.attribute.name,
        attributeDisplayName: item.attribute.displayName,
        valueId: item.attributeValueId,
        value: item.attributeValue.value,
        displayValue: item.attributeValue.displayValue,
        sortOrder: item.sortOrder,
      };
    });

    return attributesMap;
  }

  async getStats() {
    const total = await this.variantItemRepo.count();
    const byAttribute = await this.variantItemRepo
      .createQueryBuilder('item')
      .leftJoin('item.attribute', 'attribute')
      .select(['attribute.name as attributeName', 'COUNT(item.id) as count'])
      .groupBy('attribute.name')
      .getRawMany();

    return {
      total,
      byAttribute,
    };
  }
}