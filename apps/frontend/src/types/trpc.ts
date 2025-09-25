// Type definitions for tRPC client
// This file defines the structure of our tRPC API without importing backend code

export interface User {
  id: string;
  email: string;
  name?: string;
  username?: string;
  avatar?: string;
  role?: string;
  isActive?: boolean;
  firstName?: string;
  lastName?: string;
  phone?: string;
  emailVerifiedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock?: number;
  category?: string;
  images?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Order {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  total: number;
  items: OrderItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user?: User;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LocaleConfig {
  defaultLocale: 'vi' | 'en';
  supportedLocales: readonly ('vi' | 'en')[];
}

export interface TranslationData {
  locale: 'vi' | 'en';
  translations: Record<string, string>;
}

export interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  icon?: string;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
}

export interface SEOData {
  title: string;
  description?: string | null;
  keywords?: string | null;
  additionalMetaTags?: Record<string, string> | null;
}

export interface ApiResponse<T = any> {
  code: number;
  status: string;
  data?: T;
  errors?: Array<{
    '@type': string;
    reason: string;
    domain: string;
    metadata?: Record<string, string>;
  }>;
  timestamp: string;
}

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  SYSTEM = 'system',
  PRODUCT = 'product',
  ORDER = 'order',
  USER = 'user',
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  actionUrl?: string;
  icon?: string;
  image?: string;
  data?: Record<string, unknown>;
  read: boolean;
  fcmToken?: string;
  sentAt?: Date;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationWithPagination {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
}

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
          onSuccess?: (data: PaginatedResponse<Product>) => void;
        }
      ) => {
        data?: PaginatedResponse<Product>;
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
          onSuccess?: (data: PaginatedResponse<Order>) => void;
        }
      ) => {
        data?: PaginatedResponse<Order>;
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
  seo: {
    getByPath: {
      query: (input: { path: string }) => Promise<ApiResponse<SEOData>>;
    };
  };
};
