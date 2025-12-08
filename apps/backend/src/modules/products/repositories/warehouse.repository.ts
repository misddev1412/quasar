import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { BaseRepository } from '@shared';
import { Warehouse } from '../entities';

@Injectable()
export class WarehouseRepository extends BaseRepository<Warehouse> {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
  ) {
    super(warehouseRepository);
  }

  async findByCode(code: string): Promise<Warehouse | null> {
    return this.warehouseRepository.findOne({
      where: { code } as FindOptionsWhere<Warehouse>,
    });
  }

  async findDefaultWarehouse(): Promise<Warehouse | null> {
    return this.warehouseRepository.findOne({
      where: { isDefault: true, isActive: true } as FindOptionsWhere<Warehouse>,
    });
  }

  async findActiveWarehouses(): Promise<Warehouse[]> {
    return this.warehouseRepository.find({
      where: { isActive: true } as FindOptionsWhere<Warehouse>,
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findWithStats(id: string): Promise<Warehouse | null> {
    return this.warehouseRepository
      .createQueryBuilder('warehouse')
      .leftJoinAndSelect('warehouse.locations', 'locations')
      .leftJoinAndSelect('warehouse.inventoryItems', 'inventoryItems')
      .where('warehouse.id = :id', { id })
      .getOne();
  }

  async getWarehouseStats(warehouseId: string) {
    const result = await this.warehouseRepository
      .createQueryBuilder('warehouse')
      .leftJoin('warehouse.inventoryItems', 'inventory')
      .leftJoin('warehouse.locations', 'locations')
      .select([
        'warehouse.id',
        'warehouse.name',
        'COUNT(DISTINCT locations.id) as locationCount',
        'COUNT(DISTINCT inventory.id) as inventoryItemCount',
        'COALESCE(SUM(inventory.quantity), 0) as totalItems',
        'COALESCE(SUM(inventory.quantity * inventory.unitCost), 0) as totalValue',
      ])
      .where('warehouse.id = :warehouseId', { warehouseId })
      .groupBy('warehouse.id, warehouse.name')
      .getRawOne();

    return {
      locationCount: parseInt(result?.locationCount || '0'),
      inventoryItemCount: parseInt(result?.inventoryItemCount || '0'),
      totalItems: parseInt(result?.totalItems || '0'),
      totalValue: parseFloat(result?.totalValue || '0'),
    };
  }
}