
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { BaseEntity } from '@shared';
import { ProductBundleItemEntity } from './product-bundle-item.entity';

@Entity('product_bundles')
export class ProductBundleEntity extends BaseEntity {
    @Column()
    name: string;

    @Column({ unique: true })
    slug: string;

    @Column({ nullable: true, type: 'text' })
    description: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @OneToMany(() => ProductBundleItemEntity, (item) => item.bundle, {
        cascade: true,
    })
    items: ProductBundleItemEntity[];
}
