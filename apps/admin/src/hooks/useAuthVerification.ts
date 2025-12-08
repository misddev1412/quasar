import { useEffect } from 'react';
import { useAuth } from './useAuth';

/**
 * Hook to automatically verify authentication on protected pages
 * This hook will call the /me endpoint to ensure the user is still authenticated
 * and has the necessary permissions
 */
export function useAuthVerification() {
  const { verifyAuth, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Only verify if user is authenticated and not loading
    if (isAuthenticated && !isLoading) {
      verifyAuth();
    }
  }, [verifyAuth, isAuthenticated, isLoading]);

  return {
    isAuthenticated,
    isLoading
  };
}

export default useAuthVerification;
