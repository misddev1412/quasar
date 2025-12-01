import { Entity, Column, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '@shared';
import { IsString, IsBoolean, IsOptional, MaxLength, MinLength } from 'class-validator';
import { Expose } from 'class-transformer';
import { MailProvider } from '../../mail-provider/entities/mail-provider.entity';
import { MailTemplate } from '../../mail-template/entities/mail-template.entity';

@Entity('email_flows')
@Index('IDX_EMAIL_FLOW_NAME', ['name'], { unique: true })
@Index('IDX_EMAIL_FLOW_ACTIVE', ['isActive'])
@Index('IDX_EMAIL_FLOW_PROVIDER', ['mailProviderId'])
export class EmailFlow extends BaseEntity {
  @Expose()
  @Column({ 
    unique: true, 
    length: 255,
    comment: 'Unique name for the email flow'
  })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @Expose()
  @Column({ 
    length: 1000,
    nullable: true,
    comment: 'Description of the email flow'
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @Expose()
  @Column({ 
    name: 'mail_provider_id',
    nullable: false,
    comment: 'Mail provider to use for this flow'
  })
  @IsString()
  mailProviderId: string;

  @Expose()
  @ManyToOne(() => MailProvider, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'mail_provider_id' })
  mailProvider: MailProvider;

  @Expose()
  @Column({ 
    name: 'is_active',
    default: true,
    comment: 'Whether the email flow is active'
  })
  @IsBoolean()
  isActive: boolean;

  @Expose()
  @Column({ 
    name: 'priority',
    type: 'int',
    default: 5,
    comment: 'Flow priority (1=highest, 10=lowest)'
  })
  @IsOptional()
  priority?: number;

  @Expose()
  @Column({ 
    type: 'json',
    nullable: true,
    comment: 'Additional flow configuration'
  })
  @IsOptional()
  config?: Record<string, any>;

  // Relationships
  @OneToMany(() => MailTemplate, (template) => template.emailFlow)
  mailTemplates: MailTemplate[];
}




