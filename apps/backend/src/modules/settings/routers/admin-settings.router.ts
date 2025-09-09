import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { SettingService } from '../services/setting.service';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { 
  createSettingSchema, 
  updateSettingSchema,
  bulkUpdateSettingsSchema,
  getSettingByKeySchema,
  getSettingsByGroupSchema
} from '../dto/setting.dto';
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
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async getById(@Input() input: { id: string }): Promise<z.infer<typeof apiResponseSchema>> {
    const setting = await this.settingService.findById(input.id);
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
  async getByKey(@Input() input: z.infer<typeof getSettingByKeySchema>): Promise<z.infer<typeof apiResponseSchema>> {
    const setting = await this.settingService.findByKey(input.key);
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
  async create(@Input() input: z.infer<typeof createSettingSchema>): Promise<z.infer<typeof apiResponseSchema>> {
    const newSetting = await this.settingService.create(input);
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
  async update(@Input() input: z.infer<typeof updateSettingSchema>): Promise<z.infer<typeof apiResponseSchema>> {
    const { id, ...updateData } = input;
    const updatedSetting = await this.settingService.update(id, updateData);
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
  async bulkUpdate(@Input() input: z.infer<typeof bulkUpdateSettingsSchema>): Promise<z.infer<typeof apiResponseSchema>> {
    await this.settingService.bulkUpdate(input);
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
  async delete(@Input() input: { id: string }): Promise<z.infer<typeof apiResponseSchema>> {
    await this.settingService.delete(input.id);
    return this.responseService.createDeletedResponse(
      15, // ModuleCode.SETTINGS
      'settings'
    );
  }
} 