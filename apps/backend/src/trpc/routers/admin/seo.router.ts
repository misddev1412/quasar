import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { SEOService } from '@backend/modules/seo/services/seo.service';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { apiResponseSchema } from '../../schemas/response.schemas';
import {
  CreateSeoDto,
  UpdateSeoDto,
} from '@backend/modules/seo/dto/seo.dto';
import { AuthMiddleware } from '../../middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../middlewares/admin-role.middleware';

@Router({ alias: 'admin.seo' })
@Injectable()
export class AdminSeoRouter {
  constructor(
    @Inject(SEOService)
    private readonly seoService: SEOService,
    @Inject(ResponseService)
    private readonly responseService: ResponseService
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async getAll(): Promise<z.infer<typeof apiResponseSchema>> {
    const seos = await this.seoService.findAll();
    return this.responseService.createReadResponse(14, 'seo', seos);
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: CreateSeoDto,
    output: apiResponseSchema,
  })
  async create(
    @Input() input: CreateSeoDto
  ): Promise<z.infer<typeof apiResponseSchema>> {
    const newSeo = await this.seoService.create(input);
    return this.responseService.createCreatedResponse(14, 'seo', newSeo);
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string(), data: UpdateSeoDto }),
    output: apiResponseSchema,
  })
  async update(
    @Input() input: { id: string; data: UpdateSeoDto }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    const updatedSeo = await this.seoService.update(input.id, input.data);
    return this.responseService.createUpdatedResponse(14, 'seo', updatedSeo);
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string() }),
    output: apiResponseSchema,
  })
  async delete(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    await this.seoService.delete(input.id);
    return this.responseService.createDeletedResponse(14, 'seo');
  }
} 