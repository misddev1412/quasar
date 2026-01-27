import { Column, Entity, Index } from 'typeorm';
import { SoftDeletableEntity } from '@shared';
import { Expose } from 'class-transformer';

@Entity('openai_configs')
export class OpenAiConfigEntity extends SoftDeletableEntity {
  @Expose()
  @Index('IDX_OPENAI_CONFIG_NAME', { unique: true })
  @Column({ length: 255 })
  name!: string;

  @Expose()
  @Column({ length: 255 })
  model!: string;

  @Expose()
  @Column({ name: 'api_key', type: 'text' })
  apiKey!: string;

  @Expose()
  @Column({ name: 'base_url', type: 'text', nullable: true })
  baseUrl?: string;

  @Expose()
  @Column({ default: true, name: 'is_active' })
  active!: boolean;

  @Expose()
  @Column({ length: 500, nullable: true })
  description?: string;
}
