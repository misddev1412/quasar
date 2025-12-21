export interface BrandSummary {
  id: string;
  name: string;
  description?: string | null;
  logo?: string | null;
  website?: string | null;
  productCount?: number | null;
}

export type BrandShowcaseStrategy = 'newest' | 'alphabetical' | 'custom';
