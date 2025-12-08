import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '@shared';
import { IsString, IsBoolean, IsOptional, IsEmail, IsNumber, MaxLength, MinLength, Min, Max } from 'class-validator';
import { Expose } from 'class-transformer';
import { EmailFlow } from '../../email-flow/entities/email-flow.entity';

@Entity('mail_providers')
@Index('IDX_MAIL_PROVIDER_NAME', ['name'], { unique: true })
@Index('IDX_MAIL_PROVIDER_ACTIVE', ['isActive'])
@Index('IDX_MAIL_PROVIDER_TYPE', ['providerType'])
export class MailProvider extends BaseEntity {
  @Expose()
  @Column({ 
    unique: true, 
    length: 255,
    comment: 'Unique name for the mail provider'
  })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @Expose()
  @Column({ 
    name: 'provider_type',
    length: 100,
    default: 'smtp',
    comment: 'Provider type (smtp, sendgrid, mailgun, ses, postmark, mandrill, etc.)'
  })
  @IsString()
  @MaxLength(100)
  providerType: string;

  @Expose()
  @Column({ 
    length: 1000,
    nullable: true,
    comment: 'Description of the mail provider'
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @Expose()
  @Column({ 
    name: 'smtp_host',
    length: 255,
    nullable: true,
    comment: 'SMTP server hostname (for SMTP providers)'
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  smtpHost?: string;

  @Expose()
  @Column({ 
    name: 'smtp_port',
    type: 'int',
    nullable: true,
    comment: 'SMTP server port'
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(65535)
  smtpPort?: number;

  @Expose()
  @Column({ 
    name: 'smtp_secure',
    nullable: true,
    default: true,
    comment: 'Use TLS/SSL encryption'
  })
  @IsOptional()
  @IsBoolean()
  smtpSecure?: boolean;

  @Expose()
  @Column({ 
    name: 'smtp_username',
    length: 255,
    nullable: true,
    comment: 'SMTP authentication username'
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  smtpUsername?: string;

  @Expose()
  @Column({ 
    name: 'smtp_password',
    length: 255,
    nullable: true,
    comment: 'SMTP authentication password (encrypted)'
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  smtpPassword?: string;

  @Expose()
  @Column({ 
    name: 'api_key',
    length: 500,
    nullable: true,
    comment: 'API key for service providers (sendgrid, mailgun, etc.)'
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  apiKey?: string;

  @Expose()
  @Column({ 
    name: 'api_secret',
    length: 500,
    nullable: true,
    comment: 'API secret for service providers'
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  apiSecret?: string;

  @Expose()
  @Column({ 
    name: 'api_host',
    length: 255,
    nullable: true,
    comment: 'Custom API host for service providers (optional, uses default if not provided)'
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  apiHost?: string;

  @Expose()
  @Column({ 
    name: 'default_from_email',
    length: 255,
    nullable: true,
    comment: 'Default sender email address'
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  defaultFromEmail?: string;

  @Expose()
  @Column({ 
    name: 'default_from_name',
    length: 255,
    nullable: true,
    comment: 'Default sender display name'
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  defaultFromName?: string;

  @Expose()
  @Column({ 
    name: 'reply_to_email',
    length: 255,
    nullable: true,
    comment: 'Reply-to email address'
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  replyToEmail?: string;

  @Expose()
  @Column({ 
    name: 'is_active',
    default: true,
    comment: 'Whether the mail provider is active'
  })
  @IsBoolean()
  isActive: boolean;

  @Expose()
  @Column({ 
    name: 'rate_limit',
    type: 'int',
    nullable: true,
    comment: 'Maximum emails per hour (null = unlimited)'
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  rateLimit?: number;

  @Expose()
  @Column({ 
    name: 'max_daily_limit',
    type: 'int',
    nullable: true,
    comment: 'Maximum emails per day (null = unlimited)'
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxDailyLimit?: number;

  @Expose()
  @Column({ 
    name: 'priority',
    type: 'int',
    default: 5,
    comment: 'Provider priority (1=highest, 10=lowest)'
  })
  @IsNumber()
  @Min(1)
  @Max(10)
  priority: number;

  @Expose()
  @Column({ 
    type: 'json',
    nullable: true,
    comment: 'Provider-specific configuration'
  })
  @IsOptional()
  config?: Record<string, any>;

  @Expose()
  @Column({ 
    name: 'webhook_url',
    length: 500,
    nullable: true,
    comment: 'Webhook URL for delivery notifications'
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  webhookUrl?: string;

  // Relationships
  @OneToMany(() => EmailFlow, (emailFlow) => emailFlow.mailProvider)
  emailFlows: EmailFlow[];

  // Helper methods
  getSmtpConfig(): any {
    if (this.providerType !== 'smtp') {
      return null;
    }
    return {
      host: this.smtpHost,
      port: this.smtpPort,
      secure: this.smtpSecure,
      auth: this.smtpUsername && this.smtpPassword ? {
        user: this.smtpUsername,
        pass: this.smtpPassword // This should be decrypted in service
      } : undefined,
      ...this.config
    };
  }

  getDefaultFromAddress(): { email: string; name: string } | null {
    if (!this.defaultFromEmail) {
      return null;
    }
    return {
      email: this.defaultFromEmail,
      name: this.defaultFromName || ''
    };
  }

  validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.name?.trim()) {
      errors.push('Provider name is required');
    }

    if (this.providerType === 'smtp') {
      if (!this.smtpHost?.trim()) {
        errors.push('SMTP host is required for SMTP providers');
      }
      if (!this.smtpPort || this.smtpPort < 1 || this.smtpPort > 65535) {
        errors.push('Valid SMTP port is required');
      }
    } else {
      // For API-based providers, API key is usually required
      if (!this.apiKey?.trim()) {
        errors.push(`API key is required for ${this.providerType} provider`);
      }
    }

    if (this.defaultFromEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.defaultFromEmail)) {
        errors.push('Invalid default from email format');
      }
    }

    if (this.replyToEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.replyToEmail)) {
        errors.push('Invalid reply-to email format');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}


