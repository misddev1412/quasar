// Type definitions for tRPC client
// This file defines the structure of our tRPC API without importing backend code

// Import entity types
export type { User, AuthResponse } from './user';
export type { Product, ProductVariant, ProductMedia, ProductFilters } from './product';
export type { Order, OrderItem } from './order';
export type { Address, Country, AdministrativeDivision } from './address';
export type {
  Notification,
  NotificationWithPagination,
  NotificationStats
} from './notification';
export { NotificationType } from './notification';
export type { Language, LocaleConfig, TranslationData } from './language';
export type { SEOData } from './seo';

// Import API response types
export type {
  ApiResponse,
  PaginatedApiResponse,
  PaginationInfo
} from './api';

// Import types for internal use
import type { User, AuthResponse } from './user';
import type { Product, ProductVariant, ProductMedia, ProductFilters } from './product';
import type { Order, OrderItem } from './order';
import type { Address, Country, AdministrativeDivision } from './address';
import type {
  Notification,
  NotificationWithPagination,
  NotificationStats
} from './notification';
import type { NotificationType } from './notification';
import type { Language, LocaleConfig, TranslationData } from './language';
import type { SEOData } from './seo';
import type {
  ApiResponse,
  PaginatedApiResponse,
  PaginationInfo
} from './api';

// Define the shape of our tRPC router
export type AppRouter = {
  auth: {
    login: {
      mutate: (input: { email: string; password: string }) => Promise<AuthResponse>;
    };
    register: {
      mutate: (input: { email: string; password: string; name?: string }) => Promise<AuthResponse>;
    };
    me: {
      query: () => Promise<User | null>;
    };
    changePassword: {
      mutate: (input: {
        oldPassword: string;
        newPassword: string;
      }) => Promise<{ success: boolean }>;
    };
    forgotPassword: {
      mutate: (input: { email: string }) => Promise<{ success: boolean }>;
    };
  };
  user: {
    getProfile: {
      useQuery: (
        input: { id: string },
        options?: {
          enabled?: boolean;
          onError?: (error: Error) => void;
          onSuccess?: (data: User) => void;
        }
      ) => {
        data?: User;
        error?: Error;
        isLoading: boolean;
      };
    };
    updateProfile: {
      useMutation: (options?: {
        onSuccess?: (data: User) => void;
        onError?: (error: Error) => void;
      }) => {
        mutate: (input: Partial<User>) => Promise<User>;
        mutateAsync: (input: Partial<User>) => Promise<User>;
        isLoading: boolean;
      };
    };
  };
  product: {
    list: {
      useQuery: (
        input?: {
          limit?: number;
          page?: number;
          category?: string;
          search?: string;
        },
        options?: {
          enabled?: boolean;
          onError?: (error: Error) => void;
          onSuccess?: (data: PaginatedApiResponse<Product>) => void;
        }
      ) => {
        data?: PaginatedApiResponse<Product>;
        error?: Error;
        isLoading: boolean;
      };
    };
    create: {
      useMutation: (options?: {
        onSuccess?: (data: Product) => void;
        onError?: (error: Error) => void;
      }) => {
        mutate: (input: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Product>;
        mutateAsync: (input: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Product>;
        isLoading: boolean;
      };
    };
    update: {
      useMutation: (options?: {
        onSuccess?: (data: Product) => void;
        onError?: (error: Error) => void;
      }) => {
        mutate: (input: { id: string } & Partial<Product>) => Promise<Product>;
        mutateAsync: (input: { id: string } & Partial<Product>) => Promise<Product>;
        isLoading: boolean;
      };
    };
    delete: {
      useMutation: (options?: { onSuccess?: () => void; onError?: (error: Error) => void }) => {
        mutate: (input: { id: string }) => Promise<void>;
        mutateAsync: (input: { id: string }) => Promise<void>;
        isLoading: boolean;
      };
    };
  };
  order: {
    list: {
      useQuery: (
        input?: {
          limit?: number;
          page?: number;
          status?: string;
        },
        options?: {
          enabled?: boolean;
          onError?: (error: Error) => void;
          onSuccess?: (data: PaginatedApiResponse<Order>) => void;
        }
      ) => {
        data?: PaginatedApiResponse<Order>;
        error?: Error;
        isLoading: boolean;
      };
    };
    create: {
      useMutation: (options?: {
        onSuccess?: (data: Order) => void;
        onError?: (error: Error) => void;
      }) => {
        mutate: (input: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Order>;
        mutateAsync: (input: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Order>;
        isLoading: boolean;
      };
    };
    cancel: {
      useMutation: (options?: { onSuccess?: () => void; onError?: (error: Error) => void }) => {
        mutate: (input: { id: string }) => Promise<void>;
        mutateAsync: (input: { id: string }) => Promise<void>;
        isLoading: boolean;
      };
    };
  };
  clientAddressBook: {
    getAddresses: {
      query: () => Promise<ApiResponse<Address[]>>;
    };
    getCountries: {
      query: () => Promise<ApiResponse<Country[]>>;
    };
    createAddress: {
      mutate: (input: any) => Promise<ApiResponse<Address>>;
    };
    updateAddress: {
      mutate: (input: { id: string; data: any }) => Promise<ApiResponse<Address>>;
    };
    deleteAddress: {
      mutate: (input: { id: string }) => Promise<ApiResponse<void>>;
    };
    setDefaultAddress: {
      mutate: (input: { id: string }) => Promise<ApiResponse<void>>;
    };
    getAdministrativeDivisions: {
      query: (input: { countryId: string; type?: string }) => Promise<ApiResponse<AdministrativeDivision[]>>;
    };
    getAdministrativeDivisionsByParentId: {
      query: (input: { parentId: string }) => Promise<ApiResponse<AdministrativeDivision[]>>;
    };
  };
  clientLanguage: {
    getActiveLanguages: {
      query: () => Promise<ApiResponse<Language[]>>;
    };
    getDefaultLanguage: {
      query: () => Promise<ApiResponse<Language>>;
    };
  };
  adminLanguage: {
    getActiveLanguages: {
      query: () => Promise<ApiResponse<Language[]>>;
    };
  };
  clientNotification: {
    getUserNotifications: {
      query: (input: {
        userId: string;
        page?: number;
        limit?: number;
        type?: NotificationType;
        read?: boolean;
      }) => Promise<ApiResponse<NotificationWithPagination>>;
    };
    getUnreadCount: {
      query: (input: { userId: string }) => Promise<ApiResponse<{ count: number }>>;
    };
    getRecentNotifications: {
      query: (input: {
        userId: string;
        limit?: number;
      }) => Promise<ApiResponse<Notification[]>>;
    };
    createNotification: {
      mutate: (input: {
        userId: string;
        title: string;
        body: string;
        type?: NotificationType;
        actionUrl?: string;
        icon?: string;
        image?: string;
        data?: Record<string, unknown>;
      }) => Promise<ApiResponse<Notification>>;
    };
    markAllAsRead: {
      mutate: (input: {
        userId: string;
        notificationIds?: string[];
      }) => Promise<ApiResponse<null>>;
    };
    validateFCMToken: {
      mutate: (input: { token: string }) => Promise<ApiResponse<{ isValid: boolean }>>;
    };
    subscribeToTopic: {
      mutate: (input: {
        token: string;
        topic: string;
      }) => Promise<ApiResponse<{ subscribed: boolean }>>;
    };
    unsubscribeFromTopic: {
      mutate: (input: {
        token: string;
        topic: string;
      }) => Promise<ApiResponse<{ unsubscribed: boolean }>>;
    };
    getNotificationTypes: {
      query: () => Promise<ApiResponse<Array<{ value: NotificationType; label: string }>>>;
    };
  };
  userNotification: {
    getMyNotifications: {
      query: (input: {
        page?: number;
        limit?: number;
        type?: NotificationType;
        read?: boolean;
        sortBy?: 'createdAt' | 'updatedAt';
        sortOrder?: 'ASC' | 'DESC';
      }) => Promise<ApiResponse<NotificationWithPagination>>;
    };
    getMyRecentNotifications: {
      query: (input: { limit?: number }) => Promise<ApiResponse<Notification[]>>;
    };
    getMyUnreadCount: {
      query: () => Promise<ApiResponse<{ count: number }>>;
    };
    getMyNotificationById: {
      query: (input: { id: string }) => Promise<ApiResponse<Notification>>;
    };
    getMyNotificationStats: {
      query: () => Promise<ApiResponse<NotificationStats>>;
    };
    markMyNotificationAsRead: {
      mutate: (input: { id: string }) => Promise<ApiResponse<Notification>>;
    };
    markMultipleAsRead: {
      mutate: (input: { notificationIds: string[] }) => Promise<ApiResponse<null>>;
    };
    markAllMyNotificationsAsRead: {
      mutate: () => Promise<ApiResponse<null>>;
    };
    deleteMyNotification: {
      mutate: (input: { id: string }) => Promise<ApiResponse<null>>;
    };
    deleteMyOldNotifications: {
      mutate: (input: { olderThanDays?: number }) => Promise<ApiResponse<{ deletedCount: number }>>;
    };
    registerFCMToken: {
      mutate: (input: {
        token: string;
        deviceInfo?: {
          platform?: 'web' | 'android' | 'ios';
          browser?: string;
          version?: string;
        };
      }) => Promise<ApiResponse<{
        token: string;
        isValid: boolean;
        registered: boolean;
      }>>;
    };
    testMyNotification: {
      mutate: (input: { token: string }) => Promise<ApiResponse<{ messageId: string | null }>>;
    };
  };
  translation: {
    getLocaleConfig: {
      query: () => Promise<ApiResponse<LocaleConfig>>;
    };
    getTranslations: {
      query: (input: { locale: 'vi' | 'en' }) => Promise<ApiResponse<TranslationData>>;
    };
    getTranslation: {
      query: (input: { key: string; locale: 'vi' | 'en'; defaultValue?: string }) => Promise<ApiResponse<{ key: string; value: string }>>;
    };
  };
  clientProducts: {
    getProducts: {
      query: (input: {
        page?: number;
        limit?: number;
        search?: string;
        category?: string;
        brand?: string;
        minPrice?: number;
        maxPrice?: number;
        status?: string;
        isActive?: boolean;
        isFeatured?: boolean;
        sortBy?: string;
        sortOrder?: string;
      }) => Promise<PaginatedApiResponse<Product>>;
    };
    getProductById: {
      query: (input: { id: string }) => Promise<ApiResponse<Product>>;
    };
    getProductBySlug: {
      query: (input: { slug: string }) => Promise<ApiResponse<Product>>;
    };
    getFeaturedProducts: {
      query: () => Promise<PaginatedApiResponse<Product>>;
    };
    getProductsByIds: {
      query: (input: { ids: string[] }) => Promise<ApiResponse<{ items: Product[] }>>;
    };
    getNewProducts: {
      query: () => Promise<PaginatedApiResponse<Product>>;
    };
    getProductsByCategory: {
      query: (input: { categoryId?: string; strategy?: 'latest' | 'featured' | 'bestsellers' | 'custom' }) => Promise<PaginatedApiResponse<Product>>;
    };
    getProductFilters: {
      query: () => Promise<ApiResponse<ProductFilters>>;
    };
  };
  seo: {
    getByPath: {
      query: (input: { path: string }) => Promise<ApiResponse<SEOData>>;
    };
  };
};
