import { trpc } from '../utils/trpc';
import { useToast } from '../contexts/ToastContext';
import type { User, Product, Order, PaginatedApiResponse, Language, SEOData } from '../types/trpc';

// Import the Product interface from the updated ProductCard
import type { Product as BackendProduct } from '../components/ecommerce/ProductCard';

/**
 * Custom hook to simplify tRPC queries with built-in error handling
 *
 * Example usage:
 * const { useUserProfile, useProducts, useOrders } = useTrpcQuery();
 * const { data: profile } = useUserProfile(userId);
 */
export const useTrpcQuery = () => {
  const { showToast } = useToast();

  // User profile query
  const useUserProfile = (userId?: string) => {
    return (trpc as any).user.getProfile.useQuery(
      { id: userId! },
      {
        enabled: !!userId,
        onError: (error: Error) => {
          showToast({
            type: 'error',
            title: 'Failed to load profile',
            description: error.message,
          });
        },
      }
    );
  };

  // Public products list query (uses publicProducts router - no auth required)
  const usePublicProducts = (filters?: {
    search?: string;
    categoryId?: string;
    brandId?: string;
    isFeatured?: boolean;
    page?: number;
    limit?: number;
  }) => {
    return (trpc as any).publicProducts.list.useQuery(filters || {}, {
      staleTime: 5 * 60 * 1000, // 5 minutes
      onError: (error: Error) => {
        showToast({
          type: 'error',
          title: 'Failed to load products',
          description: error.message,
        });
      },
    });
  };

  // Client products list query (uses clientProducts router - auth required)
  const useClientProducts = (filters?: {
    search?: string;
    categoryId?: string;
    brandId?: string;
    isFeatured?: boolean;
    page?: number;
    limit?: number;
  }) => {
    return (trpc as any).clientProducts.list.useQuery(filters || {}, {
      staleTime: 5 * 60 * 1000, // 5 minutes
      onError: (error: Error) => {
        showToast({
          type: 'error',
          title: 'Failed to load products',
          description: error.message,
        });
      },
    });
  };

  // Featured products query
  const useFeaturedProducts = () => {
    return (trpc as any).publicProducts.featured.useQuery(undefined, {
      staleTime: 10 * 60 * 1000, // 10 minutes
      onError: (error: Error) => {
        showToast({
          type: 'error',
          title: 'Failed to load featured products',
          description: error.message,
        });
      },
    });
  };

  // Products by category query
  const useProductsByCategory = (categoryId: string, filters?: {
    page?: number;
    limit?: number;
  }) => {
    return (trpc as any).publicProducts.byCategory.useQuery({
      categoryId,
      page: filters?.page || 1,
      limit: filters?.limit || 20,
    }, {
      staleTime: 5 * 60 * 1000, // 5 minutes
      onError: (error: Error) => {
        showToast({
          type: 'error',
          title: 'Failed to load products by category',
          description: error.message,
        });
      },
    });
  };

  // Products by brand query
  const useProductsByBrand = (brandId: string, filters?: {
    page?: number;
    limit?: number;
  }) => {
    return (trpc as any).publicProducts.byBrand.useQuery({
      brandId,
      page: filters?.page || 1,
      limit: filters?.limit || 20,
    }, {
      staleTime: 5 * 60 * 1000, // 5 minutes
      onError: (error: Error) => {
        showToast({
          type: 'error',
          title: 'Failed to load products by brand',
          description: error.message,
        });
      },
    });
  };

  // Product detail query
  const useProductDetail = (productId: string) => {
    return (trpc as any).publicProducts.detail.useQuery({
      id: productId,
    }, {
      staleTime: 5 * 60 * 1000, // 5 minutes
      onError: (error: Error) => {
        showToast({
          type: 'error',
          title: 'Failed to load product details',
          description: error.message,
        });
      },
    });
  };

  // Legacy products query (deprecated - use usePublicProducts instead)
  const useProducts = (filters?: {
    search?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) => {
    return usePublicProducts(filters);
  };

  // Orders list query
  const useOrders = (status?: string) => {
    return (trpc as any).order.list.useQuery(
      { status },
      {
        onError: (error: Error) => {
          showToast({
            type: 'error',
            title: 'Failed to load orders',
            description: error.message,
          });
        },
      }
    );
  };

  // Current user query
  const useCurrentUser = () => {
    return (trpc as any).auth.me.useQuery(undefined, {
      retry: false,
      onError: () => {
        // Silent fail - user might not be logged in
      },
    });
  };

  // Categories query
  const useCategories = () => {
    return (trpc as any).category.list.useQuery(undefined, {
      staleTime: 10 * 60 * 1000, // 10 minutes
      onError: (error: Error) => {
        showToast({
          type: 'error',
          title: 'Failed to load categories',
          description: error.message,
        });
      },
    });
  };

  // Active languages query
  const useActiveLanguages = () => {
    return (trpc as any).adminLanguage.getActiveLanguages.useQuery(undefined, {
      staleTime: 15 * 60 * 1000, // 15 minutes
      onError: (error: Error) => {
        showToast({
          type: 'error',
          title: 'Failed to load languages',
          description: error.message,
        });
      },
    });
  };

  // SEO data query by path
  const useSEO = (path: string, options?: { enabled?: boolean }) => {
    return (trpc as any).seo.getByPath.useQuery(
      { path },
      {
        enabled: options?.enabled !== false && !!path,
        staleTime: 30 * 60 * 1000, // 30 minutes
        onError: (error: Error) => {
          showToast({
            type: 'error',
            title: 'Failed to load SEO data',
            description: error.message,
          });
        },
      }
    );
  };

  return {
    useUserProfile,
    usePublicProducts,
    useClientProducts,
    useFeaturedProducts,
    useProductsByCategory,
    useProductsByBrand,
    useProductDetail,
    useProducts, // Legacy support
    useOrders,
    useCurrentUser,
    useCategories,
    useActiveLanguages,
    useSEO,
  };
};

export default useTrpcQuery;
