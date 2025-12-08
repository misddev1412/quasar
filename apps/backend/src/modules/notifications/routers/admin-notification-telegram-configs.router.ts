import { Injectable, NotFoundException } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { RequirePermission } from '../../../trpc/middlewares/permission.middleware';
import { PermissionAction, PermissionScope } from '@shared';
import { apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { NotificationTelegramConfigService } from '../services/notification-telegram-config.service';
import { ModuleCode, OperationCode, ErrorLevelCode } from '@shared/enums/error-codes.enums';
import { AuthenticatedContext } from '../../../trpc/context';
import { CreateTelegramConfigDto } from '../repositories/notification-telegram-config.repository';

// Create permission middleware classes at module level so they can be registered as providers
const requireReadAnyTelegramConfig = RequirePermission({
  resource: 'telegram_config',
  action: PermissionAction.READ,
  scope: PermissionScope.ANY,
});

const requireCreateAnyTelegramConfig = RequirePermission({
  resource: 'telegram_config',
  action: PermissionAction.CREATE,
  scope: PermissionScope.ANY,
});

const requireUpdateAnyTelegramConfig = RequirePermission({
  resource: 'telegram_config',
  action: PermissionAction.UPDATE,
  scope: PermissionScope.ANY,
});

const requireDeleteAnyTelegramConfig = RequirePermission({
  resource: 'telegram_config',
  action: PermissionAction.DELETE,
  scope: PermissionScope.ANY,
});

export const AdminNotificationTelegramConfigPermissions = [
  requireReadAnyTelegramConfig,
  requireCreateAnyTelegramConfig,
  requireUpdateAnyTelegramConfig,
  requireDeleteAnyTelegramConfig,
];

const telegramConfigBaseSchema = z.object({
  name: z.string().min(3).max(150),
  botUsername: z.string().min(3).max(150),
  botToken: z.string().min(10),
  chatId: z.string().min(1).max(120),
  threadId: z.number().int().min(1).nullable().optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const updateTelegramConfigSchema = telegramConfigBaseSchema.partial().extend({
  id: z.string().uuid(),
});

const deleteTelegramConfigSchema = z.object({
  id: z.string().uuid(),
});

@Injectable()
@Router({ alias: 'adminNotificationTelegramConfigs' })
@UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
export class AdminNotificationTelegramConfigsRouter {
  constructor(
    private readonly telegramConfigService: NotificationTelegramConfigService,
    private readonly responseService: ResponseService,
  ) {}

  @UseMiddlewares(requireReadAnyTelegramConfig)
  @Query({
    output: apiResponseSchema,
  })
  async list(@Ctx() ctx: AuthenticatedContext) {
    try {
      const configs = await this.telegramConfigService.list();
      // Transform Date objects to ISO strings for proper serialization
      const serializedConfigs = configs.map(config => ({
        ...config,
        createdAt: config.createdAt instanceof Date ? config.createdAt.toISOString() : config.createdAt,
        updatedAt: config.updatedAt instanceof Date ? config.updatedAt.toISOString() : config.updatedAt,
      }));
      return this.responseService.createTrpcSuccess(serializedConfigs);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.NOTIFICATION,
        OperationCode.READ,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        'Failed to fetch telegram notification configs',
        error,
      );
    }
  }

  @UseMiddlewares(requireCreateAnyTelegramConfig)
  @Mutation({
    input: telegramConfigBaseSchema,
    output: apiResponseSchema,
  })
  async create(
    @Input() input: z.infer<typeof telegramConfigBaseSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      const config = await this.telegramConfigService.create(input as CreateTelegramConfigDto);
      // Transform Date objects to ISO strings for proper serialization
      const serializedConfig = {
        ...config,
        createdAt: config.createdAt instanceof Date ? config.createdAt.toISOString() : config.createdAt,
        updatedAt: config.updatedAt instanceof Date ? config.updatedAt.toISOString() : config.updatedAt,
      };
      return this.responseService.createTrpcSuccess(serializedConfig);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.NOTIFICATION,
        OperationCode.CREATE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        'Failed to create telegram notification config',
        error,
      );
    }
  }

  @UseMiddlewares(requireUpdateAnyTelegramConfig)
  @Mutation({
    input: updateTelegramConfigSchema,
    output: apiResponseSchema,
  })
  async update(
    @Input() input: z.infer<typeof updateTelegramConfigSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      const { id, ...payload } = input;
      const config = await this.telegramConfigService.update(id, payload);
      // Transform Date objects to ISO strings for proper serialization
      const serializedConfig = {
        ...config,
        createdAt: config.createdAt instanceof Date ? config.createdAt.toISOString() : config.createdAt,
        updatedAt: config.updatedAt instanceof Date ? config.updatedAt.toISOString() : config.updatedAt,
      };
      return this.responseService.createTrpcSuccess(serializedConfig);
    } catch (error) {
      const level = error instanceof NotFoundException
        ? ErrorLevelCode.NOT_FOUND
        : ErrorLevelCode.BUSINESS_LOGIC_ERROR;

      throw this.responseService.createTRPCError(
        ModuleCode.NOTIFICATION,
        OperationCode.UPDATE,
        level,
        error?.message || 'Failed to update telegram notification config',
        error,
      );
    }
  }

  @UseMiddlewares(requireDeleteAnyTelegramConfig)
  @Mutation({
    input: deleteTelegramConfigSchema,
    output: apiResponseSchema,
  })
  async delete(
    @Input() input: z.infer<typeof deleteTelegramConfigSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      await this.telegramConfigService.delete(input.id);
      return this.responseService.createTrpcSuccess({ success: true });
    } catch (error) {
      const level = error instanceof NotFoundException
        ? ErrorLevelCode.NOT_FOUND
        : ErrorLevelCode.BUSINESS_LOGIC_ERROR;

      throw this.responseService.createTRPCError(
        ModuleCode.NOTIFICATION,
        OperationCode.DELETE,
        level,
        error?.message || 'Failed to delete telegram notification config',
        error,
      );
    }
  }
}
