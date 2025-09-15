import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '@shared';
import { Attribute } from './attribute.entity';

@Entity('attribute_translations')
@Index(['attribute_id', 'locale'], { unique: true })
@Index(['locale'])
@Index(['attribute_id'])
export class AttributeTranslation extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  attribute_id: string;

  @Column({ length: 5 })
  locale: string;

  @Column({ name: 'display_name', length: 255 })
  displayName: string;

  // Relations
  @ManyToOne(() => Attribute, (attribute) => attribute.translations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'attribute_id' })
  attribute: Attribute;
}