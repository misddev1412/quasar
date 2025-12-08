import { MailLogStatus, MailLogChannel } from '../entities/mail-log.entity';

export interface CreateMailLogDto {
  mailProviderId?: string;
  mailTemplateId?: string;
  emailFlowId?: string;
  recipient: string;
  cc?: string[];
  bcc?: string[];
  subject?: string;
  bodyPreview?: string;
  status: MailLogStatus;
  isTest?: boolean;
  providerMessageId?: string;
  providerResponse?: Record<string, any>;
  metadata?: Record<string, any>;
  requestPayload?: Record<string, any>;
  errorMessage?: string;
  triggeredBy?: string;
  sentAt?: Date;
  fromEmail?: string;
  fromName?: string;
  channel?: MailLogChannel;
  deliveryMetadata?: Record<string, any>;
}

export interface MailLogFilters {
  page: number;
  limit: number;
  search?: string;
  status?: MailLogStatus;
  providerId?: string;
  templateId?: string;
  flowId?: string;
  isTest?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  channel?: MailLogChannel;
}

export interface MailLogStatistics {
  total: number;
  sent: number;
  failed: number;
  delivered: number;
  tests: number;
  lastSentAt?: Date | null;
}
