import { Entity, Column, Index, ManyToMany, JoinTable } from 'typeorm';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { BaseEntity } from '@shared';
import { NotificationEvent } from './notification-event.enum';
import { NotificationChannel } from './notification-preference.entity';
import { MailTemplate } from '../../mail-template/entities/mail-template.entity';

@Entity('notification_event_flows')
@Index('IDX_NOTIFICATION_EVENT_FLOW_EVENT_KEY', ['eventKey'], { unique: true })
export class NotificationEventFlow extends BaseEntity {
  @Expose()
  @Column({ name: 'event_key', type: 'varchar', length: 120 })
  @IsString()
  eventKey!: NotificationEvent;

  @Expose()
  @Column({ name: 'display_name', length: 150 })
  @IsString()
  @MaxLength(150)
  displayName!: string;

  @Expose()
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Expose()
  @Column({
    name: 'channel_preferences',
    type: 'text',
    array: true,
    default: '{}',
  })
  @IsArray()
  channelPreferences!: NotificationChannel[];

  @Expose()
  @Column({ name: 'include_actor', default: true })
  @IsBoolean()
  includeActor!: boolean;

  @Expose()
  @Column({
    name: 'recipient_user_ids',
    type: 'text',
    array: true,
    default: '{}',
  })
  @IsArray()
  recipientUserIds!: string[];

  @Expose()
  @Column({
    name: 'cc_user_ids',
    type: 'text',
    array: true,
    default: '{}',
  })
  @IsArray()
  ccUserIds!: string[];

  @Expose()
  @Column({
    name: 'bcc_user_ids',
    type: 'text',
    array: true,
    default: '{}',
  })
  @IsArray()
  bccUserIds!: string[];

  @Expose()
  @Column({
    name: 'cc_emails',
    type: 'text',
    array: true,
    default: '{}',
    nullable: true,
  })
  @IsOptional()
  @IsArray()
  ccEmails?: string[];

  @Expose()
  @Column({
    name: 'bcc_emails',
    type: 'text',
    array: true,
    default: '{}',
    nullable: true,
  })
  @IsOptional()
  @IsArray()
  bccEmails?: string[];

  @Expose()
  @Column({ name: 'channel_metadata', type: 'jsonb', nullable: true })
  @IsOptional()
  channelMetadata?: Record<string, unknown>;

  @Expose()
  @Column({ name: 'is_active', default: true })
  @IsBoolean()
  isActive!: boolean;

  @Expose()
  @ManyToMany(() => MailTemplate, { eager: true })
  @JoinTable({
    name: 'notification_event_flow_templates',
    joinColumn: { name: 'event_flow_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'mail_template_id', referencedColumnName: 'id' },
  })
  @Type(() => MailTemplate)
  mailTemplates!: MailTemplate[];
}
