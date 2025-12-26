import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '@shared';
import { ServiceItem } from './service-item.entity';

@Entity('service_item_translations')
@Index(['service_item_id', 'locale'], { unique: true })
export class ServiceItemTranslation extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid', { name: 'service_item_id' })
    service_item_id: string;

    @Column({ length: 5 })
    locale: string;

    @Column({ length: 255, nullable: true })
    name?: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @ManyToOne(() => ServiceItem, (item) => item.translations, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'service_item_id' })
    serviceItem: ServiceItem;
}
