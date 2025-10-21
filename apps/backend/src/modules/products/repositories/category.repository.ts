import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CategoryTranslation } from '../entities/category-translation.entity';
import slugify from 'slugify';

export interface CategoryFilters {
  search?: string;
  isActive?: boolean;
  parentId?: string;
}

export interface CategoryQueryOptions {
  page?: number;
  limit?: number;
  filters?: CategoryFilters;
  relations?: string[];
}

export interface CategoryFindManyOptions {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  parentId?: string;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'sortOrder' | 'level';
  sortOrder?: 'ASC' | 'DESC';
}

export interface CategoryTreeNode {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  level: number;
  createdAt: Date;
  updatedAt: Date;
  productCount?: number;
  children?: CategoryTreeNode[];
}

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(CategoryTranslation)
    private readonly categoryTranslationRepo: Repository<CategoryTranslation>,
  ) {}

  async findAll(options: CategoryQueryOptions = {}) {
    const { page = 1, limit = 20, filters = {}, relations = [] } = options;
    
    const queryBuilder = this.categoryRepository.createQueryBuilder('category');
    
    // Add relations
    relations.forEach(relation => {
      queryBuilder.leftJoinAndSelect(`category.${relation}`, relation);
    });
    
    // Apply filters
    if (filters.search) {
      queryBuilder.andWhere(
        '(LOWER(category.name) LIKE :search OR LOWER(category.description) LIKE :search)',
        { search: `%${filters.search.toLowerCase()}%` }
      );
    }
    
    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('category.is_active = :isActive', { isActive: filters.isActive });
    }

    if (filters.parentId !== undefined) {
      if (filters.parentId === null) {
        queryBuilder.andWhere('category.parent_id IS NULL');
      } else {
        queryBuilder.andWhere('category.parent_id = :parentId', { parentId: filters.parentId });
      }
    }
    
    // Apply ordering
    queryBuilder.orderBy('category.sortOrder', 'ASC')
                 .addOrderBy('category.name', 'ASC');
    
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

  async findMany(options: CategoryFindManyOptions) {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      isActive, 
      parentId,
      sortBy = 'sortOrder', 
      sortOrder = 'ASC' 
    } = options;
    
    const queryBuilder = this.categoryRepository.createQueryBuilder('category')
      .leftJoin('category.translations', 'translations');

    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        '(LOWER(category.name) LIKE :search OR LOWER(category.description) LIKE :search OR LOWER(translations.name) LIKE :search)',
        { search: `%${search.toLowerCase()}%` }
      );
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('category.is_active = :isActive', { isActive });
    }

    if (parentId !== undefined) {
      if (parentId === null) {
        queryBuilder.andWhere('category.parent_id IS NULL');
      } else {
        queryBuilder.andWhere('category.parent_id = :parentId', { parentId });
      }
    }

    // Apply ordering
    const orderByMap = {
      name: 'COALESCE(translations.name, category.name)',
      createdAt: 'category.createdAt',
      updatedAt: 'category.updatedAt',
      sortOrder: 'category.sortOrder',
      level: 'category.level',
    };
    queryBuilder.orderBy(orderByMap[sortBy], sortOrder);
    
    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);
    
    const [categories, total] = await queryBuilder.getManyAndCount();
    
    return {
      items: categories,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string, relations: string[] = []): Promise<Category | null> {
    return this.categoryRepository.findOne({
      where: { id },
      relations,
    });
  }

  async findByName(name: string): Promise<Category | null> {
    return this.categoryRepository.findOne({
      where: { name },
    });
  }

  // Note: slug is now handled in translations, use findBySlugWithTranslation instead
  async findBySlug(slug: string): Promise<Category | null> {
    // This method is deprecated - slug is now in translations
    // Use findBySlugWithTranslation instead
    return null;
  }

  async findBySlugWithTranslation(slug: string, locale?: string): Promise<Category | null> {
    const queryBuilder = this.categoryRepository.createQueryBuilder('category')
      .leftJoinAndSelect('category.translations', 'translations')
      .where('translations.slug = :slug', { slug });

    if (locale) {
      queryBuilder.andWhere('translations.locale = :locale', { locale });
    }

    return queryBuilder.getOne();
  }

  private generateSlug(text: string, maxLength: number = 100): string {
    if (!text || typeof text !== 'string') {
      return '';
    }

    // Configure Vietnamese and other character replacements
    const vietnameseMap = {
      'đ': 'd', 'Đ': 'D',
      'ă': 'a', 'Ă': 'A',
      'â': 'a', 'Â': 'A',
      'ê': 'e', 'Ê': 'E',
      'ô': 'o', 'Ô': 'O',
      'ơ': 'o', 'Ơ': 'O',
      'ư': 'u', 'Ư': 'U',
      'ý': 'y', 'Ý': 'Y',
    };

    // Use slugify with Unicode support and Vietnamese character handling
    let slug = slugify(text, {
      lower: true,
      strict: false,
      trim: true,
      replacement: '-',
      remove: /[*+~()'"]/g,
      locale: 'vi',
    });

    // Apply manual Vietnamese character replacements for edge cases
    Object.keys(vietnameseMap).forEach(char => {
      const regex = new RegExp(char, 'g');
      slug = slug.replace(regex, vietnameseMap[char]);
    });

    // Additional processing: convert remaining punctuation to hyphens
    slug = slug
      .replace(/[,;.:!?@#$%^&<>{}[\]\\|`=]/g, '-')
      .replace(/-{2,}/g, '-')
      .replace(/^-+|-+$/g, '');

    // Limit length and clean up
    return slug
      .substring(0, maxLength)
      .replace(/-+$/, '');
  }

  private async generateUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
    if (!baseSlug) {
      return '';
    }

    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const queryBuilder = this.categoryRepository.createQueryBuilder('category')
        .where('category.slug = :slug', { slug });

      if (excludeId) {
        queryBuilder.andWhere('category.id != :excludeId', { excludeId });
      }

      const existingCategory = await queryBuilder.getOne();
      
      if (!existingCategory) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  // Helper method to calculate category level based on parent hierarchy
  private async calculateCategoryLevel(parentId?: string): Promise<number> {
    if (!parentId) {
      return 0; // Root level
    }
    
    const parent = await this.findById(parentId);
    if (!parent) {
      return 0; // If parent not found, treat as root
    }
    
    return parent.level + 1;
  }

  // Helper method to update levels of all descendant categories
  private async updateDescendantLevels(categoryId: string): Promise<void> {
    const children = await this.categoryRepository.find({
      where: { parentId: categoryId }
    });

    for (const child of children) {
      const newLevel = await this.calculateCategoryLevel(child.parentId);
      if (child.level !== newLevel) {
        await this.categoryRepository.update(child.id, { level: newLevel });
        // Recursively update grandchildren and beyond
        await this.updateDescendantLevels(child.id);
      }
    }
  }

  // Helper method to recalculate all category levels (useful for data integrity)
  async recalculateAllLevels(): Promise<void> {
    // Get all categories ordered by level to ensure parents are processed before children
    const categories = await this.categoryRepository.find({
      order: { level: 'ASC' }
    });

    for (const category of categories) {
      const correctLevel = await this.calculateCategoryLevel(category.parentId);
      if (category.level !== correctLevel) {
        await this.categoryRepository.update(category.id, { level: correctLevel });
      }
    }
  }

  async create(categoryData: Partial<Category>): Promise<Category> {
    // Calculate and set the level based on parent hierarchy
    categoryData.level = await this.calculateCategoryLevel(categoryData.parentId);

    const category = this.categoryRepository.create(categoryData);
    return this.categoryRepository.save(category);
  }

  async update(id: string, categoryData: Partial<Category>): Promise<Category | null> {
    // Get the existing category to check if parent changed
    const existingCategory = await this.findById(id);
    if (!existingCategory) {
      return null;
    }

    // Check if parent has changed and recalculate level if needed
    const parentChanged = 'parentId' in categoryData && categoryData.parentId !== existingCategory.parentId;
    if (parentChanged) {
      categoryData.level = await this.calculateCategoryLevel(categoryData.parentId);
    }

    await this.categoryRepository.update(id, categoryData);
    
    // If parent changed, update levels of all descendants
    if (parentChanged) {
      await this.updateDescendantLevels(id);
    }

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.categoryRepository.delete(id);
    return result.affected > 0;
  }

  async getCategoryTree(includeInactive = false): Promise<CategoryTreeNode[]> {
    return this.getTree(includeInactive);
  }

  async getFilteredCategoryTree(filters: CategoryFilters, includeInactive = false): Promise<CategoryTreeNode[]> {
    return this.getFilteredTree(filters, includeInactive);
  }

  async getTree(includeInactive = false): Promise<CategoryTreeNode[]> {
    const queryBuilder = this.categoryRepository.createQueryBuilder('category')
      .leftJoinAndSelect('category.productCategories', 'productCategories')
      .leftJoinAndSelect('productCategories.product', 'products');

    if (!includeInactive) {
      queryBuilder.andWhere('category.is_active = :isActive', { isActive: true });
    }

    queryBuilder.orderBy('category.sortOrder', 'ASC')
                 .addOrderBy('category.name', 'ASC');

    const categories = await queryBuilder.getMany();
    
    // Build the tree structure
    const categoryMap = new Map<string, CategoryTreeNode>();
    const rootCategories: CategoryTreeNode[] = [];

    // First pass: create map of all categories
    categories.forEach(category => {
      const node: CategoryTreeNode = {
        id: category.id,
        name: category.name,
        description: category.description,
        parentId: category.parentId,
        image: category.image,
        isActive: category.isActive,
        sortOrder: category.sortOrder,
        level: category.level,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        productCount: category.productCount,
        children: []
      };
      categoryMap.set(category.id, node);
    });

    // Second pass: build the tree
    categories.forEach(category => {
      const node = categoryMap.get(category.id);
      if (!node) return;

      if (category.parentId && categoryMap.has(category.parentId)) {
        const parent = categoryMap.get(category.parentId);
        if (parent && parent.children) {
          parent.children.push(node);
        }
      } else {
        rootCategories.push(node);
      }
    });

    return rootCategories;
  }

  async getFilteredTree(filters: CategoryFilters, includeInactive = false): Promise<CategoryTreeNode[]> {
    const queryBuilder = this.categoryRepository.createQueryBuilder('category')
      .leftJoinAndSelect('category.productCategories', 'productCategories')
      .leftJoinAndSelect('productCategories.product', 'products');

    if (!includeInactive) {
      queryBuilder.andWhere('category.is_active = :isActive', { isActive: true });
    }

    // Apply filters
    if (filters.search) {
      queryBuilder.andWhere(
        '(LOWER(category.name) LIKE :search OR LOWER(category.description) LIKE :search)',
        { search: `%${filters.search.toLowerCase()}%` }
      );
    }
    
    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('category.is_active = :filterActive', { filterActive: filters.isActive });
    }

    if (filters.parentId !== undefined) {
      if (filters.parentId === null) {
        queryBuilder.andWhere('category.parent_id IS NULL');
      } else {
        queryBuilder.andWhere('category.parent_id = :parentId', { parentId: filters.parentId });
      }
    }

    queryBuilder.orderBy('category.sortOrder', 'ASC')
                 .addOrderBy('category.name', 'ASC');

    const categories = await queryBuilder.getMany();
    
    // If search is applied, we need to include parent categories for context
    let allRelevantCategories = [...categories];
    if (filters.search) {
      const parentIds = new Set<string>();
      
      // Collect all parent IDs from filtered categories
      const collectParentIds = (categoryId: string) => {
        categories.forEach(cat => {
          if (cat.id === categoryId && cat.parentId && !parentIds.has(cat.parentId)) {
            parentIds.add(cat.parentId);
            collectParentIds(cat.parentId);
          }
        });
      };
      
      categories.forEach(cat => {
        if (cat.parentId) {
          collectParentIds(cat.parentId);
        }
      });
      
      // Fetch parent categories if needed
      if (parentIds.size > 0) {
        const parentCategories = await this.categoryRepository
          .createQueryBuilder('category')
          .leftJoinAndSelect('category.productCategories', 'productCategories')
          .leftJoinAndSelect('productCategories.product', 'products')
          .whereInIds(Array.from(parentIds))
          .getMany();
        
        // Add parents that aren't already included
        parentCategories.forEach(parent => {
          if (!allRelevantCategories.find(c => c.id === parent.id)) {
            allRelevantCategories.push(parent);
          }
        });
      }
    }
    
    // Build the tree structure
    const categoryMap = new Map<string, CategoryTreeNode>();
    const rootCategories: CategoryTreeNode[] = [];

    // First pass: create map of all categories
    allRelevantCategories.forEach(category => {
      const node: CategoryTreeNode = {
        id: category.id,
        name: category.name,
        description: category.description,
        parentId: category.parentId,
        image: category.image,
        isActive: category.isActive,
        sortOrder: category.sortOrder,
        level: category.level,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        productCount: category.productCount,
        children: []
      };
      categoryMap.set(category.id, node);
    });

    // Second pass: build the tree
    allRelevantCategories.forEach(category => {
      const node = categoryMap.get(category.id);
      if (!node) return;

      if (category.parentId && categoryMap.has(category.parentId)) {
        const parent = categoryMap.get(category.parentId);
        if (parent && parent.children) {
          parent.children.push(node);
        }
      } else {
        rootCategories.push(node);
      }
    });

    return rootCategories;
  }

  async getRootCategories(includeInactive = false): Promise<Category[]> {
    // First, get the root categories
    const queryBuilder = this.categoryRepository.createQueryBuilder('category')
      .leftJoinAndSelect('category.productCategories', 'productCategories')
      .leftJoinAndSelect('productCategories.product', 'products')
      .andWhere('category.parent_id IS NULL');

    if (!includeInactive) {
      queryBuilder.andWhere('category.is_active = :isActive', { isActive: true });
    }

    queryBuilder.orderBy('category.sortOrder', 'ASC')
                 .addOrderBy('category.name', 'ASC');

    const rootCategories = await queryBuilder.getMany();
    
    // Then, for each root category, check if it has children
    const categoriesWithChildrenInfo = await Promise.all(
      rootCategories.map(async (category) => {
        const childrenCount = await this.categoryRepository.count({
          where: { 
            parentId: category.id,
            ...(includeInactive ? {} : { isActive: true })
          }
        });
        
        return {
          ...category,
          hasChildren: childrenCount > 0,
        } as Category & { hasChildren: boolean };
      })
    );
    
    return categoriesWithChildrenInfo;
  }

  async getChildren(parentId: string, includeInactive = false): Promise<Category[]> {
    // First, get the child categories
    const queryBuilder = this.categoryRepository.createQueryBuilder('category')
      .leftJoinAndSelect('category.productCategories', 'productCategories')
      .leftJoinAndSelect('productCategories.product', 'products')
      .andWhere('category.parent_id = :parentId', { parentId });

    if (!includeInactive) {
      queryBuilder.andWhere('category.is_active = :isActive', { isActive: true });
    }

    queryBuilder.orderBy('category.sortOrder', 'ASC')
                 .addOrderBy('category.name', 'ASC');

    const childCategories = await queryBuilder.getMany();
    
    // Then, for each child category, check if it has children
    const categoriesWithChildrenInfo = await Promise.all(
      childCategories.map(async (category) => {
        const childrenCount = await this.categoryRepository.count({
          where: { 
            parentId: category.id,
            ...(includeInactive ? {} : { isActive: true })
          }
        });
        
        return {
          ...category,
          hasChildren: childrenCount > 0,
        } as Category & { hasChildren: boolean };
      })
    );
    
    return categoriesWithChildrenInfo;
  }

  async getStats() {
    const queryBuilder = this.categoryRepository.createQueryBuilder('category')
      .leftJoinAndSelect('category.productCategories', 'productCategories')
      .leftJoinAndSelect('productCategories.product', 'products');

    const categories = await queryBuilder.getMany();
    
    const totalCategories = categories.length;
    const activeCategories = categories.filter(c => c.isActive).length;
    const inactiveCategories = totalCategories - activeCategories;
    const rootCategories = categories.filter(c => !c.parentId).length;
    const totalProducts = categories.reduce((sum, category) => sum + category.productCount, 0);

    return {
      totalCategories,
      activeCategories,
      inactiveCategories,
      rootCategories,
      totalProducts,
      averageProductsPerCategory: totalCategories > 0 ? Math.round(totalProducts / totalCategories) : 0,
      recentCategories: categories
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5),
    };
  }

  // Translation methods
  async findCategoryTranslations(categoryId: string): Promise<CategoryTranslation[]> {
    return this.categoryTranslationRepo.find({
      where: { category_id: categoryId },
      order: { locale: 'ASC' },
    });
  }

  async findCategoryTranslation(categoryId: string, locale: string): Promise<CategoryTranslation | null> {
    return this.categoryTranslationRepo.findOne({
      where: { category_id: categoryId, locale },
    });
  }

  async createCategoryTranslation(translationData: Partial<CategoryTranslation>): Promise<CategoryTranslation> {
    const translation = this.categoryTranslationRepo.create(translationData);
    return this.categoryTranslationRepo.save(translation);
  }

  async updateCategoryTranslation(
    categoryId: string, 
    locale: string, 
    translationData: Partial<CategoryTranslation>
  ): Promise<CategoryTranslation | null> {
    const existingTranslation = await this.findCategoryTranslation(categoryId, locale);
    
    if (!existingTranslation) {
      return null;
    }
    
    Object.assign(existingTranslation, translationData);
    return this.categoryTranslationRepo.save(existingTranslation);
  }

  async deleteCategoryTranslation(categoryId: string, locale: string): Promise<boolean> {
    const result = await this.categoryTranslationRepo.delete({ category_id: categoryId, locale });
    return result.affected > 0;
  }

  async findByIdWithTranslations(id: string, locale?: string): Promise<Category | null> {
    const query = this.categoryRepository.createQueryBuilder('category')
      .leftJoinAndSelect('category.translations', 'translations')
      .leftJoinAndSelect('category.productCategories', 'productCategories')
      .leftJoinAndSelect('productCategories.product', 'products')
      .leftJoinAndSelect('category.children', 'children')
      .leftJoinAndSelect('category.parent', 'parent')
      .where('category.id = :id', { id });

    if (locale) {
      query.andWhere('translations.locale = :locale', { locale });
    }

    return query.getOne();
  }

  async findManyWithTranslations(options: CategoryFindManyOptions, locale?: string) {
    const {
      page = 1,
      limit = 10,
      search,
      isActive,
      parentId,
      sortBy = 'sortOrder',
      sortOrder = 'ASC'
    } = options;

    const queryBuilder = this.categoryRepository.createQueryBuilder('category')
      .leftJoinAndSelect('category.translations', 'translations')
      .leftJoinAndSelect('category.productCategories', 'productCategories')
      .leftJoinAndSelect('productCategories.product', 'products');
    
    if (locale) {
      queryBuilder.andWhere('(translations.locale = :locale OR translations.locale IS NULL)', { locale });
    }
    
    // Apply filters - now also search in translations
    if (search) {
      queryBuilder.andWhere(
        '(LOWER(category.name) LIKE :search OR LOWER(category.description) LIKE :search OR LOWER(translations.name) LIKE :search OR LOWER(translations.description) LIKE :search)',
        { search: `%${search.toLowerCase()}%` }
      );
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('category.is_active = :isActive', { isActive });
    }

    if (parentId !== undefined) {
      if (parentId === null) {
        queryBuilder.andWhere('category.parent_id IS NULL');
      } else {
        queryBuilder.andWhere('category.parent_id = :parentId', { parentId });
      }
    }

    // Apply ordering
    const orderByMap = {
      name: 'COALESCE(translations.name, category.name)',
      createdAt: 'category.createdAt',
      updatedAt: 'category.updatedAt',
      sortOrder: 'category.sortOrder',
      level: 'category.level',
    };
    queryBuilder.orderBy(orderByMap[sortBy], sortOrder);
    
    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);
    
    const [categories, total] = await queryBuilder.getManyAndCount();
    
    return {
      items: categories.map(category => ({
        id: category.id || '',
        name: category.name || '',
        description: category.description || null,
        parentId: category.parentId || null,
        image: category.image || null,
        isActive: Boolean(category.isActive),
        sortOrder: category.sortOrder || 0,
        level: category.level || 0,
        productCount: category.productCount || 0,
        translations: category.translations || [],
        createdAt: category.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: category.updatedAt?.toISOString() || new Date().toISOString(),
        version: category.version || 1,
        createdBy: category.createdBy || null,
        updatedBy: category.updatedBy || null,
      })),
      total: total || 0,
      page: page || 1,
      limit: limit || 10,
      totalPages: Math.ceil((total || 0) / (limit || 10)),
    };
  }

  async getTreeWithTranslations(locale?: string, includeInactive = false): Promise<CategoryTreeNode[]> {
    const queryBuilder = this.categoryRepository.createQueryBuilder('category')
      .leftJoinAndSelect('category.translations', 'translations')
      .leftJoinAndSelect('category.productCategories', 'productCategories')
      .leftJoinAndSelect('productCategories.product', 'products');

    if (locale) {
      queryBuilder.andWhere('(translations.locale = :locale OR translations.locale IS NULL)', { locale });
    }

    if (!includeInactive) {
      queryBuilder.andWhere('category.is_active = :isActive', { isActive: true });
    }

    queryBuilder.orderBy('category.sortOrder', 'ASC')
                 .addOrderBy('category.name', 'ASC');

    const categories = await queryBuilder.getMany();
    
    // Build the tree structure
    const categoryMap = new Map<string, CategoryTreeNode>();
    const rootCategories: CategoryTreeNode[] = [];

    // First pass: create map of all categories
    categories.forEach(category => {
      const localeTranslation = category.translations?.find(t => t.locale === locale);
      const node: CategoryTreeNode = {
        id: category.id,
        name: localeTranslation?.name || category.name,
        description: localeTranslation?.description || category.description,
        parentId: category.parentId,
        image: category.image,
        isActive: category.isActive,
        sortOrder: category.sortOrder,
        level: category.level,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        productCount: category.productCount,
        children: []
      };
      categoryMap.set(category.id, node);
    });

    // Second pass: build the tree
    categories.forEach(category => {
      const node = categoryMap.get(category.id);
      if (!node) return;

      if (category.parentId && categoryMap.has(category.parentId)) {
        const parent = categoryMap.get(category.parentId);
        if (parent && parent.children) {
          parent.children.push(node);
        }
      } else {
        rootCategories.push(node);
      }
    });

    return rootCategories;
  }
}
