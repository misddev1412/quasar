import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attribute } from './entities/attribute.entity';
import { AttributeTranslation } from './entities/attribute-translation.entity';
import { AttributeValue } from './entities/attribute-value.entity';
import { Brand } from './entities/brand.entity';
import { BrandTranslation } from './entities/brand-translation.entity';
import { Category } from './entities/category.entity';
import { CategoryTranslation } from './entities/category-translation.entity';
import { Product } from './entities/product.entity';
import { ProductAttribute } from './entities/product-attribute.entity';
import { ProductTag } from './entities/product-tag.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductVariantItem } from './entities/product-variant-item.entity';
import { ProductMedia } from './entities/product-media.entity';
import { Warranty } from './entities/warranty.entity';
import { AttributeRepository } from './repositories/attribute.repository';
import { BrandRepository } from './repositories/brand.repository';
import { ProductRepository } from './repositories/product.repository';
import { ProductMediaRepository } from './repositories/product-media.repository';
import { ProductVariantRepository } from './repositories/product-variant.repository';
import { ProductVariantItemRepository } from './repositories/product-variant-item.repository';
import { CategoryRepository } from './repositories/category.repository';
import { AdminProductService } from './services/admin-product.service';
import { ProductTransformer } from './transformers/product.transformer';
import { SharedModule } from '../shared/shared.module';
import { AdminProductsRouter } from './routers/admin.router';
import { AdminProductAttributesRouter } from './routers/admin-attributes.router';
import { AdminProductBrandsRouter } from './routers/admin-brands.router';
import { AdminProductCategoriesRouter } from './routers/admin-categories.router';
import { ClientProductsRouter } from './routers/client.router';
import { PublicProductsRouter } from './routers/public.router';

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
      Product,
      ProductAttribute,
      ProductTag,
      ProductVariant,
      ProductVariantItem,
      ProductMedia,
      Warranty,
    ]),
    SharedModule,
  ],
  providers: [
    AttributeRepository,
    BrandRepository,
    ProductRepository,
    ProductMediaRepository,
    ProductVariantRepository,
    ProductVariantItemRepository,
    CategoryRepository,
    ProductTransformer,
    AdminProductService,
    AdminProductsRouter,
    AdminProductAttributesRouter,
    AdminProductBrandsRouter,
    AdminProductCategoriesRouter,
    ClientProductsRouter,
    PublicProductsRouter,
  ],
  exports: [
    TypeOrmModule,
    AttributeRepository,
    BrandRepository,
    ProductRepository,
    ProductMediaRepository,
    ProductVariantRepository,
    ProductVariantItemRepository,
    CategoryRepository,
    ProductTransformer,
    AdminProductService,
    AdminProductsRouter,
    AdminProductAttributesRouter,
    AdminProductBrandsRouter,
    AdminProductCategoriesRouter,
    ClientProductsRouter,
    PublicProductsRouter,
  ],
})
export class ProductsModule {}