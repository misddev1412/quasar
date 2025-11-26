import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { PermissionAction, PermissionScope } from '@shared';
import { trpc } from '../utils/trpc';

export interface RequiredPermission {
  resource: string;
  action: PermissionAction;
  scope: PermissionScope;
}

/**
 * Hook to check if user has required permission
 * Note: This is a client-side check. The backend will enforce permissions via middleware.
 * For SUPER_ADMIN, we grant all permissions on the frontend.
 */
export function usePermission(permission?: RequiredPermission) {
  const { user, isAuthenticated } = useAuth();

  /**
   * Check if user has the required permission
   * For now, we check role-based access. SUPER_ADMIN has all permissions.
   * ADMIN has most permissions. For granular checks, backend middleware will enforce.
   */
  const hasPermission = useMemo(() => {
    if (!permission || !isAuthenticated || !user) return false;

    // SUPER_ADMIN has all permissions
    if (user.role === 'SUPER_ADMIN' || user.role === 'super_admin' || user.role === 'SUPER_ADMIN') {
      return true;
    }

    // ADMIN role has access to most admin resources
    // For now, we allow ADMIN access. Backend middleware will enforce specific permissions.
    if (user.role === 'ADMIN' || user.role === 'admin') {
      // Allow access - backend will check specific permissions
      return true;
    }

    // For other roles or specific permission checks, return false
    // Backend middleware will handle the actual permission checking
    return false;
  }, [permission, user, isAuthenticated]);

  return {
    hasPermission,
    isLoading: false,
    userPermissions: [],
  };
}

/**
 * Hook to check multiple permissions at once
 */
export function usePermissions(permissions: RequiredPermission[]) {
  const { user, isAuthenticated } = useAuth();
  
  const { data: permissionsData, isLoading } = trpc.adminUser.getProfile.useQuery(
    undefined,
    {
      enabled: isAuthenticated && permissions.length > 0,
      retry: false,
    }
  );

  const userPermissions = useMemo(() => {
    if (!user || !permissionsData) return [];
    
    const response = permissionsData as any;
    const userData = response?.data || user;
    
    return userData?.permissions || userData?.rolePermissions || [];
  }, [user, permissionsData]);

  const hasAllPermissions = useMemo(() => {
    if (!isAuthenticated || permissions.length === 0) return false;
    if (!userPermissions || userPermissions.length === 0) return false;

    // SUPER_ADMIN has all permissions
    if (user?.role === 'SUPER_ADMIN' || user?.role === 'super_admin') {
      return true;
    }

    // Check if user has all required permissions
    return permissions.every(permission => {
      return userPermissions.some((perm: any) => {
        const resourceMatch = perm.resource === permission.resource || perm.resource === '*';
        const actionMatch = perm.action === permission.action || perm.action === '*';
        const scopeMatch = perm.scope === permission.scope || perm.scope === PermissionScope.ANY;
        
        return resourceMatch && actionMatch && scopeMatch && perm.isActive !== false;
      });
    });
  }, [permissions, userPermissions, user, isAuthenticated]);

  const hasAnyPermission = useMemo(() => {
    if (!isAuthenticated || permissions.length === 0) return false;
    if (!userPermissions || userPermissions.length === 0) return false;

    // SUPER_ADMIN has all permissions
    if (user?.role === 'SUPER_ADMIN' || user?.role === 'super_admin') {
      return true;
    }

    // Check if user has at least one required permission
    return permissions.some(permission => {
      return userPermissions.some((perm: any) => {
        const resourceMatch = perm.resource === permission.resource || perm.resource === '*';
        const actionMatch = perm.action === permission.action || perm.action === '*';
        const scopeMatch = perm.scope === permission.scope || perm.scope === PermissionScope.ANY;
        
        return resourceMatch && actionMatch && scopeMatch && perm.isActive !== false;
      });
    });
  }, [permissions, userPermissions, user, isAuthenticated]);

  return {
    hasAllPermissions,
    hasAnyPermission,
    isLoading,
    userPermissions,
  };
}

