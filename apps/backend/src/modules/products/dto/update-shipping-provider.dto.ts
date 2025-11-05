import { IsString, IsOptional, IsBoolean, IsUrl } from 'class-validator';

export class UpdateShippingProviderDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsUrl()
  @IsOptional()
  trackingUrl?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  apiKey?: string | null;

  @IsString()
  @IsOptional()
  apiSecret?: string | null;
}
