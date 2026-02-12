import type { RecentActivity, TierDistribution } from '@admin/types/loyalty';

export interface StatTrend {
  value: number;
  isPositive: boolean;
  label: string;
}

export interface LoyaltyStatsOverview {
  totalMembers?: number;
  activeMembers?: number;
  totalPointsIssued?: number;
  totalPointsRedeemed?: number;
  engagementRate?: number;
  redemptionRate?: number;
  avgPointsPerMember?: number;
  totalTiers?: number;
  membersTrend?: StatTrend;
  activeMembersTrend?: StatTrend;
  pointsIssuedTrend?: StatTrend;
  pointsRedeemedTrend?: StatTrend;
  engagementTrend?: StatTrend;
  redemptionTrend?: StatTrend;
  avgPointsTrend?: StatTrend;
  tierDistribution?: TierDistribution[];
  recentActivity?: RecentActivity[];
}

export interface LoyaltyStatsResponse {
  data?: LoyaltyStatsOverview;
}
