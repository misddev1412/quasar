import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { ProductVariant } from './product-variant.entity';
import { Warehouse } from './warehouse.entity';
import { WarehouseLocation } from './warehouse-location.entity';
import { StockMovement } from './stock-movement.entity';

@Entity('inventory_items')
export class InventoryItem extends BaseEntity {
  @Expose()
  @Column({
    name: 'product_variant_id',
    type: 'uuid',
  })
  productVariantId: string;

  @Expose()
  @Column({
    name: 'warehouse_id',
    type: 'uuid',
  })
  warehouseId: string;

  @Expose()
  @Column({
    name: 'location_id',
    type: 'uuid',
    nullable: true,
  })
  locationId?: string;

  @Expose()
  @Column({
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

  @Expose()
  @Column({
    name: 'unit_cost',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  unitCost: number;

  @Expose()
  @Column({
    name: 'last_restocked_at',
    type: 'timestamp',
    nullable: true,
  })
  lastRestockedAt?: Date;

  @Expose()
  @Column({
    name: 'low_stock_threshold',
    type: 'int',
    nullable: true,
  })
  lowStockThreshold?: number;

  @Expose()
  @Column({
    name: 'batch_number',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  batchNumber?: string;

  @Expose()
  @Column({
    name: 'expiry_date',
    type: 'date',
    nullable: true,
  })
  expiryDate?: Date;

  @Expose()
  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  // Relations
  @ManyToOne(() => ProductVariant, { lazy: true })
  @JoinColumn({ name: 'product_variant_id' })
  productVariant: Promise<ProductVariant>;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.inventoryItems)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @ManyToOne(() => WarehouseLocation, (location) => location.inventoryItems, { nullable: true })
  @JoinColumn({ name: 'location_id' })
  location?: WarehouseLocation;

  @OneToMany(() => StockMovement, (movement) => movement.inventoryItem)
  stockMovements: StockMovement[];

  // Virtual properties
  get availableQuantity(): number {
    return this.quantity - this.reservedQuantity;
  }

  get isInStock(): boolean {
    return this.availableQuantity > 0;
  }

  get isLowStock(): boolean {
    if (!this.lowStockThreshold) return false;
    return this.quantity <= this.lowStockThreshold;
  }

  get isOutOfStock(): boolean {
    return this.quantity === 0;
  }

  get totalValue(): number {
    return this.quantity * this.unitCost;
  }

  get isExpired(): boolean {
    if (!this.expiryDate) return false;
    return new Date() > this.expiryDate;
  }

  get isExpiringSoon(): boolean {
    if (!this.expiryDate) return false;
    const daysUntilExpiry = Math.ceil((this.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }

  get stockStatus(): 'OUT_OF_STOCK' | 'LOW_STOCK' | 'IN_STOCK' | 'EXPIRED' {
    if (this.isExpired) return 'EXPIRED';
    if (this.isOutOfStock) return 'OUT_OF_STOCK';
    if (this.isLowStock) return 'LOW_STOCK';
    return 'IN_STOCK';
  }
}