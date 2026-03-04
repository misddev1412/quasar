import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attribute } from '@backend/modules/products/entities/attribute.entity';
import { AttributeTranslation } from '@backend/modules/products/entities/attribute-translation.entity';
import { AttributeValue } from '@backend/modules/products/entities/attribute-value.entity';
import { Brand } from '@backend/modules/products/entities/brand.entity';
import { BrandTranslation } from '@backend/modules/products/entities/brand-translation.entity';
import { Category } from '@backend/modules/products/entities/category.entity';
import { CategoryTranslation } from '@backend/modules/products/entities/category-translation.entity';
import { InventoryItem } from '@backend/modules/products/entities/inventory-item.entity';
import { Product } from '@backend/modules/products/entities/product.entity';
import { ProductAttribute } from '@backend/modules/products/entities/product-attribute.entity';
import { ProductCategory } from '@backend/modules/products/entities/product-category.entity';
import { ProductTag } from '@backend/modules/products/entities/product-tag.entity';
import { ProductVariant } from '@backend/modules/products/entities/product-variant.entity';
import { ProductVariantItem } from '@backend/modules/products/entities/product-variant-item.entity';
import { ProductMedia } from '@backend/modules/products/entities/product-media.entity';
import { ProductSpecification } from '@backend/modules/products/entities/product-specification.entity';
import { ProductSpecificationLabel } from '@backend/modules/products/entities/product-specification-label.entity';
import { ProductWarehouseQuantity } from '@backend/modules/products/entities/product-warehouse-quantity.entity';
import { ProductTranslation } from '@backend/modules/products/entities/product-translation.entity';
import { ProductPriceHistory } from '@backend/modules/products/entities/product-price-history.entity';
import { ProductVariantPriceHistory } from '@backend/modules/products/entities/product-variant-price-history.entity';
import { ProductReview } from '@backend/modules/products/entities/product-review.entity';
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
import { User } from '@backend/modules/user/entities/user.entity';
import { CustomerTransaction, CustomerTransactionEntry } from '@backend/modules/user/entities/customer-transaction.entity';
import { Country } from '@backend/modules/products/entities/country.entity';
import { AdministrativeDivision } from '@backend/modules/products/entities/administrative-division.entity';
import { PaymentMethod } from '@backend/modules/products/entities/payment-method.entity';
import { PaymentMethodProvider } from '@backend/modules/products/entities/payment-method-provider.entity';
import { DeliveryMethod } from '@backend/modules/products/entities/delivery-method.entity';
import { Wishlist } from '@backend/modules/products/entities/wishlist.entity';
import { ShippingProvider } from '@backend/modules/products/entities/shipping-provider.entity';
import { OrderFulfillment } from '@backend/modules/products/entities/order-fulfillment.entity';
import { FulfillmentItem } from '@backend/modules/products/entities/fulfillment-item.entity';
import { DeliveryTracking } from '@backend/modules/products/entities/delivery-tracking.entity';
import { Currency } from '@backend/modules/products/entities/currency.entity';
import { AttributeRepository } from '@backend/modules/products/repositories/attribute.repository';
import { BrandRepository } from '@backend/modules/products/repositories/brand.repository';
import { InventoryItemRepository } from '@backend/modules/products/repositories/inventory-item.repository';
import { ProductRepository } from '@backend/modules/products/repositories/product.repository';
import { ProductMediaRepository } from '@backend/modules/products/repositories/product-media.repository';
import { ProductVariantRepository } from '@backend/modules/products/repositories/product-variant.repository';
import { ProductVariantItemRepository } from '@backend/modules/products/repositories/product-variant-item.repository';
import { ProductSpecificationRepository } from '@backend/modules/products/repositories/product-specification.repository';
import { ProductSpecificationLabelRepository } from '@backend/modules/products/repositories/product-specification-label.repository';
import { ProductWarehouseQuantityRepository } from '@backend/modules/products/repositories/product-warehouse-quantity.repository';
import { PurchaseOrderRepository } from '@backend/modules/products/repositories/purchase-order.repository';
import { PurchaseOrderItemRepository } from '@backend/modules/products/repositories/purchase-order-item.repository';
import { StockMovementRepository } from '@backend/modules/products/repositories/stock-movement.repository';
import { CategoryRepository } from '@backend/modules/products/repositories/category.repository';
import { SupplierRepository } from '@backend/modules/products/repositories/supplier.repository';
import { WarehouseRepository } from '@backend/modules/products/repositories/warehouse.repository';
import { OrderRepository } from '@backend/modules/products/repositories/order.repository';
import { CustomerRepository } from '@backend/modules/products/repositories/customer.repository';
import { CountryRepository } from '@backend/modules/products/repositories/country.repository';
import { AdministrativeDivisionRepository } from '@backend/modules/products/repositories/administrative-division.repository';
import { PaymentMethodRepository } from '@backend/modules/products/repositories/payment-method.repository';
import { PaymentMethodProviderRepository } from '@backend/modules/products/repositories/payment-method-provider.repository';
import { DeliveryMethodRepository } from '@backend/modules/products/repositories/delivery-method.repository';
import { WishlistRepository } from '@backend/modules/products/repositories/wishlist.repository';
import { ShippingProviderRepository } from '@backend/modules/products/repositories/shipping-provider.repository';
import { OrderFulfillmentRepository } from '@backend/modules/products/repositories/order-fulfillment.repository';
import { FulfillmentItemRepository } from '@backend/modules/products/repositories/fulfillment-item.repository';
import { DeliveryTrackingRepository } from '@backend/modules/products/repositories/delivery-tracking.repository';
import { AdminProductService } from '@backend/modules/products/services/admin-product.service';
import { AdminCategoryService } from '@backend/modules/products/services/admin-category.service';
import { WarehouseService } from '@backend/modules/products/services/warehouse.service';
import { PurchaseOrderService } from '@backend/modules/products/services/purchase-order.service';
import { AdminOrderService } from '@backend/modules/products/services/admin-order.service';
import { AdminCustomerService } from '@backend/modules/products/services/admin-customer.service';
import { AdminCurrencyService } from '@backend/modules/products/services/admin-currency.service';
import { AdminShippingProviderService } from '@backend/modules/products/services/admin-shipping-provider.service';
import { AdminBrandService } from '@backend/modules/products/services/admin-brand.service';
import { PaymentMethodService } from '@backend/modules/products/services/payment-method.service';
import { DeliveryMethodService } from '@backend/modules/products/services/delivery-method.service';
import { ClientOrderService } from '@backend/modules/products/services/client-order.service';
import { OrderFulfillmentService } from '@backend/modules/products/services/order-fulfillment.service';
import { ShippingProviderService } from '@backend/modules/products/services/shipping-provider.service';
import { ProductTransformer } from '@backend/modules/products/transformers/product.transformer';
import { SharedModule } from '@backend/modules/shared/shared.module';
import { AdminProductsRouter } from '@backend/modules/products/routers/admin.router';
import { AdminProductSpecificationLabelsRouter } from '@backend/modules/products/routers/admin-product-specification-labels.router';
import { AdminProductAttributesRouter } from '@backend/modules/products/routers/admin-attributes.router';
import { AdminProductBrandsRouter } from '@backend/modules/products/routers/admin-brands.router';
import { AdminProductCategoriesRouter } from '@backend/modules/products/routers/admin-categories.router';
import { AdminProductSuppliersRouter } from '@backend/modules/products/routers/admin-suppliers.router';
import { AdminPurchaseOrdersRouter } from '@backend/modules/products/routers/admin-purchase-orders.router';
import { AdminWarehousesRouter } from '@backend/modules/products/routers/admin-warehouse.router';
import { PublicProductsRouter } from '@backend/modules/products/routers/public.router';
import { AdminOrdersRouter } from '@backend/modules/products/routers/admin-orders.router';
import { AdminOrderFulfillmentsRouter } from '@backend/modules/products/routers/admin-order-fulfillments.trpc';
import { AdminCustomersRouter } from '@backend/modules/products/routers/admin-customers.router';
import { AdminPaymentMethodsRouter } from '@backend/modules/products/routers/admin-payment-methods.router';
import { AdminCurrencyRouter } from '@backend/modules/products/routers/admin-currency.router';
import { ClientCurrencyRouter } from '@backend/modules/products/routers/client-currency.router';
import { AdminShippingProviderRouter } from '@backend/modules/products/routers/admin-shipping-provider.router';
import { AdminDeliveryMethodsRouter } from '@backend/modules/products/routers/admin-delivery-methods.router';
import { AdminWishlistRouter } from '@backend/modules/products/routers/admin-wishlist.router';
import { ClientOrdersRouter } from '@backend/modules/products/routers/client-orders.router';
import { ClientDeliveryMethodsRouter } from '@backend/modules/products/routers/client-delivery-methods.router';
import { StorageModule } from '@backend/modules/storage/storage.module';
import { TranslationModule } from '@backend/modules/translation/translation.module';
import { SettingsModule } from '@backend/modules/settings/settings.module';
import { DataExportModule } from '@backend/modules/export/data-export.module';
import { ExportProcessingModule } from '@backend/modules/export/export-processing.module';
import { PayosService } from '@backend/modules/products/services/payos.service';
import { PayosWebhookController } from '@backend/modules/products/controllers/payos-webhook.controller';
import { ImportModule } from '@backend/modules/import/import.module';

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
    ImportModule,
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
    PurchaseOrderItemRepository,
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
    AdminBrandService,
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
    AdminPurchaseOrdersRouter,
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
    PurchaseOrderItemRepository,
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
    AdminPurchaseOrdersRouter,
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
    AdminBrandService,
  ],
})
export class ProductsModule { }
