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
import { Country } from './entities/country.entity';
import { AdministrativeDivision } from './entities/administrative-division.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { DeliveryMethod } from './entities/delivery-method.entity';
import { Wishlist } from './entities/wishlist.entity';
import { AttributeRepository } from './repositories/attribute.repository';
import { BrandRepository } from './repositories/brand.repository';
import { InventoryItemRepository } from './repositories/inventory-item.repository';
import { ProductRepository } from './repositories/product.repository';
import { ProductMediaRepository } from './repositories/product-media.repository';
import { ProductVariantRepository } from './repositories/product-variant.repository';
import { ProductVariantItemRepository } from './repositories/product-variant-item.repository';
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
import { DeliveryMethodRepository } from './repositories/delivery-method.repository';
import { WishlistRepository } from './repositories/wishlist.repository';
import { AdminProductService } from './services/admin-product.service';
import { WarehouseService } from './services/warehouse.service';
import { PurchaseOrderService } from './services/purchase-order.service';
import { AdminOrderService } from './services/admin-order.service';
import { AdminCustomerService } from './services/admin-customer.service';
import { PaymentMethodService } from './services/payment-method.service';
import { DeliveryMethodService } from './services/delivery-method.service';
import { ClientOrderService } from './services/client-order.service';
import { ProductTransformer } from './transformers/product.transformer';
import { SharedModule } from '../shared/shared.module';
import { AdminProductsRouter } from './routers/admin.router';
import { AdminProductAttributesRouter } from './routers/admin-attributes.router';
import { AdminProductBrandsRouter } from './routers/admin-brands.router';
import { AdminProductCategoriesRouter } from './routers/admin-categories.router';
import { AdminProductSuppliersRouter } from './routers/admin-suppliers.router';
import { AdminWarehousesRouter } from './routers/admin-warehouse.router';
import { PublicProductsRouter } from './routers/public.router';
import { AdminOrdersRouter } from './routers/admin-orders.router';
import { AdminCustomersRouter } from './routers/admin-customers.router';
import { AdminPaymentMethodsRouter } from './routers/admin-payment-methods.router';
import { AdminDeliveryMethodsRouter } from './routers/admin-delivery-methods.router';
import { AdminWishlistRouter } from './routers/admin-wishlist.router';
import { ClientOrdersRouter } from './routers/client-orders.router';
import { ClientProductsRouter } from '../../trpc/routers/client/products.router';

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
      AdministrativeDivision,
      PaymentMethod,
      DeliveryMethod,
      Wishlist,
      User,
    ]),
    SharedModule,
  ],
  providers: [
    AttributeRepository,
    BrandRepository,
    InventoryItemRepository,
    ProductRepository,
    ProductMediaRepository,
    ProductVariantRepository,
    ProductVariantItemRepository,
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
    DeliveryMethodRepository,
    WishlistRepository,
    ProductTransformer,
    AdminProductService,
    WarehouseService,
    PurchaseOrderService,
    AdminOrderService,
    AdminCustomerService,
        PaymentMethodService,
    DeliveryMethodService,
    AdminProductsRouter,
    AdminProductAttributesRouter,
    AdminProductBrandsRouter,
    AdminProductCategoriesRouter,
    AdminProductSuppliersRouter,
    AdminWarehousesRouter,
        PublicProductsRouter,
    AdminOrdersRouter,
    AdminCustomersRouter,
        AdminPaymentMethodsRouter,
    AdminDeliveryMethodsRouter,
    AdminWishlistRouter,
        ClientOrdersRouter,
        ClientOrderService,
        ClientProductsRouter,
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
    DeliveryMethodRepository,
    WishlistRepository,
    ProductTransformer,
    AdminProductService,
    WarehouseService,
    PurchaseOrderService,
    AdminOrderService,
    AdminCustomerService,
        PaymentMethodService,
    DeliveryMethodService,
    AdminProductsRouter,
    AdminProductAttributesRouter,
    AdminProductBrandsRouter,
    AdminProductCategoriesRouter,
    AdminProductSuppliersRouter,
    AdminWarehousesRouter,
        PublicProductsRouter,
    AdminOrdersRouter,
    AdminCustomersRouter,
        AdminPaymentMethodsRouter,
    AdminDeliveryMethodsRouter,
    AdminWishlistRouter,
        ClientOrdersRouter,
        ClientOrderService,
        ClientProductsRouter,
      ],
})
export class ProductsModule {}