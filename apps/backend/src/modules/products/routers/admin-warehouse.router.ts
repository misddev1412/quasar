import { Injectable, Inject } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { WarehouseService } from '../services/warehouse.service';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { paginatedResponseSchema, apiResponseSchema } from '../../../trpc/schemas/response.schemas';

export const createWarehouseSchema = z.object({
  name: z.string().min(1).max(255),
  code: z.string().min(1).max(100),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  managerName: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export const updateWarehouseSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  code: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  managerName: z.string().optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

export const adjustStockSchema = z.object({
  inventoryItemId: z.string().uuid(),
  newQuantity: z.number().min(0),
  reason: z.enum(['PURCHASE', 'SALE', 'TRANSFER', 'ADJUSTMENT', 'RETURN', 'DAMAGED', 'EXPIRED', 'INITIAL_STOCK']),
  notes: z.string().optional(),
});

@Router({ alias: 'adminWarehouses' })
@Injectable()
export class AdminWarehousesRouter {
  constructor(
    @Inject(WarehouseService)
    private readonly warehouseService: WarehouseService,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async getAll(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const warehouses = await this.warehouseService.getAllWarehouses();
      return this.responseHandler.createTrpcSuccess(warehouses);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve warehouses'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: createWarehouseSchema,
    output: apiResponseSchema,
  })
  async create(
    @Input() input: z.infer<typeof createWarehouseSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const warehouse = await this.warehouseService.createWarehouse(input as any);
      return this.responseHandler.createTrpcSuccess(warehouse);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        1,  // OperationCode.CREATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to create warehouse'
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
      const warehouse = await this.warehouseService.getWarehouse(input.id);
      return this.responseHandler.createTrpcSuccess(warehouse);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Warehouse not found'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string().uuid() }).merge(updateWarehouseSchema),
    output: apiResponseSchema,
  })
  async update(
    @Input() input: { id: string } & z.infer<typeof updateWarehouseSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const { id, ...updateData } = input;
      const warehouse = await this.warehouseService.updateWarehouse(id, updateData);
      return this.responseHandler.createTrpcSuccess(warehouse);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to update warehouse'
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
      await this.warehouseService.deleteWarehouse(input.id);
      return this.responseHandler.createTrpcSuccess({ deleted: true });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        4,  // OperationCode.DELETE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to delete warehouse'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async getStats(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const stats = await this.warehouseService.getWarehouseStats(input.id);
      return this.responseHandler.createTrpcSuccess(stats);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve warehouse statistics'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async getInventory(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const inventory = await this.warehouseService.getInventoryItems(input.id);
      return this.responseHandler.createTrpcSuccess(inventory);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve warehouse inventory'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: adjustStockSchema,
    output: apiResponseSchema,
  })
  async adjustStock(
    @Input() input: z.infer<typeof adjustStockSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const inventory = await this.warehouseService.adjustStock(input as any);
      return this.responseHandler.createTrpcSuccess(inventory);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to adjust stock'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({
      id: z.string().uuid(),
      limit: z.number().min(1).max(100).default(50).optional()
    }),
    output: apiResponseSchema,
  })
  async getMovements(
    @Input() input: { id: string; limit?: number }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const movements = await this.warehouseService.getStockMovements(input.id, input.limit || 50);
      return this.responseHandler.createTrpcSuccess(movements);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve stock movements'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async getLowStock(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const items = await this.warehouseService.getLowStockItems(input.id);
      return this.responseHandler.createTrpcSuccess(items);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve low stock items'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async getOutOfStock(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const items = await this.warehouseService.getOutOfStockItems(input.id);
      return this.responseHandler.createTrpcSuccess(items);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve out of stock items'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({
      id: z.string().uuid().optional(),
      days: z.number().min(1).max(365).default(30).optional()
    }),
    output: apiResponseSchema,
  })
  async getExpiringSoon(
    @Input() input: { id?: string; days?: number }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const items = await this.warehouseService.getExpiringSoonItems(input.id, input.days || 30);
      return this.responseHandler.createTrpcSuccess(items);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.PRODUCT
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve expiring items'
      );
    }
  }
}