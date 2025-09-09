import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
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
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'sortOrder';
  sortOrder?: 'ASC' | 'DESC';
}

export interface CategoryTreeNode {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
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
    queryBuilder.orderBy('category.sort_order', 'ASC')
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
    
    const queryBuilder = this.categoryRepository.createQueryBuilder('category');
    
    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        '(LOWER(category.name) LIKE :search OR LOWER(category.description) LIKE :search)',
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
      name: 'category.name',
      createdAt: 'category.createdAt',
      updatedAt: 'category.updatedAt',
      sortOrder: 'category.sort_order',
    };
    queryBuilder.orderBy(orderByMap[sortBy], sortOrder);
    
    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);
    
    const [categories, total] = await queryBuilder.getManyAndCount();
    
    return {
      categories,
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

  async findBySlug(slug: string): Promise<Category | null> {
    return this.categoryRepository.findOne({
      where: { slug },
    });
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

  async create(categoryData: Partial<Category>): Promise<Category> {
    // Handle slug generation
    if (!categoryData.slug && categoryData.name) {
      const baseSlug = this.generateSlug(categoryData.name);
      categoryData.slug = await this.generateUniqueSlug(baseSlug);
    } else if (categoryData.slug) {
      // Clean the provided slug and ensure it's unique
      const cleanedSlug = this.generateSlug(categoryData.slug);
      categoryData.slug = await this.generateUniqueSlug(cleanedSlug);
    }

    const category = this.categoryRepository.create(categoryData);
    return this.categoryRepository.save(category);
  }

  async update(id: string, categoryData: Partial<Category>): Promise<Category | null> {
    // Handle slug generation/update
    if (categoryData.name && !categoryData.slug) {
      const baseSlug = this.generateSlug(categoryData.name);
      categoryData.slug = await this.generateUniqueSlug(baseSlug, id);
    } else if (categoryData.slug) {
      // Clean the provided slug and ensure it's unique
      const cleanedSlug = this.generateSlug(categoryData.slug);
      categoryData.slug = await this.generateUniqueSlug(cleanedSlug, id);
    }

    await this.categoryRepository.update(id, categoryData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.categoryRepository.delete(id);
    return result.affected > 0;
  }

  async getCategoryTree(includeInactive = false): Promise<CategoryTreeNode[]> {
    return this.getTree(includeInactive);
  }

  async getTree(includeInactive = false): Promise<CategoryTreeNode[]> {
    const queryBuilder = this.categoryRepository.createQueryBuilder('category')
      .leftJoinAndSelect('category.products', 'products');

    if (!includeInactive) {
      queryBuilder.andWhere('category.is_active = :isActive', { isActive: true });
    }

    queryBuilder.orderBy('category.sort_order', 'ASC')
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
        slug: category.slug,
        description: category.description,
        parentId: category.parentId,
        image: category.image,
        isActive: category.isActive,
        sortOrder: category.sortOrder,
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

  async getRootCategories(includeInactive = false): Promise<Category[]> {
    // First, get the root categories
    const queryBuilder = this.categoryRepository.createQueryBuilder('category')
      .leftJoinAndSelect('category.products', 'products')
      .andWhere('category.parent_id IS NULL');

    if (!includeInactive) {
      queryBuilder.andWhere('category.is_active = :isActive', { isActive: true });
    }

    queryBuilder.orderBy('category.sort_order', 'ASC')
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
      .leftJoinAndSelect('category.products', 'products')
      .andWhere('category.parent_id = :parentId', { parentId });

    if (!includeInactive) {
      queryBuilder.andWhere('category.is_active = :isActive', { isActive: true });
    }

    queryBuilder.orderBy('category.sort_order', 'ASC')
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
      .leftJoinAndSelect('category.products', 'products');

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
}