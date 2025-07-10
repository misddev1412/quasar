import { ISEO, ISEOResponse, GetSEOByPathParams } from '../types/seo.types';

// SEO API Client for Admin operations
export interface SeoAdminApiClient {
  getAll: () => Promise<ISEO[]>;
  getById: (id: string) => Promise<ISEO>;
  getByPath: (params: GetSEOByPathParams) => Promise<ISEO>;
  create: (data: CreateSeoInput) => Promise<ISEO>;
  update: (id: string, data: UpdateSeoInput) => Promise<ISEO>;
  delete: (id: string) => Promise<boolean>;
}

// SEO API Client for Client operations (read-only)
export interface SeoClientApiClient {
  getByPath: (params: GetSEOByPathParams) => Promise<ISEOResponse>;
}

// Input types for SEO operations
export interface CreateSeoInput {
  title: string;
  description?: string;
  keywords?: string;
  path: string;
  isActive?: boolean;
  additionalMetaTags?: Record<string, string>;
}

export interface UpdateSeoInput {
  title?: string;
  description?: string;
  keywords?: string;
  path?: string;
  isActive?: boolean;
  additionalMetaTags?: Record<string, string>;
}

// SEO API Response types
export interface SeoApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
}

// Utility type for SEO operations
export type SeoOperation = 'getAll' | 'getById' | 'getByPath' | 'create' | 'update' | 'delete';

// Helper function to create SEO API client
export function createSeoApiClient<T extends SeoAdminApiClient | SeoClientApiClient>(
  baseUrl: string,
  authToken?: string
): T {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const makeRequest = async <TData>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<TData> => {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  return {
    getAll: () => makeRequest<ISEO[]>('/admin/seo/getAll'),
    getById: (id: string) => makeRequest<ISEO>(`/admin/seo/getById?id=${id}`),
    getByPath: (params: GetSEOByPathParams) => 
      makeRequest<ISEOResponse>(`/client/seo/getByPath?path=${encodeURIComponent(params.path)}`),
    create: (data: CreateSeoInput) => makeRequest<ISEO>('/admin/seo/create', 'POST', data),
    update: (id: string, data: UpdateSeoInput) => 
      makeRequest<ISEO>('/admin/seo/update', 'PUT', { id, ...data }),
    delete: (id: string) => makeRequest<boolean>('/admin/seo/delete', 'DELETE', { id }),
  } as T;
}

// Type guards for checking API client types
export function isSeoAdminApiClient(client: any): client is SeoAdminApiClient {
  return client && typeof client.create === 'function' && typeof client.delete === 'function';
}

export function isSeoClientApiClient(client: any): client is SeoClientApiClient {
  return client && typeof client.getByPath === 'function' && !client.create;
} 