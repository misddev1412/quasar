import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { BaseRepository } from '@shared';
import { PurchaseOrder, PurchaseOrderStatus } from '../entities';

@Injectable()
export class PurchaseOrderRepository extends BaseRepository<PurchaseOrder> {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly purchaseOrderRepository: Repository<PurchaseOrder>,
  ) {
    super(purchaseOrderRepository);
  }

  async findByOrderNumber(orderNumber: string): Promise<PurchaseOrder | null> {
    return this.purchaseOrderRepository.findOne({
      where: { orderNumber } as FindOptionsWhere<PurchaseOrder>,
      relations: ['items', 'supplier', 'warehouse'],
    });
  }

  async findByStatus(status: PurchaseOrderStatus): Promise<PurchaseOrder[]> {
    return this.purchaseOrderRepository.find({
      where: { status } as FindOptionsWhere<PurchaseOrder>,
      relations: ['supplier', 'warehouse'],
      order: { orderDate: 'DESC' },
    });
  }

  async findBySupplier(supplierId: string): Promise<PurchaseOrder[]> {
    return this.purchaseOrderRepository.find({
      where: { supplierId } as FindOptionsWhere<PurchaseOrder>,
      relations: ['items', 'warehouse'],
      order: { orderDate: 'DESC' },
    });
  }

  async findByWarehouse(warehouseId: string): Promise<PurchaseOrder[]> {
    return this.purchaseOrderRepository.find({
      where: { warehouseId } as FindOptionsWhere<PurchaseOrder>,
      relations: ['items', 'supplier'],
      order: { orderDate: 'DESC' },
    });
  }

  async findOverdueOrders(): Promise<PurchaseOrder[]> {
    return this.purchaseOrderRepository
      .createQueryBuilder('po')
      .leftJoinAndSelect('po.supplier', 'supplier')
      .leftJoinAndSelect('po.warehouse', 'warehouse')
      .where('po.expectedDeliveryDate < :currentDate', { currentDate: new Date() })
      .andWhere('po.status IN (:...statuses)', {
        statuses: [PurchaseOrderStatus.ORDERED, PurchaseOrderStatus.PARTIALLY_RECEIVED],
      })
      .orderBy('po.expectedDeliveryDate', 'ASC')
      .getMany();
  }

  async findPendingReceiving(): Promise<PurchaseOrder[]> {
    return this.purchaseOrderRepository.find({
      where: {
        status: PurchaseOrderStatus.ORDERED,
      } as FindOptionsWhere<PurchaseOrder>,
      relations: ['items', 'supplier', 'warehouse'],
      order: { expectedDeliveryDate: 'ASC' },
    });
  }

  async getOrderStats(warehouseId?: string) {
    const queryBuilder = this.purchaseOrderRepository
      .createQueryBuilder('po')
      .select([
        'po.status as status',
        'COUNT(*) as count',
        'SUM(po.totalAmount) as totalAmount',
      ]);

    if (warehouseId) {
      queryBuilder.where('po.warehouseId = :warehouseId', { warehouseId });
    }

    const results = await queryBuilder
      .groupBy('po.status')
      .getRawMany();

    return results.reduce((acc, result) => {
      acc[result.status] = {
        count: parseInt(result.count),
        totalAmount: parseFloat(result.totalAmount || '0'),
      };
      return acc;
    }, {});
  }

  async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');

    const latestOrder = await this.purchaseOrderRepository
      .createQueryBuilder('po')
      .where('po.orderNumber LIKE :pattern', { pattern: `PO-${year}${month}%` })
      .orderBy('po.orderNumber', 'DESC')
      .getOne();

    let nextNumber = 1;
    if (latestOrder) {
      const lastNumber = latestOrder.orderNumber.split('-')[1];
      const yearMonth = lastNumber.substring(0, 6);
      if (yearMonth === `${year}${month}`) {
        nextNumber = parseInt(lastNumber.substring(6)) + 1;
      }
    }

    return `PO-${year}${month}${String(nextNumber).padStart(4, '0')}`;
  }
}