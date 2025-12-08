import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { SettingService } from '../services/setting.service';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { apiResponseSchema, paginatedResponseSchema } from '../../../trpc/schemas/response.schemas';
import {
  createSettingSchema,
  updateSettingSchema,
  bulkUpdateSettingsSchema,
  getSettingByKeySchema,
  getSettingsByGroupSchema
} from '../dto/setting.dto';
import { AuthenticatedContext } from '../../../trpc/context';

export const getSettingsQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  group: z.string().optional(),
});

import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';

@Router({ alias: 'admin.settings' })
@Injectable()
export class AdminSettingsRouter {
  constructor(
    @Inject(SettingService)
    private readonly settingService: SettingService,
    @Inject(ResponseService)
    private readonly responseService: ResponseService,
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async getAll(): Promise<z.infer<typeof apiResponseSchema>> {
    const settings = await this.settingService.findAll();
    return this.responseService.createReadResponse(
      15, // ModuleCode.SETTINGS
      'settings',
      settings
    );
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: getSettingsQuerySchema,
    output: paginatedResponseSchema,
  })
  async list(
    @Input() query: z.infer<typeof getSettingsQuerySchema>
  ): Promise<z.infer<typeof paginatedResponseSchema>> {
    const result = await this.settingService.findPaginated({
      page: query.page || 1,
      limit: query.limit || 20,
      search: query.search,
      group: query.group
    });
    return this.responseService.createTrpcSuccess(result);
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async getById(
    @Input() input: { id: string },
    @Ctx() ctx: AuthenticatedContext
  ): Promise<z.infer<typeof apiResponseSchema>> {
    const setting = await this.settingService.findById(input.id, ctx.locale);
    return this.responseService.createReadResponse(
      15, // ModuleCode.SETTINGS
      'settings',
      setting
    );
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: getSettingByKeySchema,
    output: apiResponseSchema,
  })
  async getByKey(
    @Input() input: z.infer<typeof getSettingByKeySchema>,
    @Ctx() ctx: AuthenticatedContext
  ): Promise<z.infer<typeof apiResponseSchema>> {
    const setting = await this.settingService.findByKey(input.key, ctx.locale);
    return this.responseService.createReadResponse(
      15, // ModuleCode.SETTINGS
      'settings',
      setting
    );
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: getSettingsByGroupSchema,
    output: apiResponseSchema,
  })
  async getByGroup(@Input() input: z.infer<typeof getSettingsByGroupSchema>): Promise<z.infer<typeof apiResponseSchema>> {
    const settings = await this.settingService.findByGroup(input.group);
    return this.responseService.createReadResponse(
      15, // ModuleCode.SETTINGS
      'settings',
      settings
    );
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: createSettingSchema,
    output: apiResponseSchema,
  })
  async create(
    @Input() input: z.infer<typeof createSettingSchema>,
    @Ctx() ctx: AuthenticatedContext
  ): Promise<z.infer<typeof apiResponseSchema>> {
    const newSetting = await this.settingService.create(input, ctx.locale);
    return this.responseService.createCreatedResponse(
      15, // ModuleCode.SETTINGS
      'settings',
      newSetting
    );
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: updateSettingSchema,
    output: apiResponseSchema,
  })
  async update(
    @Input() input: z.infer<typeof updateSettingSchema>,
    @Ctx() ctx: AuthenticatedContext
  ): Promise<z.infer<typeof apiResponseSchema>> {
    const { id, ...updateData } = input;
    const updatedSetting = await this.settingService.update(id, updateData, ctx.locale);
    return this.responseService.createUpdatedResponse(
      15, // ModuleCode.SETTINGS
      'settings',
      updatedSetting
    );
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: bulkUpdateSettingsSchema,
    output: apiResponseSchema,
  })
  async bulkUpdate(
    @Input() input: z.infer<typeof bulkUpdateSettingsSchema>,
    @Ctx() ctx: AuthenticatedContext
  ): Promise<z.infer<typeof apiResponseSchema>> {
    await this.settingService.bulkUpdate(input, ctx.locale);
    return this.responseService.createUpdatedResponse(
      15, // ModuleCode.SETTINGS
      'settings',
      { success: true }
    );
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async delete(
    @Input() input: { id: string },
    @Ctx() ctx: AuthenticatedContext
  ): Promise<z.infer<typeof apiResponseSchema>> {
    await this.settingService.delete(input.id, ctx.locale);
    return this.responseService.createDeletedResponse(
      15, // ModuleCode.SETTINGS
      'settings'
    );
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({
      id: z.string().uuid(),
      isPublic: z.boolean(),
      description: z.string().max(500).optional()
    }),
    output: apiResponseSchema,
  })
  async updateVisibility(
    @Input() input: { id: string, isPublic: boolean, description?: string },
    @Ctx() ctx: AuthenticatedContext
  ): Promise<z.infer<typeof apiResponseSchema>> {
    const updatedSetting = await this.settingService.update(input.id, {
      isPublic: input.isPublic,
      description: input.description
    }, ctx.locale);
    return this.responseService.createUpdatedResponse(
      15, // ModuleCode.SETTINGS
      'settings',
      updatedSetting
    );
  }
} 
