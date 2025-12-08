import { Injectable, Inject } from '@nestjs/common';
import { Router, Query, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { DeliveryMethodService } from '../services/delivery-method.service';
import { ResponseService } from '../../shared/services/response.service';
import { ModuleCode, OperationCode, ErrorLevelCode } from '@shared/enums/error-codes.enums';
import { apiResponseSchema } from '../../../trpc/schemas/response.schemas';

const deliveryOptionsInputSchema = z.object({
  orderAmount: z.number().min(0).default(0),
  weight: z.number().min(0).optional(),
  distance: z.number().min(0).optional(),
  coverageArea: z.string().min(1).optional(),
  paymentMethodId: z.string().optional(),
});

@Router({ alias: 'clientDeliveryMethods' })
@Injectable()
export class ClientDeliveryMethodsRouter {
  constructor(
    @Inject(DeliveryMethodService)
    private readonly deliveryMethodService: DeliveryMethodService,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
  ) {}

  @Query({
    input: deliveryOptionsInputSchema.partial().optional(),
    output: apiResponseSchema,
  })
  async list(@Input() input: z.infer<typeof deliveryOptionsInputSchema> = { orderAmount: 0 }) {
    try {
      const {
        orderAmount = 0,
        weight,
        distance,
        coverageArea,
        paymentMethodId,
      } = input ?? { orderAmount: 0 };

      const activeMethods = await this.deliveryMethodService.findActive();

      const options = await Promise.all(
        activeMethods.map(async (method) => {
          try {
            const calculation = await this.deliveryMethodService.calculateDelivery(method.id, orderAmount, {
              weight,
              distance,
              coverageArea,
              paymentMethodId,
            });

            return {
              id: method.id,
              name: method.name,
              type: method.type,
              description: method.description,
              isDefault: method.isDefault,
              costCalculationType: method.costCalculationType,
              deliveryCost: Number(calculation.deliveryCost ?? method.deliveryCost ?? 0),
              estimatedDeliveryTime: calculation.estimatedDeliveryTime,
              providerName: method.providerName,
              trackingEnabled: method.trackingEnabled,
              insuranceEnabled: method.insuranceEnabled,
              signatureRequired: method.signatureRequired,
              iconUrl: method.iconUrl,
              isAvailable: true,
            };
          } catch (error) {
            return {
              id: method.id,
              name: method.name,
              type: method.type,
              description: method.description,
              isDefault: method.isDefault,
              costCalculationType: method.costCalculationType,
              deliveryCost: Number(method.deliveryCost ?? 0),
              estimatedDeliveryTime: method.getEstimatedDeliveryTime(),
              providerName: method.providerName,
              trackingEnabled: method.trackingEnabled,
              insuranceEnabled: method.insuranceEnabled,
              signatureRequired: method.signatureRequired,
              iconUrl: method.iconUrl,
              isAvailable: false,
              unavailableReason: error instanceof Error ? error.message : 'Delivery method unavailable',
            };
          }
        })
      );

      return this.responseHandler.createTrpcSuccess({ items: options });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.PRODUCT,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        error instanceof Error ? error.message : 'Failed to load delivery methods'
      );
    }
  }
}
