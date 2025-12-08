import { Injectable, Inject } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { SupplierRepository } from '../repositories/supplier.repository';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { paginatedResponseSchema, apiResponseSchema } from '../../../trpc/schemas/response.schemas';

export const getSuppliersQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  country: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'country']).default('createdAt'),
  sortOrder: z.enum(['ASC', 'DESC']).default('DESC'),
});

export const createSupplierSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  logo: z.string().optional(),
  website: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  contactPerson: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().min(0).default(0),
});

export const updateSupplierSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  logo: z.string().optional(),
  website: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  contactPerson: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

export const createSupplierTranslationSchema = z.object({
  supplierId: z.string().uuid(),
  locale: z.string().min(2).max(5),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  contactPerson: z.string().optional(),
});

export const updateSupplierTranslationSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  contactPerson: z.string().optional(),
});

@Router({ alias: 'adminProductSuppliers' })
@Injectable()
export class AdminProductSuppliersRouter {
  constructor(
    @Inject(SupplierRepository)
    private readonly supplierRepository: SupplierRepository,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: getSuppliersQuerySchema,
    output: paginatedResponseSchema,
  })
  async getAll(
    @Input() query: z.infer<typeof getSuppliersQuerySchema>
  ): Promise<z.infer<typeof paginatedResponseSchema>> {
    try {
      const { page, limit, search, isActive, country, sortBy, sortOrder } = query;

      const result = await this.supplierRepository.findMany({
        page,
        limit,
        search,
        isActive,
        country,
        sortBy,
        sortOrder,
      });

      return this.responseHandler.createTrpcResponse(
        200,
        'OK',
        result
      );
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve suppliers'
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
      const supplier = await this.supplierRepository.findById(input.id);
      if (!supplier) {
        throw new Error('Supplier not found');
      }
      return this.responseHandler.createTrpcSuccess(supplier);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Supplier not found'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: createSupplierSchema,
    output: apiResponseSchema,
  })
  async create(
    @Input() input: z.infer<typeof createSupplierSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      // Check if supplier with same name already exists
      const existingSupplier = await this.supplierRepository.findByName(input.name);
      if (existingSupplier) {
        throw new Error('Supplier with this name already exists');
      }

      // Check if supplier with same email already exists
      if (input.email) {
        const existingSupplierByEmail = await this.supplierRepository.findByEmail(input.email);
        if (existingSupplierByEmail) {
          throw new Error('Supplier with this email already exists');
        }
      }

      const supplier = await this.supplierRepository.create(input);
      return this.responseHandler.createTrpcSuccess(supplier);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        1,  // OperationCode.CREATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to create supplier'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string().uuid() }).merge(updateSupplierSchema),
    output: apiResponseSchema,
  })
  async update(
    @Input() input: { id: string } & z.infer<typeof updateSupplierSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const { id, ...updateData } = input;

      // Check if supplier exists
      const existingSupplier = await this.supplierRepository.findById(id);
      if (!existingSupplier) {
        throw new Error('Supplier not found');
      }

      // Check if another supplier with same name exists
      if (updateData.name) {
        const supplierWithSameName = await this.supplierRepository.findByName(updateData.name);
        if (supplierWithSameName && supplierWithSameName.id !== id) {
          throw new Error('Another supplier with this name already exists');
        }
      }

      // Check if another supplier with same email exists
      if (updateData.email) {
        const supplierWithSameEmail = await this.supplierRepository.findByEmail(updateData.email);
        if (supplierWithSameEmail && supplierWithSameEmail.id !== id) {
          throw new Error('Another supplier with this email already exists');
        }
      }

      const supplier = await this.supplierRepository.update(id, updateData);
      return this.responseHandler.createTrpcSuccess(supplier);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to update supplier'
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
      const supplier = await this.supplierRepository.findById(input.id);
      if (!supplier) {
        throw new Error('Supplier not found');
      }

      // Check if supplier has associated products
      if (supplier.productCount > 0) {
        throw new Error('Cannot delete supplier with associated products. Please reassign or remove products first.');
      }

      await this.supplierRepository.delete(input.id);
      return this.responseHandler.createTrpcSuccess({ deleted: true });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        4,  // OperationCode.DELETE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to delete supplier'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async getStats(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const stats = await this.supplierRepository.getStats();
      return this.responseHandler.createTrpcSuccess(stats);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve supplier statistics'
      );
    }
  }

  // Translation endpoints
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({
      supplierId: z.string().uuid(),
      locale: z.string().min(2).max(5).optional(),
    }),
    output: apiResponseSchema,
  })
  async getSupplierTranslations(
    @Input() input: { supplierId: string; locale?: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      if (input.locale) {
        const translation = await this.supplierRepository.findSupplierTranslation(input.supplierId, input.locale);
        return this.responseHandler.createTrpcSuccess(translation);
      } else {
        const translations = await this.supplierRepository.findSupplierTranslations(input.supplierId);
        return this.responseHandler.createTrpcSuccess(translations);
      }
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve supplier translations'
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
      const supplier = await this.supplierRepository.findByIdWithTranslations(input.id, input.locale);
      if (!supplier) {
        throw new Error('Supplier not found');
      }
      return this.responseHandler.createTrpcSuccess(supplier);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Supplier not found'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: createSupplierTranslationSchema,
    output: apiResponseSchema,
  })
  async createSupplierTranslation(
    @Input() input: z.infer<typeof createSupplierTranslationSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const translation = await this.supplierRepository.createSupplierTranslation({
        supplier_id: input.supplierId,
        locale: input.locale,
        name: input.name,
        description: input.description,
        address: input.address,
        city: input.city,
        country: input.country,
        contactPerson: input.contactPerson,
      });
      return this.responseHandler.createTrpcSuccess(translation);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        1,  // OperationCode.CREATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to create supplier translation'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({
      supplierId: z.string().uuid(),
      locale: z.string().min(2).max(5),
    }).merge(updateSupplierTranslationSchema),
    output: apiResponseSchema,
  })
  async updateSupplierTranslation(
    @Input() input: { supplierId: string; locale: string } & z.infer<typeof updateSupplierTranslationSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const { supplierId, locale, ...updateData } = input;
      const translation = await this.supplierRepository.updateSupplierTranslation(supplierId, locale, updateData);

      if (!translation) {
        throw this.responseHandler.createTRPCError(
          50, // ModuleCode.PRODUCT
          3,  // OperationCode.UPDATE
          4,  // ErrorLevelCode.NOT_FOUND
          'Supplier translation not found'
        );
      }

      return this.responseHandler.createTrpcSuccess(translation);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to update supplier translation'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({
      supplierId: z.string().uuid(),
      locale: z.string().min(2).max(5),
    }),
    output: apiResponseSchema,
  })
  async deleteSupplierTranslation(
    @Input() input: { supplierId: string; locale: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      await this.supplierRepository.deleteSupplierTranslation(input.supplierId, input.locale);
      return this.responseHandler.createTrpcSuccess({ deleted: true });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // ModuleCode.PRODUCT
        4,  // OperationCode.DELETE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to delete supplier translation'
      );
    }
  }
}