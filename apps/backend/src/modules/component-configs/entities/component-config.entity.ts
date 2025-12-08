import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { SoftDeletableEntity } from '@shared';
import { ComponentStructureType, ComponentCategory } from '@shared/enums/component.enums';

@Entity('component_configs')
@Index('IDX_component_configs_parent_id', ['parentId'])
@Index('IDX_component_configs_category', ['category'])
@Index('IDX_component_configs_component_type', ['componentType'])
@Index('IDX_component_configs_is_enabled', ['isEnabled'])
export class ComponentConfigEntity extends SoftDeletableEntity {
  @Column({
    name: 'component_key',
    type: 'varchar',
    length: 150,
    unique: true,
  })
  componentKey!: string;

  @Column({
    name: 'display_name',
    type: 'varchar',
    length: 255,
  })
  displayName!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string | null;

  @Column({
    name: 'component_type',
    type: 'enum',
    enum: ComponentStructureType,
  })
  componentType!: ComponentStructureType;

  @Column({
    type: 'enum',
    enum: ComponentCategory,
    default: ComponentCategory.PRODUCT,
  })
  category!: ComponentCategory;

  @Column({
    type: 'int',
    default: 0,
  })
  position!: number;

  @Column({
    name: 'is_enabled',
    type: 'boolean',
    default: true,
  })
  isEnabled!: boolean;

  @Column({
    name: 'default_config',
    type: 'jsonb',
    default: () => "'{}'::jsonb",
  })
  defaultConfig!: Record<string, unknown>;

  @Column({
    name: 'config_schema',
    type: 'jsonb',
    default: () => "'{}'::jsonb",
  })
  configSchema!: Record<string, unknown>;

  @Column({
    type: 'jsonb',
    default: () => "'{}'::jsonb",
  })
  metadata!: Record<string, unknown>;

  @Column({
    name: 'allowed_child_keys',
    type: 'jsonb',
    default: () => "'[]'::jsonb",
  })
  allowedChildKeys!: string[];

  @Column({
    name: 'preview_media_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  previewMediaUrl?: string | null;

  @Column({
    name: 'slot_key',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  slotKey?: string | null;

  @Column({
    name: 'parent_id',
    type: 'uuid',
    nullable: true,
  })
  parentId?: string | null;

  @ManyToOne(() => ComponentConfigEntity, (component) => component.children, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parent_id' })
  parent?: ComponentConfigEntity | null;

  @OneToMany(() => ComponentConfigEntity, (component) => component.parent)
  children?: ComponentConfigEntity[];
}
