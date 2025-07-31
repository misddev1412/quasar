import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { UserProfile } from '../user/entities/user-profile.entity';
import { AdminChartDataService } from './services/admin-chart-data.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile]),
  ],
  providers: [
    AdminChartDataService,
  ],
  exports: [
    AdminChartDataService,
  ],
})
export class ChartModule {}
