import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, FindManyOptions } from 'typeorm';
import { Supplier } from '../entities/supplier.entity';
import { SupplierTranslation } from '../entities/supplier-translation.entity';

export interface SupplierFilters {
  search?: string;
  isActive?: boolean;
  country?: string;
}

export interface SupplierQueryOptions {
  page?: number;
  limit?: number;
  filters?: SupplierFilters;
  relations?: string[];
}

export interface SupplierFindManyOptions {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  country?: string;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'country';
  sortOrder?: 'ASC' | 'DESC';
}

@Injectable()
export class SupplierRepository {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    @InjectRepository(SupplierTranslation)
    private readonly supplierTranslationRepo: Repository<SupplierTranslation>,
  ) {}

  async findAll(options: SupplierQueryOptions = {}) {
    const { page = 1, limit = 20, filters = {}, relations = [] } = options;

    const queryBuilder = this.supplierRepository.createQueryBuilder('supplier');

    // Add relations
    relations.forEach(relation => {
      queryBuilder.leftJoinAndSelect(`supplier.${relation}`, relation);
    });

    // Apply filters
    if (filters.search) {
      queryBuilder.andWhere(
        '(LOWER(supplier.name) LIKE :search OR LOWER(supplier.description) LIKE :search OR LOWER(supplier.email) LIKE :search OR LOWER(supplier.contactPerson) LIKE :search)',
        { search: `%${filters.search.toLowerCase()}%` }
      );
    }

    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('supplier.is_active = :isActive', { isActive: filters.isActive });
    }

    if (filters.country) {
      queryBuilder.andWhere('LOWER(supplier.country) LIKE :country', { country: `%${filters.country.toLowerCase()}%` });
    }

    // Apply ordering
    queryBuilder.orderBy('supplier.name', 'ASC');

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

  async findMany(options: SupplierFindManyOptions) {
    const {
      page = 1,
      limit = 10,
      search,
      isActive,
      country,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = options;

    const queryBuilder = this.supplierRepository.createQueryBuilder('supplier')
      .leftJoinAndSelect('supplier.products', 'products');

    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        '(LOWER(supplier.name) LIKE :search OR LOWER(supplier.description) LIKE :search OR LOWER(supplier.email) LIKE :search OR LOWER(supplier.contactPerson) LIKE :search)',
        { search: `%${search.toLowerCase()}%` }
      );
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('supplier.is_active = :isActive', { isActive });
    }

    if (country) {
      queryBuilder.andWhere('LOWER(supplier.country) LIKE :country', { country: `%${country.toLowerCase()}%` });
    }

    // Apply ordering
    const orderByMap = {
      name: 'supplier.name',
      createdAt: 'supplier.createdAt',
      updatedAt: 'supplier.updatedAt',
      country: 'supplier.country',
    };
    queryBuilder.orderBy(orderByMap[sortBy], sortOrder);

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [suppliers, total] = await queryBuilder.getManyAndCount();

    return {
      items: suppliers.map(supplier => ({
        id: supplier.id || '',
        name: supplier.name || '',
        description: supplier.description || null,
        logo: supplier.logo || null,
        website: supplier.website || null,
        email: supplier.email || null,
        phone: supplier.phone || null,
        address: supplier.address || null,
        city: supplier.city || null,
        country: supplier.country || null,
        postalCode: supplier.postalCode || null,
        contactPerson: supplier.contactPerson || null,
        isActive: Boolean(supplier.isActive),
        sortOrder: supplier.sortOrder || 0,
        productCount: supplier.productCount || 0,
        createdAt: supplier.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: supplier.updatedAt?.toISOString() || new Date().toISOString(),
        version: supplier.version || 1,
        createdBy: supplier.createdBy || null,
        updatedBy: supplier.updatedBy || null,
      })),
      total: total || 0,
      page: page || 1,
      limit: limit || 10,
      totalPages: Math.ceil((total || 0) / (limit || 10)),
    };
  }

  async findById(id: string, relations: string[] = ['products']): Promise<any> {
    const supplier = await this.supplierRepository.findOne({
      where: { id },
      relations,
    });

    if (!supplier) return null;

    return {
      id: supplier.id || '',
      name: supplier.name || '',
      description: supplier.description || null,
      logo: supplier.logo || null,
      website: supplier.website || null,
      email: supplier.email || null,
      phone: supplier.phone || null,
      address: supplier.address || null,
      city: supplier.city || null,
      country: supplier.country || null,
      postalCode: supplier.postalCode || null,
      contactPerson: supplier.contactPerson || null,
      isActive: Boolean(supplier.isActive),
      sortOrder: supplier.sortOrder || 0,
      productCount: supplier.productCount || 0,
      createdAt: supplier.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: supplier.updatedAt?.toISOString() || new Date().toISOString(),
      version: supplier.version || 1,
      createdBy: supplier.createdBy || null,
      updatedBy: supplier.updatedBy || null,
    };
  }

  async findByName(name: string): Promise<Supplier | null> {
    return this.supplierRepository.findOne({
      where: { name },
    });
  }

  async findByEmail(email: string): Promise<Supplier | null> {
    return this.supplierRepository.findOne({
      where: { email },
    });
  }

  async create(supplierData: Partial<Supplier>): Promise<any> {
    const supplier = this.supplierRepository.create(supplierData);
    const savedSupplier = await this.supplierRepository.save(supplier);

    return {
      id: savedSupplier.id || '',
      name: savedSupplier.name || '',
      description: savedSupplier.description || null,
      logo: savedSupplier.logo || null,
      website: savedSupplier.website || null,
      email: savedSupplier.email || null,
      phone: savedSupplier.phone || null,
      address: savedSupplier.address || null,
      city: savedSupplier.city || null,
      country: savedSupplier.country || null,
      postalCode: savedSupplier.postalCode || null,
      contactPerson: savedSupplier.contactPerson || null,
      isActive: Boolean(savedSupplier.isActive),
      sortOrder: savedSupplier.sortOrder || 0,
      productCount: 0, // New suppliers have no products initially
      createdAt: savedSupplier.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: savedSupplier.updatedAt?.toISOString() || new Date().toISOString(),
      version: savedSupplier.version || 1,
      createdBy: savedSupplier.createdBy || null,
      updatedBy: savedSupplier.updatedBy || null,
    };
  }

  async update(id: string, supplierData: Partial<Supplier>): Promise<any> {
    await this.supplierRepository.update(id, supplierData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.supplierRepository.delete(id);
    return result.affected > 0;
  }

  async getStats() {
    const queryBuilder = this.supplierRepository.createQueryBuilder('supplier')
      .leftJoinAndSelect('supplier.products', 'products');

    const suppliers = await queryBuilder.getMany();

    const totalSuppliers = suppliers.length;
    const activeSuppliers = suppliers.filter(s => s.isActive).length;
    const inactiveSuppliers = totalSuppliers - activeSuppliers;
    const totalProducts = suppliers.reduce((sum, supplier) => sum + supplier.productCount, 0);
    const countries = [...new Set(suppliers.map(s => s.country).filter(Boolean))];

    return {
      totalSuppliers,
      activeSuppliers,
      inactiveSuppliers,
      totalProducts,
      averageProductsPerSupplier: totalSuppliers > 0 ? Math.round(totalProducts / totalSuppliers) : 0,
      totalCountries: countries.length,
      recentSuppliers: suppliers
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5)
        .map(supplier => ({
          id: supplier.id,
          name: supplier.name,
          description: supplier.description,
          logo: supplier.logo,
          website: supplier.website,
          email: supplier.email,
          phone: supplier.phone,
          address: supplier.address,
          city: supplier.city,
          country: supplier.country,
          postalCode: supplier.postalCode,
          contactPerson: supplier.contactPerson,
          isActive: supplier.isActive,
          sortOrder: supplier.sortOrder,
          productCount: supplier.productCount,
          createdAt: supplier.createdAt.toISOString(),
          updatedAt: supplier.updatedAt.toISOString(),
        })),
    };
  }

  // Translation methods
  async findSupplierTranslations(supplierId: string): Promise<SupplierTranslation[]> {
    return this.supplierTranslationRepo.find({
      where: { supplier_id: supplierId },
      order: { locale: 'ASC' },
    });
  }

  async findSupplierTranslation(supplierId: string, locale: string): Promise<SupplierTranslation | null> {
    return this.supplierTranslationRepo.findOne({
      where: { supplier_id: supplierId, locale },
    });
  }

  async createSupplierTranslation(translationData: Partial<SupplierTranslation>): Promise<SupplierTranslation> {
    const translation = this.supplierTranslationRepo.create(translationData);
    return this.supplierTranslationRepo.save(translation);
  }

  async updateSupplierTranslation(
    supplierId: string,
    locale: string,
    translationData: Partial<SupplierTranslation>
  ): Promise<SupplierTranslation | null> {
    // Find the existing translation first
    const existingTranslation = await this.findSupplierTranslation(supplierId, locale);

    if (!existingTranslation) {
      return null;
    }

    // Update the translation using save() which returns the updated entity
    Object.assign(existingTranslation, translationData);
    return this.supplierTranslationRepo.save(existingTranslation);
  }

  async deleteSupplierTranslation(supplierId: string, locale: string): Promise<boolean> {
    const result = await this.supplierTranslationRepo.delete({ supplier_id: supplierId, locale });
    return result.affected > 0;
  }

  async findByIdWithTranslations(id: string, locale?: string): Promise<Supplier | null> {
    const query = this.supplierRepository.createQueryBuilder('supplier')
      .leftJoinAndSelect('supplier.translations', 'translations')
      .leftJoinAndSelect('supplier.products', 'products')
      .where('supplier.id = :id', { id });

    if (locale) {
      query.andWhere('translations.locale = :locale', { locale });
    }

    return query.getOne();
  }

  async findManyWithTranslations(options: SupplierFindManyOptions, locale?: string) {
    const {
      page = 1,
      limit = 10,
      search,
      isActive,
      country,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = options;

    const queryBuilder = this.supplierRepository.createQueryBuilder('supplier')
      .leftJoinAndSelect('supplier.translations', 'translations')
      .leftJoinAndSelect('supplier.products', 'products');

    if (locale) {
      queryBuilder.andWhere('(translations.locale = :locale OR translations.locale IS NULL)', { locale });
    }

    // Apply filters - now also search in translations
    if (search) {
      queryBuilder.andWhere(
        '(LOWER(supplier.name) LIKE :search OR LOWER(supplier.description) LIKE :search OR LOWER(supplier.email) LIKE :search OR LOWER(supplier.contactPerson) LIKE :search OR LOWER(translations.name) LIKE :search OR LOWER(translations.description) LIKE :search OR LOWER(translations.contactPerson) LIKE :search)',
        { search: `%${search.toLowerCase()}%` }
      );
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('supplier.is_active = :isActive', { isActive });
    }

    if (country) {
      queryBuilder.andWhere('(LOWER(supplier.country) LIKE :country OR LOWER(translations.country) LIKE :country)', { country: `%${country.toLowerCase()}%` });
    }

    // Apply ordering
    const orderByMap = {
      name: 'supplier.name',
      createdAt: 'supplier.createdAt',
      updatedAt: 'supplier.updatedAt',
      country: 'supplier.country',
    };
    queryBuilder.orderBy(orderByMap[sortBy], sortOrder);

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [suppliers, total] = await queryBuilder.getManyAndCount();

    return {
      items: suppliers.map(supplier => ({
        id: supplier.id || '',
        name: supplier.name || '',
        description: supplier.description || null,
        logo: supplier.logo || null,
        website: supplier.website || null,
        email: supplier.email || null,
        phone: supplier.phone || null,
        address: supplier.address || null,
        city: supplier.city || null,
        country: supplier.country || null,
        postalCode: supplier.postalCode || null,
        contactPerson: supplier.contactPerson || null,
        isActive: Boolean(supplier.isActive),
        sortOrder: supplier.sortOrder || 0,
        productCount: supplier.productCount || 0,
        translations: supplier.translations || [],
        createdAt: supplier.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: supplier.updatedAt?.toISOString() || new Date().toISOString(),
        version: supplier.version || 1,
        createdBy: supplier.createdBy || null,
        updatedBy: supplier.updatedBy || null,
      })),
      total: total || 0,
      page: page || 1,
      limit: limit || 10,
      totalPages: Math.ceil((total || 0) / (limit || 10)),
    };
  }
}