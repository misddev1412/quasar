import { useEffect, useRef } from 'react';
import { useAuth } from '@admin/hooks/useAuth';

/**
 * Hook to automatically verify authentication on protected pages
 * This hook will call the /me endpoint to ensure the user is still authenticated
 * and has the necessary permissions
 */
export function useAuthVerification() {
  const { verifyAuth, isAuthenticated, isLoading } = useAuth();
  const lastVerificationRef = useRef(0);
  const isVerifyingRef = useRef(false);
  const verifyStaleMs = 2 * 60 * 1000;

  useEffect(() => {
    // Only verify if user is authenticated and not loading
    if (isAuthenticated && !isLoading) {
      const now = Date.now();
      const isStale = now - lastVerificationRef.current > verifyStaleMs;

      if (isStale && !isVerifyingRef.current) {
        isVerifyingRef.current = true;
        verifyAuth()
          .finally(() => {
            lastVerificationRef.current = Date.now();
            isVerifyingRef.current = false;
          });
      }
    }
  }, [verifyAuth, isAuthenticated, isLoading]);

  return {
    isAuthenticated,
    isLoading
  };
}

export default useAuthVerification;
