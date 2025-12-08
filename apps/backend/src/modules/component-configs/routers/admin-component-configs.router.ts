import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { ComponentConfigsService } from '../services/component-configs.service';
import { ResponseService } from '../../shared/services/response.service';
import { apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { ModuleCode, OperationCode, ErrorLevelCode } from '@shared/enums/error-codes.enums';
import {
  createComponentConfigSchema,
  updateComponentConfigSchema,
  listComponentConfigSchema,
  type CreateComponentConfigDto,
  type UpdateComponentConfigDto,
  type ListComponentConfigDto,
} from '../dto/component-config.dto';
import { AuthenticatedContext } from '../../../trpc/context';

const byIdSchema = z.object({
  id: z.string().uuid(),
});

const byKeySchema = z.object({
  componentKey: z.string().min(1).max(150),
});

const updateInputSchema = z.object({
  id: z.string().uuid(),
  data: updateComponentConfigSchema,
});

@Router({ alias: 'adminComponentConfigs' })
@Injectable()
export class AdminComponentConfigsRouter {
  constructor(
    @Inject(ComponentConfigsService)
    private readonly componentConfigsService: ComponentConfigsService,
    @Inject(ResponseService)
    private readonly responseService: ResponseService,
  ) {}

  @Query({
    input: listComponentConfigSchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async list(@Input() input: ListComponentConfigDto) {
    try {
      const components = await this.componentConfigsService.list(input);
      return this.responseService.createReadResponse(ModuleCode.COMPONENT, 'componentConfigs', components);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.COMPONENT,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Unable to load component configurations',
        error,
      );
    }
  }

  @Query({
    input: byIdSchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async byId(@Input() input: z.infer<typeof byIdSchema>) {
    try {
      const component = await this.componentConfigsService.getById(input.id);
      return this.responseService.createReadResponse(ModuleCode.COMPONENT, 'componentConfig', component);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.COMPONENT,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Unable to load component configuration',
        error,
      );
    }
  }

  @Query({
    input: byKeySchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async byKey(@Input() input: z.infer<typeof byKeySchema>) {
    try {
      const component = await this.componentConfigsService.getByKey(input.componentKey);
      return this.responseService.createReadResponse(ModuleCode.COMPONENT, 'componentConfig', component);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.COMPONENT,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Unable to load component configuration',
        error,
      );
    }
  }

  @Mutation({
    input: createComponentConfigSchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async create(
    @Input() input: CreateComponentConfigDto,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      const component = await this.componentConfigsService.create(input, ctx.user?.id);
      return this.responseService.createCreatedResponse(ModuleCode.COMPONENT, 'componentConfig', component);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.COMPONENT,
        OperationCode.CREATE,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Unable to create component configuration',
        error,
      );
    }
  }

  @Mutation({
    input: updateInputSchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async update(
    @Input() input: { id: string; data: UpdateComponentConfigDto },
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      const component = await this.componentConfigsService.update(input.id, input.data, ctx.user?.id);
      return this.responseService.createUpdatedResponse(ModuleCode.COMPONENT, 'componentConfig', component);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.COMPONENT,
        OperationCode.UPDATE,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Unable to update component configuration',
        error,
      );
    }
  }

  @Mutation({
    input: byIdSchema,
    output: apiResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async delete(
    @Input() input: z.infer<typeof byIdSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ) {
    try {
      await this.componentConfigsService.delete(input.id, ctx.user?.id);
      return this.responseService.createDeletedResponse(ModuleCode.COMPONENT, 'componentConfig');
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.COMPONENT,
        OperationCode.DELETE,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Unable to delete component configuration',
        error,
      );
    }
  }
}
