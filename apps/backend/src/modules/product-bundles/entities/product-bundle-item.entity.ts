
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    ManyToMany,
    JoinTable,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { BaseEntity } from '@shared';
import { ProductBundleEntity } from './product-bundle.entity';
import { Category } from '../../products/entities/category.entity';
import { Product } from '../../products/entities/product.entity';

export enum BundleItemMode {
    CATEGORY = 'category',
    PRODUCT = 'product',
}

@Entity('product_bundle_items')
export class ProductBundleItemEntity extends BaseEntity {
    @Column({ name: 'bundle_id' })
    bundleId: string;

    @ManyToOne(() => ProductBundleEntity, (bundle) => bundle.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'bundle_id' })
    bundle: ProductBundleEntity;

    @Column()
    label: string;

    @Column({
        type: 'enum',
        enum: BundleItemMode,
        default: BundleItemMode.CATEGORY,
    })
    mode: BundleItemMode;

    @ManyToMany(() => Category)
    @JoinTable({
        name: 'product_bundle_item_categories',
        joinColumn: { name: 'item_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
    })
    categories: Category[];

    @ManyToMany(() => Product)
    @JoinTable({
        name: 'product_bundle_item_products',
        joinColumn: { name: 'item_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'product_id', referencedColumnName: 'id' },
    })
    products: Product[];

    @Column({ default: 0 })
    position: number;
}
