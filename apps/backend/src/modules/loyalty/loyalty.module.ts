import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoyaltyTier } from '@backend/modules/loyalty/entities/loyalty-tier.entity';
import { LoyaltyReward } from '@backend/modules/loyalty/entities/loyalty-reward.entity';
import { LoyaltyTransaction } from '@backend/modules/loyalty/entities/loyalty-transaction.entity';
import { CustomerRedemption } from '@backend/modules/loyalty/entities/customer-redemption.entity';
import { Customer } from '@backend/modules/products/entities/customer.entity';
import { User } from '@backend/modules/user/entities/user.entity';
import { LoyaltyTierRepository } from '@backend/modules/loyalty/repositories/loyalty-tier.repository';
import { LoyaltyRewardRepository } from '@backend/modules/loyalty/repositories/loyalty-reward.repository';
import { LoyaltyTransactionRepository } from '@backend/modules/loyalty/repositories/loyalty-transaction.repository';
import { CustomerRedemptionRepository } from '@backend/modules/loyalty/repositories/customer-redemption.repository';
import { AdminLoyaltyTierService } from '@backend/modules/loyalty/services/admin-loyalty-tier.service';
import { AdminLoyaltyRewardService } from '@backend/modules/loyalty/services/admin-loyalty-reward.service';
import { AdminLoyaltyTransactionService } from '@backend/modules/loyalty/services/admin-loyalty-transaction.service';
import { AdminLoyaltyStatsService } from '@backend/modules/loyalty/services/admin-loyalty-stats.service';
import { SharedModule } from '@backend/modules/shared/shared.module';
import { AdminLoyaltyTiersRouter } from '@backend/modules/loyalty/routers/admin-loyalty-tiers.router';
import { AdminLoyaltyRewardsRouter } from '@backend/modules/loyalty/routers/admin-loyalty-rewards.router';
import { AdminLoyaltyTransactionsRouter } from '@backend/modules/loyalty/routers/admin-loyalty-transactions.router';
import { AdminLoyaltyStatsRouter } from '@backend/modules/loyalty/routers/admin-loyalty-stats.router';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LoyaltyTier,
      LoyaltyReward,
      LoyaltyTransaction,
      CustomerRedemption,
      Customer,
      User,
    ]),
    SharedModule,
  ],
  providers: [
    LoyaltyTierRepository,
    LoyaltyRewardRepository,
    LoyaltyTransactionRepository,
    CustomerRedemptionRepository,
    AdminLoyaltyTierService,
    AdminLoyaltyRewardService,
    AdminLoyaltyTransactionService,
    AdminLoyaltyStatsService,
    AdminLoyaltyTiersRouter,
    AdminLoyaltyRewardsRouter,
    AdminLoyaltyTransactionsRouter,
    AdminLoyaltyStatsRouter,
  ],
  exports: [
    TypeOrmModule,
    LoyaltyTierRepository,
    LoyaltyRewardRepository,
    LoyaltyTransactionRepository,
    CustomerRedemptionRepository,
    AdminLoyaltyTierService,
    AdminLoyaltyRewardService,
    AdminLoyaltyTransactionService,
    AdminLoyaltyStatsService,
    AdminLoyaltyTiersRouter,
    AdminLoyaltyRewardsRouter,
    AdminLoyaltyTransactionsRouter,
    AdminLoyaltyStatsRouter,
  ],
})
export class LoyaltyModule {}