import { Injectable, Inject } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { FirebaseConfigService, CreateFirebaseConfigDto, UpdateFirebaseConfigDto } from '../services/firebase-config.service';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { apiResponseSchema } from '../../../trpc/schemas/response.schemas';

export const createFirebaseConfigSchema = z.object({
  name: z.string().min(1),
  apiKey: z.string().min(1),
  authDomain: z.string().min(1),
  projectId: z.string().min(1),
  storageBucket: z.string().optional(),
  messagingSenderId: z.string().optional(),
  appId: z.string().min(1),
  measurementId: z.string().optional(),
  serviceAccountKey: z.string().optional(),
  active: z.boolean().default(true),
  description: z.string().optional(),
});

export const updateFirebaseConfigSchema = z.object({
  name: z.string().min(1).optional(),
  apiKey: z.string().min(1).optional(),
  authDomain: z.string().min(1).optional(),
  projectId: z.string().min(1).optional(),
  storageBucket: z.string().optional(),
  messagingSenderId: z.string().optional(),
  appId: z.string().min(1).optional(),
  measurementId: z.string().optional(),
  serviceAccountKey: z.string().optional(),
  active: z.boolean().optional(),
  description: z.string().optional(),
});

@Router({ alias: 'adminFirebaseConfig' })
@Injectable()
export class AdminFirebaseConfigRouter {
  constructor(
    @Inject(FirebaseConfigService)
    private readonly firebaseConfigService: FirebaseConfigService,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async getAllConfigs(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const configs = await this.firebaseConfigService.getAllConfigs();
      return this.responseHandler.createTrpcSuccess(configs);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        80, // ModuleCode.FIREBASE
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve Firebase configurations'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async getConfig(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const config = await this.firebaseConfigService.getConfigById(input.id);
      if (!config) {
        throw new Error('Firebase configuration not found');
      }
      return this.responseHandler.createTrpcSuccess(config);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        80, // ModuleCode.FIREBASE
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Firebase configuration not found'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: createFirebaseConfigSchema,
    output: apiResponseSchema,
  })
  async createConfig(
    @Input() input: z.infer<typeof createFirebaseConfigSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      // Cast to CreateFirebaseConfigDto since Zod schema ensures required fields are present
      const configData = input as CreateFirebaseConfigDto;
      const config = await this.firebaseConfigService.createConfig(configData);
      return this.responseHandler.createTrpcSuccess(config);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        80, // ModuleCode.FIREBASE
        1,  // OperationCode.CREATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to create Firebase configuration'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string().uuid() }).merge(updateFirebaseConfigSchema),
    output: apiResponseSchema,
  })
  async updateConfig(
    @Input() input: { id: string } & z.infer<typeof updateFirebaseConfigSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const { id, ...updateData } = input;
      const config = await this.firebaseConfigService.updateConfig(id, updateData);
      return this.responseHandler.createTrpcSuccess(config);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        80, // ModuleCode.FIREBASE
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to update Firebase configuration'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async deleteConfig(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      await this.firebaseConfigService.deleteConfig(input.id);
      return this.responseHandler.createTrpcSuccess({ deleted: true });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        80, // ModuleCode.FIREBASE
        4,  // OperationCode.DELETE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to delete Firebase configuration'
      );
    }
  }
}