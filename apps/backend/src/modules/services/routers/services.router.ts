import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { ServicesService } from '../services.service';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { apiResponseSchema, paginatedResponseSchema } from '../../../trpc/schemas/response.schemas';
import { AuthenticatedContext } from '../../../trpc/context';
import {
  CreateServiceSchema,
  UpdateServiceSchema,
  ServiceFilterSchema,
  CreateServiceDto,
  UpdateServiceDto,
} from '../dto/service.dto';

const getServiceByIdSchema = z.object({
  id: z.string().uuid(),
});

const updateServiceInputSchema = z.object({
  id: z.string().uuid(),
  data: UpdateServiceSchema,
});

@Router({ alias: 'services' })
@Injectable()
export class ServicesRouter {
  constructor(
    @Inject(ServicesService)
    private readonly servicesService: ServicesService,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: ServiceFilterSchema,
    output: paginatedResponseSchema,
  })
  async getServices(
    @Input() query: z.infer<typeof ServiceFilterSchema>
  ): Promise<z.infer<typeof paginatedResponseSchema>> {
    try {
      const result = await this.servicesService.findAll(query);
      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        40, // Assuming a new module code for SERVICES
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve services'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: getServiceByIdSchema,
    output: apiResponseSchema,
  })
  async getServiceById(
    @Input() input: z.infer<typeof getServiceByIdSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const service = await this.servicesService.findOne(input.id);
      return this.responseHandler.createTrpcSuccess(service);
    } catch (error) {
       // Check for not found error
       if (error.name === 'NotFoundException') {
        throw this.responseHandler.createTRPCError(
            40,
            2,
            20, // NOT_FOUND
            'Service not found'
        );
       }
      throw this.responseHandler.createTRPCError(
        40,
        2,
        10,
        error.message || 'Failed to retrieve service'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: CreateServiceSchema,
    output: apiResponseSchema,
  })
  async createService(
    @Input() input: CreateServiceDto,
    @Ctx() ctx: AuthenticatedContext, // Keep context if needed for createdBy
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const service = await this.servicesService.create(input);
      return this.responseHandler.createTrpcSuccess(service);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        40,
        1, // CREATE
        10,
        error.message || 'Failed to create service'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: updateServiceInputSchema,
    output: apiResponseSchema,
  })
  async updateService(
    @Input() input: z.infer<typeof updateServiceInputSchema>,
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const updatedService = await this.servicesService.update(
        input.id,
        input.data
      );
      return this.responseHandler.createTrpcSuccess(updatedService);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        40,
        3, // UPDATE
        10,
        error.message || 'Failed to update service'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: getServiceByIdSchema,
    output: apiResponseSchema,
  })
  async deleteService(
    @Input() input: z.infer<typeof getServiceByIdSchema>,
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      await this.servicesService.remove(input.id);
      return this.responseHandler.createTrpcSuccess({ success: true });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        40,
        4, // DELETE
        10,
        error.message || 'Failed to delete service'
      );
    }
  }
}
