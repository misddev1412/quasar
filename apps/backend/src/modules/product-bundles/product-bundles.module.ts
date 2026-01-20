import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductBundleEntity } from './entities/product-bundle.entity';
import { ProductBundleItemEntity } from './entities/product-bundle-item.entity';
import { ProductBundlesService } from './services/product-bundles.service';
import { AdminProductBundlesRouter } from './routers/admin-product-bundles.router';
import { SharedModule } from '../shared/shared.module';
import { Category } from '../products/entities/category.entity';
import { Product } from '../products/entities/product.entity';

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
