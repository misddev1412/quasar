import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@shared';
import { EmailFlow } from '../../email-flow/entities/email-flow.entity';
import { MailTemplate } from '../../mail-template/entities/mail-template.entity';
import { MailProvider } from '../../mail-provider/entities/mail-provider.entity';

export enum MailQueueStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  QUEUED = 'queued',
  SENT = 'sent',
  FAILED = 'failed',
}

@Entity('mail_queue')
@Index('IDX_MAIL_QUEUE_STATUS_PRIORITY', ['status', 'priority'])
@Index('IDX_MAIL_QUEUE_SCHEDULED', ['scheduledAt'])
@Index('IDX_MAIL_QUEUE_AVAILABLE', ['availableAt'])
export class MailQueue extends BaseEntity {
  @Column({ name: 'email_flow_id', nullable: true })
  emailFlowId?: string | null;

  @ManyToOne(() => EmailFlow, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'email_flow_id' })
  emailFlow?: EmailFlow | null;

  @Column({ name: 'mail_template_id', nullable: true })
  mailTemplateId?: string | null;

  @ManyToOne(() => MailTemplate, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'mail_template_id' })
  mailTemplate?: MailTemplate | null;

  @Column({ name: 'mail_provider_id', nullable: true })
  mailProviderId?: string | null;

  @ManyToOne(() => MailProvider, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'mail_provider_id' })
  mailProvider?: MailProvider | null;

  @Column({ name: 'recipient_email', length: 320 })
  recipientEmail: string;

  @Column({ name: 'recipient_name', length: 255, nullable: true })
  recipientName?: string | null;

  @Column({ length: 255, nullable: true })
  subject?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  payload?: Record<string, any> | null;

  @Column({ type: 'jsonb', name: 'metadata', nullable: true })
  metadata?: Record<string, any> | null;

  @Column({ type: 'int', default: 5 })
  priority: number;

  @Column({ type: 'varchar', length: 20, default: MailQueueStatus.PENDING })
  status: MailQueueStatus;

  @Column({ name: 'attempt_count', type: 'int', default: 0 })
  attemptCount: number;

  @Column({ name: 'scheduled_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  scheduledAt: Date;

  @Column({ name: 'available_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  availableAt: Date;

  @Column({ name: 'locked_at', type: 'timestamp', nullable: true })
  lockedAt?: Date | null;

  @Column({ name: 'locked_by', length: 100, nullable: true })
  lockedBy?: string | null;

  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError?: string | null;
}
