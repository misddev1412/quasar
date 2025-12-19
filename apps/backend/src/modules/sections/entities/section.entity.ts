import { Column, Entity, OneToMany, Index, ManyToMany } from 'typeorm';
import { SoftDeletableEntity } from '@shared';
import { SectionType } from '@shared/enums/section.enums';
import { SectionTranslationEntity } from './section-translation.entity';
import { ComponentConfigEntity } from '../../component-configs/entities/component-config.entity';

@Entity('sections')
@Index(['page', 'position'])
export class SectionEntity extends SoftDeletableEntity {
  @Column({
    type: 'varchar',
    length: 100,
  })
  page!: string;

  @Column({
    type: 'enum',
    enum: SectionType,
  })
  type!: SectionType;

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
    type: 'jsonb',
    default: () => "'{}'::jsonb",
  })
  config!: Record<string, any>;

  @OneToMany(() => SectionTranslationEntity, (translation) => translation.section, {
    cascade: ['insert', 'update'],
  })
  translations!: SectionTranslationEntity[];

  @ManyToMany(() => ComponentConfigEntity, (component) => component.sections)
  components?: ComponentConfigEntity[];
}
