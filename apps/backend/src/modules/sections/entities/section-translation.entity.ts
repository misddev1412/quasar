import { Column, Entity, Index, ManyToOne, Unique, JoinColumn } from 'typeorm';
import { BaseEntity } from '@shared';
import { SectionEntity } from './section.entity';

@Entity('section_translations')
@Unique(['sectionId', 'locale'])
@Index(['locale'])
export class SectionTranslationEntity extends BaseEntity {
  @Column({
    name: 'section_id',
    type: 'uuid',
  })
  sectionId!: string;

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
  title?: string | null;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  subtitle?: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string | null;

  @Column({
    name: 'hero_description',
    type: 'text',
    nullable: true,
  })
  heroDescription?: string | null;

  @Column({
    name: 'config_override',
    type: 'jsonb',
    nullable: true,
  })
  configOverride?: Record<string, any> | null;

  @ManyToOne(() => SectionEntity, (section) => section.translations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'section_id' })
  section!: SectionEntity;
}
