import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, In } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { BaseRepository } from '@shared';
import { Post, PostStatus, PostType } from '@backend/modules/posts/entities/post.entity';
import { PostTranslation } from '@backend/modules/posts/entities/post-translation.entity';
import { PostCategory } from '@backend/modules/posts/entities/post-category.entity';
import { PostTag } from '@backend/modules/posts/entities/post-tag.entity';
import { Media } from '@backend/modules/storage/entities/media.entity';
import { MediaService } from '@backend/modules/storage/services/media.service';

export interface CreatePostDto {
  status?: PostStatus;
  type?: PostType;
  featuredImage?: string;
  bannerImage?: string;
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
  bannerImage?: string;
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
    private readonly mediaService: MediaService,
  ) {
    super(postRepository);
  }

  async createPost(createPostDto: CreatePostDto): Promise<Post> {
    const { translations, categoryIds, tagIds, ...dtoData } = createPostDto;

    // Map DTO properties to entity properties (camelCase to snake_case)
    const postData = {
      status: dtoData.status,
      type: dtoData.type,
      featured_image: dtoData.featuredImage,
      banner_image: dtoData.bannerImage,
      author_id: dtoData.authorId,
      published_at: dtoData.publishedAt,
      scheduled_at: dtoData.scheduledAt,
      is_featured: dtoData.isFeatured,
      allow_comments: dtoData.allowComments,
      meta_title: dtoData.metaTitle,
      meta_description: dtoData.metaDescription,
      meta_keywords: dtoData.metaKeywords,
    };

    // Remove undefined values
    Object.keys(postData).forEach(key => postData[key] === undefined && delete postData[key]);

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

    // Sync media relations
    if (dtoData.featuredImage) {
      await this.mediaService.syncMediaRelations(savedPost.id, 'post', 'featured_image', dtoData.featuredImage);
    }
    if (dtoData.bannerImage) {
      await this.mediaService.syncMediaRelations(savedPost.id, 'post', 'banner_image', dtoData.bannerImage);
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
    const { translations, categoryIds, tagIds, ...dtoData } = updatePostDto;

    // Map DTO properties to entity properties (camelCase to snake_case)
    const postData = {
      status: dtoData.status,
      type: dtoData.type,
      featured_image: dtoData.featuredImage,
      banner_image: dtoData.bannerImage,
      published_at: dtoData.publishedAt,
      scheduled_at: dtoData.scheduledAt,
      is_featured: dtoData.isFeatured,
      allow_comments: dtoData.allowComments,
      meta_title: dtoData.metaTitle,
      meta_description: dtoData.metaDescription,
      meta_keywords: dtoData.metaKeywords,
    };

    // Remove undefined values
    Object.keys(postData).forEach(key => postData[key] === undefined && delete postData[key]);

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



    // Sync media relations if images are updated
    if (dtoData.featuredImage !== undefined) {
      await this.mediaService.syncMediaRelations(id, 'post', 'featured_image', dtoData.featuredImage);
    }
    if (dtoData.bannerImage !== undefined) {
      await this.mediaService.syncMediaRelations(id, 'post', 'banner_image', dtoData.bannerImage);
    }

    return this.findByIdWithRelations(id);
  }

  async bulkUpdateStatus(
    ids: string[],
    status: PostStatus,
    publishedAt?: Date | null,
  ): Promise<number> {
    if (!ids.length) {
      return 0;
    }

    const payload: QueryDeepPartialEntity<Post> = {
      status,
    };

    if (status === PostStatus.PUBLISHED) {
      payload.published_at = publishedAt ?? new Date();
    } else if (publishedAt !== undefined) {
      payload.published_at = publishedAt;
    }

    const result = await this.repository.createQueryBuilder()
      .update(Post)
      .set(payload)
      .whereInIds(ids)
      .execute();

    return result.affected ?? 0;
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.repository.increment({ id }, 'view_count', 1);
  }



  async migratePostMedia(): Promise<number> {
    const posts = await this.repository.find();
    let count = 0;

    for (const post of posts) {
      if (post.featured_image) {
        await this.mediaService.syncMediaRelations(post.id, 'post', 'featured_image', post.featured_image);
        count++;
      }
      if (post.banner_image) {
        await this.mediaService.syncMediaRelations(post.id, 'post', 'banner_image', post.banner_image);
        count++;
      }
    }

    return count;
  }
}
