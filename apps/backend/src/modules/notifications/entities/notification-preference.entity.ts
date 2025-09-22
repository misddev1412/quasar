import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { NotificationType } from './notification.entity';

export enum NotificationChannel {
  PUSH = 'push',
  EMAIL = 'email',
  IN_APP = 'in_app',
}

export enum NotificationFrequency {
  IMMEDIATE = 'immediate',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  NEVER = 'never',
}

@Entity('notification_preferences')
@Index(['userId'])
@Unique(['userId', 'type', 'channel'])
export class NotificationPreferenceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  type: NotificationType;

  @Column({
    type: 'varchar',
    length: 20,
  })
  channel: NotificationChannel;

  @Column({ default: true })
  enabled: boolean;

  @Column({
    type: 'varchar',
    length: 20,
    default: NotificationFrequency.IMMEDIATE,
  })
  frequency: NotificationFrequency;

  @Column({ name: 'quiet_hours_start', nullable: true })
  quietHoursStart?: string; // Format: "HH:mm"

  @Column({ name: 'quiet_hours_end', nullable: true })
  quietHoursEnd?: string; // Format: "HH:mm"

  @Column({ name: 'quiet_hours_timezone', nullable: true })
  quietHoursTimezone?: string;

  @Column('jsonb', { nullable: true })
  settings?: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  isInQuietHours(timezone?: string): boolean {
    if (!this.quietHoursStart || !this.quietHoursEnd) {
      return false;
    }

    const now = new Date();
    const userTimezone = timezone || this.quietHoursTimezone || 'UTC';

    // This is a simplified check - in production, you'd want to use a proper timezone library
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    const [startHour, startMinute] = this.quietHoursStart.split(':').map(Number);
    const [endHour, endMinute] = this.quietHoursEnd.split(':').map(Number);

    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  shouldSendNotification(timezone?: string): boolean {
    if (!this.enabled) {
      return false;
    }

    if (this.frequency === NotificationFrequency.NEVER) {
      return false;
    }

    if (this.isInQuietHours(timezone)) {
      return false;
    }

    return true;
  }
}