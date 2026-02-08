import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { OpenAiConfigService, CreateOpenAiConfigDto, UpdateOpenAiConfigDto } from '@backend/modules/openai/services/openai-config.service';
import { OpenAiContentService, GenerateSeoArticleInput } from '@backend/modules/openai/services/openai-content.service';
import { AuthMiddleware } from '@backend/trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '@backend/trpc/middlewares/admin-role.middleware';
import { apiResponseSchema } from '@backend/trpc/schemas/response.schemas';

export const createOpenAiConfigSchema = z.object({
  name: z.string().min(1),
  model: z.string().min(1),
  apiKey: z.string().min(1),
  baseUrl: z.string().optional(),
  active: z.boolean().default(true),
  description: z.string().optional(),
});

export const updateOpenAiConfigSchema = z.object({
  name: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  apiKey: z.string().min(1).optional(),
  baseUrl: z.string().optional(),
  active: z.boolean().optional(),
  description: z.string().optional(),
});

export const generateSeoArticleSchema = z.object({
  topic: z.string().min(3),
  keywords: z.array(z.string()).optional(),
  language: z.string().optional(),
  tone: z.string().optional(),
  wordCount: z.number().int().min(300).max(4000).optional(),
  audience: z.string().optional(),
  includeFaq: z.boolean().optional(),
  configId: z.string().uuid().optional(),
});

@Router({ alias: 'adminOpenAiConfig' })
@Injectable()
export class AdminOpenAiConfigRouter {
  constructor(
    @Inject(OpenAiConfigService)
    private readonly openAiConfigService: OpenAiConfigService,
    @Inject(OpenAiContentService)
    private readonly openAiContentService: OpenAiContentService,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
  ) { }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async getAllConfigs(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const configs = await this.openAiConfigService.getAllConfigs();
      return this.responseHandler.createTrpcSuccess(configs);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        91,
        2,
        10,
        error.message || 'Failed to retrieve OpenAI configurations'
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
      const config = await this.openAiConfigService.getConfigById(input.id);
      if (!config) {
        throw new Error('OpenAI configuration not found');
      }
      return this.responseHandler.createTrpcSuccess(config);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        91,
        2,
        4,
        error.message || 'OpenAI configuration not found'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: createOpenAiConfigSchema,
    output: apiResponseSchema,
  })
  async createConfig(
    @Input() input: z.infer<typeof createOpenAiConfigSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const configData = input as CreateOpenAiConfigDto;
      const config = await this.openAiConfigService.createConfig(configData);
      return this.responseHandler.createTrpcSuccess(config);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        91,
        1,
        30,
        error.message || 'Failed to create OpenAI configuration'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string().uuid() }).merge(updateOpenAiConfigSchema),
    output: apiResponseSchema,
  })
  async updateConfig(
    @Input() input: { id: string } & z.infer<typeof updateOpenAiConfigSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const { id, ...updateData } = input;
      const config = await this.openAiConfigService.updateConfig(id, updateData as UpdateOpenAiConfigDto);
      return this.responseHandler.createTrpcSuccess(config);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        91,
        3,
        30,
        error.message || 'Failed to update OpenAI configuration'
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
      await this.openAiConfigService.deleteConfig(input.id);
      return this.responseHandler.createTrpcSuccess({ deleted: true });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        91,
        4,
        30,
        error.message || 'Failed to delete OpenAI configuration'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: generateSeoArticleSchema,
    output: apiResponseSchema,
  })
  async generateSeoArticle(
    @Input() input: z.infer<typeof generateSeoArticleSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const result = await this.openAiContentService.generateSeoArticle(input as GenerateSeoArticleInput);
      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        91,
        27,
        20,
        error.message || 'Failed to generate SEO article'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({
      entityType: z.enum(['product', 'post']),
      contentType: z.enum(['title', 'description', 'keywords', 'image']),
      context: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      language: z.string().optional(),
      tone: z.string().optional(),
      style: z.string().optional(),
      includeProductLinks: z.boolean().optional(),
      includeImages: z.boolean().optional(),
      length: z.enum(['short', 'medium', 'long', 'very_long']).optional(),
    }),
    output: apiResponseSchema,
  })
  async generateContent(
    @Input() input: {
      entityType: 'product' | 'post';
      contentType: 'title' | 'description' | 'keywords' | 'image';
      context?: string;
      keywords?: string[];
      language?: string;
      tone?: string;
      style?: string;
    }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const result = await this.openAiContentService.generateContent(input);
      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        91,
        27,
        30,
        error.message || 'Failed to generate content'
      );
    }
  }
}
