import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { BaseRepository } from '@shared';
import { StockMovement, MovementType, MovementReason } from '../entities';

@Injectable()
export class StockMovementRepository extends BaseRepository<StockMovement> {
  constructor(
    @InjectRepository(StockMovement)
    private readonly stockMovementRepository: Repository<StockMovement>,
  ) {
    super(stockMovementRepository);
  }

  async findByInventoryItem(inventoryItemId: string, limit: number = 50): Promise<StockMovement[]> {
    return this.stockMovementRepository.find({
      where: { inventoryItemId } as FindOptionsWhere<StockMovement>,
      relations: ['warehouse', 'location'],
      order: { movementDate: 'DESC' },
      take: limit,
    });
  }

  async findByWarehouse(warehouseId: string, limit: number = 50): Promise<StockMovement[]> {
    return this.stockMovementRepository.find({
      where: { warehouseId } as FindOptionsWhere<StockMovement>,
      relations: ['inventoryItem', 'location'],
      order: { movementDate: 'DESC' },
      take: limit,
    });
  }

  async findByType(type: MovementType, warehouseId?: string): Promise<StockMovement[]> {
    const where: FindOptionsWhere<StockMovement> = { type };
    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    return this.stockMovementRepository.find({
      where,
      relations: ['inventoryItem', 'warehouse', 'location'],
      order: { movementDate: 'DESC' },
    });
  }

  async findByReason(reason: MovementReason, warehouseId?: string): Promise<StockMovement[]> {
    const where: FindOptionsWhere<StockMovement> = { reason };
    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    return this.stockMovementRepository.find({
      where,
      relations: ['inventoryItem', 'warehouse', 'location'],
      order: { movementDate: 'DESC' },
    });
  }

  async findByReference(referenceType: string, referenceId: string): Promise<StockMovement[]> {
    return this.stockMovementRepository.find({
      where: {
        referenceType,
        referenceId,
      } as FindOptionsWhere<StockMovement>,
      relations: ['inventoryItem', 'warehouse', 'location'],
      order: { movementDate: 'DESC' },
    });
  }

  async getMovementsSummary(
    warehouseId?: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    const queryBuilder = this.stockMovementRepository
      .createQueryBuilder('movement')
      .select([
        'movement.type as type',
        'movement.reason as reason',
        'COUNT(*) as count',
        'SUM(movement.quantity) as totalQuantity',
        'SUM(movement.quantity * COALESCE(movement.unitCost, 0)) as totalValue',
      ]);

    if (warehouseId) {
      queryBuilder.where('movement.warehouseId = :warehouseId', { warehouseId });
    }

    if (startDate) {
      queryBuilder.andWhere('movement.movementDate >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('movement.movementDate <= :endDate', { endDate });
    }

    return queryBuilder
      .groupBy('movement.type, movement.reason')
      .getRawMany();
  }

  async getDailyMovements(
    warehouseId?: string,
    days: number = 30,
  ) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const queryBuilder = this.stockMovementRepository
      .createQueryBuilder('movement')
      .select([
        'DATE(movement.movementDate) as date',
        'movement.type as type',
        'COUNT(*) as count',
        'SUM(movement.quantity) as totalQuantity',
      ])
      .where('movement.movementDate >= :startDate', { startDate });

    if (warehouseId) {
      queryBuilder.andWhere('movement.warehouseId = :warehouseId', { warehouseId });
    }

    return queryBuilder
      .groupBy('DATE(movement.movementDate), movement.type')
      .orderBy('DATE(movement.movementDate)', 'DESC')
      .getRawMany();
  }
}