import { Column, Entity, ManyToOne, Index, JoinColumn } from 'typeorm';
import { BaseEntity } from '@shared';
import { MenuEntity } from './menu.entity';

@Entity('menu_translations')
@Index(['menuId', 'locale'], { unique: true })
export class MenuTranslationEntity extends BaseEntity {
  @Column({
    name: 'menu_id',
    type: 'uuid',
  })
  menuId!: string;

  @Column({
    type: 'varchar',
    length: 10,
  })
  locale!: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  label?: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string | null;

  @Column({
    name: 'custom_html',
    type: 'text',
    nullable: true,
  })
  customHtml?: string | null;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  config?: Record<string, unknown> | null;

  @ManyToOne(() => MenuEntity, (menu) => menu.translations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'menu_id' })
  menu!: MenuEntity;
}