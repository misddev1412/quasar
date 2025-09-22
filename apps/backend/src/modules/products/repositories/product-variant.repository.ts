import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVariant } from '../entities/product-variant.entity';
import { ProductVariantItem } from '../entities/product-variant-item.entity';
import { Product } from '../entities/product.entity';

export interface CreateProductVariantDto {
  productId: string;
  name: string;
  sku?: string;
  barcode?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stockQuantity?: number;
  lowStockThreshold?: number;
  trackInventory?: boolean;
  allowBackorders?: boolean;
  weight?: number;
  dimensions?: string;
  image?: string;
  isActive?: boolean;
  sortOrder?: number;
  variantItems?: Array<{
    attributeId: string;
    attributeValueId: string;
    sortOrder?: number;
  }>;
}

export interface UpdateProductVariantDto {
  name?: string;
  sku?: string;
  barcode?: string;
  price?: number;
  compareAtPrice?: number;
  costPrice?: number;
  stockQuantity?: number;
  lowStockThreshold?: number;
  trackInventory?: boolean;
  allowBackorders?: boolean;
  weight?: number;
  dimensions?: string;
  image?: string;
  isActive?: boolean;
  sortOrder?: number;
  variantItems?: Array<{
    attributeId: string;
    attributeValueId: string;
    sortOrder?: number;
  }>;
}

export interface ProductVariantFilters {
  productId?: string;
  search?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  hasStock?: boolean;
  attributeFilters?: Record<string, string>; // attributeId -> attributeValueId
}

export interface ProductVariantQueryOptions {
  page?: number;
  limit?: number;
  filters?: ProductVariantFilters;
  relations?: string[];
  sortBy?: 'name' | 'price' | 'stockQuantity' | 'createdAt' | 'updatedAt' | 'sortOrder';
  sortOrder?: 'ASC' | 'DESC';
}

@Injectable()
export class ProductVariantRepository {
  constructor(
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
    @InjectRepository(ProductVariantItem)
    private readonly variantItemRepo: Repository<ProductVariantItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async findMany(options: ProductVariantQueryOptions = {}) {
    const { page = 1, limit = 50, filters = {}, relations = [], sortBy = 'sortOrder', sortOrder = 'ASC' } = options;

    const queryBuilder = this.variantRepo.createQueryBuilder('variant');

    // Add relations
    const defaultRelations = ['product', 'variantItems', 'variantItems.attribute', 'variantItems.attributeValue'];
    const allRelations = [...new Set([...defaultRelations, ...relations])];

    allRelations.forEach(relation => {
      const relationPath = relation.split('.');
      if (relationPath.length === 1) {
        queryBuilder.leftJoinAndSelect(`variant.${relation}`, relation);
      } else {
        // Handle nested relations like 'variantItems.attribute'
        const [parent, child] = relationPath;
        queryBuilder.leftJoinAndSelect(`${parent}.${child}`, child);
      }
    });

    // Apply filters
    if (filters.productId) {
      queryBuilder.andWhere('variant.productId = :productId', {
        productId: filters.productId
      });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(variant.name ILIKE :search OR variant.sku ILIKE :search OR variant.barcode ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('variant.isActive = :isActive', {
        isActive: filters.isActive
      });
    }

    if (filters.minPrice !== undefined) {
      queryBuilder.andWhere('variant.price >= :minPrice', {
        minPrice: filters.minPrice
      });
    }

    if (filters.maxPrice !== undefined) {
      queryBuilder.andWhere('variant.price <= :maxPrice', {
        maxPrice: filters.maxPrice
      });
    }

    if (filters.hasStock) {
      queryBuilder.andWhere('variant.stockQuantity > 0');
    }

    // Apply attribute filters
    if (filters.attributeFilters && Object.keys(filters.attributeFilters).length > 0) {
      Object.entries(filters.attributeFilters).forEach(([attributeId, attributeValueId], index) => {
        const alias = `vi_${index}`;
        queryBuilder
          .innerJoin('variant.variantItems', alias)
          .andWhere(`${alias}.attributeId = :attributeId_${index}`, { [`attributeId_${index}`]: attributeId })
          .andWhere(`${alias}.attributeValueId = :attributeValueId_${index}`, { [`attributeValueId_${index}`]: attributeValueId });
      });
    }

    // Add sorting
    queryBuilder.orderBy(`variant.${sortBy}`, sortOrder);

    // Add pagination
    if (limit > 0) {
      queryBuilder.skip((page - 1) * limit).take(limit);
    }

    const [variants, total] = await queryBuilder.getManyAndCount();

    return {
      data: variants,
      total,
      page,
      limit,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 1,
    };
  }

  async findById(id: string, relations: string[] = []) {
    const defaultRelations = ['product', 'variantItems', 'variantItems.attribute', 'variantItems.attributeValue'];
    const allRelations = [...new Set([...defaultRelations, ...relations])];

    return this.variantRepo.findOne({
      where: { id },
      relations: allRelations,
    });
  }

  async findByProductId(productId: string, relations: string[] = []) {
    return this.findMany({
      filters: { productId },
      relations,
      sortBy: 'sortOrder',
      sortOrder: 'ASC',
    });
  }

  async findBySku(sku: string, relations: string[] = []) {
    const defaultRelations = ['product', 'variantItems', 'variantItems.attribute', 'variantItems.attributeValue'];
    const allRelations = [...new Set([...defaultRelations, ...relations])];

    return this.variantRepo.findOne({
      where: { sku },
      relations: allRelations,
    });
  }

  async create(data: CreateProductVariantDto) {

    // Validate that the product exists
    const product = await this.productRepo.findOne({
      where: { id: data.productId }
    });
    if (!product) {
      throw new Error(`Product with ID ${data.productId} not found`);
    }

    // Create the variant
    const { variantItems, ...variantData } = data;

    const variant = this.variantRepo.create({
      ...variantData,
    });

    const savedVariant = await this.variantRepo.save(variant);

    // Create variant items if provided
    if (variantItems && variantItems.length > 0) {
      const variantItemsToCreate = variantItems.map(item => ({
        productVariantId: savedVariant.id,
        attributeId: item.attributeId,
        attributeValueId: item.attributeValueId,
        sortOrder: item.sortOrder ?? 0,
      }));

      await this.variantItemRepo.save(variantItemsToCreate);
    }

    // Return the complete variant with items
    return this.findById(savedVariant.id);
  }

  async update(id: string, data: UpdateProductVariantDto) {
    const variant = await this.findById(id);
    if (!variant) {
      throw new Error(`Product variant with ID ${id} not found`);
    }

    // Update variant data
    const { variantItems, ...restUpdateData } = data;

    const updateData = {
      ...restUpdateData,
    };

    await this.variantRepo.update(id, updateData);

    // Update variant items if provided
    if (variantItems !== undefined) {
      // Delete existing items
      await this.variantItemRepo.delete({ productVariantId: id });

      // Create new items
      if (variantItems.length > 0) {
        const variantItemsToCreate = variantItems.map(item => ({
          productVariantId: id,
          attributeId: item.attributeId,
          attributeValueId: item.attributeValueId,
          sortOrder: item.sortOrder ?? 0,
        }));

        await this.variantItemRepo.save(variantItemsToCreate);
      }
    }

    // Return the updated variant with items
    return this.findById(id);
  }

  async delete(id: string) {
    const variant = await this.findById(id);
    if (!variant) {
      throw new Error(`Product variant with ID ${id} not found`);
    }

    // Delete variant items first (cascade should handle this, but being explicit)
    await this.variantItemRepo.delete({ productVariantId: id });

    // Delete the variant
    await this.variantRepo.delete(id);
    return { deleted: true };
  }

  async deleteByProductId(productId: string) {
    const variants = await this.variantRepo.find({
      where: { productId },
      select: ['id'],
    });

    for (const variant of variants) {
      await this.delete(variant.id);
    }

    return { deleted: true };
  }

  async getVariantWithAttributes(id: string) {
    const variant = await this.findById(id);
    if (!variant) {
      return null;
    }

    const attributesMap: Record<string, any> = {};

    if (variant.variantItems) {
      variant.variantItems.forEach(item => {
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
    }

    return {
      ...variant,
      attributesMap,
    };
  }

  async findVariantsByAttributes(productId: string, attributeFilters: Record<string, string>) {
    return this.findMany({
      filters: {
        productId,
        attributeFilters,
      },
    });
  }

  async updateStock(id: string, stockQuantity: number) {
    await this.variantRepo.update(id, { stockQuantity });
    return this.findById(id);
  }

  async getStats() {
    const total = await this.variantRepo.count();

    const stockStats = await this.variantRepo
      .createQueryBuilder('variant')
      .select([
        'COUNT(*) as total',
        'SUM(variant.stockQuantity) as totalStock',
        'AVG(variant.price) as averagePrice',
        'COUNT(CASE WHEN variant.stockQuantity > 0 THEN 1 END) as inStock',
        'COUNT(CASE WHEN variant.stockQuantity = 0 THEN 1 END) as outOfStock',
        'COUNT(CASE WHEN variant.isActive = true THEN 1 END) as active',
      ])
      .getRawOne();

    const priceRange = await this.variantRepo
      .createQueryBuilder('variant')
      .select(['MIN(variant.price) as minPrice', 'MAX(variant.price) as maxPrice'])
      .getRawOne();

    return {
      total,
      totalStock: parseInt(stockStats.totalStock) || 0,
      averagePrice: parseFloat(stockStats.averagePrice) || 0,
      inStock: parseInt(stockStats.inStock) || 0,
      outOfStock: parseInt(stockStats.outOfStock) || 0,
      active: parseInt(stockStats.active) || 0,
      minPrice: parseFloat(priceRange.minPrice) || 0,
      maxPrice: parseFloat(priceRange.maxPrice) || 0,
    };
  }
}