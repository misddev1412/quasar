import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, FindManyOptions } from 'typeorm';
import { Brand } from '../entities/brand.entity';

export interface BrandFilters {
  search?: string;
  isActive?: boolean;
}

export interface BrandQueryOptions {
  page?: number;
  limit?: number;
  filters?: BrandFilters;
  relations?: string[];
}

export interface BrandFindManyOptions {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'ASC' | 'DESC';
}

@Injectable()
export class BrandRepository {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {}

  async findAll(options: BrandQueryOptions = {}) {
    const { page = 1, limit = 20, filters = {}, relations = [] } = options;
    
    const queryBuilder = this.brandRepository.createQueryBuilder('brand');
    
    // Add relations
    relations.forEach(relation => {
      queryBuilder.leftJoinAndSelect(`brand.${relation}`, relation);
    });
    
    // Apply filters
    if (filters.search) {
      queryBuilder.andWhere(
        '(LOWER(brand.name) LIKE :search OR LOWER(brand.description) LIKE :search)',
        { search: `%${filters.search.toLowerCase()}%` }
      );
    }
    
    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('brand.is_active = :isActive', { isActive: filters.isActive });
    }
    
    // Apply ordering
    queryBuilder.orderBy('brand.name', 'ASC');
    
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

  async findMany(options: BrandFindManyOptions) {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      isActive, 
      sortBy = 'createdAt', 
      sortOrder = 'DESC' 
    } = options;
    
    const queryBuilder = this.brandRepository.createQueryBuilder('brand')
      .leftJoinAndSelect('brand.products', 'products');
    
    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        '(LOWER(brand.name) LIKE :search OR LOWER(brand.description) LIKE :search)',
        { search: `%${search.toLowerCase()}%` }
      );
    }
    
    if (isActive !== undefined) {
      queryBuilder.andWhere('brand.is_active = :isActive', { isActive });
    }
    
    // Apply ordering
    const orderByMap = {
      name: 'brand.name',
      createdAt: 'brand.createdAt',
      updatedAt: 'brand.updatedAt',
    };
    queryBuilder.orderBy(orderByMap[sortBy], sortOrder);
    
    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);
    
    const [brands, total] = await queryBuilder.getManyAndCount();
    
    return {
      items: brands.map(brand => ({
        id: brand.id || '',
        name: brand.name || '',
        description: brand.description || null,
        logo: brand.logo || null,
        website: brand.website || null,
        isActive: Boolean(brand.isActive),
        productCount: brand.productCount || 0,
        createdAt: brand.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: brand.updatedAt?.toISOString() || new Date().toISOString(),
        version: brand.version || 1,
        createdBy: brand.createdBy || null,
        updatedBy: brand.updatedBy || null,
      })),
      total: total || 0,
      page: page || 1,
      limit: limit || 10,
      totalPages: Math.ceil((total || 0) / (limit || 10)),
    };
  }

  async findById(id: string, relations: string[] = ['products']): Promise<any> {
    const brand = await this.brandRepository.findOne({
      where: { id },
      relations,
    });
    
    if (!brand) return null;
    
    return {
      id: brand.id || '',
      name: brand.name || '',
      description: brand.description || null,
      logo: brand.logo || null,
      website: brand.website || null,
      isActive: Boolean(brand.isActive),
      productCount: brand.productCount || 0,
      createdAt: brand.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: brand.updatedAt?.toISOString() || new Date().toISOString(),
      version: brand.version || 1,
      createdBy: brand.createdBy || null,
      updatedBy: brand.updatedBy || null,
    };
  }

  async findByName(name: string): Promise<Brand | null> {
    return this.brandRepository.findOne({
      where: { name },
    });
  }

  async create(brandData: Partial<Brand>): Promise<any> {
    const brand = this.brandRepository.create(brandData);
    const savedBrand = await this.brandRepository.save(brand);
    
    return {
      id: savedBrand.id || '',
      name: savedBrand.name || '',
      description: savedBrand.description || null,
      logo: savedBrand.logo || null,
      website: savedBrand.website || null,
      isActive: Boolean(savedBrand.isActive),
      productCount: 0, // New brands have no products initially
      createdAt: savedBrand.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: savedBrand.updatedAt?.toISOString() || new Date().toISOString(),
      version: savedBrand.version || 1,
      createdBy: savedBrand.createdBy || null,
      updatedBy: savedBrand.updatedBy || null,
    };
  }

  async update(id: string, brandData: Partial<Brand>): Promise<any> {
    await this.brandRepository.update(id, brandData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.brandRepository.delete(id);
    return result.affected > 0;
  }

  async getStats() {
    const queryBuilder = this.brandRepository.createQueryBuilder('brand')
      .leftJoinAndSelect('brand.products', 'products');

    const brands = await queryBuilder.getMany();
    
    const totalBrands = brands.length;
    const activeBrands = brands.filter(b => b.isActive).length;
    const inactiveBrands = totalBrands - activeBrands;
    const totalProducts = brands.reduce((sum, brand) => sum + brand.productCount, 0);

    return {
      totalBrands,
      activeBrands,
      inactiveBrands,
      totalProducts,
      averageProductsPerBrand: totalBrands > 0 ? Math.round(totalProducts / totalBrands) : 0,
      recentBrands: brands
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5)
        .map(brand => ({
          id: brand.id,
          name: brand.name,
          description: brand.description,
          logo: brand.logo,
          website: brand.website,
          isActive: brand.isActive,
          productCount: brand.productCount,
          createdAt: brand.createdAt.toISOString(),
          updatedAt: brand.updatedAt.toISOString(),
        })),
    };
  }
}