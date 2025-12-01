import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@shared';
import { MailProvider } from '../../mail-provider/entities/mail-provider.entity';
import { MailTemplate } from '../../mail-template/entities/mail-template.entity';
import { EmailFlow } from '../../email-flow/entities/email-flow.entity';
import { User } from '../../user/entities/user.entity';

export enum MailLogStatus {
  QUEUED = 'queued',
  SENT = 'sent',
  FAILED = 'failed',
  DELIVERED = 'delivered',
}

export type MailLogChannel = 'email' | 'sms' | 'push';

@Entity('mail_logs')
@Index('IDX_MAIL_LOG_STATUS', ['status'])
@Index('IDX_MAIL_LOG_PROVIDER', ['mailProviderId'])
@Index('IDX_MAIL_LOG_TEMPLATE', ['mailTemplateId'])
@Index('IDX_MAIL_LOG_FLOW', ['emailFlowId'])
@Index('IDX_MAIL_LOG_RECIPIENT', ['recipient'])
@Index('IDX_MAIL_LOG_CREATED_AT', ['createdAt'])
@Index('IDX_MAIL_LOG_IS_TEST', ['isTest'])
export class MailLog extends BaseEntity {
  @Column({ name: 'mail_provider_id', type: 'uuid', nullable: true })
  mailProviderId?: string;

  @ManyToOne(() => MailProvider, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'mail_provider_id' })
  mailProvider?: MailProvider;

  @Column({ name: 'mail_template_id', type: 'uuid', nullable: true })
  mailTemplateId?: string;

  @ManyToOne(() => MailTemplate, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'mail_template_id' })
  mailTemplate?: MailTemplate;

  @Column({ name: 'email_flow_id', type: 'uuid', nullable: true })
  emailFlowId?: string;

  @ManyToOne(() => EmailFlow, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'email_flow_id' })
  emailFlow?: EmailFlow;

  @Column({ length: 320 })
  recipient: string;

  @Column({ type: 'text', array: true, nullable: true })
  cc?: string[];

  @Column({ type: 'text', array: true, nullable: true })
  bcc?: string[];

  @Column({ name: 'from_email', length: 320, nullable: true })
  fromEmail?: string;

  @Column({ name: 'from_name', length: 255, nullable: true })
  fromName?: string;

  @Column({ length: 500, nullable: true })
  subject?: string;

  @Column({ name: 'body_preview', type: 'text', nullable: true })
  bodyPreview?: string;

  @Column({ length: 50, default: MailLogStatus.QUEUED })
  status: MailLogStatus;

  @Column({ name: 'channel', length: 20, default: 'email' })
  channel: MailLogChannel;

  @Column({ name: 'is_test', default: false })
  isTest: boolean;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt?: Date;

  @Column({ name: 'provider_message_id', length: 255, nullable: true })
  providerMessageId?: string;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ name: 'provider_response', type: 'jsonb', nullable: true })
  providerResponse?: Record<string, any>;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ name: 'request_payload', type: 'jsonb', nullable: true })
  requestPayload?: Record<string, any>;

  @Column({ name: 'triggered_by', type: 'uuid', nullable: true })
  triggeredBy?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'triggered_by' })
  triggeredByUser?: User;

  @Column({ name: 'delivery_metadata', type: 'jsonb', nullable: true })
  deliveryMetadata?: Record<string, any>;
}
