import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attribute } from './entities/attribute.entity';
import { AttributeTranslation } from './entities/attribute-translation.entity';
import { AttributeValue } from './entities/attribute-value.entity';
import { Brand } from './entities/brand.entity';
import { BrandTranslation } from './entities/brand-translation.entity';
import { Category } from './entities/category.entity';
import { CategoryTranslation } from './entities/category-translation.entity';
import { InventoryItem } from './entities/inventory-item.entity';
import { Product } from './entities/product.entity';
import { ProductAttribute } from './entities/product-attribute.entity';
import { ProductCategory } from './entities/product-category.entity';
import { ProductTag } from './entities/product-tag.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductVariantItem } from './entities/product-variant-item.entity';
import { ProductMedia } from './entities/product-media.entity';
import { ProductSpecification } from './entities/product-specification.entity';
import { ProductSpecificationLabel } from './entities/product-specification-label.entity';
import { ProductWarehouseQuantity } from './entities/product-warehouse-quantity.entity';
import { ProductTranslation } from './entities/product-translation.entity';
import { ProductPriceHistory } from './entities/product-price-history.entity';
import { ProductVariantPriceHistory } from './entities/product-variant-price-history.entity';
import { ProductReview } from './entities/product-review.entity';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { StockMovement } from './entities/stock-movement.entity';
import { Supplier } from './entities/supplier.entity';
import { SupplierTranslation } from './entities/supplier-translation.entity';
import { Warehouse } from './entities/warehouse.entity';
import { WarehouseLocation } from './entities/warehouse-location.entity';
import { Warranty } from './entities/warranty.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Customer } from './entities/customer.entity';
import { User } from '../user/entities/user.entity';
import { CustomerTransaction, CustomerTransactionEntry } from '../user/entities/customer-transaction.entity';
import { Country } from './entities/country.entity';
import { AdministrativeDivision } from './entities/administrative-division.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { PaymentMethodProvider } from './entities/payment-method-provider.entity';
import { DeliveryMethod } from './entities/delivery-method.entity';
import { Wishlist } from './entities/wishlist.entity';
import { ShippingProvider } from './entities/shipping-provider.entity';
import { OrderFulfillment } from './entities/order-fulfillment.entity';
import { FulfillmentItem } from './entities/fulfillment-item.entity';
import { DeliveryTracking } from './entities/delivery-tracking.entity';
import { Currency } from './entities/currency.entity';
import { AttributeRepository } from './repositories/attribute.repository';
import { BrandRepository } from './repositories/brand.repository';
import { InventoryItemRepository } from './repositories/inventory-item.repository';
import { ProductRepository } from './repositories/product.repository';
import { ProductMediaRepository } from './repositories/product-media.repository';
import { ProductVariantRepository } from './repositories/product-variant.repository';
import { ProductVariantItemRepository } from './repositories/product-variant-item.repository';
import { ProductSpecificationRepository } from './repositories/product-specification.repository';
import { ProductSpecificationLabelRepository } from './repositories/product-specification-label.repository';
import { ProductWarehouseQuantityRepository } from './repositories/product-warehouse-quantity.repository';
import { PurchaseOrderRepository } from './repositories/purchase-order.repository';
import { StockMovementRepository } from './repositories/stock-movement.repository';
import { CategoryRepository } from './repositories/category.repository';
import { SupplierRepository } from './repositories/supplier.repository';
import { WarehouseRepository } from './repositories/warehouse.repository';
import { OrderRepository } from './repositories/order.repository';
import { CustomerRepository } from './repositories/customer.repository';
import { CountryRepository } from './repositories/country.repository';
import { AdministrativeDivisionRepository } from './repositories/administrative-division.repository';
import { PaymentMethodRepository } from './repositories/payment-method.repository';
import { PaymentMethodProviderRepository } from './repositories/payment-method-provider.repository';
import { DeliveryMethodRepository } from './repositories/delivery-method.repository';
import { WishlistRepository } from './repositories/wishlist.repository';
import { ShippingProviderRepository } from './repositories/shipping-provider.repository';
import { OrderFulfillmentRepository } from './repositories/order-fulfillment.repository';
import { FulfillmentItemRepository } from './repositories/fulfillment-item.repository';
import { DeliveryTrackingRepository } from './repositories/delivery-tracking.repository';
import { AdminProductService } from './services/admin-product.service';
import { AdminCategoryService } from './services/admin-category.service';
import { WarehouseService } from './services/warehouse.service';
import { PurchaseOrderService } from './services/purchase-order.service';
import { AdminOrderService } from './services/admin-order.service';
import { AdminCustomerService } from './services/admin-customer.service';
import { AdminCurrencyService } from './services/admin-currency.service';
import { AdminShippingProviderService } from './services/admin-shipping-provider.service';
import { PaymentMethodService } from './services/payment-method.service';
import { DeliveryMethodService } from './services/delivery-method.service';
import { ClientOrderService } from './services/client-order.service';
import { OrderFulfillmentService } from './services/order-fulfillment.service';
import { ShippingProviderService } from './services/shipping-provider.service';
import { ProductTransformer } from './transformers/product.transformer';
import { SharedModule } from '../shared/shared.module';
import { AdminProductsRouter } from './routers/admin.router';
import { AdminProductSpecificationLabelsRouter } from './routers/admin-product-specification-labels.router';
import { AdminProductAttributesRouter } from './routers/admin-attributes.router';
import { AdminProductBrandsRouter } from './routers/admin-brands.router';
import { AdminProductCategoriesRouter } from './routers/admin-categories.router';
import { AdminProductSuppliersRouter } from './routers/admin-suppliers.router';
import { AdminWarehousesRouter } from './routers/admin-warehouse.router';
import { PublicProductsRouter } from './routers/public.router';
import { AdminOrdersRouter } from './routers/admin-orders.router';
import { AdminOrderFulfillmentsRouter } from './routers/admin-order-fulfillments.trpc';
import { AdminCustomersRouter } from './routers/admin-customers.router';
import { AdminPaymentMethodsRouter } from './routers/admin-payment-methods.router';
import { AdminCurrencyRouter } from './routers/admin-currency.router';
import { ClientCurrencyRouter } from './routers/client-currency.router';
import { AdminShippingProviderRouter } from './routers/admin-shipping-provider.router';
import { AdminDeliveryMethodsRouter } from './routers/admin-delivery-methods.router';
import { AdminWishlistRouter } from './routers/admin-wishlist.router';
import { ClientOrdersRouter } from './routers/client-orders.router';
import { ClientDeliveryMethodsRouter } from './routers/client-delivery-methods.router';
import { StorageModule } from '../storage/storage.module';
import { TranslationModule } from '../translation/translation.module';
import { SettingsModule } from '../settings/settings.module';
import { DataExportModule } from '../export/data-export.module';
import { ExportProcessingModule } from '../export/export-processing.module';
import { PayosService } from './services/payos.service';
import { PayosWebhookController } from './controllers/payos-webhook.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Attribute,
      AttributeTranslation,
      AttributeValue,
      Brand,
      BrandTranslation,
      Category,
      CategoryTranslation,
      InventoryItem,
      Product,
      ProductAttribute,
      ProductCategory,
      ProductTag,
      ProductVariant,
      ProductVariantItem,
      ProductMedia,
      ProductSpecification,
      ProductSpecificationLabel,
      ProductWarehouseQuantity,
      ProductTranslation,
      ProductPriceHistory,
      ProductVariantPriceHistory,
      ProductReview,
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
      CustomerTransaction,
      CustomerTransactionEntry,
      Country,
      Currency,
      AdministrativeDivision,
      PaymentMethod,
      PaymentMethodProvider,
      DeliveryMethod,
      Wishlist,
      User,
      ShippingProvider,
      OrderFulfillment,
      FulfillmentItem,
      DeliveryTracking,
    ]),
    SharedModule,
    StorageModule,
    TranslationModule,
    SettingsModule,
    DataExportModule,
    ExportProcessingModule,
  ],
  controllers: [PayosWebhookController],
  providers: [
    AttributeRepository,
    BrandRepository,
    InventoryItemRepository,
    ProductRepository,
    ProductMediaRepository,
    ProductVariantRepository,
    ProductVariantItemRepository,
    ProductSpecificationRepository,
    ProductSpecificationLabelRepository,
    ProductWarehouseQuantityRepository,
    PurchaseOrderRepository,
    StockMovementRepository,
    CategoryRepository,
    SupplierRepository,
    WarehouseRepository,
    OrderRepository,
    CustomerRepository,
    CountryRepository,
    AdministrativeDivisionRepository,
    PaymentMethodRepository,
    PaymentMethodProviderRepository,
    DeliveryMethodRepository,
    WishlistRepository,
    ShippingProviderRepository,
    OrderFulfillmentRepository,
    FulfillmentItemRepository,
    DeliveryTrackingRepository,
    ProductTransformer,
    AdminProductService,
    AdminCategoryService,
    WarehouseService,
    PurchaseOrderService,
    AdminOrderService,
    AdminCustomerService,
    AdminCurrencyService,
    AdminShippingProviderService,
    PaymentMethodService,
    PayosService,
    DeliveryMethodService,
    ClientOrderService,
    OrderFulfillmentService,
    ShippingProviderService,
    AdminProductsRouter,
    AdminProductAttributesRouter,
    AdminProductBrandsRouter,
    AdminProductCategoriesRouter,
    AdminProductSuppliersRouter,
    AdminProductSpecificationLabelsRouter,
    AdminWarehousesRouter,
    PublicProductsRouter,
    AdminOrdersRouter,
    AdminOrderFulfillmentsRouter,
    AdminCustomersRouter,
    AdminPaymentMethodsRouter,
    AdminCurrencyRouter,
    ClientCurrencyRouter,
    AdminShippingProviderRouter,
    AdminDeliveryMethodsRouter,
    AdminWishlistRouter,
    ClientOrdersRouter,
    ClientOrderService,
    ClientDeliveryMethodsRouter,
  ],
  exports: [
    TypeOrmModule,
    AttributeRepository,
    BrandRepository,
    InventoryItemRepository,
    ProductRepository,
    ProductMediaRepository,
    ProductVariantRepository,
    ProductVariantItemRepository,
    ProductSpecificationRepository,
    ProductSpecificationLabelRepository,
    ProductWarehouseQuantityRepository,
    PurchaseOrderRepository,
    StockMovementRepository,
    CategoryRepository,
    SupplierRepository,
    WarehouseRepository,
    OrderRepository,
    CustomerRepository,
    CountryRepository,
    AdministrativeDivisionRepository,
    PaymentMethodRepository,
    PaymentMethodProviderRepository,
    DeliveryMethodRepository,
    WishlistRepository,
    ShippingProviderRepository,
    OrderFulfillmentRepository,
    FulfillmentItemRepository,
    DeliveryTrackingRepository,
    ProductTransformer,
    AdminProductService,
    WarehouseService,
    PurchaseOrderService,
    AdminOrderService,
    AdminCustomerService,
    AdminCurrencyService,
    PaymentMethodService,
    PayosService,
    DeliveryMethodService,
    AdminProductsRouter,
    AdminProductAttributesRouter,
    AdminProductBrandsRouter,
    AdminProductCategoriesRouter,
    AdminProductSuppliersRouter,
    AdminProductSpecificationLabelsRouter,
    AdminWarehousesRouter,
    PublicProductsRouter,
    AdminOrdersRouter,
    AdminOrderFulfillmentsRouter,
    AdminCustomersRouter,
    AdminPaymentMethodsRouter,
    AdminCurrencyRouter,
    ClientCurrencyRouter,
    AdminShippingProviderRouter,
    AdminDeliveryMethodsRouter,
    AdminWishlistRouter,
    ClientOrdersRouter,
    ClientOrderService,
    ClientDeliveryMethodsRouter,
    OrderFulfillmentService,
    ShippingProviderService,
    AdminShippingProviderService,
  ],
})
export class ProductsModule { }
