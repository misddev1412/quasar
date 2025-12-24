import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductVariant } from './product-variant.entity';

@Entity('product_variant_price_history')
export class ProductVariantPriceHistory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'variant_id' })
    variantId: string;

    @ManyToOne(() => ProductVariant, (variant) => variant.priceHistory, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'variant_id' })
    variant: ProductVariant;

    @Column('decimal', { precision: 15, scale: 2, nullable: true })
    price: number;

    @Column('decimal', { name: 'compare_at_price', precision: 15, scale: 2, nullable: true })
    compareAtPrice: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @Column({ name: 'created_by', nullable: true })
    createdBy: string;
}
