import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { InventoryItem } from './inventory-item.entity';
import { Warehouse } from './warehouse.entity';
import { WarehouseLocation } from './warehouse-location.entity';

export enum MovementType {
  IN = 'IN',
  OUT = 'OUT',
  TRANSFER = 'TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN = 'RETURN',
  DAMAGED = 'DAMAGED',
  EXPIRED = 'EXPIRED',
}

export enum MovementReason {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  TRANSFER = 'TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN = 'RETURN',
  DAMAGED = 'DAMAGED',
  EXPIRED = 'EXPIRED',
  INITIAL_STOCK = 'INITIAL_STOCK',
}

@Entity('stock_movements')
export class StockMovement extends BaseEntity {
  @Expose()
  @Column({
    name: 'inventory_item_id',
    type: 'uuid',
  })
  inventoryItemId: string;

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
    type: 'enum',
    enum: MovementType,
  })
  type: MovementType;

  @Expose()
  @Column({
    type: 'enum',
    enum: MovementReason,
  })
  reason: MovementReason;

  @Expose()
  @Column({
    type: 'int',
  })
  quantity: number;

  @Expose()
  @Column({
    name: 'unit_cost',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  unitCost?: number;

  @Expose()
  @Column({
    name: 'reference_id',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  referenceId?: string;

  @Expose()
  @Column({
    name: 'reference_type',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  referenceType?: string;

  @Expose()
  @Column({
    type: 'text',
    nullable: true,
  })
  notes?: string;

  @Expose()
  @Column({
    name: 'user_id',
    type: 'uuid',
    nullable: true,
  })
  userId?: string;

  @Expose()
  @Column({
    name: 'movement_date',
    type: 'timestamp',
    default: 'CURRENT_TIMESTAMP',
  })
  movementDate: Date;

  @Expose()
  @Column({
    name: 'previous_quantity',
    type: 'int',
    nullable: true,
  })
  previousQuantity?: number;

  @Expose()
  @Column({
    name: 'new_quantity',
    type: 'int',
    nullable: true,
  })
  newQuantity?: number;

  // Relations
  @ManyToOne(() => InventoryItem, (inventory) => inventory.stockMovements)
  @JoinColumn({ name: 'inventory_item_id' })
  inventoryItem: InventoryItem;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.stockMovements)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @ManyToOne(() => WarehouseLocation, { nullable: true })
  @JoinColumn({ name: 'location_id' })
  location?: WarehouseLocation;

  // Virtual properties
  get isInbound(): boolean {
    return [MovementType.IN, MovementType.RETURN].includes(this.type);
  }

  get isOutbound(): boolean {
    return [MovementType.OUT, MovementType.DAMAGED, MovementType.EXPIRED].includes(this.type);
  }

  get totalValue(): number {
    return this.quantity * (this.unitCost || 0);
  }

  get quantityChange(): number {
    if (this.previousQuantity !== null && this.newQuantity !== null) {
      return this.newQuantity - this.previousQuantity;
    }
    return this.isInbound ? this.quantity : -this.quantity;
  }
}