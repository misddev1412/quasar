export type MailLogStatus = 'queued' | 'sent' | 'failed' | 'delivered';

export interface MailLogUserProfileSummary {
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
}

export interface MailLogTriggeredByUser {
  id: string;
  email?: string | null;
  username?: string | null;
  profile?: MailLogUserProfileSummary | null;
}

export interface MailLogProvider {
  id: string;
  name: string;
  providerType?: string;
}

export interface MailLogTemplateSummary {
  id: string;
  name: string;
}

export interface MailLogFlowSummary {
  id: string;
  name: string;
}

export interface MailLogListItem {
  id: string;
  recipient: string;
  subject?: string;
  status: MailLogStatus;
  isTest: boolean;
  channel?: string;
  createdAt: string;
  updatedAt?: string;
  sentAt?: string | null;
  errorMessage?: string | null;
  providerMessageId?: string | null;
  providerResponse?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
  requestPayload?: Record<string, any> | null;
  fromEmail?: string | null;
  fromName?: string | null;
  bodyPreview?: string | null;
  mailProvider?: MailLogProvider | null;
  mailTemplate?: MailLogTemplateSummary | null;
  emailFlow?: MailLogFlowSummary | null;
  triggeredBy?: string | null;
  triggeredByUser?: MailLogTriggeredByUser | null;
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
  dateFrom?: string;
  dateTo?: string;
  channel?: 'email' | 'sms' | 'push';
}

export interface MailLogStatistics {
  total: number;
  sent: number;
  failed: number;
  delivered: number;
  tests: number;
  lastSentAt?: string | null;
}
