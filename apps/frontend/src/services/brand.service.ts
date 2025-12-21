import { trpcClient } from '../utils/trpc';
import type { BrandSummary, BrandShowcaseStrategy } from '../types/brand';

export interface BrandShowcaseParams {
  strategy?: BrandShowcaseStrategy;
  limit?: number;
  brandIds?: string[];
  locale?: string;
}

const extractBrandList = (payload: unknown): BrandSummary[] => {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload as BrandSummary[];
  }

  if (typeof payload === 'object' && payload !== null) {
    const dataField = (payload as Record<string, unknown>).data;
    if (Array.isArray(dataField)) {
      return dataField as BrandSummary[];
    }
  }

  return [];
};

export class BrandService {
  static async getShowcaseBrands(params: BrandShowcaseParams = {}): Promise<BrandSummary[]> {
    try {
      const response = await trpcClient.clientBrands.list.query(params);
      return extractBrandList(response?.data);
    } catch (error) {
      console.error('Failed to load brands', error);
      return [];
    }
  }
}
