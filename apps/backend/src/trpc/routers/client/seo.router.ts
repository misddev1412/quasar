import { getSeoByPathSchema } from '@backend/modules/seo/dto/seo.dto';
import { SEOService } from '@backend/modules/seo/services/seo.service';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { Inject, Injectable } from '@nestjs/common';
import { apiResponseSchema } from '../../schemas/response.schemas';
import { Router, Query, Input } from 'nestjs-trpc';
import { z } from 'zod';

@Router({ alias: 'seo' })
@Injectable()
export class ClientSeoRouter {
  constructor(
    @Inject(SEOService)
    private readonly seoService: SEOService,
    @Inject(ResponseService)
    private readonly responseService: ResponseService,
  ) {}

  @Query({
    input: getSeoByPathSchema,
    output: apiResponseSchema,
  })
  async getByPath(@Input() input: z.infer<typeof getSeoByPathSchema>): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const seo = await this.seoService.findByPath(input.path);

      const seoData = {
        title: seo.title,
        description: seo.description,
        keywords: seo.keywords,
        additionalMetaTags: seo.additionalMetaTags
      };

      return this.responseService.createReadResponse(
        14, // ModuleCode.SEO
        'seo',
        seoData
      );
    } catch (error) {
      // If SEO not found, return fallback data instead of throwing error
      const fallbackData = {
        title: 'Products',
        description: 'Browse our wide range of high-quality products',
        keywords: 'products, shopping, online store, quality',
        additionalMetaTags: {}
      };

      return this.responseService.createReadResponse(
        14, // ModuleCode.SEO
        'seo',
        fallbackData
      );
    }
  }
} 