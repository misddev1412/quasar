import { Column, Entity, OneToMany, Index, Tree, TreeParent, TreeChildren, JoinColumn } from 'typeorm';
import { SoftDeletableEntity } from '@shared';
import { MenuType, MenuTarget } from '@shared/enums/menu.enums';
import { MenuTranslationEntity } from './menu-translation.entity';

@Entity('menus')
@Index(['menuGroup', 'position'])
@Tree('closure-table')
export class MenuEntity extends SoftDeletableEntity {
  @Column({
    name: 'menu_group',
    type: 'varchar',
    length: 100,
  })
  menuGroup!: string;

  @Column({
    type: 'enum',
    enum: MenuType,
  })
  type!: MenuType;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  url?: string | null;

  @Column({
    name: 'reference_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  referenceId?: string | null;

  @Column({
    type: 'enum',
    enum: MenuTarget,
    default: MenuTarget.SELF,
  })
  target!: MenuTarget;

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
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  icon?: string | null;

  @Column({
    name: 'text_color',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  textColor?: string | null;

  @Column({
    name: 'background_color',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  backgroundColor?: string | null;

  @Column({
    name: 'border_color',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  borderColor?: string | null;

  @Column({
    name: 'border_width',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  borderWidth?: string | null;

  @Column({
    type: 'jsonb',
    default: () => "'{}'::jsonb",
  })
  config!: Record<string, any>;

  @Column({
    name: 'is_mega_menu',
    type: 'boolean',
    default: false,
  })
  isMegaMenu!: boolean;

  @Column({
    name: 'mega_menu_columns',
    type: 'int',
    nullable: true,
  })
  megaMenuColumns?: number | null;

  @Column({
    name: 'parent_id',
    type: 'uuid',
    nullable: true,
  })
  parentId?: string | null;

  @TreeParent()
  @JoinColumn({ name: 'parent_id' })
  parent?: MenuEntity | null;

  @TreeChildren()
  children!: MenuEntity[];

  @OneToMany(() => MenuTranslationEntity, (translation) => translation.menu, {
    cascade: ['insert', 'update'],
  })
  translations!: MenuTranslationEntity[];
}
