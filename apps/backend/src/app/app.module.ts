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
import { MailProviderModule } from '../modules/mail-provider/mail-provider.module';
import { EmailFlowModule } from '../modules/email-flow/email-flow.module';
import { MailLogModule } from '../modules/mail-log/mail-log.module';
import { LanguageModule } from '../modules/language/language.module';
import { StorageModule } from '../modules/storage/storage.module';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../modules/shared/shared.module';
import { FirebaseModule } from '../modules/firebase/firebase.module';
import { ProductsModule } from '../modules/products/products.module';
import { NotificationsModule } from '../modules/notifications/notifications.module';
import { SectionsModule } from '../modules/sections/sections.module';
import { MenuModule } from '../modules/menus/menus.module';
import { SiteContentModule } from '../modules/site-content/site-content.module';
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
import { UserLoginProvider } from '../modules/user/entities/user-login-provider.entity';
import { CustomerTransaction, CustomerTransactionEntry } from '../modules/user/entities/customer-transaction.entity';
import { Translation } from '../modules/translation/entities/translation.entity';
import { SEOEntity } from '../modules/seo/entities/seo.entity';
import { SettingEntity } from '../modules/settings/entities/setting.entity';
import { MailTemplate } from '../modules/mail-template/entities/mail-template.entity';
import { Post } from '../modules/posts/entities/post.entity';
import { PostTranslation } from '../modules/posts/entities/post-translation.entity';
import { PostCategory } from '../modules/posts/entities/post-category.entity';
import { PostTag } from '../modules/posts/entities/post-tag.entity';
import { EmailChannel } from '../modules/email-channel/entities/email-channel.entity';
import { MailProvider } from '../modules/mail-provider/entities/mail-provider.entity';
import { EmailFlow } from '../modules/email-flow/entities/email-flow.entity';
import { MailLog } from '../modules/mail-log/entities/mail-log.entity';
import { MailQueue } from '../modules/mail-queue/entities/mail-queue.entity';
import { Language } from '../modules/language/entities/language.entity';
import { Media } from '../modules/storage/entities/media.entity';
import { FirebaseConfigEntity } from '../modules/firebase/entities/firebase-config.entity';
import { Brand } from '../modules/products/entities/brand.entity';
import { Category } from '../modules/products/entities/category.entity';
import { Product } from '../modules/products/entities/product.entity';
import { ProductTag } from '../modules/products/entities/product-tag.entity';
import { ProductVariant } from '../modules/products/entities/product-variant.entity';
import { Warranty } from '../modules/products/entities/warranty.entity';
import { Attribute } from '../modules/products/entities/attribute.entity';
import { AttributeValue } from '../modules/products/entities/attribute-value.entity';
import { ProductAttribute } from '../modules/products/entities/product-attribute.entity';
import { NotificationEntity } from '../modules/notifications/entities/notification.entity';
import { SectionEntity } from '../modules/sections/entities/section.entity';
import { SectionTranslationEntity } from '../modules/sections/entities/section-translation.entity';
import { MenuEntity } from '../modules/menus/entities/menu.entity';
import { MenuTranslationEntity } from '../modules/menus/entities/menu-translation.entity';
import { SiteContentEntity } from '../modules/site-content/entities/site-content.entity';
import { createErrorFormatter } from '../trpc/error-formatter';
import { AppRouterModule } from '../trpc/app-router.module';
import { LoyaltyModule } from '../modules/loyalty/loyalty.module';
import { LoyaltyTier } from '../modules/loyalty/entities/loyalty-tier.entity';
import { LoyaltyReward } from '../modules/loyalty/entities/loyalty-reward.entity';
import { LoyaltyTransaction } from '../modules/loyalty/entities/loyalty-transaction.entity';
import { CustomerRedemption } from '../modules/loyalty/entities/customer-redemption.entity';
import { VisitorModule } from '../modules/visitor/visitor.module';
import { Visitor } from '../modules/visitor/entities/visitor.entity';
import { VisitorSession } from '../modules/visitor/entities/visitor-session.entity';
import { PageView } from '../modules/visitor/entities/page-view.entity';
import { ComponentConfigsModule } from '../modules/component-configs/component-configs.module';
import { ComponentConfigEntity } from '../modules/component-configs/entities/component-config.entity';
import { DataExportModule } from '../modules/export/data-export.module';
import { DataExportJob } from '../modules/export/entities/data-export-job.entity';
import { MailQueueModule } from '../modules/mail-queue/mail-queue.module';
import { ServicesModule } from '../modules/services/services.module';
import { Service } from '../modules/services/entities/service.entity';
import { ServiceTranslation } from '../modules/services/entities/service-translation.entity';
import { ServiceItem } from '../modules/services/entities/service-item.entity';
import { ServiceItemTranslation } from '../modules/services/entities/service-item-translation.entity';
import { ThemesModule } from '../modules/themes/themes.module';
import { ThemeEntity } from '../modules/themes/entities/theme.entity';


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
          UserLoginProvider,
          CustomerTransaction,
          CustomerTransactionEntry,
          Translation,
          SEOEntity,
          SettingEntity,
          MailTemplate,
          Post,
          PostTranslation,
          PostCategory,
          PostTag,
          EmailChannel,
          MailProvider,
          EmailFlow,
          MailQueue,
          MailLog,
          Language,
          Media,
          FirebaseConfigEntity,
          Brand,
          Category,
          Product,
          ProductTag,
          ProductVariant,
          Warranty,
          Attribute,
          AttributeValue,
          ProductAttribute,
          NotificationEntity,
          SectionEntity,
          SectionTranslationEntity,
          MenuEntity,
          MenuTranslationEntity,
          SiteContentEntity,
          LoyaltyTier,
          LoyaltyReward,
          LoyaltyTransaction,
          CustomerRedemption,
          Visitor,
          VisitorSession,
          PageView,
          ComponentConfigEntity,
          DataExportJob,
          Service,
          ServiceTranslation,
          ServiceItem,
          ServiceItemTranslation,
          ThemeEntity,
        ],
        autoLoadEntities: true
      }),
    }),
    AuthModule,
    FirebaseModule,
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
    MailProviderModule,
    EmailFlowModule,
    MailLogModule,
    LanguageModule,
    StorageModule,
    ProductsModule,
    NotificationsModule,
    SectionsModule,
    MenuModule,
    SiteContentModule,
    LoyaltyModule,
    VisitorModule,
    ComponentConfigsModule,
    DataExportModule,
    MailQueueModule,
    ServicesModule,
    ThemesModule,
    AppRouterModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppContext,
  ],
})
export class AppModule { }
