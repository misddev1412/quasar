import { Module } from '@nestjs/common';
import { ProductsModule } from '@backend/modules/products/products.module';
import { ProductBundlesModule } from '@backend/modules/product-bundles/product-bundles.module';
import { FirebaseModule } from '@backend/modules/firebase/firebase.module';
import { OpenAiModule } from '@backend/modules/openai/openai.module';
import { PageSpeedModule } from '@backend/modules/pagespeed/pagespeed.module';
import { AuthModule } from '@backend/auth/auth.module';
import { UserModule } from '@backend/modules/user/user.module';
import { PostsModule } from '@backend/modules/posts/posts.module';
import { SettingsModule } from '@backend/modules/settings/settings.module';
import { EmailChannelModule } from '@backend/modules/email-channel/email-channel.module';
import { MailProviderModule } from '@backend/modules/mail-provider/mail-provider.module';
import { EmailFlowModule } from '@backend/modules/email-flow/email-flow.module';
import { MailTemplateModule } from '@backend/modules/mail-template/mail-template.module';
import { MailLogModule } from '@backend/modules/mail-log/mail-log.module';
import { LanguageModule } from '@backend/modules/language/language.module';
import { ChartModule } from '@backend/modules/chart/chart.module';
import { SEOModule } from '@backend/modules/seo/seo.module';
import { StorageModule } from '@backend/modules/storage/storage.module';
import { NotificationsModule } from '@backend/modules/notifications/notifications.module';
import { SupportModule } from '@backend/modules/support/support.module';
import { SectionsModule } from '@backend/modules/sections/sections.module';
import { ServicesModule } from '@backend/modules/services/services.module';
import { ThemesModule } from '@backend/modules/themes/themes.module';
import { MenuModule } from '@backend/modules/menus/menus.module';
import { SiteContentModule } from '@backend/modules/site-content/site-content.module';
import { SharedModule } from '@backend/modules/shared/shared.module';
import { TranslationModule } from '@backend/modules/translation/translation.module';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { ClientNewsRouter } from '@backend/trpc/routers/client/news.router';
import { ClientCategoriesRouter } from '@backend/trpc/routers/client/categories.router';
import { ClientProductsRouter } from '@backend/trpc/routers/client/products.router';
import { ClientBrandsRouter } from '@backend/trpc/routers/client/brands.router';
import { TranslationRouter } from '@backend/trpc/routers/translation.router';
import { SectionsRouter } from '@backend/trpc/routers/sections.router';
import { AdminMenuRouter } from '@backend/modules/menus/routers/admin-menu.router';
import { ClientMenuRouter } from '@backend/modules/menus/routers/client-menu.router';
import { AdminSiteContentRouter } from '@backend/modules/site-content/routers/admin-site-content.router';
import { ClientSiteContentRouter } from '@backend/modules/site-content/routers/client-site-content.router';
import { LoyaltyModule } from '@backend/modules/loyalty/loyalty.module';
import { AdminLoyaltyTiersRouter } from '@backend/modules/loyalty/routers/admin-loyalty-tiers.router';
import { AdminLoyaltyRewardsRouter } from '@backend/modules/loyalty/routers/admin-loyalty-rewards.router';
import { AdminLoyaltyTransactionsRouter } from '@backend/modules/loyalty/routers/admin-loyalty-transactions.router';
import { AdminLoyaltyStatsRouter } from '@backend/modules/loyalty/routers/admin-loyalty-stats.router';
import { AdminCustomerTransactionsRouter } from '@backend/modules/user/routers/admin-customer-transactions.router';
import { AdminImpersonationRouter } from '@backend/modules/user/routers/admin-impersonation.router';
import { AdminMailProviderRouter } from '@backend/modules/mail-provider/routers/admin-mail-provider.router';
import { AdminMailChannelPriorityRouter } from '@backend/modules/email-flow/routers/admin-mail-channel-priority.router';
import { AdminMailLogRouter } from '@backend/modules/mail-log/routers/admin-mail-log.router';
import { VisitorModule } from '@backend/modules/visitor/visitor.module';
import { AdminVisitorStatisticsRouter } from '@backend/modules/visitor/routers/admin-visitor-statistics.router';
import { ClientVisitorStatsRouter } from '@backend/modules/visitor/routers/client-visitor-stats.router';
import { AdminNotificationTelegramConfigsRouter } from '@backend/modules/notifications/routers/admin-notification-telegram-configs.router';
import { AdminSupportClientsRouter } from '@backend/modules/support/routers/admin-support-clients.router';
import { ComponentConfigsModule } from '@backend/modules/component-configs/component-configs.module';
import { AdminComponentConfigsRouter } from '@backend/modules/component-configs/routers/admin-component-configs.router';
import { ClientComponentConfigsRouter } from '@backend/modules/component-configs/routers/client-component-configs.router';
import { AdminProductSpecificationLabelsRouter } from '@backend/modules/products/routers/admin-product-specification-labels.router';
import { ServicesRouter } from '@backend/modules/services/routers/services.router';
import { ClientServicesRouter } from '@backend/trpc/routers/client/services.router';
import { AdminThemesRouter } from '@backend/modules/themes/routers/admin-themes.router';
import { PublicThemesRouter } from '@backend/modules/themes/routers/public-themes.router';
import { AdminProductBundlesRouter } from '@backend/modules/product-bundles/routers/admin-product-bundles.router';
import { AdminOpenAiConfigRouter } from '@backend/modules/openai/routers/admin-openai-config.router';
import { AdminPageSpeedRouter } from '@backend/modules/pagespeed/routers/admin-page-speed.router';
import { ImportModule } from '@backend/modules/import/import.module';
import { AdminImportRouter } from '@backend/modules/import/routers/admin-import.router';
import { NewsletterModule } from '@backend/modules/newsletter/newsletter.module';

import { ClientNewsletterRouter } from '@backend/trpc/routers/client/newsletter.router';

@Module({
  imports: [
    ProductsModule,
    FirebaseModule,
    OpenAiModule,
    PageSpeedModule,
    AuthModule,
    UserModule,
    PostsModule,
    SettingsModule,
    EmailChannelModule,
    MailProviderModule,
    EmailFlowModule,
    MailTemplateModule,
    MailLogModule,
    LanguageModule,
    ChartModule,
    SEOModule,
    StorageModule,
    NotificationsModule,
    SupportModule,
    SectionsModule,
    MenuModule,
    SiteContentModule,
    LoyaltyModule,
    VisitorModule,
    SharedModule,
    ComponentConfigsModule,
    ServicesModule,
    ThemesModule,
    TranslationModule,
    TranslationModule,
    ProductBundlesModule,
    ImportModule,
    NewsletterModule,
  ],
  providers: [
    ClientNewsRouter,
    ClientCategoriesRouter,
    ClientProductsRouter,
    ClientBrandsRouter,
    SectionsRouter,
    AdminMenuRouter,
    ClientMenuRouter,
    AdminSiteContentRouter,
    ClientSiteContentRouter,
    AdminLoyaltyTiersRouter,
    AdminLoyaltyRewardsRouter,
    AdminLoyaltyTransactionsRouter,
    AdminLoyaltyStatsRouter,
    AdminCustomerTransactionsRouter,
    AdminMailProviderRouter,
    AdminMailChannelPriorityRouter,
    AdminMailLogRouter,
    AdminVisitorStatisticsRouter,
    ClientVisitorStatsRouter,
    AdminNotificationTelegramConfigsRouter,
    AdminSupportClientsRouter,
    AdminImpersonationRouter,
    AdminComponentConfigsRouter,
    ClientComponentConfigsRouter,
    AdminProductSpecificationLabelsRouter,
    ServicesRouter,
    ClientServicesRouter,
    AdminThemesRouter,
    PublicThemesRouter,
    PublicThemesRouter,
    TranslationRouter,
    ResponseService,
    AdminProductBundlesRouter,
    AdminProductBundlesRouter,
    AdminOpenAiConfigRouter,
    AdminPageSpeedRouter,
    AdminImportRouter,
    ClientNewsletterRouter,
  ],
})
export class AppRouterModule { }
