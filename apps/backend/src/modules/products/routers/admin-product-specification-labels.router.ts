import { Injectable, Inject } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { paginatedResponseSchema, apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import {
  ProductSpecificationLabelRepository,
  SearchSpecificationLabelsParams,
  CreateSpecificationLabelDto,
} from '../repositories/product-specification-label.repository';

export const searchSpecificationLabelsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  groupName: z.string().optional(),
  includeInactive: z.boolean().optional(),
});

export const createSpecificationLabelSchema = z.object({
  label: z.string().min(1),
  groupName: z.string().min(1).optional(),
  groupCode: z.string().optional(),
  description: z.string().optional(),
  sortOrder: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

@Router({ alias: 'adminProductSpecificationLabels' })
@Injectable()
export class AdminProductSpecificationLabelsRouter {
  constructor(
    @Inject(ProductSpecificationLabelRepository)
    private readonly labelRepository: ProductSpecificationLabelRepository,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: searchSpecificationLabelsSchema,
    output: paginatedResponseSchema,
  })
  async search(
    @Input() input: z.infer<typeof searchSpecificationLabelsSchema>,
  ): Promise<z.infer<typeof paginatedResponseSchema>> {
    try {
      const result = await this.labelRepository.search(input as SearchSpecificationLabelsParams);
      return this.responseHandler.createTrpcResponse(200, 'OK', result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to search specification labels',
        error,
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: createSpecificationLabelSchema,
    output: apiResponseSchema,
  })
  async create(
    @Input() input: z.infer<typeof createSpecificationLabelSchema>,
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const created = await this.labelRepository.create(input as CreateSpecificationLabelDto);
      return this.responseHandler.createTrpcSuccess(created);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        1,  // OperationCode.CREATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to create specification label',
        error,
      );
    }
  }
}
