import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@backend/modules/user/entities/user.entity';
import { UserProfile } from '@backend/modules/user/entities/user-profile.entity';
import { UserActivity } from '@backend/modules/user/entities/user-activity.entity';
import { UserSession } from '@backend/modules/user/entities/user-session.entity';
import { UserActivityRepository } from '@backend/modules/user/repositories/user-activity.repository';
import { UserSessionRepository } from '@backend/modules/user/repositories/user-session.repository';
import { AdminChartDataService } from '@backend/modules/chart/services/admin-chart-data.service';
import { AdminChartDataRouter } from '@backend/modules/chart/routers/admin-chart-data.router';
import { SharedModule } from '@backend/modules/shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile, UserActivity, UserSession]),
    SharedModule,
  ],
  providers: [
    UserActivityRepository,
    UserSessionRepository,
    AdminChartDataService,
    AdminChartDataRouter,
  ],
  exports: [
    AdminChartDataService,
    AdminChartDataRouter,
  ],
})
export class ChartModule {}
