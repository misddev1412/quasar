import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '@shared';
import { PostCategory } from '../entities/post-category.entity';

export interface CreatePostCategoryDto {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdatePostCategoryDto {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
}

@Injectable()
export class PostCategoryRepository extends BaseRepository<PostCategory> {
  constructor(
    @InjectRepository(PostCategory)
    private readonly postCategoryRepository: Repository<PostCategory>,
  ) {
    super(postCategoryRepository);
  }

  async findAllWithHierarchy(): Promise<PostCategory[]> {
    return await this.repository.find({
      relations: ['parent', 'children'],
      order: { sort_order: 'ASC', name: 'ASC' },
    });
  }

  async findBySlug(slug: string): Promise<PostCategory | null> {
    return await this.repository.findOne({
      where: { slug },
      relations: ['parent', 'children'],
    });
  }

  async findRootCategories(): Promise<PostCategory[]> {
    return await this.repository.find({
      where: { parent_id: null },
      relations: ['children'],
      order: { sort_order: 'ASC', name: 'ASC' },
    });
  }

  async findByParentId(parentId: string): Promise<PostCategory[]> {
    return await this.repository.find({
      where: { parent_id: parentId },
      order: { sort_order: 'ASC', name: 'ASC' },
    });
  }

  async createCategory(createDto: CreatePostCategoryDto): Promise<PostCategory> {
    const category = this.repository.create(createDto);
    return await this.repository.save(category);
  }

  async updateCategory(id: string, updateDto: UpdatePostCategoryDto): Promise<PostCategory | null> {
    await this.repository.update(id, updateDto);
    return await this.findById(id);
  }

  async findActiveCategories(): Promise<PostCategory[]> {
    return await this.repository.find({
      where: { is_active: true },
      relations: ['parent', 'children'],
      order: { sort_order: 'ASC', name: 'ASC' },
    });
  }

  async getCategoryWithPostCount(id: string): Promise<PostCategory & { postCount: number } | null> {
    const category = await this.repository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.posts', 'posts')
      .where('category.id = :id', { id })
      .getOne();

    if (!category) {
      return null;
    }

    (category as any).postCount = category.posts?.length || 0;
    return category as PostCategory & { postCount: number };
  }
}
