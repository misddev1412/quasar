import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Visitor, VisitorSession, PageView } from './entities';
import { VisitorRepository } from './repositories/visitor.repository';
import { VisitorTrackingService } from './services/visitor-tracking.service';
import { AdminVisitorStatisticsService } from './services/admin/admin-visitor-statistics.service';
import { VisitorTrackingMiddleware } from './middleware/visitor-tracking.middleware';
import { AdminVisitorStatisticsRouter } from './routers/admin-visitor-statistics.router';
import { ClientVisitorStatsRouter } from './routers/client-visitor-stats.router';
import { SharedModule } from '../shared/shared.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Visitor, VisitorSession, PageView]),
    SharedModule,
    UserModule,
  ],
  providers: [
    // Repositories
    VisitorRepository,

    // Services
    VisitorTrackingService,
    AdminVisitorStatisticsService,
    VisitorTrackingMiddleware,

    // Routers
    AdminVisitorStatisticsRouter,
    ClientVisitorStatsRouter,
  ],
  exports: [
    // Repositories
    VisitorRepository,

    // Services
    VisitorTrackingService,
    AdminVisitorStatisticsService,

    // Routers
    AdminVisitorStatisticsRouter,
    ClientVisitorStatsRouter,
  ],
})
export class VisitorModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply visitor tracking middleware to storefront routes
    consumer
      .apply(VisitorTrackingMiddleware)
      .forRoutes('/*'); // Apply to all routes, middleware will filter
  }
}
