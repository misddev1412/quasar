import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TRPCModule } from 'nestjs-trpc';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from '../modules/user/user.module';
import { TranslationModule } from '../modules/translation/translation.module';
import { SEOModule } from '../modules/seo/seo.module';
import { SettingsModule } from '../modules/settings/settings.module';
import { ChartModule } from '../modules/chart/chart.module';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../modules/shared/shared.module';
import { AppContext } from '../trpc/context';
import databaseConfig from '../config/database.config';
import { User } from '../modules/user/entities/user.entity';
import { UserProfile } from '../modules/user/entities/user-profile.entity';
import { Permission } from '../modules/user/entities/permission.entity';
import { Role } from '../modules/user/entities/role.entity';
import { UserRole } from '../modules/user/entities/user-role.entity';
import { RolePermission } from '../modules/user/entities/role-permission.entity';
import { UserActivity } from '../modules/user/entities/user-activity.entity';
import { UserSession } from '../modules/user/entities/user-session.entity';
import { Translation } from '../modules/translation/entities/translation.entity';
import { SEOEntity } from '../modules/seo/entities/seo.entity';
import { SettingEntity } from '../modules/settings/entities/setting.entity';
import { createErrorFormatter } from '../trpc/error-formatter';
import { AdminAuthRouter } from '../trpc/routers/admin/auth.router';
import { AdminUserStatisticsRouter } from '../trpc/routers/admin/user-statistics.router';
import { AdminChartDataRouter } from '../trpc/routers/admin/chart-data.router';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
        entities: [
          User,
          UserProfile,
          Permission,
          Role,
          UserRole,
          RolePermission,
          UserActivity,
          UserSession,
          Translation,
          SEOEntity,
          SettingEntity
        ],
        autoLoadEntities: true
      }),
    }),
    AuthModule,
    TRPCModule.forRoot({
      context: AppContext,
      errorFormatter: createErrorFormatter('TRPCModule.forRoot'),
    }),
    SharedModule,
    UserModule,
    TranslationModule,
    SEOModule,
    SettingsModule,
    ChartModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppContext,
    AdminAuthRouter,
    AdminUserStatisticsRouter,
    AdminChartDataRouter,
  ],
})
export class AppModule {}
