import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { Product } from './product.entity';
import { Warehouse } from './warehouse.entity';

@Entity('product_warehouse_quantities')
@Index(['productId', 'warehouseId'], { unique: true })
export class ProductWarehouseQuantity extends BaseEntity {
  @Expose()
  @Column({
    name: 'product_id',
    type: 'uuid',
  })
  productId: string;

  @Expose()
  @Column({
    name: 'warehouse_id',
    type: 'uuid',
  })
  warehouseId: string;

  @Expose()
  @Column({
    name: 'quantity',
    type: 'int',
    default: 0,
  })
  quantity: number;

  @Expose()
  @Column({
    name: 'reserved_quantity',
    type: 'int',
    default: 0,
  })
  reservedQuantity: number;

  // Relations
  @ManyToOne(() => Product, (product) => product.warehouseQuantities)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.productQuantities)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  // Computed property
  get availableQuantity(): number {
    return this.quantity - this.reservedQuantity;
  }
}
