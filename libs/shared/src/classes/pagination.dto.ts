import { Type, Transform } from 'class-transformer';
import { IsOptional, IsInt, Min, Max, IsString, IsEnum } from 'class-validator';
import { SortOrder } from '../enums/common.enums';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be greater than 0' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be greater than 0' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit?: number = 10;

  @IsOptional()
  @IsString({ message: 'Sort field must be a string' })
  sortBy?: string;

  @IsOptional()
  @IsEnum(SortOrder, { message: 'Sort order must be ASC or DESC' })
  sortOrder?: SortOrder = SortOrder.ASC;

  // Calculate skip value for database queries
  get skip(): number {
    return ((this.page || 1) - 1) * (this.limit || 10);
  }

  // Get offset for pagination
  get offset(): number {
    return this.skip;
  }

  // Get take value for database queries
  get take(): number {
    return this.limit || 10;
  }
}

export class SearchPaginationDto extends PaginationDto {
  @IsOptional()
  @IsString({ message: 'Search query must be a string' })
  @Transform(({ value }) => value?.trim())
  search?: string;

  @IsOptional()
  @IsString({ message: 'Search field must be a string' })
  searchField?: string;
}

export class DateRangePaginationDto extends PaginationDto {
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  endDate?: Date;
}

export class FilterPaginationDto extends PaginationDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return {};
      }
    }
    return value || {};
  })
  filters?: Record<string, any> = {};
}

// Response DTOs
export class PaginationMetaDto {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;

  constructor(
    total: number,
    page: number,
    limit: number
  ) {
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
    this.hasNext = page < this.totalPages;
    this.hasPrevious = page > 1;
  }
}

export class PaginatedResponseDto<T> {
  data: T[];
  meta: PaginationMetaDto;

  constructor(data: T[], meta: PaginationMetaDto) {
    this.data = data;
    this.meta = meta;
  }

  static create<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
  ): PaginatedResponseDto<T> {
    const meta = new PaginationMetaDto(total, page, limit);
    return new PaginatedResponseDto(data, meta);
  }
}

export class PaginatedDto<T> {
  @ApiProperty({ isArray: true })
  readonly items!: T[];

  @ApiProperty({ type: () => Number })
  readonly total!: number;

  @ApiProperty({ type: () => Number })
  readonly page!: number;

  @ApiProperty({ type: () => Number })
  readonly limit!: number;

  @ApiProperty({ type: () => Number })
  readonly totalPages!: number;
} 