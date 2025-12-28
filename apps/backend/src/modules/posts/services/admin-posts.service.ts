import { Injectable } from '@nestjs/common';
import { PostRepository } from '../repositories/post.repository';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { Post, PostStatus, PostType } from '../entities/post.entity';
import { PaginatedDto } from '@shared/classes/pagination.dto';
import { CreatePostDto, UpdatePostDto } from '../dto/post.dto';

export interface AdminPostFilters {
  page: number;
  limit: number;
  search?: string;
  status?: PostStatus;
  type?: PostType;
  authorId?: string;
  categoryId?: string;
  tagId?: string;
  locale?: string;
  isFeatured?: boolean;
}

@Injectable()
export class AdminPostsService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly responseHandler: ResponseService,
  ) {}

  async getAllPosts(filters: AdminPostFilters): Promise<PaginatedDto<Post>> {
    try {
      // Use the BaseRepository's findWithPagination method
      const result = await this.postRepository.findWithPagination({
        page: filters.page,
        limit: filters.limit,
        relations: ['translations'],
      });

      return {
        items: result.data,
        total: result.meta.total,
        page: result.meta.page,
        limit: result.meta.limit,
        totalPages: result.meta.totalPages,
      };
    } catch (error) {
      console.error('AdminPostsService.getAllPosts error:', error);
      throw this.responseHandler.createError(
        500,
        'Failed to retrieve posts',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async getPostById(id: string): Promise<Post | null> {
    try {
      // Include related translations/categories/tags so the admin edit form has the full dataset
      return await this.postRepository.findByIdWithRelations(id);
    } catch (error) {
      console.error('AdminPostsService.getPostById error:', error);
      throw this.responseHandler.createError(
        500,
        'Failed to retrieve post',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async createPost(createPostDto: CreatePostDto): Promise<Post> {
    try {
      return await this.postRepository.createPost(createPostDto);
    } catch (error) {
      console.error('AdminPostsService.createPost error:', error);
      throw this.responseHandler.createError(
        500,
        'Failed to create post',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async updatePost(id: string, updatePostDto: UpdatePostDto): Promise<Post | null> {
    try {
      return await this.postRepository.updatePost(id, updatePostDto);
    } catch (error) {
      console.error('AdminPostsService.updatePost error:', error);
      throw this.responseHandler.createError(
        500,
        'Failed to update post',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async deletePost(id: string): Promise<boolean> {
    try {
      return await this.postRepository.delete(id);
    } catch (error) {
      console.error('AdminPostsService.deletePost error:', error);
      throw this.responseHandler.createError(
        500,
        'Failed to delete post',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async bulkUpdateStatus(
    ids: string[],
    status: PostStatus,
    options?: { publishedAt?: Date | null },
  ): Promise<number> {
    try {
      return await this.postRepository.bulkUpdateStatus(ids, status, options?.publishedAt);
    } catch (error) {
      console.error('AdminPostsService.bulkUpdateStatus error:', error);
      throw this.responseHandler.createError(
        500,
        'Failed to update post status',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }
}
