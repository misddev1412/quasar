'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

interface UseProtectedRouteOptions {
  redirectTo?: string;
  requireAuth?: boolean;
  requireGuest?: boolean;
  allowedRoles?: string[];
}

export const useProtectedRoute = (options: UseProtectedRouteOptions = {}) => {
  const {
    redirectTo = '/login',
    requireAuth = true,
    requireGuest = false,
    allowedRoles = [],
  } = options;

  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // If route requires authentication and user is not authenticated
    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // If route requires guest (not authenticated) and user is authenticated
    if (requireGuest && isAuthenticated) {
      router.push('/');
      return;
    }

    // If route has role restrictions
    if (allowedRoles.length > 0 && user) {
      const hasRequiredRole = allowedRoles.includes(user.role || '');
      if (!hasRequiredRole) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [
    isAuthenticated,
    user,
    isLoading,
    requireAuth,
    requireGuest,
    allowedRoles,
    router,
    redirectTo,
  ]);

  return { isLoading, isAuthenticated, user };
};

export default useProtectedRoute;
