import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, FindManyOptions } from 'typeorm';
import { Brand } from '../entities/brand.entity';
import { BrandTranslation } from '../entities/brand-translation.entity';

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

export interface PublicBrandQueryOptions {
  limit?: number;
  strategy?: 'newest' | 'alphabetical' | 'custom';
  brandIds?: string[];
  locale?: string | null;
}

@Injectable()
export class BrandRepository {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(BrandTranslation)
    private readonly brandTranslationRepo: Repository<BrandTranslation>,
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

  async findPublicBrands(options: PublicBrandQueryOptions = {}) {
    const {
      limit = 12,
      strategy = 'newest',
      brandIds,
      locale,
    } = options;

    const queryBuilder = this.brandRepository.createQueryBuilder('brand')
      .distinct(true)
      .leftJoinAndSelect('brand.translations', 'translations')
      .loadRelationCountAndMap('brand._productCount', 'brand.products')
      .where('brand.is_active = :isActive', { isActive: true });

    const normalizedBrandIds = Array.isArray(brandIds) ? brandIds.filter(Boolean) : [];
    const useCustomOrder = strategy === 'custom' && normalizedBrandIds.length > 0;

    if (useCustomOrder) {
      queryBuilder.andWhere('brand.id IN (:...brandIds)', { brandIds: normalizedBrandIds });
    }

    if (!useCustomOrder) {
      if (strategy === 'alphabetical') {
        queryBuilder.orderBy('LOWER(COALESCE(translations.name, brand.name))', 'ASC');
      } else {
        queryBuilder.orderBy('brand.createdAt', 'DESC');
      }
      queryBuilder.take(limit);
    }

    const brands = await queryBuilder.getMany();
    const items = (useCustomOrder ? this.sortBrandsByIds(brands, normalizedBrandIds) : brands).slice(0, limit);
    const normalizedLocale = this.normalizeLocale(locale);

    return items.map((brand: Brand & { _productCount?: number }) => {
      const translation = this.resolveTranslation(brand.translations ?? [], normalizedLocale);
      return {
        id: brand.id || '',
        name: translation?.name || brand.name || '',
        description: translation?.description || brand.description || null,
        logo: brand.logo || null,
        website: brand.website || null,
        productCount: typeof brand._productCount === 'number' ? brand._productCount : brand.productCount || 0,
      };
    });
  }

  private sortBrandsByIds(brands: Brand[], ids: string[]) {
    const orderMap = ids.reduce<Map<string, number>>((map, id, index) => {
      map.set(id, index);
      return map;
    }, new Map());
    return [...brands].sort((a, b) => {
      const orderA = orderMap.get(a.id) ?? Number.MAX_SAFE_INTEGER;
      const orderB = orderMap.get(b.id) ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
  }

  private normalizeLocale(locale?: string | null): string | null {
    if (!locale || typeof locale !== 'string') {
      return null;
    }
    const trimmed = locale.trim().toLowerCase();
    if (!trimmed) {
      return null;
    }
    const [base] = trimmed.split(/[-_]/);
    return base || trimmed;
  }

  private resolveTranslation(translations: BrandTranslation[], locale?: string | null) {
    if (!translations || translations.length === 0) {
      return null;
    }
    const normalizedLocale = this.normalizeLocale(locale);
    const match = normalizedLocale
      ? translations.find((translation) => this.normalizeLocale(translation.locale) === normalizedLocale)
      : null;
    return match || translations[0] || null;
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

  // Translation methods
  async findBrandTranslations(brandId: string): Promise<BrandTranslation[]> {
    return this.brandTranslationRepo.find({
      where: { brand_id: brandId },
      order: { locale: 'ASC' },
    });
  }

  async findBrandTranslation(brandId: string, locale: string): Promise<BrandTranslation | null> {
    return this.brandTranslationRepo.findOne({
      where: { brand_id: brandId, locale },
    });
  }

  async createBrandTranslation(translationData: Partial<BrandTranslation>): Promise<BrandTranslation> {
    const translation = this.brandTranslationRepo.create(translationData);
    return this.brandTranslationRepo.save(translation);
  }

  async updateBrandTranslation(
    brandId: string, 
    locale: string, 
    translationData: Partial<BrandTranslation>
  ): Promise<BrandTranslation | null> {
    // Find the existing translation first
    const existingTranslation = await this.findBrandTranslation(brandId, locale);
    
    if (!existingTranslation) {
      return null;
    }
    
    // Update the translation using save() which returns the updated entity
    Object.assign(existingTranslation, translationData);
    return this.brandTranslationRepo.save(existingTranslation);
  }

  async deleteBrandTranslation(brandId: string, locale: string): Promise<boolean> {
    const result = await this.brandTranslationRepo.delete({ brand_id: brandId, locale });
    return result.affected > 0;
  }

  async findByIdWithTranslations(id: string, locale?: string): Promise<Brand | null> {
    const query = this.brandRepository.createQueryBuilder('brand')
      .leftJoinAndSelect('brand.translations', 'translations')
      .leftJoinAndSelect('brand.products', 'products')
      .where('brand.id = :id', { id });

    if (locale) {
      query.andWhere('translations.locale = :locale', { locale });
    }

    return query.getOne();
  }

  async findManyWithTranslations(options: BrandFindManyOptions, locale?: string) {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      isActive, 
      sortBy = 'createdAt', 
      sortOrder = 'DESC' 
    } = options;
    
    const queryBuilder = this.brandRepository.createQueryBuilder('brand')
      .leftJoinAndSelect('brand.translations', 'translations')
      .leftJoinAndSelect('brand.products', 'products');
    
    if (locale) {
      queryBuilder.andWhere('(translations.locale = :locale OR translations.locale IS NULL)', { locale });
    }
    
    // Apply filters - now also search in translations
    if (search) {
      queryBuilder.andWhere(
        '(LOWER(brand.name) LIKE :search OR LOWER(brand.description) LIKE :search OR LOWER(translations.name) LIKE :search OR LOWER(translations.description) LIKE :search)',
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
        translations: brand.translations || [],
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
}
