import { IsString, IsNumber, IsBoolean, IsOptional, IsEmail, MaxLength, MinLength, Min, Max, IsIn, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEmailChannelDto {
  @IsString()
  @MinLength(2, { message: 'Channel name must be at least 2 characters long' })
  @MaxLength(255, { message: 'Channel name must not exceed 255 characters' })
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description?: string;

  @IsString()
  @MaxLength(255, { message: 'SMTP host must not exceed 255 characters' })
  smtpHost: string;

  @IsNumber({}, { message: 'SMTP port must be a valid number' })
  @Min(1, { message: 'SMTP port must be at least 1' })
  @Max(65535, { message: 'SMTP port must not exceed 65535' })
  @Type(() => Number)
  smtpPort: number;

  @IsBoolean({ message: 'SMTP secure must be a boolean value' })
  smtpSecure: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'SMTP username must not exceed 255 characters' })
  smtpUsername?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'SMTP password must not exceed 255 characters' })
  smtpPassword?: string;

  @IsEmail({}, { message: 'Default from email must be a valid email address' })
  @MaxLength(255, { message: 'Default from email must not exceed 255 characters' })
  defaultFromEmail: string;

  @IsString()
  @MaxLength(255, { message: 'Default from name must not exceed 255 characters' })
  defaultFromName: string;

  @IsOptional()
  @IsEmail({}, { message: 'Reply-to email must be a valid email address' })
  @MaxLength(255, { message: 'Reply-to email must not exceed 255 characters' })
  replyToEmail?: string;

  @IsOptional()
  @IsBoolean({ message: 'Is active must be a boolean value' })
  isActive?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'Is default must be a boolean value' })
  isDefault?: boolean;

  @IsOptional()
  @IsNumber({}, { message: 'Rate limit must be a valid number' })
  @Min(1, { message: 'Rate limit must be at least 1' })
  @Type(() => Number)
  rateLimit?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Provider name must not exceed 100 characters' })
  @IsIn(['smtp', 'sendgrid', 'mailgun', 'ses', 'postmark', 'mandrill'], {
    message: 'Provider name must be one of: smtp, sendgrid, mailgun, ses, postmark, mandrill'
  })
  providerName?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Priority must be a valid number' })
  @Min(1, { message: 'Priority must be at least 1 (highest priority)' })
  @Max(10, { message: 'Priority must not exceed 10 (lowest priority)' })
  @Type(() => Number)
  priority?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Usage type must not exceed 50 characters' })
  @IsIn(['transactional', 'marketing', 'notification', 'general'], {
    message: 'Usage type must be one of: transactional, marketing, notification, general'
  })
  usageType?: string;

  @IsOptional()
  @IsObject({ message: 'Config keys must be a valid object' })
  configKeys?: Record<string, any>;

  @IsOptional()
  @IsObject({ message: 'Advanced config must be a valid object' })
  advancedConfig?: Record<string, any>;

  @IsOptional()
  @IsNumber({}, { message: 'Max daily limit must be a valid number' })
  @Min(1, { message: 'Max daily limit must be at least 1' })
  @Type(() => Number)
  maxDailyLimit?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Webhook URL must not exceed 500 characters' })
  webhookUrl?: string;
}

export class UpdateEmailChannelDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Channel name must be at least 2 characters long' })
  @MaxLength(255, { message: 'Channel name must not exceed 255 characters' })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'SMTP host must not exceed 255 characters' })
  smtpHost?: string;

  @IsOptional()
  @IsNumber({}, { message: 'SMTP port must be a valid number' })
  @Min(1, { message: 'SMTP port must be at least 1' })
  @Max(65535, { message: 'SMTP port must not exceed 65535' })
  @Type(() => Number)
  smtpPort?: number;

  @IsOptional()
  @IsBoolean({ message: 'SMTP secure must be a boolean value' })
  smtpSecure?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'SMTP username must not exceed 255 characters' })
  smtpUsername?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'SMTP password must not exceed 255 characters' })
  smtpPassword?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Default from email must be a valid email address' })
  @MaxLength(255, { message: 'Default from email must not exceed 255 characters' })
  defaultFromEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Default from name must not exceed 255 characters' })
  defaultFromName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Reply-to email must be a valid email address' })
  @MaxLength(255, { message: 'Reply-to email must not exceed 255 characters' })
  replyToEmail?: string;

  @IsOptional()
  @IsBoolean({ message: 'Is active must be a boolean value' })
  isActive?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'Is default must be a boolean value' })
  isDefault?: boolean;

  @IsOptional()
  @IsNumber({}, { message: 'Rate limit must be a valid number' })
  @Min(1, { message: 'Rate limit must be at least 1' })
  @Type(() => Number)
  rateLimit?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Provider name must not exceed 100 characters' })
  @IsIn(['smtp', 'sendgrid', 'mailgun', 'ses', 'postmark', 'mandrill'], {
    message: 'Provider name must be one of: smtp, sendgrid, mailgun, ses, postmark, mandrill'
  })
  providerName?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Priority must be a valid number' })
  @Min(1, { message: 'Priority must be at least 1 (highest priority)' })
  @Max(10, { message: 'Priority must not exceed 10 (lowest priority)' })
  @Type(() => Number)
  priority?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Usage type must not exceed 50 characters' })
  @IsIn(['transactional', 'marketing', 'notification', 'general'], {
    message: 'Usage type must be one of: transactional, marketing, notification, general'
  })
  usageType?: string;

  @IsOptional()
  @IsObject({ message: 'Config keys must be a valid object' })
  configKeys?: Record<string, any>;

  @IsOptional()
  @IsObject({ message: 'Advanced config must be a valid object' })
  advancedConfig?: Record<string, any>;

  @IsOptional()
  @IsNumber({}, { message: 'Max daily limit must be a valid number' })
  @Min(1, { message: 'Max daily limit must be at least 1' })
  @Type(() => Number)
  maxDailyLimit?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Webhook URL must not exceed 500 characters' })
  webhookUrl?: string;
}

export class GetEmailChannelsDto {
  @IsOptional()
  @IsNumber({}, { message: 'Page must be a valid number' })
  @Min(1, { message: 'Page must be at least 1' })
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber({}, { message: 'Limit must be a valid number' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Search term must not exceed 255 characters' })
  search?: string;

  @IsOptional()
  @IsBoolean({ message: 'Is active must be a boolean value' })
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Provider name must not exceed 100 characters' })
  providerName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Usage type must not exceed 50 characters' })
  usageType?: string;
}

export class CloneEmailChannelDto {
  @IsString()
  @MinLength(2, { message: 'New channel name must be at least 2 characters long' })
  @MaxLength(255, { message: 'New channel name must not exceed 255 characters' })
  newName: string;
}