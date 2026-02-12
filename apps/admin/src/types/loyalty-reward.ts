import type { LoyaltyReward } from '@admin/types/loyalty';

export type LoyaltyRewardFilterType =
  | 'discount'
  | 'free_shipping'
  | 'free_product'
  | 'cashback'
  | 'gift_card'
  | 'exclusive_access';

export interface LoyaltyRewardListResponse {
  data?: {
    items?: LoyaltyReward[];
    total?: number;
  };
}

export interface LoyaltyRewardStatsResponse {
  data?: {
    totalRewards: number;
    activeRewards: number;
    expiringSoonCount: number;
    totalRedemptions?: number;
  };
}

export interface LoyaltyRewardStatisticsData {
  data: {
    total: number;
    active: number;
    expiringSoon: number;
    totalRedemptions: number;
  };
}
