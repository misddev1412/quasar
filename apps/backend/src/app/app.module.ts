import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TRPCModule } from 'nestjs-trpc';
import { AppController } from '@backend/app/app.controller';
import { AppService } from '@backend/app/app.service';
import { UserModule } from '@backend/modules/user/user.module';
import { TranslationModule } from '@backend/modules/translation/translation.module';
import { SEOModule } from '@backend/modules/seo/seo.module';
import { SettingsModule } from '@backend/modules/settings/settings.module';
import { ChartModule } from '@backend/modules/chart/chart.module';
import { MailTemplateModule } from '@backend/modules/mail-template/mail-template.module';
import { PostsModule } from '@backend/modules/posts/posts.module';
import { EmailChannelModule } from '@backend/modules/email-channel/email-channel.module';
import { MailProviderModule } from '@backend/modules/mail-provider/mail-provider.module';
import { EmailFlowModule } from '@backend/modules/email-flow/email-flow.module';
import { MailLogModule } from '@backend/modules/mail-log/mail-log.module';
import { LanguageModule } from '@backend/modules/language/language.module';
import { StorageModule } from '@backend/modules/storage/storage.module';
import { AuthModule } from '@backend/auth/auth.module';
import { SharedModule } from '@backend/modules/shared/shared.module';
import { FirebaseModule } from '@backend/modules/firebase/firebase.module';
import { OpenAiModule } from '@backend/modules/openai/openai.module';
import { PageSpeedModule } from '@backend/modules/pagespeed/pagespeed.module';
import { ProductsModule } from '@backend/modules/products/products.module';
import { NotificationsModule } from '@backend/modules/notifications/notifications.module';
import { SectionsModule } from '@backend/modules/sections/sections.module';
import { MenuModule } from '@backend/modules/menus/menus.module';
import { SiteContentModule } from '@backend/modules/site-content/site-content.module';
import { AppContext } from '@backend/trpc/context';
import databaseConfig from '@backend/config/database.config';
import { User } from '@backend/modules/user/entities/user.entity';
import { UserProfile } from '@backend/modules/user/entities/user-profile.entity';
import { Permission } from '@backend/modules/user/entities/permission.entity';
import { Role } from '@backend/modules/user/entities/role.entity';
import { UserRole } from '@backend/modules/user/entities/user-role.entity';
import { RolePermission } from '@backend/modules/user/entities/role-permission.entity';
import { UserActivity } from '@backend/modules/user/entities/user-activity.entity';
import { UserSession } from '@backend/modules/user/entities/user-session.entity';
import { UserLoginProvider } from '@backend/modules/user/entities/user-login-provider.entity';
import { CustomerTransaction, CustomerTransactionEntry } from '@backend/modules/user/entities/customer-transaction.entity';
import { Translation } from '@backend/modules/translation/entities/translation.entity';
import { SEOEntity } from '@backend/modules/seo/entities/seo.entity';
import { SettingEntity } from '@backend/modules/settings/entities/setting.entity';
import { MailTemplate } from '@backend/modules/mail-template/entities/mail-template.entity';
import { Post } from '@backend/modules/posts/entities/post.entity';
import { PostTranslation } from '@backend/modules/posts/entities/post-translation.entity';
import { PostCategory } from '@backend/modules/posts/entities/post-category.entity';
import { PostTag } from '@backend/modules/posts/entities/post-tag.entity';
import { EmailChannel } from '@backend/modules/email-channel/entities/email-channel.entity';
import { MailProvider } from '@backend/modules/mail-provider/entities/mail-provider.entity';
import { EmailFlow } from '@backend/modules/email-flow/entities/email-flow.entity';
import { MailLog } from '@backend/modules/mail-log/entities/mail-log.entity';
import { MailQueue } from '@backend/modules/mail-queue/entities/mail-queue.entity';
import { Language } from '@backend/modules/language/entities/language.entity';
import { Media } from '@backend/modules/storage/entities/media.entity';
import { FirebaseConfigEntity } from '@backend/modules/firebase/entities/firebase-config.entity';
import { OpenAiConfigEntity } from '@backend/modules/openai/entities/openai-config.entity';
import { Brand } from '@backend/modules/products/entities/brand.entity';
import { Category } from '@backend/modules/products/entities/category.entity';
import { Product } from '@backend/modules/products/entities/product.entity';
import { ProductTag } from '@backend/modules/products/entities/product-tag.entity';
import { ProductVariant } from '@backend/modules/products/entities/product-variant.entity';
import { Warranty } from '@backend/modules/products/entities/warranty.entity';
import { Attribute } from '@backend/modules/products/entities/attribute.entity';
import { AttributeValue } from '@backend/modules/products/entities/attribute-value.entity';
import { ProductAttribute } from '@backend/modules/products/entities/product-attribute.entity';
import { NotificationEntity } from '@backend/modules/notifications/entities/notification.entity';
import { SectionEntity } from '@backend/modules/sections/entities/section.entity';
import { SectionTranslationEntity } from '@backend/modules/sections/entities/section-translation.entity';
import { MenuEntity } from '@backend/modules/menus/entities/menu.entity';
import { MenuTranslationEntity } from '@backend/modules/menus/entities/menu-translation.entity';
import { SiteContentEntity } from '@backend/modules/site-content/entities/site-content.entity';
import { createErrorFormatter } from '@backend/trpc/error-formatter';
import { AppRouterModule } from '@backend/trpc/app-router.module';
import { LoyaltyModule } from '@backend/modules/loyalty/loyalty.module';
import { LoyaltyTier } from '@backend/modules/loyalty/entities/loyalty-tier.entity';
import { LoyaltyReward } from '@backend/modules/loyalty/entities/loyalty-reward.entity';
import { LoyaltyTransaction } from '@backend/modules/loyalty/entities/loyalty-transaction.entity';
import { CustomerRedemption } from '@backend/modules/loyalty/entities/customer-redemption.entity';
import { VisitorModule } from '@backend/modules/visitor/visitor.module';
import { Visitor } from '@backend/modules/visitor/entities/visitor.entity';
import { VisitorSession } from '@backend/modules/visitor/entities/visitor-session.entity';
import { PageView } from '@backend/modules/visitor/entities/page-view.entity';
import { ComponentConfigsModule } from '@backend/modules/component-configs/component-configs.module';
import { ComponentConfigEntity } from '@backend/modules/component-configs/entities/component-config.entity';
import { DataExportModule } from '@backend/modules/export/data-export.module';
import { DataExportJob } from '@backend/modules/export/entities/data-export-job.entity';
import { MailQueueModule } from '@backend/modules/mail-queue/mail-queue.module';
import { ServicesModule } from '@backend/modules/services/services.module';
import { Service } from '@backend/modules/services/entities/service.entity';
import { ServiceTranslation } from '@backend/modules/services/entities/service-translation.entity';
import { ServiceItem } from '@backend/modules/services/entities/service-item.entity';
import { ServiceItemTranslation } from '@backend/modules/services/entities/service-item-translation.entity';
import { ThemesModule } from '@backend/modules/themes/themes.module';
import { ThemeEntity } from '@backend/modules/themes/entities/theme.entity';
import { ProductBundlesModule } from '@backend/modules/product-bundles/product-bundles.module';
import { ImportModule } from '@backend/modules/import/import.module';
import { DataImportJob } from '@backend/modules/import/entities/data-import-job.entity';
import { WorkerServicesModule } from '@backend/modules/worker-services/worker-services.module';
import { NewsletterModule } from '@backend/modules/newsletter/newsletter.module';
import { NewsletterSubscription } from '@backend/modules/newsletter/entities/newsletter-subscription.entity';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env'], // Priority: Root env only
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
          OpenAiConfigEntity,
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
          DataImportJob,
          NewsletterSubscription,
        ],
        autoLoadEntities: true
      }),
    }),
    AuthModule,
    FirebaseModule,
    OpenAiModule,
    PageSpeedModule,
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
    ProductBundlesModule,
    ImportModule,
    WorkerServicesModule,
    NewsletterModule,
    AppRouterModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppContext,
  ],
})
export class AppModule { }
