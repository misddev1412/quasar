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

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
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
};
