import type { LoyaltyTier } from '@admin/types/loyalty';

export interface LoyaltyTierListResponse {
  data?: {
    items?: LoyaltyTier[];
    total?: number;
  };
}

export interface LoyaltyTierStatsResponse {
  data?: {
    totalTiers: number;
    activeTiers: number;
    inactiveTiers: number;
    totalMembers: number;
  };
}

export interface TierStatisticsData {
  data: {
    total: number;
    active: number;
    inactive: number;
    totalMembers: number;
  };
}

export interface LoyaltyTierDisplay extends LoyaltyTier {
  __rawMinPoints?: number;
  __rawMaxPoints?: number;
}
