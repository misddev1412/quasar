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
import { MailTemplateModule } from '../modules/mail-template/mail-template.module';
import { PostsModule } from '../modules/posts/posts.module';
import { EmailChannelModule } from '../modules/email-channel/email-channel.module';
import { LanguageModule } from '../modules/language/language.module';
import { StorageModule } from '../modules/storage/storage.module';
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
import { MailTemplate } from '../modules/mail-template/entities/mail-template.entity';
import { Post } from '../modules/posts/entities/post.entity';
import { PostTranslation } from '../modules/posts/entities/post-translation.entity';
import { PostCategory } from '../modules/posts/entities/post-category.entity';
import { PostTag } from '../modules/posts/entities/post-tag.entity';
import { EmailChannel } from '../modules/email-channel/entities/email-channel.entity';
import { Language } from '../modules/language/entities/language.entity';
import { Media } from '../modules/storage/entities/media.entity';
import { createErrorFormatter } from '../trpc/error-formatter';
import { AdminAuthRouter } from '../trpc/routers/admin/auth.router';
import { AdminUserRouter } from '../trpc/routers/admin/user.router';
import { AdminUserStatisticsRouter } from '../trpc/routers/admin/user-statistics.router';
import { AdminUserActivityRouter } from '../trpc/routers/admin/user-activity.router';
import { AdminRoleRouter } from '../trpc/routers/admin/role.router';
import { AdminPermissionRouter } from '../trpc/routers/admin/permission.router';
import { AdminChartDataRouter } from '../trpc/routers/admin/chart-data.router';
import { AdminMailTemplateRouter } from '../trpc/routers/admin/mail-template.router';
import { AdminPostsRouter } from '../trpc/routers/admin/posts.router';
import { AdminPostCategoriesRouter } from '../trpc/routers/admin/post-categories.router';
import { AdminPostTagsRouter } from '../trpc/routers/admin/post-tags.router';
import { AdminEmailChannelRouter } from '../trpc/routers/admin/email-channel.router';
import { AdminLanguageRouter } from '../trpc/routers/admin/language.router';
import { AdminStorageRouter } from '../trpc/routers/admin/storage.router';
import { AdminMediaRouter } from '../trpc/routers/admin/media.router';

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
          SettingEntity,
          MailTemplate,
          Post,
          PostTranslation,
          PostCategory,
          PostTag,
          EmailChannel,
          Language,
          Media
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
    MailTemplateModule,
    PostsModule,
    EmailChannelModule,
    LanguageModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppContext,
    AdminAuthRouter,
    AdminUserRouter,
    AdminUserStatisticsRouter,
    AdminUserActivityRouter,
    AdminRoleRouter,
    AdminPermissionRouter,
    AdminChartDataRouter,
    AdminMailTemplateRouter,
    AdminPostsRouter,
    AdminPostCategoriesRouter,
    AdminPostTagsRouter,
    AdminEmailChannelRouter,
    AdminLanguageRouter,
    AdminStorageRouter,
    AdminMediaRouter,
  ],
})
export class AppModule {}
