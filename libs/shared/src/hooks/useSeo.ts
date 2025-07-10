import { useState, useEffect } from 'react';
import { ISEOResponse, GetSEOByPathParams } from '../types/seo.types';
import { CreateSeoInput, UpdateSeoInput } from '../api/seo.api';

// Generic tRPC client type - this should be provided by the consuming app
export interface TRPCClient {
  admin?: {
    seo: {
      getAll: {
        useQuery: (input?: any, options?: any) => any;
      };
      getById: {
        useQuery: (input: { id: string }, options?: any) => any;
      };
      getByPath: {
        useQuery: (input: GetSEOByPathParams, options?: any) => any;
      };
      create: {
        useMutation: (options?: any) => any;
      };
      update: {
        useMutation: (options?: any) => any;
      };
      delete: {
        useMutation: (options?: any) => any;
      };
    };
  };
  client?: {
    seo: {
      getByPath: {
        useQuery: (input: GetSEOByPathParams, options?: any) => any;
      };
    };
  };
}

// Hook options
export interface UseSeoOptions {
  path: string;
  defaultTitle?: string;
  defaultDescription?: string;
  defaultKeywords?: string;
  enabled?: boolean;
}

export interface UseSeoAdminOptions {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
}

// SEO hook result
export interface UseSeoResult {
  seo: {
    title: string;
    description: string;
    keywords: string;
    additionalMetaTags: Record<string, string>;
  };
  isLoading: boolean;
  error: Error | null;
  updateDocumentHead: () => void;
}

// Admin SEO hook result
export interface UseSeoAdminResult {
  seos: any[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  createSeo: {
    mutate: (data: CreateSeoInput) => void;
    isLoading: boolean;
    error: Error | null;
  };
  updateSeo: {
    mutate: (data: { id: string } & UpdateSeoInput) => void;
    isLoading: boolean;
    error: Error | null;
  };
  deleteSeo: {
    mutate: (data: { id: string }) => void;
    isLoading: boolean;
    error: Error | null;
  };
}

// Client SEO hook - for reading SEO data
export function createUseSeoHook(trpcClient: TRPCClient) {
  return function useSeo(options: UseSeoOptions): UseSeoResult {
    const [seo, setSeo] = useState({
      title: options.defaultTitle || 'Quasar',
      description: options.defaultDescription || '',
      keywords: options.defaultKeywords || '',
      additionalMetaTags: {} as Record<string, string>
    });

    const { data, error, isLoading } = trpcClient.client?.seo.getByPath.useQuery(
      { path: options.path },
      {
        enabled: options.enabled !== false,
        refetchOnWindowFocus: false
      }
    );

    useEffect(() => {
      if (data?.data) {
        const seoData = data.data;
        
        setSeo({
          title: seoData.title || options.defaultTitle || 'Quasar',
          description: seoData.description || options.defaultDescription || '',
          keywords: seoData.keywords || options.defaultKeywords || '',
          additionalMetaTags: seoData.additionalMetaTags || {}
        });
      }
    }, [data, options.defaultTitle, options.defaultDescription, options.defaultKeywords]);

    const updateDocumentHead = () => {
      if (typeof document === 'undefined') return;
      
      document.title = seo.title;
      
      // Update meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', seo.description);
      
      // Update meta keywords
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords && seo.keywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      if (metaKeywords && seo.keywords) {
        metaKeywords.setAttribute('content', seo.keywords);
      }
      
      // Update additional meta tags
      Object.entries(seo.additionalMetaTags).forEach(([name, content]) => {
        let metaTag = document.querySelector(`meta[name="${name}"]`);
        if (!metaTag) {
          metaTag = document.createElement('meta');
          metaTag.setAttribute('name', name);
          document.head.appendChild(metaTag);
        }
        metaTag.setAttribute('content', content);
      });
    };

    return {
      seo,
      isLoading,
      error,
      updateDocumentHead
    };
  };
}

// Admin SEO hook - for managing SEO data
export function createUseSeoAdminHook(trpcClient: TRPCClient) {
  return function useSeoAdmin(options: UseSeoAdminOptions = {}): UseSeoAdminResult {
    const { data: seos, error, isLoading, refetch } = trpcClient.admin?.seo.getAll.useQuery(
      undefined,
      {
        enabled: options.enabled !== false,
        refetchOnWindowFocus: options.refetchOnWindowFocus ?? false
      }
    );

    const createMutation = trpcClient.admin?.seo.create.useMutation({
      onSuccess: () => {
        refetch();
      }
    });

    const updateMutation = trpcClient.admin?.seo.update.useMutation({
      onSuccess: () => {
        refetch();
      }
    });

    const deleteMutation = trpcClient.admin?.seo.delete.useMutation({
      onSuccess: () => {
        refetch();
      }
    });

    return {
      seos: seos?.data || [],
      isLoading,
      error,
      refetch,
      createSeo: {
        mutate: createMutation.mutate,
        isLoading: createMutation.isLoading,
        error: createMutation.error
      },
      updateSeo: {
        mutate: updateMutation.mutate,
        isLoading: updateMutation.isLoading,
        error: updateMutation.error
      },
      deleteSeo: {
        mutate: deleteMutation.mutate,
        isLoading: deleteMutation.isLoading,
        error: deleteMutation.error
      }
    };
  };
}

// Hook for getting SEO by path (admin context)
export function createUseSeoByPathHook(trpcClient: TRPCClient) {
  return function useSeoByPath(path: string, options?: { enabled?: boolean }) {
    return trpcClient.admin?.seo.getByPath.useQuery(
      { path },
      {
        enabled: options?.enabled !== false,
        refetchOnWindowFocus: false
      }
    );
  };
}

// Hook for getting SEO by ID (admin context)
export function createUseSeoByIdHook(trpcClient: TRPCClient) {
  return function useSeoById(id: string, options?: { enabled?: boolean }) {
    return trpcClient.admin?.seo.getById.useQuery(
      { id },
      {
        enabled: options?.enabled !== false && Boolean(id),
        refetchOnWindowFocus: false
      }
    );
  };
} 