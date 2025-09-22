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
import { FirebaseModule } from '../modules/firebase/firebase.module';
import { ProductsModule } from '../modules/products/products.module';
import { NotificationsModule } from '../modules/notifications/notifications.module';
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
import { createErrorFormatter } from '../trpc/error-formatter';
import { AppRouterModule } from '../trpc/app-router.module';

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
    LanguageModule,
    StorageModule,
    ProductsModule,
    NotificationsModule,
    AppRouterModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppContext,
  ],
})
export class AppModule {}
