import { Injectable } from '@nestjs/common';
import { Router, Query, Input, UseMiddlewares } from 'nestjs-trpc';
import { z } from 'zod';
import { InquiryStatus } from '@backend/modules/support/entities/inquiry.entity';
import { InquiryService } from '@backend/modules/support/services/inquiry.service';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AuthMiddleware } from '@backend/trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '@backend/trpc/middlewares/admin-role.middleware';
import { paginatedResponseSchema } from '@backend/trpc/schemas/response.schemas';

const listInquirySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.nativeEnum(InquiryStatus).optional(),
});

@Injectable()
@Router({ alias: 'adminInquiry' })
export class AdminInquiryRouter {
  constructor(
    private readonly inquiryService: InquiryService,
    private readonly responseService: ResponseService,
  ) {}

  @Query({
    input: listInquirySchema,
    output: paginatedResponseSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async list(@Input() input: z.infer<typeof listInquirySchema>) {
    const result = await this.inquiryService.findPaginated(input);
    return this.responseService.createTrpcSuccess(result);
  }
}

