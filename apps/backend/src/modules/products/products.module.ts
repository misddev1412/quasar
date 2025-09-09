import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from './entities/brand.entity';
import { Category } from './entities/category.entity';
import { Product } from './entities/product.entity';
import { ProductTag } from './entities/product-tag.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { Warranty } from './entities/warranty.entity';
import { BrandRepository } from './repositories/brand.repository';
import { ProductRepository } from './repositories/product.repository';
import { CategoryRepository } from './repositories/category.repository';
import { AdminProductService } from './services/admin-product.service';
import { SharedModule } from '../shared/shared.module';
import { AdminProductsRouter } from './routers/admin.router';
import { AdminProductBrandsRouter } from './routers/admin-brands.router';
import { AdminProductCategoriesRouter } from './routers/admin-categories.router';
import { ClientProductsRouter } from './routers/client.router';
import { PublicProductsRouter } from './routers/public.router';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Brand,
      Category,
      Product,
      ProductTag,
      ProductVariant,
      Warranty,
    ]),
    SharedModule,
  ],
  providers: [
    BrandRepository,
    ProductRepository,
    CategoryRepository,
    AdminProductService,
    AdminProductsRouter,
    AdminProductBrandsRouter,
    AdminProductCategoriesRouter,
    ClientProductsRouter,
    PublicProductsRouter,
  ],
  exports: [
    TypeOrmModule,
    BrandRepository,
    ProductRepository,
    CategoryRepository,
    AdminProductService,
    AdminProductsRouter,
    AdminProductBrandsRouter,
    AdminProductCategoriesRouter,
    ClientProductsRouter,
    PublicProductsRouter,
  ],
})
export class ProductsModule {}