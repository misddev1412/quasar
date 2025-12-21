import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Entities
import { MailProvider } from '../mail-provider/entities/mail-provider.entity';
import { MailTemplate } from '../mail-template/entities/mail-template.entity';
import { MailLog } from '../mail-log/entities/mail-log.entity';
import { NotificationEntity } from '../notifications/entities/notification.entity';
import { NotificationPreferenceEntity } from '../notifications/entities/notification-preference.entity';
import { NotificationChannelConfigEntity } from '../notifications/entities/notification-channel-config.entity';
import { User } from '../user/entities/user.entity';
import { UserProfile } from '../user/entities/user-profile.entity';
import { UserRole } from '../user/entities/user-role.entity';
import { Role } from '../user/entities/role.entity';
import { RolePermission } from '../user/entities/role-permission.entity';
import { Permission } from '../user/entities/permission.entity';
import { UserLoginProvider } from '../user/entities/user-login-provider.entity';
import { FirebaseConfigEntity } from '../firebase/entities/firebase-config.entity';
import { EmailFlow } from '../email-flow/entities/email-flow.entity';
import { Product } from '../products/entities/product.entity';
import { ProductCategory } from '../products/entities/product-category.entity';
import { Category } from '../products/entities/category.entity';
import { CategoryTranslation } from '../products/entities/category-translation.entity';
import { Brand } from '../products/entities/brand.entity';
import { BrandTranslation } from '../products/entities/brand-translation.entity';
import { Attribute } from '../products/entities/attribute.entity';
import { AttributeTranslation } from '../products/entities/attribute-translation.entity';
import { AttributeValue } from '../products/entities/attribute-value.entity';
import { InventoryItem } from '../products/entities/inventory-item.entity';
import { ProductAttribute } from '../products/entities/product-attribute.entity';
import { ProductTag } from '../products/entities/product-tag.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { ProductVariantItem } from '../products/entities/product-variant-item.entity';
import { ProductMedia } from '../products/entities/product-media.entity';
import { ProductSpecification } from '../products/entities/product-specification.entity';
import { PurchaseOrder } from '../products/entities/purchase-order.entity';
import { PurchaseOrderItem } from '../products/entities/purchase-order-item.entity';
import { StockMovement } from '../products/entities/stock-movement.entity';
import { Supplier } from '../products/entities/supplier.entity';
import { SupplierTranslation } from '../products/entities/supplier-translation.entity';
import { Warehouse } from '../products/entities/warehouse.entity';
import { WarehouseLocation } from '../products/entities/warehouse-location.entity';
import { Warranty } from '../products/entities/warranty.entity';
import { Order } from '../products/entities/order.entity';
import { OrderItem } from '../products/entities/order-item.entity';
import { Customer } from '../products/entities/customer.entity';
import { Country } from '../products/entities/country.entity';
import { AdministrativeDivision } from '../products/entities/administrative-division.entity';
import { PaymentMethod } from '../products/entities/payment-method.entity';
import { DeliveryMethod } from '../products/entities/delivery-method.entity';
import { Wishlist } from '../products/entities/wishlist.entity';
import { ShippingProvider } from '../products/entities/shipping-provider.entity';
import { OrderFulfillment } from '../products/entities/order-fulfillment.entity';
import { FulfillmentItem } from '../products/entities/fulfillment-item.entity';
import { DeliveryTracking } from '../products/entities/delivery-tracking.entity';
import { Currency } from '../products/entities/currency.entity';
import { AddressBook } from '../user/entities/address-book.entity';
import { AddressBookConfig } from '../user/entities/address-book-config.entity';
import { CustomerTransaction, CustomerTransactionEntry } from '../user/entities/customer-transaction.entity';
import { ProductTranslation } from '../products/entities/product-translation.entity';

// Repositories
import { MailProviderRepository } from '../mail-provider/repositories/mail-provider.repository';
import { MailTemplateRepository } from '../mail-template/repositories/mail-template.repository';
import { MailLogRepository } from '../mail-log/repositories/mail-log.repository';
import { NotificationRepository } from '../notifications/repositories/notification.repository';
import { NotificationPreferenceRepository } from '../notifications/repositories/notification-preference.repository';
import { NotificationChannelConfigRepository } from '../notifications/repositories/notification-channel-config.repository';
import { UserRepository } from '../user/repositories/user.repository';
import { EmailFlowRepository } from '../email-flow/repositories/email-flow.repository';
import { ProductRepository } from '../products/repositories/product.repository';
import { OrderRepository } from '../products/repositories/order.repository';

// Services
import { MailProviderService } from '../mail-provider/services/mail-provider.service';
import { MailTemplateService } from '../mail-template/services/mail-template.service';
import { MailLogService } from '../mail-log/services/mail-log.service';
import { NotificationService } from '../notifications/services/notification.service';
import { NotificationPreferenceService } from '../notifications/services/notification-preference.service';
import { NotificationChannelConfigService } from '../notifications/services/notification-channel-config.service';
import { FirebaseMessagingService } from '../notifications/services/firebase-messaging.service';
import { FirebaseAuthService } from '../firebase/services/firebase-auth.service';
import { FirebaseConfigService } from '../firebase/services/firebase-config.service';
import { FirebaseConfigRepository } from '../firebase/repositories/firebase-config.repository';
import { ResponseService } from '../shared/services/response.service';
import { EmailFlowService } from '../email-flow/services/email-flow.service';

// Worker-specific services
import { WorkerEmailService } from './services/worker-email.service';
import { WorkerNotificationService } from './services/worker-notification.service';
import { WorkerOrderService } from './services/worker-order.service';
import { WorkerReportService } from './services/worker-report.service';
import { WorkerExportService } from './services/worker-export.service';
import { UserExportHandler } from './handlers/user-export.handler';
import { ProductExportHandler } from './handlers/product-export.handler';
import { DataExportModule } from '../export/data-export.module';
import { StorageModule } from '../storage/storage.module';
import { OrderExportHandler } from './handlers/order-export.handler';

@Global()
@Module({
  imports: [
    ConfigModule,
    DataExportModule,
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
    WorkerExportService,
    UserExportHandler,
    ProductExportHandler,
    OrderExportHandler,
  ],
  exports: [
    // Export worker services for use by processors
    WorkerEmailService,
    WorkerNotificationService,
    WorkerOrderService,
    WorkerReportService,
    WorkerExportService,
    
    // Also export base services for direct usage if needed
    MailProviderService,
    NotificationService,
    MailLogService,
    EmailFlowService,
  ],
})
export class WorkerServicesModule {}
