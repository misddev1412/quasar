import { Column, Entity, Index } from 'typeorm';
import { Expose } from 'class-transformer';
import { SoftDeletableEntity } from '@shared';
import { ThemeMode } from '../dto/theme.dto';

@Entity('themes')
@Index('IDX_THEMES_SLUG', ['slug'], { unique: true })
@Index('IDX_THEMES_IS_ACTIVE', ['isActive'])
@Index('IDX_THEMES_IS_DEFAULT', ['isDefault'])
export class ThemeEntity extends SoftDeletableEntity {
  @Expose()
  @Column({ length: 150 })
  name: string;

  @Expose()
  @Column({ length: 160 })
  slug: string;

  @Expose()
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Expose()
  @Column({ length: 10, default: 'light' })
  mode: ThemeMode;

  @Expose()
  @Column({ name: 'body_background_color', length: 50, default: '#ffffff' })
  bodyBackgroundColor: string;

  @Expose()
  @Column({ name: 'surface_background_color', length: 50, default: '#f8fafc' })
  surfaceBackgroundColor: string;

  @Expose()
  @Column({ name: 'text_color', length: 50, default: '#0f172a' })
  textColor: string;

  @Expose()
  @Column({ name: 'muted_text_color', length: 50, default: '#475569' })
  mutedTextColor: string;

  @Expose()
  @Column({ name: 'primary_color', length: 50, default: '#2563eb' })
  primaryColor: string;

  @Expose()
  @Column({ name: 'primary_text_color', length: 50, default: '#ffffff' })
  primaryTextColor: string;

  @Expose()
  @Column({ name: 'secondary_color', length: 50, default: '#0ea5e9' })
  secondaryColor: string;

  @Expose()
  @Column({ name: 'secondary_text_color', length: 50, default: '#ffffff' })
  secondaryTextColor: string;

  @Expose()
  @Column({ name: 'accent_color', length: 50, default: '#7c3aed' })
  accentColor: string;

  @Expose()
  @Column({ name: 'border_color', length: 50, default: '#e2e8f0' })
  borderColor: string;

  @Expose()
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Expose()
  @Column({ name: 'is_default', default: false })
  isDefault: boolean;
}
