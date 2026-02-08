import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductBundleEntity } from '@backend/modules/product-bundles/entities/product-bundle.entity';
import { ProductBundleItemEntity } from '@backend/modules/product-bundles/entities/product-bundle-item.entity';
import { ProductBundlesService } from '@backend/modules/product-bundles/services/product-bundles.service';
import { AdminProductBundlesRouter } from '@backend/modules/product-bundles/routers/admin-product-bundles.router';
import { SharedModule } from '@backend/modules/shared/shared.module';
import { Category } from '@backend/modules/products/entities/category.entity';
import { Product } from '@backend/modules/products/entities/product.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ProductBundleEntity,
            ProductBundleItemEntity,
            Category,
            Product
        ]),
        SharedModule
    ],
    providers: [ProductBundlesService, AdminProductBundlesRouter],
    exports: [ProductBundlesService, AdminProductBundlesRouter],
})
export class ProductBundlesModule { }
