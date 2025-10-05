import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { SectionsService } from '../../modules/sections/services/sections.service';
import { ResponseService } from '../../modules/shared/services/response.service';
import { apiResponseSchema } from '../schemas/response.schemas';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../middlewares/admin-role.middleware';
import {
  createSectionSchema,
  updateSectionSchema,
  reorderSectionsSchema,
} from '../../modules/sections/dto/section.dto';
import type { CreateSectionDto, UpdateSectionDto, ReorderSectionsDto } from '../../modules/sections/dto/section.dto';
import { ModuleCode, OperationCode, ErrorLevelCode } from '@shared/enums/error-codes.enums';
import { AuthenticatedContext } from '../context';

const listInputSchema = z.object({
  page: z.string().min(1),
  locale: z.string().min(2).max(10),
});

const adminListInputSchema = z.object({
  page: z.string().min(1),
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
  ) {}

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
    input: adminListInputSchema,
    output: apiResponseSchema,
  })
  async listAll(@Input() input: z.infer<typeof adminListInputSchema>) {
    try {
      const sections = await this.sectionsService.adminList(input.page);
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
}
