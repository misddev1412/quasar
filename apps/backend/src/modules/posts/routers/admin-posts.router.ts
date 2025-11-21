import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { AdminPostsService } from '../services/admin-posts.service';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { PostStatus, PostType } from '../entities/post.entity';
import { apiResponseSchema, paginatedResponseSchema } from '../../../trpc/schemas/response.schemas';
import { AuthenticatedContext } from '../../../trpc/context';
import {
  CreatePostSchema,
  UpdatePostSchema,
  CreatePostDto,
  UpdatePostDto,
} from '../dto/post.dto';

// Zod schemas for validation
const postStatusSchema = z.enum([
  PostStatus.DRAFT,
  PostStatus.PUBLISHED,
  PostStatus.ARCHIVED,
  PostStatus.SCHEDULED,
]);

const postTypeSchema = z.enum([
  PostType.POST,
  PostType.PAGE,
  PostType.NEWS,
  PostType.EVENT,
]);

const getAllPostsQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: postStatusSchema.optional(),
  type: postTypeSchema.optional(),
  authorId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  tagId: z.string().uuid().optional(),
  locale: z.string().min(2).max(5).optional(),
  isFeatured: z.boolean().optional(),
});

const getPostByIdSchema = z.object({
  id: z.string().uuid(),
});

const createAdminPostSchema = CreatePostSchema.omit({ authorId: true });

const updateAdminPostSchema = z.object({
  id: z.string().uuid(),
  data: UpdatePostSchema,
});

@Router({ alias: 'adminPosts' })
@Injectable()
export class AdminPostsRouter {
  constructor(
    @Inject(AdminPostsService)
    private readonly adminPostsService: AdminPostsService,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: getAllPostsQuerySchema,
    output: paginatedResponseSchema,
  })
  async getPosts(
    @Input() query: z.infer<typeof getAllPostsQuerySchema>
  ): Promise<z.infer<typeof paginatedResponseSchema>> {
    try {
      const filters = {
        page: query.page || 1,
        limit: query.limit || 10,
        search: query.search,
        status: query.status,
        type: query.type,
        authorId: query.authorId,
        categoryId: query.categoryId,
        tagId: query.tagId,
        locale: query.locale,
        isFeatured: query.isFeatured,
      };

      const result = await this.adminPostsService.getAllPosts(filters);
      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        31, // ModuleCode.ARTICLE
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve posts'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: getPostByIdSchema,
    output: apiResponseSchema,
  })
  async getPostById(
    @Input() input: z.infer<typeof getPostByIdSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const post = await this.adminPostsService.getPostById(input.id);
      
      if (!post) {
        throw this.responseHandler.createTRPCError(
          31, // ModuleCode.ARTICLE
          2,  // OperationCode.READ
          20, // ErrorLevelCode.NOT_FOUND
          'Post not found'
        );
      }

      return this.responseHandler.createTrpcSuccess(post);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        31, // ModuleCode.ARTICLE
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve post'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: createAdminPostSchema,
    output: apiResponseSchema,
  })
  async createPost(
    @Input() input: z.infer<typeof createAdminPostSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      if (!ctx.user?.id) {
        throw this.responseHandler.createTRPCError(
          31,
          1,
          30,
          'User context is missing',
        );
      }

      const payload: CreatePostDto = {
        ...input,
        authorId: ctx.user.id,
      };

      const post = await this.adminPostsService.createPost(payload);
      return this.responseHandler.createTrpcSuccess(post);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        31, // ModuleCode.ARTICLE
        1,  // OperationCode.CREATE
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to create post'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: updateAdminPostSchema,
    output: apiResponseSchema,
  })
  async updatePost(
    @Input() input: z.infer<typeof updateAdminPostSchema>,
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const updatedPost = await this.adminPostsService.updatePost(
        input.id,
        input.data as UpdatePostDto,
      );

      if (!updatedPost) {
        throw this.responseHandler.createTRPCError(
          31, // ModuleCode.ARTICLE
          3,  // OperationCode.UPDATE
          20, // ErrorLevelCode.NOT_FOUND
          'Post not found'
        );
      }

      return this.responseHandler.createTrpcSuccess(updatedPost);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        31, // ModuleCode.ARTICLE
        3,  // OperationCode.UPDATE
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to update post'
      );
    }
  }
}
