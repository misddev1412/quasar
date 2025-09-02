import { IsString, IsNumber, IsBoolean, IsArray, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateStorageConfigDto {
  @IsEnum(['local', 's3'])
  provider: 'local' | 's3';

  @IsNumber()
  @Min(1024) // 1KB minimum
  @Max(104857600) // 100MB maximum
  @Type(() => Number)
  maxFileSize: number;

  @IsArray()
  @IsString({ each: true })
  allowedFileTypes: string[];

  // Local storage settings
  @IsOptional()
  @IsString()
  localUploadPath?: string;

  @IsOptional()
  @IsString()
  localBaseUrl?: string;

  // S3 settings
  @IsOptional()
  @IsString()
  s3AccessKey?: string;

  @IsOptional()
  @IsString()
  s3SecretKey?: string;

  @IsOptional()
  @IsString()
  s3Region?: string;

  @IsOptional()
  @IsString()
  s3Bucket?: string;

  @IsOptional()
  @IsString()
  s3Endpoint?: string;

  @IsOptional()
  @IsBoolean()
  s3ForcePathStyle?: boolean;
}

export class FileUploadDto {
  @IsOptional()
  @IsString()
  folder?: string;

  @IsOptional()
  @IsString()
  filename?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedTypes?: string[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  maxSize?: number;
}

export class StorageConfigResponseDto {
  provider: 'local' | 's3';
  maxFileSize: number;
  allowedFileTypes: string[];
  
  // Local config (only if provider is local)
  localUploadPath?: string;
  localBaseUrl?: string;
  
  // S3 config (only if provider is s3, without sensitive keys)
  s3Region?: string;
  s3Bucket?: string;
  s3Endpoint?: string;
  s3ForcePathStyle?: boolean;
  s3HasCredentials?: boolean; // indicate if credentials are configured
}