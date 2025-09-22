import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { Warehouse } from './warehouse.entity';
import { InventoryItem } from './inventory-item.entity';

export enum LocationType {
  ZONE = 'ZONE',
  AISLE = 'AISLE',
  SHELF = 'SHELF',
  BIN = 'BIN',
}

@Entity('warehouse_locations')
export class WarehouseLocation extends BaseEntity {
  @Expose()
  @Column({
    name: 'warehouse_id',
    type: 'uuid',
  })
  warehouseId: string;

  @Expose()
  @Column({
    type: 'varchar',
    length: 255,
  })
  name: string;

  @Expose()
  @Column({
    type: 'varchar',
    length: 100,
  })
  code: string;

  @Expose()
  @Column({
    type: 'enum',
    enum: LocationType,
    default: LocationType.SHELF,
  })
  type: LocationType;

  @Expose()
  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

  @Expose()
  @Column({
    name: 'parent_location_id',
    type: 'uuid',
    nullable: true,
  })
  parentLocationId?: string;

  @Expose()
  @Column({
    name: 'max_capacity',
    type: 'int',
    nullable: true,
  })
  maxCapacity?: number;

  @Expose()
  @Column({
    name: 'current_capacity',
    type: 'int',
    default: 0,
  })
  currentCapacity: number;

  @Expose()
  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @Expose()
  @Column({
    name: 'sort_order',
    type: 'int',
    default: 0,
  })
  sortOrder: number;

  // Relations
  @ManyToOne(() => Warehouse, (warehouse) => warehouse.locations)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @ManyToOne(() => WarehouseLocation, (location) => location.childLocations, { nullable: true })
  @JoinColumn({ name: 'parent_location_id' })
  parentLocation?: WarehouseLocation;

  @OneToMany(() => WarehouseLocation, (location) => location.parentLocation)
  childLocations: WarehouseLocation[];

  @OneToMany(() => InventoryItem, (inventory) => inventory.location)
  inventoryItems: InventoryItem[];

  // Virtual properties
  get isAtCapacity(): boolean {
    if (!this.maxCapacity) return false;
    return this.currentCapacity >= this.maxCapacity;
  }

  get capacityPercentage(): number {
    if (!this.maxCapacity) return 0;
    return Math.round((this.currentCapacity / this.maxCapacity) * 100);
  }

  get fullPath(): string {
    return this.parentLocation ? `${this.parentLocation.code}/${this.code}` : this.code;
  }

  get itemCount(): number {
    return this.inventoryItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  }
}