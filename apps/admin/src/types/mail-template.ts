// Mail Template Types for Admin Frontend

export interface MailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: string;
  isActive: boolean;
  description?: string;
  variables?: string[];
  fromEmail?: string;
  fromName?: string;
  recipientType?: 'manual' | 'roles' | 'all_users';
  recipientRoles?: string[];
  emailChannelId?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
  version: number;
}

export interface MailTemplateListItem {
  id: string;
  name: string;
  subject: string;
  type: string;
  isActive: boolean;
  description?: string;
  variableCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMailTemplateData {
  name: string;
  subject: string;
  body: string;
  type: string;
  isActive?: boolean;
  description?: string;
  variables?: string[];
  fromEmail?: string;
  fromName?: string;
  recipientType?: 'manual' | 'roles' | 'all_users';
  recipientRoles?: string[];
  emailChannelId?: string;
}

export interface UpdateMailTemplateData {
  name?: string;
  subject?: string;
  body?: string;
  type?: string;
  isActive?: boolean;
  description?: string;
  variables?: string[];
  fromEmail?: string;
  fromName?: string;
  recipientType?: 'manual' | 'roles' | 'all_users';
  recipientRoles?: string[];
  emailChannelId?: string;
}

export interface ProcessTemplateData {
  templateId: string;
  variables?: Record<string, any>;
}

export interface ProcessedTemplate {
  subject: string;
  body: string;
  originalTemplate: {
    id: string;
    name: string;
    type: string;
  };
  processedVariables: Record<string, any>;
  missingVariables: string[];
}

export interface CloneTemplateData {
  templateId: string;
  newName: string;
}

export interface MailTemplateFilters {
  page: number;
  limit: number;
  search?: string;
  type?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'type' | 'createdAt' | 'updatedAt';
  sortOrder?: 'ASC' | 'DESC';
}

export interface MailTemplateStatistics {
  total: number;
  active: number;
  inactive: number;
  byType: Record<string, number>;
}

export interface BulkUpdateStatusData {
  ids: string[];
  isActive: boolean;
}

// Template types enum
export enum MailTemplateType {
  USER_ONBOARDING = 'user_onboarding',
  AUTHENTICATION = 'authentication',
  NOTIFICATION = 'notification',
  MARKETING = 'marketing',
  SYSTEM = 'system',
  TRANSACTIONAL = 'transactional',
  REMINDER = 'reminder',
  WELCOME = 'welcome',
  CONFIRMATION = 'confirmation',
  ALERT = 'alert',
}

// Template type options for dropdowns
export const MAIL_TEMPLATE_TYPE_OPTIONS = [
  { label: 'User Onboarding', value: MailTemplateType.USER_ONBOARDING },
  { label: 'Authentication', value: MailTemplateType.AUTHENTICATION },
  { label: 'Notification', value: MailTemplateType.NOTIFICATION },
  { label: 'Marketing', value: MailTemplateType.MARKETING },
  { label: 'System', value: MailTemplateType.SYSTEM },
  { label: 'Transactional', value: MailTemplateType.TRANSACTIONAL },
  { label: 'Reminder', value: MailTemplateType.REMINDER },
  { label: 'Welcome', value: MailTemplateType.WELCOME },
  { label: 'Confirmation', value: MailTemplateType.CONFIRMATION },
  { label: 'Alert', value: MailTemplateType.ALERT },
];

// Recipient type options
export const RECIPIENT_TYPE_OPTIONS = [
  { label: 'Manual Recipients', value: 'manual' },
  { label: 'Based on User Roles', value: 'roles' },
  { label: 'All Users', value: 'all_users' },
];

// Form validation schemas (using the same validation as backend)
export interface MailTemplateFormData {
  name: string;
  subject: string;
  body: string;
  type: string;
  isActive: boolean;
  description?: string;
  variables?: string[] | string; // Can be array or string (for textarea input)
  fromEmail?: string;
  fromName?: string;
  recipientType?: 'manual' | 'roles' | 'all_users';
  recipientRoles?: string[];
  emailChannelId?: string;
}

// Table column definitions
export interface MailTemplateTableColumn {
  key: keyof MailTemplateListItem | 'actions';
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

// Filter options
export interface MailTemplateFilterOptions {
  types: Array<{ label: string; value: string }>;
  statusOptions: Array<{ label: string; value: boolean | undefined }>;
}

// Bulk action types
export type MailTemplateBulkAction = 
  | 'activate'
  | 'deactivate'
  | 'delete'
  | 'export'
  | 'clone';

// Search and filter state
export interface MailTemplateSearchState {
  search: string;
  type: string;
  isActive: boolean | undefined;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
  page: number;
  limit: number;
}

// Preview data for template preview component
export interface TemplatePreviewData {
  template: MailTemplate;
  variables: Record<string, any>;
  processedSubject: string;
  processedBody: string;
  missingVariables: string[];
}

// Variable definition for template editor
export interface TemplateVariable {
  name: string;
  description?: string;
  required?: boolean;
  defaultValue?: any;
  type?: 'string' | 'number' | 'boolean' | 'date' | 'email' | 'url';
}

// Template editor state
export interface TemplateEditorState {
  template: Partial<MailTemplate>;
  isDirty: boolean;
  isValid: boolean;
  errors: Record<string, string>;
  previewMode: boolean;
  previewVariables: Record<string, any>;
}

// API response types (matching backend)
export interface MailTemplateApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
  statusCode: number;
}

export interface PaginatedMailTemplateResponse {
  templates: MailTemplateListItem[];
  total: number;
  page: number;
  limit: number;
}

// Form field configurations
export interface MailTemplateFormField {
  name: keyof MailTemplateFormData;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'rich-text';
  placeholder?: string;
  required?: boolean;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  };
  description?: string;
  options?: Array<{ label: string; value: any }>;
  rows?: number; // for textarea
}

// Component props interfaces
export interface MailTemplateListProps {
  onEdit?: (template: MailTemplateListItem) => void;
  onDelete?: (template: MailTemplateListItem) => void;
  onClone?: (template: MailTemplateListItem) => void;
  onPreview?: (template: MailTemplateListItem) => void;
}

export interface MailTemplateFormProps {
  initialData?: Partial<MailTemplate>;
  onSubmit: (data: MailTemplateFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  mode?: 'create' | 'edit';
}

export interface MailTemplatePreviewProps {
  template: MailTemplate;
  variables?: Record<string, any>;
  onVariableChange?: (variables: Record<string, any>) => void;
  onClose?: () => void;
}

// Utility types
export type MailTemplateKeys = keyof MailTemplate;
export type MailTemplateListItemKeys = keyof MailTemplateListItem;
export type MailTemplateFormKeys = keyof MailTemplateFormData;
