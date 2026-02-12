export type MailChannelPriorityFormData = {
  name: string;
  description?: string;
  mailProviderId: string;
  mailTemplateId?: string;
  isActive?: boolean;
  priority?: number;
  config?: Record<string, unknown>;
};

export interface ActiveMailProviderOption {
  id: string;
  name: string;
  providerType: string;
}

export interface ActiveMailProvidersResponse {
  data?: ActiveMailProviderOption[];
}

export interface MailTemplateOption {
  id: string;
  name: string;
}

export interface MailTemplatesOptionsResponse {
  data?: {
    items?: MailTemplateOption[];
  };
}
