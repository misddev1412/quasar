import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { SectionsService } from '@backend/modules/sections/services/sections.service';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { apiResponseSchema } from '@backend/trpc/schemas/response.schemas';
import { AuthMiddleware } from '@backend/trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '@backend/trpc/middlewares/admin-role.middleware';
import {
  createSectionSchema,
  updateSectionSchema,
  reorderSectionsSchema,
  adminListSectionsSchema,
} from '@backend/modules/sections/dto/section.dto';
import type { CreateSectionDto, UpdateSectionDto, ReorderSectionsDto } from '@backend/modules/sections/dto/section.dto';
import { ModuleCode, OperationCode, ErrorLevelCode } from '@shared/enums/error-codes.enums';
import { AuthenticatedContext } from '@backend/trpc/context';

const listInputSchema = z.object({
  page: z.string().min(1),
  locale: z.string().min(2).max(10),
});

const updateInputSchema = z.object({
  id: z.string().uuid(),
  data: updateSectionSchema,
});

const deleteInputSchema = z.object({
  id: z.string().uuid(),
});

@Router({ alias: 'sections' })
@Injectable()
export class SectionsRouter {
  constructor(
    @Inject(SectionsService)
    private readonly sectionsService: SectionsService,
    @Inject(ResponseService)
    private readonly responseService: ResponseService,
  ) { }

  @Query({
    input: listInputSchema,
    output: apiResponseSchema,
  })
  async list(@Input() input: z.infer<typeof listInputSchema>) {
    try {
      const sections = await this.sectionsService.list(input.page, input.locale);
      return this.responseService.createReadResponse(ModuleCode.CONFIG, 'sections', sections);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.CONFIG,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Failed to load sections',
        error,
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: adminListSectionsSchema,
    output: apiResponseSchema,
  })
  async listAll(@Input() input: z.infer<typeof adminListSectionsSchema>) {
    try {
      const sections = await this.sectionsService.adminList(input);
      return this.responseService.createReadResponse(ModuleCode.CONFIG, 'sections', sections);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.CONFIG,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Failed to load sections for admin',
        error,
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: adminListSectionsSchema,
    output: apiResponseSchema,
  })
  async stats(@Input() input: z.infer<typeof adminListSectionsSchema>) {
    try {
      const statistics = await this.sectionsService.adminStats(input);
      return this.responseService.createReadResponse(ModuleCode.CONFIG, 'sections_statistics', statistics);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.CONFIG,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Failed to load sections statistics for admin',
        error,
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: createSectionSchema,
    output: apiResponseSchema,
  })
  async create(
    @Input() input: CreateSectionDto,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      const section = await this.sectionsService.create(input, ctx.user?.id);
      return this.responseService.createCreatedResponse(ModuleCode.CONFIG, 'section', section);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.CONFIG,
        OperationCode.CREATE,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Failed to create section',
        error,
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: updateInputSchema,
    output: apiResponseSchema,
  })
  async update(
    @Input() input: z.infer<typeof updateInputSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      const section = await this.sectionsService.update(input.id, input.data, ctx.user?.id);
      return this.responseService.createUpdatedResponse(ModuleCode.CONFIG, 'section', section);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.CONFIG,
        OperationCode.UPDATE,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Failed to update section',
        error,
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: deleteInputSchema,
    output: apiResponseSchema,
  })
  async delete(
    @Input() input: z.infer<typeof deleteInputSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      await this.sectionsService.delete(input.id, ctx.user?.id);
      return this.responseService.createDeletedResponse(ModuleCode.CONFIG, 'section');
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.CONFIG,
        OperationCode.DELETE,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Failed to delete section',
        error,
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: reorderSectionsSchema,
    output: apiResponseSchema,
  })
  async reorder(
    @Input() input: ReorderSectionsDto,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      await this.sectionsService.reorder(input, ctx.user?.id);
      return this.responseService.createSuccessResponse(
        ModuleCode.CONFIG,
        OperationCode.UPDATE,
        null,
        'Sections reordered successfully',
        { success: true },
      );
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.CONFIG,
        OperationCode.UPDATE,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Failed to reorder sections',
        error,
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async clone(
    @Input() input: { id: string },
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      const section = await this.sectionsService.clone(input.id, ctx.user?.id);
      return this.responseService.createCreatedResponse(ModuleCode.CONFIG, 'section', section);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.CONFIG,
        OperationCode.CREATE,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Failed to clone section',
        error,
      );
    }
  }
}
