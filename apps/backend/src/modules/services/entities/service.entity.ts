import { Entity, Column, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { ServiceTranslation } from './service-translation.entity';
import { ServiceItem } from './service-item.entity';
import { Currency } from '../../products/entities/currency.entity';

@Entity('services')
export class Service extends BaseEntity {
    @Expose()
    @Column({
        name: 'unit_price',
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0,
    })
    unitPrice: number;

    @Expose()
    @Column({
        name: 'currency_id',
        type: 'uuid',
        nullable: true,
    })
    currencyId?: string;

    @Expose()
    @Column({
        name: 'is_contact_price',
        type: 'boolean',
        default: false,
    })
    isContactPrice: boolean;

    @Expose()
    @Column({
        type: 'text',
        nullable: true,
    })
    thumbnail?: string;

    @Expose()
    @Column({
        name: 'is_active',
        type: 'boolean',
        default: true,
    })
    isActive: boolean;

    // Relations
    @OneToMany(() => ServiceTranslation, (translation) => translation.service, {
        cascade: true,
        eager: false,
    })
    translations: ServiceTranslation[];

    @OneToMany(() => ServiceItem, (item) => item.service, {
        cascade: true,
        eager: false,
    })
    items: ServiceItem[];

    @ManyToOne(() => Currency, { lazy: true })
    @JoinColumn({ name: 'currency_id' })
    currency: Promise<Currency>;
}
