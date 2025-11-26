import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { NotificationEvent } from './notification-event.enum';

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  SYSTEM = 'system',
  PRODUCT = 'product',
  ORDER = 'order',
  USER = 'user',
}

@Entity('notifications')
@Index(['userId'])
@Index(['read'])
@Index(['type'])
@Index(['createdAt'])
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ length: 255 })
  title: string;

  @Column('text')
  body: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: NotificationType.INFO,
  })
  type: NotificationType;

  @Column({ name: 'action_url', length: 500, nullable: true })
  actionUrl?: string;

  @Column({ length: 255, nullable: true })
  icon?: string;

  @Column({ length: 500, nullable: true })
  image?: string;

  @Column('jsonb', { nullable: true })
  data?: Record<string, unknown>;

  @Column({
    type: 'varchar',
    name: 'event_key',
    length: 100,
    nullable: true,
  })
  eventKey?: NotificationEvent;

  @Column({ default: false })
  read: boolean;

  @Column({ name: 'fcm_token', length: 500, nullable: true })
  fcmToken?: string;

  @Column({ name: 'sent_at', nullable: true })
  sentAt?: Date;

  @Column({ name: 'read_at', nullable: true })
  readAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  markAsRead(): void {
    this.read = true;
    this.readAt = new Date();
  }

  markAsSent(fcmToken?: string): void {
    this.sentAt = new Date();
    if (fcmToken) {
      this.fcmToken = fcmToken;
    }
  }
}
