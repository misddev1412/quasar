import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Visitor, VisitorSession, PageView } from '@backend/modules/visitor/entities';
import { VisitorStatistics } from '@backend/modules/visitor/entities/visitor-statistics.entity';
import { VisitorRepository } from '@backend/modules/visitor/repositories/visitor.repository';
import { VisitorTrackingService } from '@backend/modules/visitor/services/visitor-tracking.service';
import { AdminVisitorStatisticsService } from '@backend/modules/visitor/services/admin/admin-visitor-statistics.service';
import { VisitorTrackingMiddleware } from '@backend/modules/visitor/middleware/visitor-tracking.middleware';
import { AdminVisitorStatisticsRouter } from '@backend/modules/visitor/routers/admin-visitor-statistics.router';
import { ClientVisitorStatsRouter } from '@backend/modules/visitor/routers/client-visitor-stats.router';
import { SharedModule } from '@backend/modules/shared/shared.module';
import { UserModule } from '@backend/modules/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Visitor, VisitorSession, PageView, VisitorStatistics]),
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
