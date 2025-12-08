import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '@shared';
import { PostTag } from '../entities/post-tag.entity';

export interface CreatePostTagDto {
  name?: string;
  slug?: string;
  description?: string;
  color?: string;
  isActive?: boolean;
  is_active?: boolean;
}

export interface UpdatePostTagDto {
  name?: string;
  slug?: string;
  description?: string;
  color?: string;
  isActive?: boolean;
  is_active?: boolean;
}

@Injectable()
export class PostTagRepository extends BaseRepository<PostTag> {
  constructor(
    @InjectRepository(PostTag)
    private readonly postTagRepository: Repository<PostTag>,
  ) {
    super(postTagRepository);
  }

  async findBySlug(slug: string): Promise<PostTag | null> {
    return await this.repository.findOne({
      where: { slug },
    });
  }

  async findByName(name: string): Promise<PostTag | null> {
    return await this.repository.findOne({
      where: { name },
    });
  }

  async createTag(createDto: CreatePostTagDto): Promise<PostTag> {
    // Map frontend field names to backend entity field names
    const mappedCreateDto = {
      ...createDto,
      is_active: createDto.is_active ?? createDto.isActive, // Use is_active if provided, otherwise map from isActive
      isActive: undefined, // Remove isActive from the create object
    };

    const tag = this.repository.create(mappedCreateDto);
    return await this.repository.save(tag);
  }

  async updateTag(id: string, updateDto: UpdatePostTagDto): Promise<PostTag | null> {
    // Map frontend field names to backend entity field names
    const mappedUpdateDto = {
      ...updateDto,
      is_active: updateDto.is_active ?? updateDto.isActive, // Use is_active if provided, otherwise map from isActive
      isActive: undefined, // Remove isActive from the update object
    };

    await this.repository.update(id, mappedUpdateDto);
    return await this.findById(id);
  }

  async findActiveTags(): Promise<PostTag[]> {
    return await this.repository.find({
      where: { is_active: true },
      order: { name: 'ASC' },
    });
  }

  async findPopularTags(limit: number = 10): Promise<PostTag[]> {
    return await this.repository
      .createQueryBuilder('tag')
      .leftJoin('tag.posts', 'posts')
      .addSelect('COUNT(posts.id)', 'postCount')
      .where('tag.is_active = :isActive', { isActive: true })
      .groupBy('tag.id')
      .orderBy('postCount', 'DESC')
      .limit(limit)
      .getMany();
  }

  async getTagWithPostCount(id: string): Promise<PostTag & { postCount: number } | null> {
    const tag = await this.repository
      .createQueryBuilder('tag')
      .leftJoinAndSelect('tag.posts', 'posts')
      .where('tag.id = :id', { id })
      .getOne();

    if (!tag) {
      return null;
    }

    (tag as any).postCount = tag.posts?.length || 0;
    return tag as PostTag & { postCount: number };
  }

  async searchTags(query: string, limit: number = 10): Promise<PostTag[]> {
    return await this.repository
      .createQueryBuilder('tag')
      .where('LOWER(tag.name) LIKE LOWER(:query)', { query: `%${query}%` })
      .andWhere('tag.is_active = :isActive', { isActive: true })
      .orderBy('tag.name', 'ASC')
      .limit(limit)
      .getMany();
  }
}
