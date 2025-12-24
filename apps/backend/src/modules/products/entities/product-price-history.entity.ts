import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './product.entity';
// import { User } from '../../users/entities/user.entity'; // Assuming User entity location, will adjust if needed

@Entity('product_price_history')
export class ProductPriceHistory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'product_id' })
    productId: string;

    @ManyToOne(() => Product, (product) => product.priceHistory, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @Column('decimal', { precision: 15, scale: 2, nullable: true })
    price: number;

    @Column('decimal', { name: 'compare_at_price', precision: 15, scale: 2, nullable: true })
    compareAtPrice: number;

    @Column({ name: 'is_contact_price', default: false })
    isContactPrice: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @Column({ name: 'created_by', nullable: true })
    createdBy: string;

    // Relation to User if needed later, keeping it simple with ID for now to avoid circular deps or complex path finding
}
