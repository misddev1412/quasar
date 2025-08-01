import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { UserProfile } from '../user/entities/user-profile.entity';
import { UserActivity } from '../user/entities/user-activity.entity';
import { UserSession } from '../user/entities/user-session.entity';
import { UserActivityRepository } from '../user/repositories/user-activity.repository';
import { UserSessionRepository } from '../user/repositories/user-session.repository';
import { AdminChartDataService } from './services/admin-chart-data.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile, UserActivity, UserSession]),
  ],
  providers: [
    UserActivityRepository,
    UserSessionRepository,
    AdminChartDataService,
  ],
  exports: [
    AdminChartDataService,
  ],
})
export class ChartModule {}
