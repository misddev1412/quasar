import { Column, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { SoftDeletableEntity } from '@shared';
import { ComponentStructureType, ComponentCategory } from '@shared/enums/component.enums';
import { SectionEntity } from '../../sections/entities/section.entity';

export type ComponentSidebarLinkType = 'custom' | 'category' | 'product' | 'brand';

export interface ComponentSidebarMenuItem {
  id: string;
  label: string;
  href?: string;
  description?: string;
  icon?: string;
  linkType?: ComponentSidebarLinkType;
  referenceId?: string;
}

export interface ComponentSidebarMenuSection {
  id: string;
  title?: string;
  description?: string;
  backgroundColor?: string;
  titleFontColor?: string;
  titleFontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  titleFontSize?: 'xs' | 'sm' | 'base' | 'lg';
  titleUppercase?: boolean;
  titleIcon?: string;
  items: ComponentSidebarMenuItem[];
}

export interface ComponentSidebarMenuConfig {
  enabled?: boolean;
  title?: string;
  description?: string;
  showTitle?: boolean;
  showDescription?: boolean;
  sections?: ComponentSidebarMenuSection[];
}

export interface ViewMoreButtonConfig {
  size?: 'sm' | 'md' | 'lg';
  weight?: 'thin' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
  backgroundColor?: string;
  textColor?: string;
}

export interface ComponentConfigDefaults extends Record<string, unknown> {
  sidebar?: ComponentSidebarMenuConfig;
  viewMoreButton?: ViewMoreButtonConfig;
}

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
  defaultConfig!: ComponentConfigDefaults;

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

  @ManyToMany(() => SectionEntity, (section) => section.components, {
    cascade: false,
  })
  @JoinTable({
    name: 'component_config_sections',
    joinColumn: { name: 'component_config_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'section_id', referencedColumnName: 'id' },
  })
  sections?: SectionEntity[];
}
