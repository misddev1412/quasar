export type ServiceTranslation = {
  id?: string;
  locale?: string;
  name?: string;
  slug?: string;
  description?: string;
  content?: string;
};

export type ServiceEntity = {
  name?: string;
  translations?: ServiceTranslation[];
  items?: unknown[];
} & Record<string, unknown>;

export type ServiceSubmitPayload = {
  unitPrice: number | string;
  isContactPrice?: boolean;
  isActive?: boolean;
  thumbnail?: string;
  currencyId?: string;
  items?: unknown[];
  translations?: unknown[];
};

export type ServiceListItem = {
  id: string;
  unitPrice: number;
  isContactPrice: boolean;
  thumbnail?: string;
  isActive: boolean;
  currency?: {
    code: string;
    symbol: string;
  };
  translations: Array<{
    locale: string;
    name: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type ServiceListResponse = {
  data?: {
    items?: ServiceListItem[];
    total?: number;
    totalPages?: number;
  };
};
