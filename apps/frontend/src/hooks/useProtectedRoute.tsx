import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    // If route requires authentication and user is not authenticated
    if (requireAuth && !isAuthenticated) {
      navigate(redirectTo);
      return;
    }

    // If route requires guest (not authenticated) and user is authenticated
    if (requireGuest && isAuthenticated) {
      navigate('/');
      return;
    }

    // If route has role restrictions
    if (allowedRoles.length > 0 && user) {
      const hasRequiredRole = allowedRoles.includes(user.role || '');
      if (!hasRequiredRole) {
        navigate('/unauthorized');
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, requireAuth, requireGuest, allowedRoles, navigate, redirectTo]);

  return { isLoading, isAuthenticated, user };
};

export default useProtectedRoute;