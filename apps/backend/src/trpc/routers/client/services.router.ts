import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { ServicesService } from '../../../modules/services/services.service';
import { ResponseService } from '../../../modules/shared/services/response.service';
import { apiResponseSchema, paginatedResponseSchema } from '../../schemas/response.schemas';
import { ServiceFilterSchema } from '../../../modules/services/dto/service.dto';

const getServiceByIdSchema = z.object({
  id: z.string().uuid(),
});

@Router({ alias: 'clientServices' })
@Injectable()
export class ClientServicesRouter {
  constructor(
    @Inject(ServicesService)
    private readonly servicesService: ServicesService,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
  ) {}

  @Query({
    input: ServiceFilterSchema.omit({ isActive: true }),
    output: paginatedResponseSchema,
  })
  async getServices(
    @Input() query: z.infer<typeof ServiceFilterSchema>
  ): Promise<z.infer<typeof paginatedResponseSchema>> {
    try {
      const result = await this.servicesService.findAll({
        ...query,
        isActive: true,
      });
      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        40,
        2,
        10,
        error.message || 'Failed to retrieve services'
      );
    }
  }

  @Query({
    input: getServiceByIdSchema,
    output: apiResponseSchema,
  })
  async getServiceById(
    @Input() input: z.infer<typeof getServiceByIdSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const service = await this.servicesService.findOne(input.id);

      if (!service.isActive) {
        throw this.responseHandler.createTRPCError(
          40,
          2,
          20,
          'Service not found'
        );
      }

      return this.responseHandler.createTrpcSuccess(service);
    } catch (error) {
      if (error.name === 'NotFoundException') {
        throw this.responseHandler.createTRPCError(
          40,
          2,
          20,
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
}
