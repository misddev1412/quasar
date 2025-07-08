import { IsEmail, IsString, IsOptional, MinLength, IsDateString } from 'class-validator';

export class ClientRegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(2)
  firstName: string;

  @IsString()
  @MinLength(2)
  lastName: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}

export class ClientLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class ClientUpdateProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;
}

export class ClientUserResponseDto {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
  profile?: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    dateOfBirth?: Date;
    avatar?: string;
    bio?: string;
    address?: string;
    city?: string;
    country?: string;
    postalCode?: string;
  };
}

export class ClientAuthResponseDto {
  user: ClientUserResponseDto;
  accessToken: string;
  refreshToken?: string;
} 