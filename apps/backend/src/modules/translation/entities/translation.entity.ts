import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '@shared';

@Entity('translations')
@Index(['key', 'locale'], { unique: true })
export class Translation extends BaseEntity {
  @Column()
  key: string;

  @Column({ length: 5 })
  locale: string;

  @Column('text')
  value: string;

  @Column({ nullable: true })
  namespace?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
} 