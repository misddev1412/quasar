import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, In } from 'typeorm';
import { BaseRepository } from '@shared';
import { Post, PostStatus, PostType } from '../entities/post.entity';
import { PostTranslation } from '../entities/post-translation.entity';
import { PostCategory } from '../entities/post-category.entity';
import { PostTag } from '../entities/post-tag.entity';

export interface CreatePostDto {
  status?: PostStatus;
  type?: PostType;
  featuredImage?: string;
  authorId?: string;
  publishedAt?: Date;
  scheduledAt?: Date;
  isFeatured?: boolean;
  allowComments?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  translations?: {
    locale?: string;
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
  }[];
  categoryIds?: string[];
  tagIds?: string[];
}

export interface UpdatePostDto {
  status?: PostStatus;
  type?: PostType;
  featuredImage?: string;
  publishedAt?: Date;
  scheduledAt?: Date;
  isFeatured?: boolean;
  allowComments?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  translations?: {
    locale?: string;
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
  }[];
  categoryIds?: string[];
  tagIds?: string[];
}

@Injectable()
export class PostRepository extends BaseRepository<Post> {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(PostTranslation)
    private readonly postTranslationRepository: Repository<PostTranslation>,
    @InjectRepository(PostCategory)
    private readonly postCategoryRepository: Repository<PostCategory>,
    @InjectRepository(PostTag)
    private readonly postTagRepository: Repository<PostTag>,
  ) {
    super(postRepository);
  }

  async createPost(createPostDto: CreatePostDto): Promise<Post> {
    const { translations, categoryIds, tagIds, ...postData } = createPostDto;

    // Create post
    const post = this.repository.create(postData);
    const savedPost = await this.repository.save(post);

    // Create translations
    if (translations && translations.length > 0) {
      const translationEntities = translations.map(translation =>
        this.postTranslationRepository.create({
          ...translation,
          post_id: savedPost.id,
        })
      );
      await this.postTranslationRepository.save(translationEntities);
    }

    // Associate categories
    if (categoryIds && categoryIds.length > 0) {
      const categories = await this.postCategoryRepository.findBy({ id: In(categoryIds) });
      savedPost.categories = categories;
      await this.repository.save(savedPost);
    }

    // Associate tags
    if (tagIds && tagIds.length > 0) {
      const tags = await this.postTagRepository.findBy({ id: In(tagIds) });
      savedPost.tags = tags;
      await this.repository.save(savedPost);
    }

    return this.findByIdWithRelations(savedPost.id);
  }

  async findByIdWithRelations(id: string): Promise<Post | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['author', 'translations', 'categories', 'tags'],
    });
  }

  async findBySlug(slug: string, locale?: string): Promise<Post | null> {
    const queryBuilder = this.repository.createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.categories', 'categories')
      .leftJoinAndSelect('post.tags', 'tags')
      .leftJoinAndSelect('post.translations', 'translations')
      .where('translations.slug = :slug', { slug });

    if (locale) {
      queryBuilder.andWhere('translations.locale = :locale', { locale });
    }

    return await queryBuilder.getOne();
  }

  async updatePost(id: string, updatePostDto: UpdatePostDto): Promise<Post | null> {
    const { translations, categoryIds, tagIds, ...postData } = updatePostDto;

    // Update post data
    if (Object.keys(postData).length > 0) {
      await this.repository.update(id, postData);
    }

    // Update translations
    if (translations && translations.length > 0) {
      // Remove existing translations
      await this.postTranslationRepository.delete({ post_id: id });
      
      // Create new translations
      const translationEntities = translations.map(translation =>
        this.postTranslationRepository.create({
          ...translation,
          post_id: id,
        })
      );
      await this.postTranslationRepository.save(translationEntities);
    }

    // Update categories
    if (categoryIds !== undefined) {
      const post = await this.repository.findOne({ where: { id }, relations: ['categories'] });
      if (post) {
        if (categoryIds.length > 0) {
          const categories = await this.postCategoryRepository.findBy({ id: In(categoryIds) });
          post.categories = categories;
        } else {
          post.categories = [];
        }
        await this.repository.save(post);
      }
    }

    // Update tags
    if (tagIds !== undefined) {
      const post = await this.repository.findOne({ where: { id }, relations: ['tags'] });
      if (post) {
        if (tagIds.length > 0) {
          const tags = await this.postTagRepository.findBy({ id: In(tagIds) });
          post.tags = tags;
        } else {
          post.tags = [];
        }
        await this.repository.save(post);
      }
    }

    return this.findByIdWithRelations(id);
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.repository.increment({ id }, 'view_count', 1);
  }
}