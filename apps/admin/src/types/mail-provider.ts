export type MailProviderFormData = {
  name: string;
  providerType: string;
  description?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUsername?: string;
  smtpPassword?: string;
  apiKey?: string;
  apiSecret?: string;
  apiHost?: string;
  defaultFromEmail?: string;
  defaultFromName?: string;
  replyToEmail?: string;
  isActive?: boolean;
  rateLimit?: number;
  maxDailyLimit?: number;
  priority?: number;
  config?: Record<string, unknown>;
  webhookUrl?: string;
};

export interface MailProviderByIdResponse {
  data?: MailProviderFormData;
}

export interface MailProviderConnectionTestResponse {
  data?: {
    success?: boolean;
    message?: string;
  };
}
