import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity('notification_telegram_configs')
@Unique(['name'])
export class NotificationTelegramConfigEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  name: string;

  @Column({ name: 'bot_username', length: 150 })
  botUsername: string;

  @Column({ name: 'bot_token', type: 'text' })
  botToken: string;

  @Column({ name: 'chat_id', length: 120 })
  chatId: string;

  @Column({ name: 'thread_id', type: 'int', nullable: true })
  threadId?: number | null;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
