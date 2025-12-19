import { Entity, Column, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '@shared';
import { IsString, IsBoolean, IsOptional, MaxLength, MinLength } from 'class-validator';
import { Expose } from 'class-transformer';
import { MailProvider } from '../../mail-provider/entities/mail-provider.entity';
import { MailTemplate } from '../../mail-template/entities/mail-template.entity';

@Entity('mail_channel_priorities')
@Index('IDX_MAIL_CHANNEL_PRIORITY_NAME', ['name'], { unique: true })
@Index('IDX_MAIL_CHANNEL_PRIORITY_ACTIVE', ['isActive'])
@Index('IDX_MAIL_CHANNEL_PRIORITY_PROVIDER', ['mailProviderId'])
export class EmailFlow extends BaseEntity {
  @Expose()
  @Column({ 
    unique: true, 
    length: 255,
    comment: 'Unique name for the mail channel priority'
  })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @Expose()
  @Column({ 
    length: 1000,
    nullable: true,
    comment: 'Description of the mail channel priority'
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @Expose()
  @Column({ 
    name: 'mail_provider_id',
    nullable: false,
    comment: 'Mail provider associated with this priority'
  })
  @IsString()
  mailProviderId: string;

  @Expose()
  @ManyToOne(() => MailProvider, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'mail_provider_id' })
  mailProvider: MailProvider;

  @Expose()
  @Column({
    name: 'mail_template_id',
    nullable: true,
    comment: 'Optional mail template scope for this priority',
  })
  @IsOptional()
  @IsString()
  mailTemplateId?: string | null;

  @Expose({ name: 'mailTemplate' })
  @ManyToOne(() => MailTemplate, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'mail_template_id' })
  mailTemplate?: MailTemplate | null;

  @Expose()
  @Column({ 
    name: 'is_active',
    default: true,
    comment: 'Whether the priority configuration is active'
  })
  @IsBoolean()
  isActive: boolean;

  @Expose()
  @Column({ 
    name: 'priority',
    type: 'int',
    default: 5,
    comment: 'Priority order (1=highest, 10=lowest)'
  })
  @IsOptional()
  priority?: number;

  @Expose()
  @Column({ 
    type: 'json',
    nullable: true,
    comment: 'Additional priority configuration'
  })
  @IsOptional()
  config?: Record<string, any>;

  // Relationships
  @OneToMany(() => MailTemplate, (template) => template.emailFlow)
  mailTemplates: MailTemplate[];
}





