import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@shared';
import { Media } from './media.entity';

@Entity('media_relations')
@Index(['objectId', 'objectType'])
@Index(['objectId', 'objectType', 'fieldName'])
export class MediaRelation extends BaseEntity {
    @Column({ type: 'uuid', name: 'media_id' })
    mediaId: string;

    @Column({ type: 'uuid', name: 'object_id' })
    objectId: string;

    @Column({ type: 'varchar', length: 50, name: 'object_type' })
    objectType: string;

    @Column({ type: 'varchar', length: 50, name: 'field_name' })
    fieldName: string;

    @Column({ type: 'int', default: 0 })
    order: number;

    @ManyToOne(() => Media, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'media_id' })
    media: Media;
}
