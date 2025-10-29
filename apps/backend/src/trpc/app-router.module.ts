import { Module } from '@nestjs/common';
import { ProductsModule } from '../modules/products/products.module';
import { FirebaseModule } from '../modules/firebase/firebase.module';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../modules/user/user.module';
import { PostsModule } from '../modules/posts/posts.module';
import { SettingsModule } from '../modules/settings/settings.module';
import { EmailChannelModule } from '../modules/email-channel/email-channel.module';
import { MailTemplateModule } from '../modules/mail-template/mail-template.module';
import { LanguageModule } from '../modules/language/language.module';
import { ChartModule } from '../modules/chart/chart.module';
import { SEOModule } from '../modules/seo/seo.module';
import { StorageModule } from '../modules/storage/storage.module';
import { NotificationsModule } from '../modules/notifications/notifications.module';
import { SupportModule } from '../modules/support/support.module';
import { SectionsModule } from '../modules/sections/sections.module';
import { MenuModule } from '../modules/menus/menus.module';
import { SiteContentModule } from '../modules/site-content/site-content.module';
import { SharedModule } from '../modules/shared/shared.module';
import { ResponseService } from '../modules/shared/services/response.service';
import { ClientNewsRouter } from './routers/client/news.router';
import { ClientCategoriesRouter } from './routers/client/categories.router';
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

@Module({
  imports: [
    ProductsModule,
    FirebaseModule,
    AuthModule,
    UserModule,
    PostsModule,
    SettingsModule,
    EmailChannelModule,
    MailTemplateModule,
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
    SharedModule,
  ],
  providers: [
    ClientNewsRouter,
    ClientCategoriesRouter,
    SectionsRouter,
    AdminMenuRouter,
    ClientMenuRouter,
    AdminSiteContentRouter,
    ClientSiteContentRouter,
    AdminLoyaltyTiersRouter,
    AdminLoyaltyRewardsRouter,
    AdminLoyaltyTransactionsRouter,
    AdminLoyaltyStatsRouter,
    ResponseService,
  ],
})
export class AppRouterModule {}
