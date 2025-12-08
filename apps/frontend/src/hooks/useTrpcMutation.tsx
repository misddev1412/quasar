import { trpc } from '../utils/trpc';
import type { User, Product, Order } from '../types/trpc';
import { useToast } from '../contexts/ToastContext';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Custom hook to simplify tRPC mutations with built-in error handling
 *
 * Example usage:
 * const { updateProfile, createProduct } = useTrpcMutation();
 * const mutation = updateProfile();
 * mutation.mutate({ name: 'John' });
 */
export const useTrpcMutation = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Update user profile mutation
  const updateProfile = () => {
    return (trpc as any).user.updateProfile.useMutation({
      onSuccess: (data: User) => {
        showToast({
          type: 'success',
          title: 'Profile Updated',
          description: 'Your profile has been updated successfully.',
        });
        // Invalidate user queries
        queryClient.invalidateQueries({ queryKey: ['user'] });
      },
      onError: (error: Error) => {
        showToast({
          type: 'error',
          title: 'Update Failed',
          description: error.message,
        });
      },
    });
  };

  // Create product mutation
  const createProduct = () => {
    return (trpc as any).product.create.useMutation({
      onSuccess: (data: Product) => {
        showToast({
          type: 'success',
          title: 'Product Created',
          description: `Product "${data.name}" has been created successfully.`,
        });
        // Invalidate product list
        queryClient.invalidateQueries({ queryKey: ['product', 'list'] });
      },
      onError: (error: Error) => {
        showToast({
          type: 'error',
          title: 'Creation Failed',
          description: error.message,
        });
      },
    });
  };

  // Update product mutation
  const updateProduct = () => {
    return (trpc as any).product.update.useMutation({
      onSuccess: (data: Product) => {
        showToast({
          type: 'success',
          title: 'Product Updated',
          description: `Product has been updated successfully.`,
        });
        queryClient.invalidateQueries({ queryKey: ['product'] });
      },
      onError: (error: Error) => {
        showToast({
          type: 'error',
          title: 'Update Failed',
          description: error.message,
        });
      },
    });
  };

  // Delete product mutation
  const deleteProduct = () => {
    return (trpc as any).product.delete.useMutation({
      onSuccess: () => {
        showToast({
          type: 'success',
          title: 'Product Deleted',
          description: 'Product has been deleted successfully.',
        });
        queryClient.invalidateQueries({ queryKey: ['product', 'list'] });
      },
      onError: (error: Error) => {
        showToast({
          type: 'error',
          title: 'Deletion Failed',
          description: error.message,
        });
      },
    });
  };

  // Create order mutation
  const createOrder = () => {
    return (trpc as any).order.create.useMutation({
      onSuccess: (data: Order) => {
        showToast({
          type: 'success',
          title: 'Order Placed',
          description: `Your order #${data.id} has been placed successfully.`,
        });
        queryClient.invalidateQueries({ queryKey: ['order'] });
      },
      onError: (error: Error) => {
        showToast({
          type: 'error',
          title: 'Order Failed',
          description: error.message,
        });
      },
    });
  };

  // Cancel order mutation
  const cancelOrder = () => {
    return (trpc as any).order.cancel.useMutation({
      onSuccess: () => {
        showToast({
          type: 'success',
          title: 'Order Cancelled',
          description: 'Your order has been cancelled.',
        });
        queryClient.invalidateQueries({ queryKey: ['order'] });
      },
      onError: (error: Error) => {
        showToast({
          type: 'error',
          title: 'Cancellation Failed',
          description: error.message,
        });
      },
    });
  };

  // Change password mutation
  const changePassword = () => {
    return (trpc as any).auth.changePassword.useMutation({
      onSuccess: () => {
        showToast({
          type: 'success',
          title: 'Password Changed',
          description: 'Your password has been changed successfully.',
        });
      },
      onError: (error: Error) => {
        showToast({
          type: 'error',
          title: 'Password Change Failed',
          description: error.message,
        });
      },
    });
  };

  // Request password reset
  const requestPasswordReset = () => {
    return (trpc as any).auth.forgotPassword.useMutation({
      onSuccess: () => {
        showToast({
          type: 'success',
          title: 'Email Sent',
          description: 'Password reset instructions have been sent to your email.',
        });
      },
      onError: (error: Error) => {
        showToast({
          type: 'error',
          title: 'Request Failed',
          description: error.message,
        });
      },
    });
  };

  return {
    updateProfile,
    createProduct,
    updateProduct,
    deleteProduct,
    createOrder,
    cancelOrder,
    changePassword,
    requestPasswordReset,
  };
};

export default useTrpcMutation;
