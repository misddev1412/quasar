import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Entities
import { MailProvider } from '@backend/modules/mail-provider/entities/mail-provider.entity';
import { MailTemplate } from '@backend/modules/mail-template/entities/mail-template.entity';
import { MailLog } from '@backend/modules/mail-log/entities/mail-log.entity';
import { NotificationEntity } from '@backend/modules/notifications/entities/notification.entity';
import { NotificationPreferenceEntity } from '@backend/modules/notifications/entities/notification-preference.entity';
import { NotificationChannelConfigEntity } from '@backend/modules/notifications/entities/notification-channel-config.entity';
import { User } from '@backend/modules/user/entities/user.entity';
import { UserProfile } from '@backend/modules/user/entities/user-profile.entity';
import { UserRole } from '@backend/modules/user/entities/user-role.entity';
import { Role } from '@backend/modules/user/entities/role.entity';
import { RolePermission } from '@backend/modules/user/entities/role-permission.entity';
import { Permission } from '@backend/modules/user/entities/permission.entity';
import { UserLoginProvider } from '@backend/modules/user/entities/user-login-provider.entity';
import { FirebaseConfigEntity } from '@backend/modules/firebase/entities/firebase-config.entity';
import { EmailFlow } from '@backend/modules/email-flow/entities/email-flow.entity';
import { Product } from '@backend/modules/products/entities/product.entity';
import { ProductCategory } from '@backend/modules/products/entities/product-category.entity';
import { Category } from '@backend/modules/products/entities/category.entity';
import { CategoryTranslation } from '@backend/modules/products/entities/category-translation.entity';
import { Brand } from '@backend/modules/products/entities/brand.entity';
import { BrandTranslation } from '@backend/modules/products/entities/brand-translation.entity';
import { Attribute } from '@backend/modules/products/entities/attribute.entity';
import { AttributeTranslation } from '@backend/modules/products/entities/attribute-translation.entity';
import { AttributeValue } from '@backend/modules/products/entities/attribute-value.entity';
import { InventoryItem } from '@backend/modules/products/entities/inventory-item.entity';
import { ProductAttribute } from '@backend/modules/products/entities/product-attribute.entity';
import { ProductTag } from '@backend/modules/products/entities/product-tag.entity';
import { ProductVariant } from '@backend/modules/products/entities/product-variant.entity';
import { ProductVariantItem } from '@backend/modules/products/entities/product-variant-item.entity';
import { ProductMedia } from '@backend/modules/products/entities/product-media.entity';
import { ProductSpecification } from '@backend/modules/products/entities/product-specification.entity';
import { PurchaseOrder } from '@backend/modules/products/entities/purchase-order.entity';
import { PurchaseOrderItem } from '@backend/modules/products/entities/purchase-order-item.entity';
import { StockMovement } from '@backend/modules/products/entities/stock-movement.entity';
import { Supplier } from '@backend/modules/products/entities/supplier.entity';
import { SupplierTranslation } from '@backend/modules/products/entities/supplier-translation.entity';
import { Warehouse } from '@backend/modules/products/entities/warehouse.entity';
import { WarehouseLocation } from '@backend/modules/products/entities/warehouse-location.entity';
import { Warranty } from '@backend/modules/products/entities/warranty.entity';
import { Order } from '@backend/modules/products/entities/order.entity';
import { OrderItem } from '@backend/modules/products/entities/order-item.entity';
import { Customer } from '@backend/modules/products/entities/customer.entity';
import { Country } from '@backend/modules/products/entities/country.entity';
import { AdministrativeDivision } from '@backend/modules/products/entities/administrative-division.entity';
import { PaymentMethod } from '@backend/modules/products/entities/payment-method.entity';
import { DeliveryMethod } from '@backend/modules/products/entities/delivery-method.entity';
import { Wishlist } from '@backend/modules/products/entities/wishlist.entity';
import { ShippingProvider } from '@backend/modules/products/entities/shipping-provider.entity';
import { OrderFulfillment } from '@backend/modules/products/entities/order-fulfillment.entity';
import { FulfillmentItem } from '@backend/modules/products/entities/fulfillment-item.entity';
import { DeliveryTracking } from '@backend/modules/products/entities/delivery-tracking.entity';
import { Currency } from '@backend/modules/products/entities/currency.entity';
import { AddressBook } from '@backend/modules/user/entities/address-book.entity';
import { AddressBookConfig } from '@backend/modules/user/entities/address-book-config.entity';
import { CustomerTransaction, CustomerTransactionEntry } from '@backend/modules/user/entities/customer-transaction.entity';
import { ProductTranslation } from '@backend/modules/products/entities/product-translation.entity';

// Repositories
import { MailProviderRepository } from '@backend/modules/mail-provider/repositories/mail-provider.repository';
import { MailTemplateRepository } from '@backend/modules/mail-template/repositories/mail-template.repository';
import { MailLogRepository } from '@backend/modules/mail-log/repositories/mail-log.repository';
import { NotificationRepository } from '@backend/modules/notifications/repositories/notification.repository';
import { NotificationPreferenceRepository } from '@backend/modules/notifications/repositories/notification-preference.repository';
import { NotificationChannelConfigRepository } from '@backend/modules/notifications/repositories/notification-channel-config.repository';
import { UserRepository } from '@backend/modules/user/repositories/user.repository';
import { EmailFlowRepository } from '@backend/modules/email-flow/repositories/email-flow.repository';
import { ProductRepository } from '@backend/modules/products/repositories/product.repository';
import { OrderRepository } from '@backend/modules/products/repositories/order.repository';
import { BrandRepository } from '@backend/modules/products/repositories/brand.repository';

// Services
import { MailProviderService } from '@backend/modules/mail-provider/services/mail-provider.service';
import { MailTemplateService } from '@backend/modules/mail-template/services/mail-template.service';
import { MailLogService } from '@backend/modules/mail-log/services/mail-log.service';
import { NotificationService } from '@backend/modules/notifications/services/notification.service';
import { NotificationPreferenceService } from '@backend/modules/notifications/services/notification-preference.service';
import { NotificationChannelConfigService } from '@backend/modules/notifications/services/notification-channel-config.service';
import { FirebaseMessagingService } from '@backend/modules/notifications/services/firebase-messaging.service';
import { FirebaseAuthService } from '@backend/modules/firebase/services/firebase-auth.service';
import { FirebaseConfigService } from '@backend/modules/firebase/services/firebase-config.service';
import { FirebaseConfigRepository } from '@backend/modules/firebase/repositories/firebase-config.repository';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { EmailFlowService } from '@backend/modules/email-flow/services/email-flow.service';

// Worker-specific services
import { WorkerEmailService } from '@backend/modules/worker-services/services/worker-email.service';
import { WorkerNotificationService } from '@backend/modules/worker-services/services/worker-notification.service';
import { WorkerOrderService } from '@backend/modules/worker-services/services/worker-order.service';
import { WorkerReportService } from '@backend/modules/worker-services/services/worker-report.service';
import { UserExportHandler } from '@backend/modules/worker-services/handlers/user-export.handler';
import { ProductExportHandler } from '@backend/modules/worker-services/handlers/product-export.handler';
import { ProductTemplateExportHandler } from '@backend/modules/worker-services/handlers/product-template-export.handler';
import { DataExportModule } from '@backend/modules/export/data-export.module';
import { StorageModule } from '@backend/modules/storage/storage.module';
import { OrderExportHandler } from '@backend/modules/worker-services/handlers/order-export.handler';
import { BrandExportHandler } from '@backend/modules/worker-services/handlers/brand-export.handler';
import { BrandTemplateExportHandler } from '@backend/modules/worker-services/handlers/brand-template-export.handler';
import { ExportProcessingModule } from '@backend/modules/export/export-processing.module';
import { WorkerExportService } from '@backend/modules/export/services/worker-export.service';
import { NotificationsModule } from '@backend/modules/notifications/notifications.module';
import { SettingsModule } from '@backend/modules/settings/settings.module';
import { FirebaseModule } from '@backend/modules/firebase/firebase.module';

@Global()
@Module({
  imports: [
    ConfigModule,
    DataExportModule,
    ExportProcessingModule,
    StorageModule,
    TypeOrmModule.forFeature([
      MailProvider,
      MailTemplate,
      MailLog,
      NotificationEntity,
      NotificationPreferenceEntity,
      NotificationChannelConfigEntity,
      User,
      UserProfile,
      UserRole,
      Role,
      RolePermission,
      Permission,
      UserLoginProvider,
      FirebaseConfigEntity,
      EmailFlow,
      Product,
      ProductCategory,
      Category,
      CategoryTranslation,
      Brand,
      BrandTranslation,
      Attribute,
      AttributeTranslation,
      AttributeValue,
      InventoryItem,
      ProductAttribute,
      ProductTag,
      ProductVariant,
      ProductVariantItem,
      ProductMedia,
      ProductSpecification,
      ProductTranslation,
      PurchaseOrder,
      PurchaseOrderItem,
      StockMovement,
      Supplier,
      SupplierTranslation,
      Warehouse,
      WarehouseLocation,
      Warranty,
      Order,
      OrderItem,
      Customer,
      Country,
      Currency,
      AdministrativeDivision,
      PaymentMethod,
      DeliveryMethod,
      Wishlist,
      ShippingProvider,
      OrderFulfillment,
      FulfillmentItem,
      DeliveryTracking,
      AddressBook,
      AddressBookConfig,
      CustomerTransaction,
      CustomerTransactionEntry,
    ]),
    SettingsModule,
    NotificationsModule,
    FirebaseModule,
  ],
  providers: [
    // Shared Services
    ResponseService,

    // Repositories
    MailProviderRepository,
    MailTemplateRepository,
    MailLogRepository,
    NotificationRepository,
    NotificationPreferenceRepository,
    NotificationChannelConfigRepository,
    UserRepository,
    FirebaseConfigRepository,
    EmailFlowRepository,
    ProductRepository,
    OrderRepository,
    BrandRepository,

    // Backend Services
    MailProviderService,
    MailTemplateService,
    MailLogService,
    FirebaseConfigService,
    FirebaseAuthService,
    FirebaseMessagingService,
    NotificationPreferenceService,
    NotificationChannelConfigService,
    NotificationService,
    EmailFlowService,

    // Worker Services
    WorkerEmailService,
    WorkerNotificationService,
    WorkerOrderService,
    WorkerReportService,
    UserExportHandler,
    ProductExportHandler,
    ProductTemplateExportHandler,
    OrderExportHandler,
    BrandExportHandler,
    BrandTemplateExportHandler,
  ],
  exports: [
    // Export worker services for use by processors
    WorkerEmailService,
    WorkerNotificationService,
    WorkerOrderService,
    WorkerReportService,
    // Also export base services for direct usage if needed
    MailProviderService,
    NotificationService,
    MailLogService,
    EmailFlowService,
    ExportProcessingModule,
  ],
})
export class WorkerServicesModule { }
