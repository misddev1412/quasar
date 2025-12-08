import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { PostCategoryRepository } from '../repositories/post-category.repository';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { ErrorLevelCode } from '@shared/enums/error-codes.enums';
import { apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { AuthenticatedContext } from '../../../trpc/context';
import {
  CreatePostCategorySchema,
  UpdatePostCategorySchema,
  IdSchema,
} from '../dto/post.dto';

@Injectable()
@Router({ alias: 'adminPostCategories' })
export class AdminPostCategoriesRouter {
  constructor(
    @Inject(PostCategoryRepository)
    private readonly categoryRepository: PostCategoryRepository,
    private readonly responseService: ResponseService,
  ) {}

  @Query({
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async getCategories() {
    try {
      const categories = await this.categoryRepository.findAllWithHierarchy();
      return this.responseService.createTrpcSuccess(categories);
    } catch (error) {
      throw this.responseService.createTRPCError(
        null, // ModuleCode
        null, // OperationCode
        ErrorLevelCode.SERVER_ERROR,
        'Failed to retrieve categories'
      );
    }
  }

  @Query({
    input: IdSchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async getCategoryById(@Input() input: z.infer<typeof IdSchema>) {
    try {
      const category = await this.categoryRepository.findById(input.id);
      if (!category) {
        throw this.responseService.createTRPCError(
          null, // ModuleCode
          null, // OperationCode
          ErrorLevelCode.NOT_FOUND,
          'Category not found'
        );
      }
      return this.responseService.createTrpcSuccess(category);
    } catch (error) {
      throw this.responseService.createTRPCError(
        null, // ModuleCode
        null, // OperationCode
        ErrorLevelCode.SERVER_ERROR,
        'Failed to retrieve category'
      );
    }
  }

  @Mutation({
    input: CreatePostCategorySchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async createCategory(@Input() input: z.infer<typeof CreatePostCategorySchema>) {
    try {
      const category = await this.categoryRepository.createCategory(input);
      return this.responseService.createTrpcSuccess(category);
    } catch (error) {
      throw this.responseService.createTRPCError(
        null, // ModuleCode
        null, // OperationCode
        ErrorLevelCode.SERVER_ERROR,
        'Failed to create category'
      );
    }
  }

  @Mutation({
    input: z.object({ id: z.string().uuid(), data: UpdatePostCategorySchema }),
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async updateCategory(@Input() input: { id: string; data: z.infer<typeof UpdatePostCategorySchema> }) {
    try {
      const category = await this.categoryRepository.updateCategory(input.id, input.data);
      if (!category) {
        throw this.responseService.createTRPCError(
          null, // ModuleCode
          null, // OperationCode
          ErrorLevelCode.NOT_FOUND,
          'Category not found'
        );
      }
      return this.responseService.createTrpcSuccess(category);
    } catch (error) {
      throw this.responseService.createTRPCError(
        null, // ModuleCode
        null, // OperationCode
        ErrorLevelCode.SERVER_ERROR,
        'Failed to update category'
      );
    }
  }

  @Mutation({
    input: IdSchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async deleteCategory(@Input() input: z.infer<typeof IdSchema>) {
    try {
      const result = await this.categoryRepository.delete(input.id);
      if (!result) {
        throw this.responseService.createTRPCError(
          null, // ModuleCode
          null, // OperationCode
          ErrorLevelCode.NOT_FOUND,
          'Category not found'
        );
      }
      return this.responseService.createTrpcSuccess(null);
    } catch (error) {
      throw this.responseService.createTRPCError(
        null, // ModuleCode
        null, // OperationCode
        ErrorLevelCode.SERVER_ERROR,
        'Failed to delete category'
      );
    }
  }
}