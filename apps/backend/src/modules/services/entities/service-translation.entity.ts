import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '@shared';
import { Service } from './service.entity';

@Entity('service_translations')
@Index(['service_id', 'locale'], { unique: true })
export class ServiceTranslation extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid', { name: 'service_id' })
    service_id: string;

    @Column({ length: 5 })
    locale: string;

    @Column({ length: 255, nullable: true })
    name?: string;

    @Column({ type: 'text', nullable: true })
    content?: string; // Rich text content

    @Column({ type: 'text', nullable: true })
    description?: string;

    @ManyToOne(() => Service, (service) => service.translations, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'service_id' })
    service: Service;
}
