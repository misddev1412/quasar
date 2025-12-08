import { Injectable, Inject } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AttributeRepository } from '../repositories/attribute.repository';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { paginatedResponseSchema, apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { AttributeType } from '../entities/attribute.entity';

export const getAttributesQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  type: z.nativeEnum(AttributeType).optional(),
  isRequired: z.boolean().optional(),
  isFilterable: z.boolean().optional(),
  sortBy: z.enum(['name', 'displayName', 'createdAt', 'updatedAt', 'sortOrder']).default('sortOrder'),
  sortOrder: z.enum(['ASC', 'DESC']).default('ASC'),
});

export const createAttributeSchema = z.object({
  name: z.string().min(1),
  displayName: z.string().optional(),
  type: z.nativeEnum(AttributeType),
  isRequired: z.boolean().default(false),
  isFilterable: z.boolean().default(false),
  sortOrder: z.number().min(0).default(0),
});

export const updateAttributeSchema = z.object({
  name: z.string().min(1).optional(),
  displayName: z.string().optional(),
  type: z.nativeEnum(AttributeType).optional(),
  isRequired: z.boolean().optional(),
  isFilterable: z.boolean().optional(),
  sortOrder: z.number().min(0).optional(),
});

export const createAttributeValueSchema = z.object({
  attributeId: z.string().uuid(),
  value: z.string().min(1),
  displayValue: z.string().optional(),
  sortOrder: z.number().min(0).default(0),
});

export const updateAttributeValueSchema = z.object({
  value: z.string().min(1).optional(),
  displayValue: z.string().optional(),
  sortOrder: z.number().min(0).optional(),
});

export const createAttributeTranslationSchema = z.object({
  attributeId: z.string().uuid(),
  locale: z.string().min(2).max(5),
  displayName: z.string().min(1),
});

export const updateAttributeTranslationSchema = z.object({
  displayName: z.string().min(1),
});

@Router({ alias: 'adminProductAttributes' })
@Injectable()
export class AdminProductAttributesRouter {
  constructor(
    @Inject(AttributeRepository)
    private readonly attributeRepository: AttributeRepository,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: getAttributesQuerySchema,
    output: paginatedResponseSchema,
  })
  async getAll(
    @Input() query: z.infer<typeof getAttributesQuerySchema>
  ): Promise<z.infer<typeof paginatedResponseSchema>> {
    try {
      const result = await this.attributeRepository.findMany(query);
      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve attributes',
        error
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async getById(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const attribute = await this.attributeRepository.findById(input.id, ['values']);
      if (!attribute) {
        throw new Error('Attribute not found');
      }
      return this.responseHandler.createTrpcSuccess(attribute);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Attribute not found',
        error
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async getSelectAttributes(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const attributes = await this.attributeRepository.getSelectAttributes();
      return this.responseHandler.createTrpcSuccess(attributes);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve select attributes',
        error
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async getFilterableAttributes(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const attributes = await this.attributeRepository.getFilterableAttributes();
      return this.responseHandler.createTrpcSuccess(attributes);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve filterable attributes',
        error
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: createAttributeSchema,
    output: apiResponseSchema,
  })
  async create(
    @Input() input: z.infer<typeof createAttributeSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const attribute = await this.attributeRepository.create(input);
      return this.responseHandler.createTrpcSuccess(attribute);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        1,  // OperationCode.CREATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to create attribute',
        error
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string().uuid() }).merge(updateAttributeSchema),
    output: apiResponseSchema,
  })
  async update(
    @Input() input: { id: string } & z.infer<typeof updateAttributeSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const { id, ...updateData } = input;
      const attribute = await this.attributeRepository.update(id, updateData);
      return this.responseHandler.createTrpcSuccess(attribute);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to update attribute',
        error
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async delete(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      await this.attributeRepository.delete(input.id);
      return this.responseHandler.createTrpcSuccess({ deleted: true });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        4,  // OperationCode.DELETE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to delete attribute',
        error
      );
    }
  }

  // Attribute Values endpoints
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ attributeId: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async getAttributeValues(
    @Input() input: { attributeId: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const values = await this.attributeRepository.findAttributeValues(input.attributeId);
      return this.responseHandler.createTrpcSuccess(values);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve attribute values',
        error
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: createAttributeValueSchema,
    output: apiResponseSchema,
  })
  async createAttributeValue(
    @Input() input: z.infer<typeof createAttributeValueSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const attributeValue = await this.attributeRepository.createAttributeValue(input);
      return this.responseHandler.createTrpcSuccess(attributeValue);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        1,  // OperationCode.CREATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to create attribute value',
        error
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string().uuid() }).merge(updateAttributeValueSchema),
    output: apiResponseSchema,
  })
  async updateAttributeValue(
    @Input() input: { id: string } & z.infer<typeof updateAttributeValueSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const { id, ...updateData } = input;
      const attributeValue = await this.attributeRepository.updateAttributeValue(id, updateData);
      return this.responseHandler.createTrpcSuccess(attributeValue);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to update attribute value',
        error
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async deleteAttributeValue(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      await this.attributeRepository.deleteAttributeValue(input.id);
      return this.responseHandler.createTrpcSuccess({ deleted: true });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        4,  // OperationCode.DELETE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to delete attribute value',
        error
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async getStats(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const stats = await this.attributeRepository.getStats();
      return this.responseHandler.createTrpcSuccess(stats);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve attribute statistics',
        error
      );
    }
  }

  // Translation endpoints
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ 
      attributeId: z.string().uuid(),
      locale: z.string().min(2).max(5).optional(),
    }),
    output: apiResponseSchema,
  })
  async getAttributeTranslations(
    @Input() input: { attributeId: string; locale?: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      if (input.locale) {
        const translation = await this.attributeRepository.findAttributeTranslation(input.attributeId, input.locale);
        return this.responseHandler.createTrpcSuccess(translation);
      } else {
        const translations = await this.attributeRepository.findAttributeTranslations(input.attributeId);
        return this.responseHandler.createTrpcSuccess(translations);
      }
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve attribute translations',
        error
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ 
      id: z.string().uuid(),
      locale: z.string().min(2).max(5).optional(),
    }),
    output: apiResponseSchema,
  })
  async getByIdWithTranslations(
    @Input() input: { id: string; locale?: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const attribute = await this.attributeRepository.findByIdWithTranslations(input.id, input.locale);
      if (!attribute) {
        throw new Error('Attribute not found');
      }
      return this.responseHandler.createTrpcSuccess(attribute);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Attribute not found',
        error
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: createAttributeTranslationSchema,
    output: apiResponseSchema,
  })
  async createAttributeTranslation(
    @Input() input: z.infer<typeof createAttributeTranslationSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const translation = await this.attributeRepository.createAttributeTranslation({
        attribute_id: input.attributeId,
        locale: input.locale,
        displayName: input.displayName,
      });
      return this.responseHandler.createTrpcSuccess(translation);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        1,  // OperationCode.CREATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to create attribute translation',
        error
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({
      attributeId: z.string().uuid(),
      locale: z.string().min(2).max(5),
    }).merge(updateAttributeTranslationSchema),
    output: apiResponseSchema,
  })
  async updateAttributeTranslation(
    @Input() input: { attributeId: string; locale: string } & z.infer<typeof updateAttributeTranslationSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const { attributeId, locale, ...updateData } = input;
      const translation = await this.attributeRepository.updateAttributeTranslation(attributeId, locale, updateData);
      return this.responseHandler.createTrpcSuccess(translation);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to update attribute translation',
        error
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({
      attributeId: z.string().uuid(),
      locale: z.string().min(2).max(5),
    }),
    output: apiResponseSchema,
  })
  async deleteAttributeTranslation(
    @Input() input: { attributeId: string; locale: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      await this.attributeRepository.deleteAttributeTranslation(input.attributeId, input.locale);
      return this.responseHandler.createTrpcSuccess({ deleted: true });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        4,  // OperationCode.DELETE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to delete attribute translation',
        error
      );
    }
  }
}