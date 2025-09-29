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
  ],
})
export class AppRouterModule {}
