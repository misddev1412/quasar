import { Module } from '@nestjs/common';
import { ProductsModule } from '../modules/products/products.module';
import { FirebaseModule } from '../modules/firebase/firebase.module';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../modules/user/user.module';
import { PostsModule } from '../modules/posts/posts.module';
import { SettingsModule } from '../modules/settings/settings.module';
import { EmailChannelModule } from '../modules/email-channel/email-channel.module';
import { MailProviderModule } from '../modules/mail-provider/mail-provider.module';
import { EmailFlowModule } from '../modules/email-flow/email-flow.module';
import { MailTemplateModule } from '../modules/mail-template/mail-template.module';
import { MailLogModule } from '../modules/mail-log/mail-log.module';
import { LanguageModule } from '../modules/language/language.module';
import { ChartModule } from '../modules/chart/chart.module';
import { SEOModule } from '../modules/seo/seo.module';
import { StorageModule } from '../modules/storage/storage.module';
import { NotificationsModule } from '../modules/notifications/notifications.module';
import { SupportModule } from '../modules/support/support.module';
import { SectionsModule } from '../modules/sections/sections.module';
import { ServicesModule } from '../modules/services/services.module';
import { MenuModule } from '../modules/menus/menus.module';
import { SiteContentModule } from '../modules/site-content/site-content.module';
import { SharedModule } from '../modules/shared/shared.module';
import { ResponseService } from '../modules/shared/services/response.service';
import { ClientNewsRouter } from './routers/client/news.router';
import { ClientCategoriesRouter } from './routers/client/categories.router';
import { ClientProductsRouter } from './routers/client/products.router';
import { ClientBrandsRouter } from './routers/client/brands.router';
import { SectionsRouter } from './routers/sections.router';
import { AdminMenuRouter } from '../modules/menus/routers/admin-menu.router';
import { ClientMenuRouter } from '../modules/menus/routers/client-menu.router';
import { AdminSiteContentRouter } from '../modules/site-content/routers/admin-site-content.router';
import { ClientSiteContentRouter } from '../modules/site-content/routers/client-site-content.router';
import { LoyaltyModule } from '../modules/loyalty/loyalty.module';
import { AdminLoyaltyTiersRouter } from '../modules/loyalty/routers/admin-loyalty-tiers.router';
import { AdminLoyaltyRewardsRouter } from '../modules/loyalty/routers/admin-loyalty-rewards.router';
import { AdminLoyaltyTransactionsRouter } from '../modules/loyalty/routers/admin-loyalty-transactions.router';
import { AdminLoyaltyStatsRouter } from '../modules/loyalty/routers/admin-loyalty-stats.router';
import { AdminCustomerTransactionsRouter } from '../modules/user/routers/admin-customer-transactions.router';
import { AdminImpersonationRouter } from '../modules/user/routers/admin-impersonation.router';
import { AdminMailProviderRouter } from '../modules/mail-provider/routers/admin-mail-provider.router';
import { AdminMailChannelPriorityRouter } from '../modules/email-flow/routers/admin-mail-channel-priority.router';
import { AdminMailLogRouter } from '../modules/mail-log/routers/admin-mail-log.router';
import { VisitorModule } from '../modules/visitor/visitor.module';
import { AdminVisitorStatisticsRouter } from '../modules/visitor/routers/admin-visitor-statistics.router';
import { ClientVisitorStatsRouter } from '../modules/visitor/routers/client-visitor-stats.router';
import { AdminNotificationTelegramConfigsRouter } from '../modules/notifications/routers/admin-notification-telegram-configs.router';
import { AdminSupportClientsRouter } from '../modules/support/routers/admin-support-clients.router';
import { ComponentConfigsModule } from '../modules/component-configs/component-configs.module';
import { AdminComponentConfigsRouter } from '../modules/component-configs/routers/admin-component-configs.router';
import { ClientComponentConfigsRouter } from '../modules/component-configs/routers/client-component-configs.router';
import { AdminProductSpecificationLabelsRouter } from '../modules/products/routers/admin-product-specification-labels.router';
import { ServicesRouter } from '../modules/services/routers/services.router';

@Module({
  imports: [
    ProductsModule,
    FirebaseModule,
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
    ResponseService,
  ],
})
export class AppRouterModule { }
