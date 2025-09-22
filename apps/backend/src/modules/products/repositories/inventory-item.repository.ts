import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { BaseRepository } from '@shared';
import { InventoryItem } from '../entities';

@Injectable()
export class InventoryItemRepository extends BaseRepository<InventoryItem> {
  constructor(
    @InjectRepository(InventoryItem)
    private readonly inventoryRepository: Repository<InventoryItem>,
  ) {
    super(inventoryRepository);
  }

  async findByVariantAndWarehouse(
    productVariantId: string,
    warehouseId: string,
  ): Promise<InventoryItem | null> {
    return this.inventoryRepository.findOne({
      where: {
        productVariantId,
        warehouseId,
      } as FindOptionsWhere<InventoryItem>,
      relations: ['productVariant', 'warehouse', 'location'],
    });
  }

  async findByWarehouse(warehouseId: string): Promise<InventoryItem[]> {
    return this.inventoryRepository.find({
      where: { warehouseId } as FindOptionsWhere<InventoryItem>,
      relations: ['productVariant', 'location'],
      order: { updatedAt: 'DESC' },
    });
  }

  async findLowStockItems(warehouseId?: string): Promise<InventoryItem[]> {
    const queryBuilder = this.inventoryRepository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.productVariant', 'variant')
      .leftJoinAndSelect('inventory.warehouse', 'warehouse')
      .leftJoinAndSelect('inventory.location', 'location')
      .where('inventory.isActive = :isActive', { isActive: true })
      .andWhere('inventory.lowStockThreshold IS NOT NULL')
      .andWhere('inventory.quantity <= inventory.lowStockThreshold');

    if (warehouseId) {
      queryBuilder.andWhere('inventory.warehouseId = :warehouseId', { warehouseId });
    }

    return queryBuilder.getMany();
  }

  async findOutOfStockItems(warehouseId?: string): Promise<InventoryItem[]> {
    const queryBuilder = this.inventoryRepository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.productVariant', 'variant')
      .leftJoinAndSelect('inventory.warehouse', 'warehouse')
      .leftJoinAndSelect('inventory.location', 'location')
      .where('inventory.isActive = :isActive', { isActive: true })
      .andWhere('inventory.quantity = 0');

    if (warehouseId) {
      queryBuilder.andWhere('inventory.warehouseId = :warehouseId', { warehouseId });
    }

    return queryBuilder.getMany();
  }

  async findExpiredItems(warehouseId?: string): Promise<InventoryItem[]> {
    const queryBuilder = this.inventoryRepository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.productVariant', 'variant')
      .leftJoinAndSelect('inventory.warehouse', 'warehouse')
      .leftJoinAndSelect('inventory.location', 'location')
      .where('inventory.isActive = :isActive', { isActive: true })
      .andWhere('inventory.expiryDate IS NOT NULL')
      .andWhere('inventory.expiryDate < :currentDate', { currentDate: new Date() });

    if (warehouseId) {
      queryBuilder.andWhere('inventory.warehouseId = :warehouseId', { warehouseId });
    }

    return queryBuilder.getMany();
  }

  async findExpiringSoonItems(warehouseId?: string, days: number = 30): Promise<InventoryItem[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const queryBuilder = this.inventoryRepository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.productVariant', 'variant')
      .leftJoinAndSelect('inventory.warehouse', 'warehouse')
      .leftJoinAndSelect('inventory.location', 'location')
      .where('inventory.isActive = :isActive', { isActive: true })
      .andWhere('inventory.expiryDate IS NOT NULL')
      .andWhere('inventory.expiryDate > :currentDate', { currentDate: new Date() })
      .andWhere('inventory.expiryDate <= :futureDate', { futureDate });

    if (warehouseId) {
      queryBuilder.andWhere('inventory.warehouseId = :warehouseId', { warehouseId });
    }

    return queryBuilder.getMany();
  }

  async getTotalStockByVariant(productVariantId: string): Promise<number> {
    const result = await this.inventoryRepository
      .createQueryBuilder('inventory')
      .select('SUM(inventory.quantity)', 'totalStock')
      .where('inventory.productVariantId = :productVariantId', { productVariantId })
      .andWhere('inventory.isActive = :isActive', { isActive: true })
      .getRawOne();

    return parseInt(result?.totalStock || '0');
  }

  async getInventoryValue(warehouseId?: string): Promise<number> {
    const queryBuilder = this.inventoryRepository
      .createQueryBuilder('inventory')
      .select('SUM(inventory.quantity * inventory.unitCost)', 'totalValue')
      .where('inventory.isActive = :isActive', { isActive: true });

    if (warehouseId) {
      queryBuilder.andWhere('inventory.warehouseId = :warehouseId', { warehouseId });
    }

    const result = await queryBuilder.getRawOne();
    return parseFloat(result?.totalValue || '0');
  }
}