import { trpc } from '../utils/trpc';
import { useToast } from '../contexts/ToastContext';
import type { User, Product, Order, PaginatedResponse } from '../types/trpc';

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

  // Products list query
  const useProducts = (filters?: {
    search?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) => {
    return (trpc as any).product.list.useQuery(filters || {}, {
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

  return {
    useUserProfile,
    useProducts,
    useOrders,
    useCurrentUser,
    useCategories,
  };
};

export default useTrpcQuery;