import { Column, Entity, Index } from 'typeorm';
import { Expose } from 'class-transformer';
import { SoftDeletableEntity } from '@shared';
import { ThemeColorModesDto } from '../dto/theme.dto';

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
  @Column({ name: 'color_modes', type: 'jsonb', default: () => "'{}'::jsonb" })
  colors: ThemeColorModesDto;

  @Expose()
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Expose()
  @Column({ name: 'is_default', default: false })
  isDefault: boolean;
}
