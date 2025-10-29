import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoyaltyTier } from './entities/loyalty-tier.entity';
import { LoyaltyReward } from './entities/loyalty-reward.entity';
import { LoyaltyTransaction } from './entities/loyalty-transaction.entity';
import { CustomerRedemption } from './entities/customer-redemption.entity';
import { Customer } from '../products/entities/customer.entity';
import { User } from '../user/entities/user.entity';
import { LoyaltyTierRepository } from './repositories/loyalty-tier.repository';
import { LoyaltyRewardRepository } from './repositories/loyalty-reward.repository';
import { LoyaltyTransactionRepository } from './repositories/loyalty-transaction.repository';
import { CustomerRedemptionRepository } from './repositories/customer-redemption.repository';
import { AdminLoyaltyTierService } from './services/admin-loyalty-tier.service';
import { AdminLoyaltyRewardService } from './services/admin-loyalty-reward.service';
import { AdminLoyaltyTransactionService } from './services/admin-loyalty-transaction.service';
import { AdminLoyaltyStatsService } from './services/admin-loyalty-stats.service';
import { SharedModule } from '../shared/shared.module';
import { AdminLoyaltyTiersRouter } from './routers/admin-loyalty-tiers.router';
import { AdminLoyaltyRewardsRouter } from './routers/admin-loyalty-rewards.router';
import { AdminLoyaltyTransactionsRouter } from './routers/admin-loyalty-transactions.router';
import { AdminLoyaltyStatsRouter } from './routers/admin-loyalty-stats.router';

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