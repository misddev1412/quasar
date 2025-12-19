import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { WarehouseLocation } from './warehouse-location.entity';
import { InventoryItem } from './inventory-item.entity';
import { StockMovement } from './stock-movement.entity';
import { ProductWarehouseQuantity } from './product-warehouse-quantity.entity';

@Entity('warehouses')
export class Warehouse extends BaseEntity {
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
    unique: true,
  })
  code: string;

  @Expose()
  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

  @Expose()
  @Column({
    type: 'text',
    nullable: true,
  })
  address?: string;

  @Expose()
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  city?: string;

  @Expose()
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  country?: string;

  @Expose()
  @Column({
    name: 'postal_code',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  postalCode?: string;

  @Expose()
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  phone?: string;

  @Expose()
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  email?: string;

  @Expose()
  @Column({
    name: 'manager_name',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  managerName?: string;

  @Expose()
  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @Expose()
  @Column({
    name: 'is_default',
    type: 'boolean',
    default: false,
  })
  isDefault: boolean;

  @Expose()
  @Column({
    name: 'sort_order',
    type: 'int',
    default: 0,
  })
  sortOrder: number;

  // Relations
  @OneToMany(() => WarehouseLocation, (location) => location.warehouse)
  locations: WarehouseLocation[];

  @OneToMany(() => InventoryItem, (inventory) => inventory.warehouse)
  inventoryItems: InventoryItem[];

  @OneToMany(() => StockMovement, (movement) => movement.warehouse)
  stockMovements: StockMovement[];

  @OneToMany(() => ProductWarehouseQuantity, (productQuantity) => productQuantity.warehouse)
  productQuantities: ProductWarehouseQuantity[];

  // Virtual properties
  get locationCount(): number {
    return this.locations?.length || 0;
  }

  get totalInventoryValue(): number {
    return this.inventoryItems?.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0) || 0;
  }

  get totalItems(): number {
    return this.inventoryItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  }
}