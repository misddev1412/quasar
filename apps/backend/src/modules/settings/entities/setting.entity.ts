import { Column, Entity, Index } from 'typeorm';
import { SoftDeletableEntity } from '@shared';
import { Expose } from 'class-transformer';

@Entity('settings')
export class SettingEntity extends SoftDeletableEntity {
  @Expose()
  @Index('IDX_SETTINGS_KEY', { unique: true })
  @Column({ length: 255 })
  key: string;

  @Expose()
  @Column({ type: 'text', nullable: true })
  value: string;

  @Expose()
  @Column({ length: 50, default: 'string' })
  type: 'string' | 'number' | 'boolean' | 'json' | 'array';

  @Expose()
  @Column({ length: 100, nullable: true })
  group: string;

  @Expose()
  @Column({ default: false, name: 'is_public' })
  isPublic: boolean;

  @Expose()
  @Column({ length: 500, nullable: true })
  description: string;

  
  getTypedValue(): any {
    if (!this.value) return null;

    switch (this.type) {
      case 'number':
        return Number(this.value);
      case 'boolean':
        return this.value === 'true' || this.value === '1';
      case 'json':
        try {
          return JSON.parse(this.value);
        } catch (e) {
          return null;
        }
      case 'array':
        try {
          return JSON.parse(this.value);
        } catch (e) {
          return [];
        }
      default:
        return this.value;
    }
  }
} 