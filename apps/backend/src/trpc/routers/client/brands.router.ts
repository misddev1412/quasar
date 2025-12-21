import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { BrandRepository } from '../../../modules/products/repositories/brand.repository';
import { ResponseService } from '../../../modules/shared/services/response.service';
import { apiResponseSchema } from '../../schemas/response.schemas';
import { AuthenticatedContext } from '../../context';

const brandShowcaseStrategySchema = z.enum(['newest', 'alphabetical', 'custom']);

const brandShowcaseQuerySchema = z.object({
  strategy: brandShowcaseStrategySchema.optional(),
  limit: z.number().min(1).max(30).optional(),
  brandIds: z.array(z.string().uuid()).optional(),
  locale: z.string().min(2).max(10).optional(),
});

@Router({ alias: 'clientBrands' })
@Injectable()
export class ClientBrandsRouter {
  constructor(
    @Inject(BrandRepository)
    private readonly brandRepository: BrandRepository,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
  ) {}

  @Query({
    input: brandShowcaseQuerySchema.optional(),
    output: apiResponseSchema,
  })
  async list(
    @Ctx() ctx: AuthenticatedContext,
    @Input() input?: z.infer<typeof brandShowcaseQuerySchema>,
  ) {
    try {
      const requestedStrategy = input?.strategy ?? 'newest';
      const brandIds = Array.isArray(input?.brandIds) ? input?.brandIds.filter(Boolean) : [];
      const normalizedStrategy =
        requestedStrategy === 'custom' && brandIds.length === 0 ? 'newest' : requestedStrategy;

      const brands = await this.brandRepository.findPublicBrands({
        strategy: normalizedStrategy,
        brandIds,
        limit: input?.limit ?? 12,
        locale: input?.locale ?? ctx.locale,
      });

      return this.responseHandler.createTrpcSuccess(brands);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        20, // ModuleCode.PRODUCTS
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to load brands',
        error,
      );
    }
  }
}

