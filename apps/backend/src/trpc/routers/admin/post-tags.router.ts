import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { PostTagRepository } from '../../../modules/posts/repositories/post-tag.repository';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AuthMiddleware } from '../../middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../middlewares/admin-role.middleware';
import { ErrorLevelCode } from '@shared/enums/error-codes.enums';
import { apiResponseSchema } from '../../schemas/response.schemas';
import { AuthenticatedContext } from '../../context';
import {
  CreatePostTagSchema,
  UpdatePostTagSchema,
  IdSchema,
} from '../../../modules/posts/dto/post.dto';

@Injectable()
@Router({ alias: 'adminPostTags' })
export class AdminPostTagsRouter {
  constructor(
    @Inject(PostTagRepository)
    private readonly tagRepository: PostTagRepository,
    private readonly responseService: ResponseService,
  ) {}

  @Query({
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async getTags() {
    try {
      const tags = await this.tagRepository.findActiveTags();
      return this.responseService.createTrpcSuccess(tags);
    } catch (error) {
      throw this.responseService.createTRPCError(
        null, // ModuleCode
        null, // OperationCode
        ErrorLevelCode.SERVER_ERROR,
        'Failed to retrieve tags'
      );
    }
  }

  @Query({
    input: z.object({ query: z.string().min(1), limit: z.number().int().min(1).max(50).default(10) }),
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async searchTags(@Input() input: { query: string; limit: number }) {
    try {
      const tags = await this.tagRepository.searchTags(input.query, input.limit);
      return this.responseService.createTrpcSuccess(tags);
    } catch (error) {
      throw this.responseService.createTRPCError(
        null, // ModuleCode
        null, // OperationCode
        ErrorLevelCode.SERVER_ERROR,
        'Failed to search tags'
      );
    }
  }

  @Query({
    input: IdSchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async getTagById(@Input() input: z.infer<typeof IdSchema>) {
    try {
      const tag = await this.tagRepository.findById(input.id);
      if (!tag) {
        throw this.responseService.createTRPCError(
          null, // ModuleCode
          null, // OperationCode
          ErrorLevelCode.NOT_FOUND,
          'Tag not found'
        );
      }
      return this.responseService.createTrpcSuccess(tag);
    } catch (error) {
      throw this.responseService.createTRPCError(
        null, // ModuleCode
        null, // OperationCode
        ErrorLevelCode.SERVER_ERROR,
        'Failed to retrieve tag'
      );
    }
  }

  @Mutation({
    input: CreatePostTagSchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async createTag(@Input() input: z.infer<typeof CreatePostTagSchema>) {
    try {
      const tag = await this.tagRepository.createTag(input);
      return this.responseService.createTrpcSuccess(tag);
    } catch (error) {
      throw this.responseService.createTRPCError(
        null, // ModuleCode
        null, // OperationCode
        ErrorLevelCode.SERVER_ERROR,
        'Failed to create tag'
      );
    }
  }

  @Mutation({
    input: z.object({ id: z.string().uuid(), data: UpdatePostTagSchema }),
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async updateTag(@Input() input: { id: string; data: z.infer<typeof UpdatePostTagSchema> }) {
    try {
      const tag = await this.tagRepository.updateTag(input.id, input.data);
      if (!tag) {
        throw this.responseService.createTRPCError(
          null, // ModuleCode
          null, // OperationCode
          ErrorLevelCode.NOT_FOUND,
          'Tag not found'
        );
      }
      return this.responseService.createTrpcSuccess(tag);
    } catch (error) {
      throw this.responseService.createTRPCError(
        null, // ModuleCode
        null, // OperationCode
        ErrorLevelCode.SERVER_ERROR,
        'Failed to update tag'
      );
    }
  }

  @Mutation({
    input: IdSchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async deleteTag(@Input() input: z.infer<typeof IdSchema>) {
    try {
      const result = await this.tagRepository.delete(input.id);
      if (!result) {
        throw this.responseService.createTRPCError(
          null, // ModuleCode
          null, // OperationCode
          ErrorLevelCode.NOT_FOUND,
          'Tag not found'
        );
      }
      return this.responseService.createTrpcSuccess(null);
    } catch (error) {
      throw this.responseService.createTRPCError(
        null, // ModuleCode
        null, // OperationCode
        ErrorLevelCode.SERVER_ERROR,
        'Failed to delete tag'
      );
    }
  }

  @Query({
    input: z.object({ limit: z.number().int().min(1).max(50).default(10) }),
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async getPopularTags(@Input() input: { limit: number }) {
    try {
      const tags = await this.tagRepository.findPopularTags(input.limit);
      return this.responseService.createTrpcSuccess(tags);
    } catch (error) {
      throw this.responseService.createTRPCError(
        null, // ModuleCode
        null, // OperationCode
        ErrorLevelCode.SERVER_ERROR,
        'Failed to retrieve popular tags'
      );
    }
  }
}