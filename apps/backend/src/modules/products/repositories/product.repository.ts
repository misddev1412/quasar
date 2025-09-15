import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, FindManyOptions } from 'typeorm';
import { Product, ProductStatus } from '../entities/product.entity';

export interface ProductFilters {
  search?: string;
  brandId?: string;
  categoryId?: string;
  status?: ProductStatus;
  isActive?: boolean;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  hasStock?: boolean;
  createdFrom?: string;
  createdTo?: string;
}

export interface ProductQueryOptions {
  page?: number;
  limit?: number;
  filters?: ProductFilters;
  relations?: string[];
}

export interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll(options: ProductQueryOptions = {}): Promise<PaginatedProducts> {

    const { page = 1, limit = 20, filters = {}, relations = [] } = options;

    try {
      // Create basic query builder
      const queryBuilder = this.productRepository.createQueryBuilder('product');


      // Add relations if requested with support for nested relations
      if (relations.length > 0) {
        const addedJoins = new Set<string>(); // Track added joins to avoid duplicates

        relations.forEach(relation => {
          // Handle nested relations like 'variants.variantItems.attribute'
          const relationParts = relation.split('.');

          if (relationParts.length === 1) {
            // Simple relation: product.variants
            const joinKey = `product.${relation}`;
            if (!addedJoins.has(joinKey)) {
              queryBuilder.leftJoinAndSelect(joinKey, relation);
              addedJoins.add(joinKey);
            }
          } else {
            // Nested relation: variants.variantItems or variants.variantItems.attribute
            let currentAlias = 'product';

            relationParts.forEach((part, index) => {
              if (index === 0) {
                // First level: product.variants
                const joinKey = `${currentAlias}.${part}`;
                if (!addedJoins.has(joinKey)) {
                  queryBuilder.leftJoinAndSelect(joinKey, part);
                  addedJoins.add(joinKey);
                }
                currentAlias = part;
              } else {
                // Nested levels: variants.variantItems, variantItems.attribute
                const parentAlias = currentAlias;
                const relationAlias = relationParts.slice(0, index + 1).join('_');
                const joinKey = `${parentAlias}.${part}`;

                if (!addedJoins.has(joinKey)) {
                  queryBuilder.leftJoinAndSelect(joinKey, relationAlias);
                  addedJoins.add(joinKey);
                }
                currentAlias = relationAlias;
              }
            });
          }
        });
      }

      // Apply pagination and ordering
      const skip = (page - 1) * limit;
      queryBuilder
        .skip(skip)
        .take(limit)
        .orderBy('product.id', 'DESC'); // Use simplest ordering

      // Get count without relations for performance
      const countQueryBuilder = this.productRepository.createQueryBuilder('product');
      const total = await countQueryBuilder.getCount();

      const items = await queryBuilder.getMany();

      const totalPages = Math.ceil(total / limit);

      const result = {
        items,
        total,
        page,
        limit,
        totalPages,
      };

      // Return paginated result
      return result;

    } catch (error) {
      throw error;
    }
  }

  async findById(id: string, relations: string[] = []): Promise<Product | null> {
    console.log('🔍 DEBUG REPO - Finding product by ID:', id);
    console.log('🔍 DEBUG REPO - Relations requested:', relations);

    if (relations.length === 0) {
      // No relations requested, use simple findOne
      return this.productRepository.findOne({ where: { id } });
    }

    // Use QueryBuilder for proper relation loading when lazy: true is set
    const queryBuilder = this.productRepository.createQueryBuilder('product');
    queryBuilder.where('product.id = :id', { id });

    // Add relations using leftJoinAndSelect with support for nested relations
    const addedJoins = new Set<string>(); // Track added joins to avoid duplicates

    relations.forEach(relation => {
      console.log('🔍 DEBUG REPO - Adding relation:', relation);

      // Handle nested relations like 'variants.variantItems.attribute'
      const relationParts = relation.split('.');

      if (relationParts.length === 1) {
        // Simple relation: product.variants
        const joinKey = `product.${relation}`;
        if (!addedJoins.has(joinKey)) {
          queryBuilder.leftJoinAndSelect(joinKey, relation);
          addedJoins.add(joinKey);
          console.log('🔍 DEBUG REPO - Added simple join:', joinKey, 'as', relation);
        }
      } else {
        // Nested relation: variants.variantItems or variants.variantItems.attribute
        let currentAlias = 'product';

        relationParts.forEach((part, index) => {
          if (index === 0) {
            // First level: product.variants
            const joinKey = `${currentAlias}.${part}`;
            if (!addedJoins.has(joinKey)) {
              queryBuilder.leftJoinAndSelect(joinKey, part);
              addedJoins.add(joinKey);
              console.log('🔍 DEBUG REPO - Added nested join level 0:', joinKey, 'as', part);
            }
            currentAlias = part;
          } else {
            // Nested levels: variants.variantItems, variantItems.attribute
            const parentAlias = currentAlias;
            const relationAlias = relationParts.slice(0, index + 1).join('_');
            const joinKey = `${parentAlias}.${part}`;

            if (!addedJoins.has(joinKey)) {
              queryBuilder.leftJoinAndSelect(joinKey, relationAlias);
              addedJoins.add(joinKey);
              console.log('🔍 DEBUG REPO - Added nested join level', index, ':', joinKey, 'as', relationAlias);
            }
            currentAlias = relationAlias;
          }
        });
      }
    });

    console.log('🔍 DEBUG REPO - Final SQL:', queryBuilder.getSql());
    const result = await queryBuilder.getOne();

    console.log('🔍 DEBUG REPO - Result:', result ? 'Found' : 'Not found');
    if (result) {
      console.log('🔍 DEBUG REPO - Result media:', (result as any).media);
      console.log('🔍 DEBUG REPO - Result media type:', typeof (result as any).media);
    }

    return result;
  }

  async findBySku(sku: string): Promise<Product | null> {
    return this.productRepository.findOne({
      where: { sku },
    });
  }

  async create(productData: Partial<Product>): Promise<Product> {
    const product = this.productRepository.create(productData);
    return this.productRepository.save(product);
  }

  async update(id: string, productData: Partial<Product>): Promise<Product | null> {
    await this.productRepository.update(id, productData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.productRepository.delete(id);
    return result.affected > 0;
  }

  async getStats() {
    // For stats, we need to eagerly load relations
    const queryBuilder = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.category', 'category');

    const products = await queryBuilder.getMany();
    
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.status === ProductStatus.ACTIVE).length;
    const draftProducts = products.filter(p => p.status === ProductStatus.DRAFT).length;
    const inactiveProducts = products.filter(p => p.status === ProductStatus.INACTIVE).length;
    const discontinuedProducts = products.filter(p => p.status === ProductStatus.DISCONTINUED).length;
    const featuredProducts = products.filter(p => p.isFeatured).length;
    
    // Calculate total stock value using eagerly loaded variants
    const totalStockValue = products.reduce((sum, product) => {
      const variants = (product as any).variants || [];
      const variantValue = variants.reduce((vSum: number, variant: any) => 
        vSum + (variant.price * variant.stockQuantity), 0);
      return sum + variantValue;
    }, 0);
    
    const totalViews = 0; // Would need to implement view tracking
    
    // Categories breakdown using eagerly loaded category
    const categoryStats = products.reduce((acc, product) => {
      const category = (product as any).category?.name || 'Uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Brand breakdown using eagerly loaded brand
    const brandStats = products.reduce((acc, product) => {
      const brand = (product as any).brand?.name || 'No Brand';
      acc[brand] = (acc[brand] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalProducts,
      activeProducts,
      draftProducts,
      inactiveProducts,
      discontinuedProducts,
      featuredProducts,
      totalStockValue: Math.round(totalStockValue),
      averagePrice: totalProducts > 0 ? Math.round(totalStockValue / totalProducts) : 0,
      totalViews,
      categoryStats,
      brandStats,
      recentProducts: products
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5),
      topViewedProducts: products
        .slice(0, 5), // Would sort by view count when implemented
    };
  }

  async findProductsWithFilters(filters: ProductFilters & { page: number; limit: number }): Promise<PaginatedProducts> {
    return this.findAll({
      page: filters.page,
      limit: filters.limit,
      filters: {
        search: filters.search,
        brandId: filters.brandId,
        categoryId: filters.categoryId,
        status: filters.status,
        isActive: filters.isActive,
        isFeatured: filters.isFeatured,
      },
      relations: ['brand', 'category', 'variants', 'tags'],
    });
  }

  async findByIds(productIds: string[]): Promise<Product[]> {
    if (productIds.length === 0) return [];
    
    return await this.productRepository.findBy({
      id: productIds as any
    });
  }
}