import { Injectable, Inject } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AdminProductService } from '../services/admin-product.service';
import { UpdateProductVariantDto } from '../repositories/product-variant.repository';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { paginatedResponseSchema, apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { AuthenticatedContext } from '../../../trpc/context';
import { ProductStatus } from '../entities/product.entity';

export const productStatusSchema = z.nativeEnum(ProductStatus);
const exportFormatSchema = z.enum(['csv', 'json']);

export const getProductsQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  brandId: z.string().optional(),
  categoryId: z.string().optional(),
  status: productStatusSchema.optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  hasStock: z.boolean().optional(),
  createdFrom: z.string().optional(),
  createdTo: z.string().optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(1),
  sku: z.string().optional(),
  description: z.string().optional(),
  status: productStatusSchema.optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  price: z.number().optional(),
  brandId: z.string().optional(),
  categoryId: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
  warrantyId: z.string().optional(),
  images: z.array(z.string()).optional(),
  media: z.array(z.object({
    id: z.string().optional(),
    type: z.enum(['image', 'video', 'audio', 'document', 'other']),
    url: z.string(),
    altText: z.string().nullable().optional(),
    caption: z.string().nullable().optional(),
    sortOrder: z.number().nullable().optional(),
    fileSize: z.number().nullable().optional(),
    mimeType: z.string().nullable().optional(),
    width: z.number().nullable().optional(),
    height: z.number().nullable().optional(),
    duration: z.number().nullable().optional(),
    thumbnailUrl: z.string().nullable().optional(),
    isPrimary: z.boolean().optional(),
  })).optional(),
  tags: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  stockQuantity: z.number().optional(),
  enableWarehouseQuantity: z.boolean().optional(),
  warehouseQuantities: z.array(z.object({
    warehouseId: z.string(),
    quantity: z.number(),
  })).optional(),
  specifications: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    value: z.string().min(1),
    sortOrder: z.number().optional(),
  })).optional(),
  variants: z.array(z.object({
    name: z.string(),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    price: z.number(),
    compareAtPrice: z.number().optional(),
    costPrice: z.number().optional(),
    stockQuantity: z.number(),
    lowStockThreshold: z.number().optional(),
    trackInventory: z.boolean(),
    allowBackorders: z.boolean(),
    weight: z.number().optional(),
    dimensions: z.string().optional(),
    image: z.string().nullable().optional(),
    isActive: z.boolean(),
    sortOrder: z.number(),
    variantItems: z.array(z.object({
      attributeId: z.string(),
      attributeValueId: z.string(),
    })),
  })).optional(),
});

export const updateProductSchema = z.object({
  name: z.string().optional(),
  sku: z.string().optional(),
  description: z.string().optional(),
  status: productStatusSchema.optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  price: z.number().optional(),
  brandId: z.string().optional(),
  categoryId: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
  warrantyId: z.string().optional(),
  media: z.array(z.object({
    id: z.string().optional(),
    type: z.enum(['image', 'video', 'audio', 'document', 'other']),
    url: z.string(),
    altText: z.string().nullable().optional(),
    caption: z.string().nullable().optional(),
    sortOrder: z.number().nullable().optional(),
    fileSize: z.number().nullable().optional(),
    mimeType: z.string().nullable().optional(),
    width: z.number().nullable().optional(),
    height: z.number().nullable().optional(),
    duration: z.number().nullable().optional(),
    thumbnailUrl: z.string().nullable().optional(),
    isPrimary: z.boolean().optional(),
  })).optional(),
  tags: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  stockQuantity: z.number().optional(),
  enableWarehouseQuantity: z.boolean().optional(),
  warehouseQuantities: z.array(z.object({
    warehouseId: z.string(),
    quantity: z.number(),
  })).optional(),
  specifications: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    value: z.string().min(1),
    sortOrder: z.number().optional(),
  })).optional(),
  variants: z.array(z.object({
    id: z.string().optional(), // Include ID for updates
    name: z.string(),
    sku: z.string().nullable().optional(),
    barcode: z.string().nullable().optional(),
    price: z.number(),
    compareAtPrice: z.number().nullable().optional(),
    costPrice: z.number().nullable().optional(),
    stockQuantity: z.number(),
    lowStockThreshold: z.number().nullable().optional(),
    trackInventory: z.boolean(),
    allowBackorders: z.boolean(),
    weight: z.number().nullable().optional(),
    dimensions: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
    isActive: z.boolean(),
    sortOrder: z.number(),
    variantItems: z.array(z.object({
      attributeId: z.string(),
      attributeValueId: z.string(),
    })),
  })).optional(),
});

export const updateProductVariantSchema = z.object({
  name: z.string().optional(),
  sku: z.string().nullable().optional(),
  barcode: z.string().nullable().optional(),
  price: z.number().optional(),
  compareAtPrice: z.number().nullable().optional(),
  costPrice: z.number().nullable().optional(),
  stockQuantity: z.number().optional(),
  lowStockThreshold: z.number().nullable().optional(),
  trackInventory: z.boolean().optional(),
  allowBackorders: z.boolean().optional(),
  weight: z.number().nullable().optional(),
  dimensions: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
  variantItems: z.array(z.object({
    attributeId: z.string(),
    attributeValueId: z.string(),
    sortOrder: z.number().optional(),
  })).optional(),
});

const normalizeCategoryIdsInput = (
  categoryIds?: unknown,
  categoryId?: unknown,
): string[] | undefined => {
  let raw: string[] | undefined;

  if (Array.isArray(categoryIds)) {
    raw = categoryIds.filter((id): id is string => typeof id === 'string');
  } else if (categoryIds !== undefined) {
    raw = [];
  }

  if (raw === undefined) {
    if (typeof categoryId === 'string') {
      raw = [categoryId];
    } else if (categoryId !== undefined && categoryId !== null) {
      raw = [];
    }
  }

  if (raw === undefined) {
    return undefined;
  }

  const normalized = raw
    .map((id) => id.trim())
    .filter((id) => id.length > 0);

  const unique = Array.from(new Set(normalized));
  return unique;
};

@Router({ alias: 'adminProducts' })
@Injectable()
export class AdminProductsRouter {
  constructor(
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
    @Inject(AdminProductService)
    private readonly productService: AdminProductService,
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware) // Temporarily commented for debugging
  @Query({
    input: getProductsQuerySchema,
    output: paginatedResponseSchema,
  })
  async list(
    @Input() query: z.infer<typeof getProductsQuerySchema>
  ): Promise<z.infer<typeof paginatedResponseSchema>> {
    try {
      const filters = {
        page: query.page,
        limit: query.limit,
        search: query.search,
        brandId: query.brandId,
        categoryIds: query.categoryId ? [query.categoryId] : undefined,
        status: query.status,
        isActive: query.isActive,
        isFeatured: query.isFeatured,
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
        hasStock: query.hasStock,
        createdFrom: query.createdFrom,
        createdTo: query.createdTo,
      };

      const result = await this.productService.getAllProducts(filters);
      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve products'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({
      format: exportFormatSchema.default('csv'),
      filters: z.record(z.any()).optional(),
    }),
    output: apiResponseSchema,
  })
  async exportProducts(
    @Ctx() ctx: AuthenticatedContext,
    @Input() input: { format: z.infer<typeof exportFormatSchema>; filters?: Record<string, any> }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const job = await this.productService.exportProducts(input.format, input.filters, ctx.user.id);
      return this.responseHandler.createTrpcSuccess(job);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15,
        1,
        30,
        (error as any)?.message || 'Failed to start export job',
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({
      filters: z.record(z.any()).optional(),
    }),
    output: apiResponseSchema,
  })
  async estimateExportProducts(
    @Input() input: { filters?: Record<string, any> }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const estimate = await this.productService.estimateProductExport(input.filters);
      return this.responseHandler.createTrpcSuccess(estimate);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15,
        2,
        30,
        (error as any)?.message || 'Failed to estimate export records',
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({
      limit: z.number().min(1).max(50).default(10),
      page: z.number().min(1).default(1),
    }),
    output: apiResponseSchema,
  })
  async listExportJobs(
    @Ctx() ctx: AuthenticatedContext,
    @Input() input: { limit: number; page: number }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const jobs = await this.productService.listProductExportJobs(input.limit, ctx.user.id, input.page);
      return this.responseHandler.createTrpcSuccess(jobs);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15,
        2,
        30,
        (error as any)?.message || 'Failed to load export jobs',
      );
    }
  }

  // @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware) // Temporarily commented for debugging
  @Mutation({
    input: z.object({
      productId: z.string(),
      mediaUrl: z.string(),
      type: z.enum(['image', 'video', 'audio', 'document', 'other']).optional().default('image'),
      altText: z.string().optional(),
      isPrimary: z.boolean().optional().default(false)
    }),
    output: apiResponseSchema,
  })
  async addTestMedia(
    @Input() input: { productId: string; mediaUrl: string; type?: string; altText?: string; isPrimary?: boolean }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      // This is a test endpoint to add media to the product
      const product = await this.productService.getProductById(input.productId);
      if (!product) {
        throw new Error('Product not found');
      }

      // Add test media data (this would normally be done through the admin interface)
      const testMedia = [{
        type: input.type || 'image',
        url: input.mediaUrl,
        altText: input.altText || 'Test image',
        caption: 'Test media added via API',
        sortOrder: 0,
        isPrimary: input.isPrimary || true,
      }];

      await this.productService.updateProduct(input.productId, { media: testMedia });

      return this.responseHandler.createTrpcSuccess({ message: 'Test media added successfully' });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to add test media'
      );
    }
  }

  // @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware) // Temporarily commented for debugging
  @Query({
    input: z.object({ id: z.string() }),
    output: apiResponseSchema,
  })
  async detail(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const product = await this.productService.getProductById(input.id);
      return this.responseHandler.createTrpcSuccess(product);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Product not found'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ id: z.string() }),
    output: apiResponseSchema,
  })
  async variantDetail(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const variant = await this.productService.getVariantById(input.id);
      return this.responseHandler.createTrpcSuccess(variant);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Variant not found'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: createProductSchema,
    output: apiResponseSchema,
  })
  async create(
    @Input() input: z.infer<typeof createProductSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const { categoryId, categoryIds, ...restInput } = input;
      const normalizedCategoryIds = normalizeCategoryIdsInput(categoryIds, categoryId);
      const payload = {
        ...restInput,
        ...(normalizedCategoryIds !== undefined ? { categoryIds: normalizedCategoryIds } : {}),
      };

      const product = await this.productService.createProduct(payload);
      return this.responseHandler.createTrpcSuccess(product);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        1,  // OperationCode.CREATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to create product'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({
      fileName: z.string().optional(),
      fileData: z.string().min(1, 'File data is required'),
      overrideExisting: z.boolean().optional(),
      dryRun: z.boolean().optional(),
      defaultStatus: productStatusSchema.optional(),
      defaultIsActive: z.boolean().optional(),
    }),
    output: apiResponseSchema,
  })
  async importFromExcel(
    @Input()
    input: {
      fileName?: string;
      fileData: string;
      overrideExisting?: boolean;
      dryRun?: boolean;
      defaultStatus?: ProductStatus;
      defaultIsActive?: boolean;
    },
    @Ctx() ctx: AuthenticatedContext,
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const result = await this.productService.importProductsFromExcel({
        fileName: input.fileName || 'products-import.xlsx',
        fileData: input.fileData,
        overrideExisting: input.overrideExisting,
        dryRun: input.dryRun,
        defaultStatus: input.defaultStatus,
        defaultIsActive: input.defaultIsActive,
        actorId: ctx?.user?.id || null,
      });

      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        1,  // OperationCode.CREATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to import products from Excel'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({}),
    output: z.object({
      data: z.string(), // base64 encoded file
      filename: z.string(),
      mimeType: z.string(),
    }),
  })
  async downloadExcelTemplate(
    @Input() input: {},
    @Ctx() ctx: AuthenticatedContext,
  ): Promise<{ data: string; filename: string; mimeType: string }> {
    try {
      const buffer = await this.productService.generateExcelTemplate();
      const base64Data = buffer.toString('base64');
      const filename = `product-import-template-${new Date().toISOString().split('T')[0]}.xlsx`;

      return {
        data: base64Data,
        filename,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        4,  // OperationCode.READ (assuming 4 for read operations)
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to generate Excel template'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware) // Temporarily commented for debugging
  @Mutation({
    input: z.object({ id: z.string() }).merge(updateProductSchema),
    output: apiResponseSchema,
  })
  async update(
    @Input() input: { id: string } & z.infer<typeof updateProductSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const { id, categoryId, categoryIds, ...restInput } = input;
      const normalizedCategoryIds = normalizeCategoryIdsInput(categoryIds, categoryId);
      const updateDto = {
        ...restInput,
        ...(normalizedCategoryIds !== undefined ? { categoryIds: normalizedCategoryIds } : {}),
      };

      const product = await this.productService.updateProduct(id, updateDto);
      return this.responseHandler.createTrpcSuccess(product);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to update product'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string() }).merge(updateProductVariantSchema),
    output: apiResponseSchema,
  })
  async updateVariant(
    @Input() input: { id: string } & z.infer<typeof updateProductVariantSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const { id, variantItems, ...restInput } = input;

      const normalizedVariantItems: UpdateProductVariantDto['variantItems'] |
        undefined = variantItems?.map(({ attributeId, attributeValueId, sortOrder }) => ({
          attributeId,
          attributeValueId,
          ...(sortOrder !== undefined ? { sortOrder } : {}),
        }));

      const updateData: UpdateProductVariantDto = {
        ...restInput,
        ...(normalizedVariantItems !== undefined ? { variantItems: normalizedVariantItems } : {}),
      };

      const variant = await this.productService.updateVariant(id, updateData);
      return this.responseHandler.createTrpcSuccess(variant);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to update product variant'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string() }),
    output: apiResponseSchema,
  })
  async delete(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      await this.productService.deleteProduct(input.id);
      return this.responseHandler.createTrpcResponse(
        200,
        'OK',
        { deleted: true }
      );
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        4,  // OperationCode.DELETE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to delete product'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async stats(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const stats = await this.productService.getProductStats();
      return this.responseHandler.createTrpcSuccess(stats);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve product statistics'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({
      id: z.string(),
      isActive: z.boolean(),
    }),
    output: apiResponseSchema,
  })
  async updateStatus(
    @Input() input: { id: string; isActive: boolean }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const product = await this.productService.updateProductStatus(input.id, input.isActive);
      return this.responseHandler.createTrpcSuccess(product);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to update product status'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({
      ids: z.array(z.string()).min(1),
      action: z.enum(['activate', 'deactivate', 'delete']),
    }),
    output: apiResponseSchema,
  })
  async bulkAction(
    @Input() input: { ids: string[]; action: 'activate' | 'deactivate' | 'delete' }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      let result: { updated?: number; deleted?: number };

      switch (input.action) {
        case 'activate':
          result = await this.productService.bulkUpdateStatus(input.ids, ProductStatus.ACTIVE);
          break;
        case 'deactivate':
          result = await this.productService.bulkUpdateStatus(input.ids, ProductStatus.INACTIVE);
          break;
        case 'delete':
          result = await this.productService.bulkDelete(input.ids);
          break;
        default:
          throw new Error('Unsupported bulk action');
      }

      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15,
        input.action === 'delete' ? 4 : 3,
        30,
        error.message || 'Failed to perform bulk action on products'
      );
    }
  }
}
