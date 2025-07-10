import { BaseEntity } from '../entities/base.entity';

export interface ISEO extends BaseEntity {
  title: string;
  description?: string;
  keywords?: string;
  path: string;
  isActive: boolean;
  additionalMetaTags?: Record<string, string>;
}

export interface ISEOResponse {
  title: string;
  description?: string;
  keywords?: string;
  additionalMetaTags?: Record<string, string>;
}

export interface GetSEOByPathParams {
  path: string;
} 