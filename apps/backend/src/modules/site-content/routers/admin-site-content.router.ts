import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input } from 'nestjs-trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { AdminSiteContentService } from '../services/admin-site-content.service';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import {
  listSiteContentQuerySchema,
  createSiteContentSchema,
  updateSiteContentSchema,
  siteContentIdSchema,
  bulkDeleteSiteContentSchema,
} from '../dto/site-content.dto';
import { apiResponseSchema, paginatedResponseSchema } from '../../../trpc/schemas/response.schemas';
import { ModuleCode, OperationCode, ErrorLevelCode } from '@shared/enums/error-codes.enums';

@Router({ alias: 'adminSiteContents' })
@Injectable()
export class AdminSiteContentRouter {
  constructor(
    @Inject(AdminSiteContentService)
    private readonly adminSiteContentService: AdminSiteContentService,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: listSiteContentQuerySchema,
    output: paginatedResponseSchema,
  })
  async listSiteContents(
    @Input() query: z.infer<typeof listSiteContentQuerySchema>,
  ) {
    try {
      const result = await this.adminSiteContentService.listSiteContents(query);
      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw this.responseHandler.createTRPCError(
        ModuleCode.PAGE,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        'Failed to retrieve site contents',
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: siteContentIdSchema,
    output: apiResponseSchema,
  })
  async getSiteContentById(
    @Input() input: z.infer<typeof siteContentIdSchema>,
  ) {
    try {
      const siteContent = await this.adminSiteContentService.getSiteContentById(input.id);

      if (!siteContent) {
        throw this.responseHandler.createTRPCError(
          ModuleCode.PAGE,
          OperationCode.READ,
          ErrorLevelCode.NOT_FOUND,
          'Site content not found',
        );
      }

      return this.responseHandler.createTrpcSuccess(siteContent);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw this.responseHandler.createTRPCError(
        ModuleCode.PAGE,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        'Failed to retrieve site content',
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: createSiteContentSchema,
    output: apiResponseSchema,
  })
  async createSiteContent(
    @Input() input: z.infer<typeof createSiteContentSchema>,
  ) {
    try {
      const created = await this.adminSiteContentService.createSiteContent(input);
      return this.responseHandler.createTrpcSuccess(created);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw this.responseHandler.createTRPCError(
        ModuleCode.PAGE,
        OperationCode.CREATE,
        ErrorLevelCode.SERVER_ERROR,
        'Failed to create site content',
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({
      id: z.string().uuid(),
      data: updateSiteContentSchema,
    }),
    output: apiResponseSchema,
  })
  async updateSiteContent(
    @Input() input: { id: string; data: z.infer<typeof updateSiteContentSchema> },
  ) {
    try {
      const updated = await this.adminSiteContentService.updateSiteContent(input.id, input.data);
      if (!updated) {
        throw this.responseHandler.createTRPCError(
          ModuleCode.PAGE,
          OperationCode.UPDATE,
          ErrorLevelCode.NOT_FOUND,
          'Site content not found',
        );
      }

      return this.responseHandler.createTrpcSuccess(updated);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw this.responseHandler.createTRPCError(
        ModuleCode.PAGE,
        OperationCode.UPDATE,
        ErrorLevelCode.SERVER_ERROR,
        'Failed to update site content',
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: siteContentIdSchema,
    output: apiResponseSchema,
  })
  async deleteSiteContent(
    @Input() input: z.infer<typeof siteContentIdSchema>,
  ) {
    try {
      const deleted = await this.adminSiteContentService.deleteSiteContent(input.id);
      return this.responseHandler.createTrpcSuccess({ deleted });
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw this.responseHandler.createTRPCError(
        ModuleCode.PAGE,
        OperationCode.DELETE,
        ErrorLevelCode.SERVER_ERROR,
        'Failed to delete site content',
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: bulkDeleteSiteContentSchema,
    output: apiResponseSchema,
  })
  async bulkDeleteSiteContents(
    @Input() input: z.infer<typeof bulkDeleteSiteContentSchema>,
  ) {
    try {
      const deletedCount = await this.adminSiteContentService.bulkDeleteSiteContents(input.ids);
      return this.responseHandler.createTrpcSuccess({ deletedCount });
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw this.responseHandler.createTRPCError(
        ModuleCode.PAGE,
        OperationCode.DELETE,
        ErrorLevelCode.SERVER_ERROR,
        'Failed to delete site contents',
      );
    }
  }
}
