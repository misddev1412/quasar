import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { Service } from './service.entity';
import { ServiceItemTranslation } from './service-item-translation.entity';

@Entity('service_items')
export class ServiceItem extends BaseEntity {
    @Expose()
    @Column({
        name: 'service_id',
        type: 'uuid',
    })
    serviceId: string;

    @Expose()
    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
    })
    price?: number;

    @Expose()
    @Column({
        name: 'sort_order',
        type: 'int',
        default: 0,
    })
    sortOrder: number;

    @ManyToOne(() => Service, (service) => service.items, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'service_id' })
    service: Service;

    @OneToMany(
        () => ServiceItemTranslation,
        (translation) => translation.serviceItem,
        {
            cascade: true,
            eager: false,
        }
    )
    translations: ServiceItemTranslation[];
}
