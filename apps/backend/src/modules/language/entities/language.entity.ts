import { Entity, Column, Index } from 'typeorm';
import { IsString, IsBoolean, IsOptional, IsNotEmpty, Length } from 'class-validator';
import { BaseEntity } from '@shared';

@Entity('languages')
@Index(['code'], { unique: true })
@Index(['isActive'])
@Index(['isDefault'])
@Index(['sortOrder'])
export class Language extends BaseEntity {
  @Column({ type: 'varchar', length: 10, unique: true })
  @IsString()
  @IsNotEmpty()
  @Length(2, 10)
  code: string; // e.g., 'en', 'vi', 'fr'

  @Column({ type: 'varchar', length: 100 })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string; // e.g., 'English', 'Vietnamese', 'French'

  @Column({ name: 'native_name', type: 'varchar', length: 100 })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  nativeName: string; // e.g., 'English', 'Tiếng Việt', 'Français'

  @Column({ type: 'varchar', length: 10, nullable: true })
  @IsString()
  @IsOptional()
  @Length(1, 10)
  icon?: string; // e.g., '🇺🇸', '🇻🇳', '🇫🇷' or flag codes

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @IsBoolean()
  isActive: boolean;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  @IsBoolean()
  isDefault: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;
}