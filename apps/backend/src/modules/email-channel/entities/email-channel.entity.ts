import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '@shared';
import { IsString, IsBoolean, IsOptional, IsEmail, IsNumber, MaxLength, MinLength, Min, Max } from 'class-validator';
import { Expose } from 'class-transformer';

@Entity('email_channels')
@Index('IDX_EMAIL_CHANNEL_NAME', ['name'], { unique: true })
@Index('IDX_EMAIL_CHANNEL_ACTIVE', ['isActive'])
@Index('IDX_EMAIL_CHANNEL_DEFAULT', ['isDefault'])
export class EmailChannel extends BaseEntity {
  @Expose()
  @Column({ 
    unique: true, 
    length: 255,
    comment: 'Unique identifier for the email channel'
  })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @Expose()
  @Column({ 
    length: 1000,
    nullable: true,
    comment: 'Description of the email channel purpose'
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @Expose()
  @Column({ 
    name: 'smtp_host',
    length: 255,
    comment: 'SMTP server hostname'
  })
  @IsString()
  @MaxLength(255)
  smtpHost: string;

  @Expose()
  @Column({ 
    name: 'smtp_port',
    type: 'int',
    default: 587,
    comment: 'SMTP server port'
  })
  @IsNumber()
  smtpPort: number;

  @Expose()
  @Column({ 
    name: 'smtp_secure',
    default: true,
    comment: 'Use TLS/SSL encryption'
  })
  @IsBoolean()
  smtpSecure: boolean;

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
    name: 'default_from_email',
    length: 255,
    comment: 'Default sender email address'
  })
  @IsEmail()
  @MaxLength(255)
  defaultFromEmail: string;

  @Expose()
  @Column({ 
    name: 'default_from_name',
    length: 255,
    comment: 'Default sender display name'
  })
  @IsString()
  @MaxLength(255)
  defaultFromName: string;

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
    comment: 'Whether the email channel is active'
  })
  @IsBoolean()
  isActive: boolean;

  @Expose()
  @Column({ 
    name: 'is_default',
    default: false,
    comment: 'Whether this is the default email channel'
  })
  @IsBoolean()
  isDefault: boolean;

  @Expose()
  @Column({ 
    name: 'rate_limit',
    type: 'int',
    default: 100,
    comment: 'Maximum emails per hour'
  })
  @IsNumber()
  rateLimit: number;

  @Expose()
  @Column({ 
    name: 'provider_name',
    length: 100,
    default: 'smtp',
    comment: 'Email provider type (smtp, sendgrid, mailgun, etc.)'
  })
  @IsString()
  @MaxLength(100)
  providerName: string;

  @Expose()
  @Column({ 
    name: 'priority',
    type: 'int',
    default: 5,
    comment: 'Channel priority (1=highest, 10=lowest)'
  })
  @IsNumber()
  @Min(1)
  @Max(10)
  priority: number;

  @Expose()
  @Column({ 
    name: 'usage_type',
    length: 50,
    default: 'general',
    comment: 'Channel usage type (transactional, marketing, notification, general)'
  })
  @IsString()
  @MaxLength(50)
  usageType: string;

  @Expose()
  @Column({ 
    name: 'config_keys',
    type: 'json',
    nullable: true,
    comment: 'Provider-specific configuration keys'
  })
  @IsOptional()
  configKeys?: Record<string, any>;

  @Expose()
  @Column({ 
    type: 'json',
    nullable: true,
    comment: 'Additional SMTP configuration options'
  })
  @IsOptional()
  advancedConfig?: Record<string, any>;

  @Expose()
  @Column({ 
    name: 'max_daily_limit',
    type: 'int',
    nullable: true,
    comment: 'Maximum emails per day (null = unlimited)'
  })
  @IsOptional()
  @IsNumber()
  maxDailyLimit?: number;

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

  // Helper methods
  getSmtpConfig(): any {
    return {
      host: this.smtpHost,
      port: this.smtpPort,
      secure: this.smtpSecure,
      auth: this.smtpUsername && this.smtpPassword ? {
        user: this.smtpUsername,
        pass: this.smtpPassword // This should be decrypted in service
      } : undefined,
      ...this.advancedConfig
    };
  }

  getDefaultFromAddress(): { email: string; name: string } {
    return {
      email: this.defaultFromEmail,
      name: this.defaultFromName
    };
  }

  validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.name?.trim()) {
      errors.push('Channel name is required');
    }

    if (!this.smtpHost?.trim()) {
      errors.push('SMTP host is required');
    }

    if (!this.smtpPort || this.smtpPort < 1 || this.smtpPort > 65535) {
      errors.push('Valid SMTP port is required');
    }

    if (!this.defaultFromEmail?.trim()) {
      errors.push('Default from email is required');
    }

    if (!this.defaultFromName?.trim()) {
      errors.push('Default from name is required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (this.defaultFromEmail && !emailRegex.test(this.defaultFromEmail)) {
      errors.push('Invalid default from email format');
    }

    if (this.replyToEmail && !emailRegex.test(this.replyToEmail)) {
      errors.push('Invalid reply-to email format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  clone(newName: string): Partial<EmailChannel> {
    return {
      name: newName,
      description: this.description ? `Copy of ${this.description}` : `Copy of ${this.name}`,
      smtpHost: this.smtpHost,
      smtpPort: this.smtpPort,
      smtpSecure: this.smtpSecure,
      smtpUsername: this.smtpUsername,
      smtpPassword: this.smtpPassword,
      defaultFromEmail: this.defaultFromEmail,
      defaultFromName: this.defaultFromName,
      replyToEmail: this.replyToEmail,
      rateLimit: this.rateLimit,
      advancedConfig: this.advancedConfig ? { ...this.advancedConfig } : undefined,
      isActive: false, // New cloned channels start as inactive
      isDefault: false // New cloned channels are not default
    };
  }
}