/**
 * API Service - Centralized API handling for the admin app
 * Uses our tRPC client to communicate with the backend
 */
import { trpc, trpcClient } from '@admin/utils/trpc';

// Export the trpc clients for direct use
export { trpc, trpcClient };

// Helper functions for common API operations
export const apiService = {
  /**
   * Generic error handler for API operations
   */
  handleError: (error: unknown) => {
    console.error('API Error:', error);
    // You can add more sophisticated error handling here
    return { success: false, error };
  },

  /**
   * Transform API response format to a standardized structure
   */
  formatResponse: <T>(data: T) => {
    return {
      success: true,
      data,
    };
  }
};

export default apiService; 