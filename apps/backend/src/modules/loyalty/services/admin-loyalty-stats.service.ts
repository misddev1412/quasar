import { Injectable, Inject } from '@nestjs/common';
import { LoyaltyTierRepository } from '../repositories/loyalty-tier.repository';
import { LoyaltyRewardRepository } from '../repositories/loyalty-reward.repository';
import { LoyaltyTransactionRepository } from '../repositories/loyalty-transaction.repository';

export interface LoyaltyStatsDto {
  totalTiers: number;
  activeTiers: number;
  totalRewards: number;
  activeRewards: number;
  expiringSoonCount: number;
  totalCustomers: number;
  activeCustomers: number;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  totalTransactions: number;
  topCustomers: any[];
  popularRewards: any[];
  recentActivity: any[];
}

@Injectable()
export class AdminLoyaltyStatsService {
  constructor(
    @Inject(LoyaltyTierRepository)
    private readonly loyaltyTierRepository: LoyaltyTierRepository,
    @Inject(LoyaltyRewardRepository)
    private readonly loyaltyRewardRepository: LoyaltyRewardRepository,
    @Inject(LoyaltyTransactionRepository)
    private readonly loyaltyTransactionRepository: LoyaltyTransactionRepository,
  ) {}

  async getLoyaltyStats(days: number = 30): Promise<LoyaltyStatsDto> {
    const [
      tierStats,
      rewardStats,
      transactionStats,
      topCustomers,
      popularRewards,
      recentActivity,
    ] = await Promise.all([
      this.getTierStats(),
      this.getRewardStats(),
      this.loyaltyTransactionRepository.getTransactionStats(days),
      this.loyaltyTransactionRepository.getTopCustomers(days, 5),
      this.loyaltyTransactionRepository.getPopularRewards(days, 5),
      this.loyaltyTransactionRepository.findRecentTransactions(days, 10),
    ]);

    return {
      ...tierStats,
      ...rewardStats,
      ...transactionStats,
      topCustomers,
      popularRewards,
      recentActivity,
    };
  }

  private async getTierStats() {
    const totalTiers = await this.loyaltyTierRepository.count();
    const activeTiers = await this.loyaltyTierRepository.countActive();
    const tiersWithStats = await this.loyaltyTierRepository.findWithStats();

    // Calculate total customers from tier stats
    const totalCustomers = tiersWithStats.reduce((sum, tier) => sum + parseInt(tier.customerCount || '0', 10), 0);
    const activeCustomers = totalCustomers; // Assuming all customers with tiers are active

    return {
      totalTiers,
      activeTiers,
      totalCustomers,
      activeCustomers,
    };
  }

  private async getRewardStats() {
    const totalRewards = await this.loyaltyRewardRepository.count();
    const activeRewards = await this.loyaltyRewardRepository.countActive();
    const expiringSoon = await this.loyaltyRewardRepository.findExpiringSoon(30);

    return {
      totalRewards,
      activeRewards,
      expiringSoonCount: expiringSoon.length,
    };
  }

  async getDashboardStats() {
    const stats7Days = await this.getLoyaltyStats(7);
    const stats30Days = await this.getLoyaltyStats(30);
    const stats90Days = await this.getLoyaltyStats(90);

    return {
      current: stats30Days,
      comparison: {
        last7Days: stats7Days,
        last30Days: stats30Days,
        last90Days: stats90Days,
      },
    };
  }

  async getCustomerEngagementStats() {
    const [
      topCustomers,
      popularRewards,
      recentActivity,
    ] = await Promise.all([
      this.loyaltyTransactionRepository.getTopCustomers(30, 10),
      this.loyaltyTransactionRepository.getPopularRewards(30, 10),
      this.loyaltyTransactionRepository.findRecentTransactions(7, 20),
    ]);

    return {
      topCustomers,
      popularRewards,
      recentActivity,
    };
  }

  async getPointsFlowStats(days: number = 30) {
    const stats = await this.loyaltyTransactionRepository.getTransactionStats(days);

    return {
      earnedPoints: stats.totalEarned,
      redeemedPoints: stats.totalRedeemed,
      netPoints: stats.totalEarned - stats.totalRedeemed,
      transactionCount: stats.totalTransactions,
      averagePointsPerTransaction: stats.totalTransactions > 0
        ? Math.round((stats.totalEarned + stats.totalRedeemed) / stats.totalTransactions)
        : 0,
    };
  }

  async getTierDistribution() {
    const tiersWithStats = await this.loyaltyTierRepository.findWithStats();

    return tiersWithStats.map(tier => ({
      id: tier.id,
      name: tier.name,
      minPoints: tier.minPoints,
      maxPoints: tier.maxPoints,
      customerCount: parseInt(tier.customerCount || '0', 10),
      color: tier.color,
      icon: tier.icon,
    }));
  }

  async getRewardPerformance() {
    const popularRewards = await this.loyaltyTransactionRepository.getPopularRewards(30, 20);

    return popularRewards.map(reward => ({
      rewardId: reward.rewardId,
      rewardName: reward.rewardName,
      redemptionCount: parseInt(reward.redemptionCount || '0', 10),
      totalPointsSpent: parseInt(reward.totalPointsSpent || '0', 10),
      averagePointsPerRedemption: parseInt(reward.redemptionCount || '0', 10) > 0
        ? Math.round(parseInt(reward.totalPointsSpent || '0', 10) / parseInt(reward.redemptionCount || '0', 10))
        : 0,
    }));
  }
}