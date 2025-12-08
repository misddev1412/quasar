export interface LoyaltyTier {
  id: string;
  name: string;
  description?: string;
  minPointsRequired: number;
  maxPointsRequired?: number;
  color?: string;
  iconUrl?: string;
  benefits: string[];
  isActive: boolean;
  sortOrder: number;
  memberCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description?: string;
  type: RewardType;
  pointsRequired: number;
  value?: number;
  discountType?: DiscountType;
  conditions?: string;
  isActive: boolean;
  isLimited: boolean;
  totalQuantity?: number;
  remainingQuantity?: number;
  startsAt?: string;
  endsAt?: string;
  imageUrl?: string;
  termsConditions?: string;
  tierRestrictions?: string[];
  autoApply?: boolean;
  sortOrder: number;
  redemptionCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  customer?: {
    id: string;
    name?: string;
    email?: string;
  };
  points: number;
  type: TransactionType;
  description: string;
  source?: string;
  orderId?: string;
  order?: {
    id: string;
    orderNumber: string;
  };
  rewardId?: string;
  reward?: {
    id: string;
    name: string;
  };
  balanceAfter?: number;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerRedemption {
  id: string;
  customerId: string;
  rewardId: string;
  pointsUsed: number;
  status: RedemptionStatus;
  redemptionCode?: string;
  redeemedAt?: string;
  expiresAt?: string;
  usedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export enum RewardType {
  DISCOUNT = 'DISCOUNT',
  FREE_PRODUCT = 'FREE_PRODUCT',
  FREE_SHIPPING = 'FREE_SHIPPING',
  CASHBACK = 'CASHBACK',
  GIFT_CARD = 'GIFT_CARD',
  EXCLUSIVE_ACCESS = 'EXCLUSIVE_ACCESS'
}

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED'
}

export enum TransactionType {
  EARN = 'EARN',
  SPEND = 'SPEND',
  EXPIRE = 'EXPIRE',
  ADJUST = 'ADJUST',
  REFERRAL_BONUS = 'REFERRAL_BONUS'
}

export enum RedemptionStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  USED = 'USED',
  EXPIRED = 'EXPIRED'
}

export interface LoyaltyStats {
  totalMembers: number;
  activeMembers: number;
  totalTiers: number;
  activeTiers: number;
  totalRewards: number;
  activeRewards: number;
  totalTransactions: number;
  totalPointsEarned: number;
  totalPointsSpent: number;
  uniqueCustomers: number;
  engagementRate: number;
  redemptionRate: number;
  avgPointsPerMember: number;
  expiringSoonCount: number;
  totalRedemptions: number;
}

export interface LoyaltyChart {
  date: string;
  value: number;
  label?: string;
}

export interface LoyaltyChartData {
  membersChart: LoyaltyChart[];
  activeMembersChart: LoyaltyChart[];
  pointsIssuedChart: LoyaltyChart[];
  pointsRedeemedChart: LoyaltyChart[];
}

export interface TierDistribution {
  name: string;
  members: number;
  percentage: number;
  color?: string;
}

export interface RecentActivity {
  type: string;
  description: string;
  customer: string;
  date: string;
  points?: number;
}