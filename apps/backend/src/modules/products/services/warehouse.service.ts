import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { WarehouseRepository } from '../repositories/warehouse.repository';
import { InventoryItemRepository } from '../repositories/inventory-item.repository';
import { StockMovementRepository } from '../repositories/stock-movement.repository';
import { Warehouse, InventoryItem, StockMovement, MovementType, MovementReason } from '../entities';

interface CreateWarehouseDto {
  name: string;
  code: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  managerName?: string;
  isDefault?: boolean;
}

interface UpdateWarehouseDto extends Partial<CreateWarehouseDto> {
  isActive?: boolean;
  sortOrder?: number;
}

interface AdjustStockDto {
  inventoryItemId: string;
  newQuantity: number;
  reason: MovementReason;
  notes?: string;
  userId?: string;
}

@Injectable()
export class WarehouseService {
  constructor(
    private readonly warehouseRepository: WarehouseRepository,
    private readonly inventoryRepository: InventoryItemRepository,
    private readonly stockMovementRepository: StockMovementRepository,
  ) {}

  async createWarehouse(createDto: CreateWarehouseDto): Promise<Warehouse> {
    // Check if code already exists
    const existingWarehouse = await this.warehouseRepository.findByCode(createDto.code);
    if (existingWarehouse) {
      throw new BadRequestException('Warehouse with this code already exists');
    }

    // If this is set as default, unset other defaults
    if (createDto.isDefault) {
      await this.unsetDefaultWarehouses();
    }

    const warehouse = this.warehouseRepository.create(createDto);
    return this.warehouseRepository.save(warehouse);
  }

  async updateWarehouse(id: string, updateDto: UpdateWarehouseDto): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findById(id);
    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    // Check if code already exists (excluding current warehouse)
    if (updateDto.code && updateDto.code !== warehouse.code) {
      const existingWarehouse = await this.warehouseRepository.findByCode(updateDto.code);
      if (existingWarehouse && existingWarehouse.id !== id) {
        throw new BadRequestException('Warehouse with this code already exists');
      }
    }

    // If this is set as default, unset other defaults
    if (updateDto.isDefault) {
      await this.unsetDefaultWarehouses();
    }

    Object.assign(warehouse, updateDto);
    return this.warehouseRepository.save(warehouse);
  }

  async deleteWarehouse(id: string): Promise<void> {
    const warehouse = await this.warehouseRepository.findById(id);
    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    // Check if warehouse has inventory
    const inventoryCount = await this.inventoryRepository.count({
      where: { warehouseId: id },
    });

    if (inventoryCount > 0) {
      throw new BadRequestException('Cannot delete warehouse with existing inventory');
    }

    await this.warehouseRepository.delete(id);
  }

  async getWarehouse(id: string): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findWithStats(id);
    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }
    return warehouse;
  }

  async getAllWarehouses(): Promise<Warehouse[]> {
    return this.warehouseRepository.findActiveWarehouses();
  }

  async getWarehouseStats(id: string) {
    const warehouse = await this.warehouseRepository.findById(id);
    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    const stats = await this.warehouseRepository.getWarehouseStats(id);
    const lowStockItems = await this.inventoryRepository.findLowStockItems(id);
    const outOfStockItems = await this.inventoryRepository.findOutOfStockItems(id);
    const expiredItems = await this.inventoryRepository.findExpiredItems(id);
    const expiringSoonItems = await this.inventoryRepository.findExpiringSoonItems(id);

    return {
      ...stats,
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
      expiredCount: expiredItems.length,
      expiringSoonCount: expiringSoonItems.length,
    };
  }

  async getInventoryItems(warehouseId: string): Promise<InventoryItem[]> {
    const warehouse = await this.warehouseRepository.findById(warehouseId);
    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    return this.inventoryRepository.findByWarehouse(warehouseId);
  }

  async adjustStock(adjustDto: AdjustStockDto): Promise<InventoryItem> {
    const inventoryItem = await this.inventoryRepository.findById(adjustDto.inventoryItemId);
    if (!inventoryItem) {
      throw new NotFoundException('Inventory item not found');
    }

    const previousQuantity = inventoryItem.quantity;
    const quantityDifference = adjustDto.newQuantity - previousQuantity;

    // Update inventory quantity
    inventoryItem.quantity = adjustDto.newQuantity;
    const updatedInventory = await this.inventoryRepository.save(inventoryItem);

    // Create stock movement record
    const movementType = quantityDifference > 0 ? MovementType.IN : MovementType.OUT;

    const stockMovement = this.stockMovementRepository.create({
      inventoryItemId: inventoryItem.id,
      warehouseId: inventoryItem.warehouseId,
      locationId: inventoryItem.locationId,
      type: movementType,
      reason: adjustDto.reason,
      quantity: Math.abs(quantityDifference),
      previousQuantity,
      newQuantity: adjustDto.newQuantity,
      notes: adjustDto.notes,
      userId: adjustDto.userId,
      movementDate: new Date(),
    });

    await this.stockMovementRepository.save(stockMovement);

    return updatedInventory;
  }

  async getStockMovements(warehouseId: string, limit: number = 50): Promise<StockMovement[]> {
    const warehouse = await this.warehouseRepository.findById(warehouseId);
    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    return this.stockMovementRepository.findByWarehouse(warehouseId, limit);
  }

  async getLowStockItems(warehouseId?: string): Promise<InventoryItem[]> {
    return this.inventoryRepository.findLowStockItems(warehouseId);
  }

  async getOutOfStockItems(warehouseId?: string): Promise<InventoryItem[]> {
    return this.inventoryRepository.findOutOfStockItems(warehouseId);
  }

  async getExpiredItems(warehouseId?: string): Promise<InventoryItem[]> {
    return this.inventoryRepository.findExpiredItems(warehouseId);
  }

  async getExpiringSoonItems(warehouseId?: string, days: number = 30): Promise<InventoryItem[]> {
    return this.inventoryRepository.findExpiringSoonItems(warehouseId, days);
  }

  private async unsetDefaultWarehouses(): Promise<void> {
    await this.warehouseRepository.updateMultiple(
      { isDefault: true },
      { isDefault: false },
    );
  }
}