import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PurchaseOrderItem } from '@backend/modules/products/entities/purchase-order-item.entity';

@Injectable()
export class PurchaseOrderItemRepository extends Repository<PurchaseOrderItem> {
    constructor(private dataSource: DataSource) {
        super(PurchaseOrderItem, dataSource.createEntityManager());
    }

    async findByPurchaseOrder(purchaseOrderId: string): Promise<PurchaseOrderItem[]> {
        return this.find({
            where: { purchaseOrderId },
            order: { sortOrder: 'ASC' },
        });
    }
}
