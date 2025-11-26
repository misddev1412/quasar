// Email Channel Types for Admin Frontend

export interface EmailChannel {
  id: string;
  name: string;
  description?: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUsername?: string;
  // Note: password is never returned in response
  defaultFromEmail: string;
  defaultFromName: string;
  replyToEmail?: string;
  isActive: boolean;
  isDefault: boolean;
  rateLimit: number;
  advancedConfig?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
  version: number;
}

export interface EmailChannelListItem {
  id: string;
  name: string;
  description?: string;
  defaultFromEmail: string;
  defaultFromName: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEmailChannelData {
  name: string;
  description?: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure?: boolean;
  smtpUsername?: string;
  smtpPassword?: string;
  defaultFromEmail: string;
  defaultFromName: string;
  replyToEmail?: string;
  isActive?: boolean;
  isDefault?: boolean;
  rateLimit?: number;
  advancedConfig?: Record<string, any>;
}

export interface UpdateEmailChannelData {
  name?: string;
  description?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUsername?: string;
  smtpPassword?: string;
  defaultFromEmail?: string;
  defaultFromName?: string;
  replyToEmail?: string;
  isActive?: boolean;
  isDefault?: boolean;
  rateLimit?: number;
  advancedConfig?: Record<string, any>;
}

export interface TestEmailChannelData {
  channelId: string;
  testEmail: string;
  testSubject?: string;
  testBody?: string;
}

export interface EmailChannelFilters {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'defaultFromEmail' | 'createdAt' | 'updatedAt';
  sortOrder?: 'ASC' | 'DESC';
}

export interface EmailChannelFormData {
  name: string;
  description?: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUsername?: string;
  smtpPassword?: string;
  defaultFromEmail: string;
  defaultFromName: string;
  replyToEmail?: string;
  isActive: boolean;
  isDefault: boolean;
  rateLimit: number;
  advancedConfig?: Record<string, any>;
}

// Component props interfaces
export interface EmailChannelListProps {
  onEdit?: (channel: EmailChannelListItem) => void;
  onDelete?: (channel: EmailChannelListItem) => void;
  onTest?: (channel: EmailChannelListItem) => void;
  onSetDefault?: (channel: EmailChannelListItem) => void;
}

export interface EmailChannelFormProps {
  initialData?: Partial<EmailChannel>;
  onSubmit: (data: EmailChannelFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  mode?: 'create' | 'edit';
}

export interface EmailChannelTestProps {
  channel: EmailChannelListItem;
  onTest: (data: TestEmailChannelData) => Promise<void>;
  onClose: () => void;
  isSubmitting?: boolean;
}

// SMTP Security options
export const SMTP_SECURITY_OPTIONS = [
  { label: 'TLS/STARTTLS (Recommended)', value: true },
  { label: 'No Encryption', value: false },
];

// Common SMTP port options
export const SMTP_PORT_OPTIONS = [
  { label: '587 (STARTTLS)', value: 587 },
  { label: '465 (SSL)', value: 465 },
  { label: '25 (Unsecured)', value: 25 },
  { label: '2525 (Alternative)', value: 2525 },
];

// Popular email service providers with default configs
export const EMAIL_PROVIDER_PRESETS = [
  {
    name: 'Gmail',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpSecure: true,
    description: 'Use Gmail SMTP (requires app password)',
  },
  {
    name: 'Outlook/Hotmail',
    smtpHost: 'smtp-mail.outlook.com',
    smtpPort: 587,
    smtpSecure: true,
    description: 'Microsoft Outlook/Hotmail SMTP',
  },
  {
    name: 'Yahoo Mail',
    smtpHost: 'smtp.mail.yahoo.com',
    smtpPort: 587,
    smtpSecure: true,
    description: 'Yahoo Mail SMTP',
  },
  {
    name: 'SendGrid',
    smtpHost: 'smtp.sendgrid.net',
    smtpPort: 587,
    smtpSecure: true,
    description: 'SendGrid email service',
  },
  {
    name: 'Mailgun',
    smtpHost: 'smtp.mailgun.org',
    smtpPort: 587,
    smtpSecure: true,
    description: 'Mailgun email service',
  },
  {
    name: 'AWS SES',
    smtpHost: 'email-smtp.us-east-1.amazonaws.com',
    smtpPort: 587,
    smtpSecure: true,
    description: 'Amazon SES (adjust region as needed)',
  },
  {
    name: 'Mailtrap',
    smtpHost: 'smtp.mailtrap.io',
    smtpPort: 2525,
    smtpSecure: true,
    description: 'Mailtrap email testing service',
  },
];

// Utility types
export type EmailChannelKeys = keyof EmailChannel;
export type EmailChannelListItemKeys = keyof EmailChannelListItem;
export type EmailChannelFormKeys = keyof EmailChannelFormData;