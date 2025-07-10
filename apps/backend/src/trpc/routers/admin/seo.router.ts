import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { UserRole } from '@shared';
import { SEOService } from '@backend/modules/seo/services/seo.service';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { apiResponseSchema } from '../../schemas/response.schemas';
import { 
  createSeoSchema, 
  updateSeoSchema, 
  seoResponseSchema,
  getSeoByPathSchema 
} from '@backend/modules/seo/dto/seo.dto';
import { AuthMiddleware } from '../../middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../middlewares/admin-role.middleware';

// The router alias must match the path that the client is using
@Router({ alias: 'admin.seo' })
@Injectable()
export class AdminSeoRouter {
  constructor(
    @Inject(SEOService)
    private readonly seoService: SEOService,
    @Inject(ResponseService)
    private readonly responseService: ResponseService,
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async getAll(): Promise<z.infer<typeof apiResponseSchema>> {
    const seos = await this.seoService.findAll();
    return this.responseService.createReadResponse(
      14, // ModuleCode.SEO
      'seo',
      seos
    );
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async getById(@Input() input: { id: string }): Promise<z.infer<typeof apiResponseSchema>> {
    const seo = await this.seoService.findById(input.id);
    return this.responseService.createReadResponse(
      14, // ModuleCode.SEO
      'seo',
      seo
    );
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: getSeoByPathSchema,
    output: apiResponseSchema,
  })
  async getByPath(@Input() input: z.infer<typeof getSeoByPathSchema>): Promise<z.infer<typeof apiResponseSchema>> {
    const seo = await this.seoService.findByPath(input.path);
    return this.responseService.createReadResponse(
      14, // ModuleCode.SEO
      'seo',
      seo
    );
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: createSeoSchema,
    output: apiResponseSchema,
  })
  async create(@Input() input: z.infer<typeof createSeoSchema>): Promise<z.infer<typeof apiResponseSchema>> {
    const newSeo = await this.seoService.create(input);
    return this.responseService.createCreatedResponse(
      14, // ModuleCode.SEO
      'seo',
      newSeo
    );
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: updateSeoSchema,
    output: apiResponseSchema,
  })
  async update(@Input() input: z.infer<typeof updateSeoSchema>): Promise<z.infer<typeof apiResponseSchema>> {
    const { id, ...updateData } = input;
    const updatedSeo = await this.seoService.update(id, updateData);
    return this.responseService.createUpdatedResponse(
      14, // ModuleCode.SEO
      'seo',
      updatedSeo
    );
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async delete(@Input() input: { id: string }): Promise<z.infer<typeof apiResponseSchema>> {
    await this.seoService.delete(input.id);
    return this.responseService.createDeletedResponse(
      14, // ModuleCode.SEO
      'seo'
    );
  }
} 