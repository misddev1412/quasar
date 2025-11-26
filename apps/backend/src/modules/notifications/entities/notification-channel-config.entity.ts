import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { NotificationChannel } from './notification-preference.entity';
import { NotificationEvent } from './notification-event.enum';

@Entity('notification_channel_configs')
@Unique(['eventKey'])
export class NotificationChannelConfigEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    name: 'event_key',
    length: 120,
  })
  eventKey: NotificationEvent;

  @Column({ name: 'display_name', length: 150 })
  displayName: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column('jsonb', { name: 'allowed_channels', default: () => `'[]'` })
  allowedChannels: NotificationChannel[];

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
