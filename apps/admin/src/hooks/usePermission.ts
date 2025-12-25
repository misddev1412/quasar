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
 * Helper function to check if a user has a specific permission
 * Can be used outside of React component context
 *
 * @param permission - The required permission to check
 * @param user - The user object to check permissions for
 * @returns true if user has permission, false otherwise
 */
export function checkUserPermission(
  permission: RequiredPermission | null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: Record<string, any> | null
): boolean {
  if (!permission || !user) return false;

  // Get role value - handle various role formats
  const role = user.role;
  const roleValue = typeof role === 'string'
    ? role
    : typeof role === 'object' && role?.code
    ? role.code
    : '';

  const normalizedRole = roleValue?.toLowerCase() || '';

  // SUPER_ADMIN has all permissions
  if (
    normalizedRole === 'super_admin' ||
    normalizedRole === 'superadmin' ||
    roleValue === 'SUPER_ADMIN'
  ) {
    return true;
  }

  // ADMIN role has access to most admin resources
  if (normalizedRole === 'admin' || roleValue === 'ADMIN') {
    return true;
  }

  // For other roles, return false
  // Backend middleware will handle the actual permission checking
  return false;
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

    // Get role value - handle both string and object with code property
    const roleValue = typeof user.role === 'string' 
      ? user.role 
      : (user.role as any)?.code || (user.role as any)?.name || '';
    
    // Normalize role value to lowercase for comparison
    const normalizedRole = roleValue?.toLowerCase() || '';

    // SUPER_ADMIN has all permissions (check various formats)
    if (
      normalizedRole === 'super_admin' || 
      normalizedRole === 'superadmin' ||
      roleValue === 'SUPER_ADMIN'
    ) {
      return true;
    }

    // ADMIN role has access to most admin resources
    // For now, we allow ADMIN access. Backend middleware will enforce specific permissions.
    if (normalizedRole === 'admin' || roleValue === 'ADMIN') {
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

    // Get role value - handle both string and object with code property
    const roleValue = typeof user?.role === 'string' 
      ? user.role 
      : (user?.role as any)?.code || (user?.role as any)?.name || '';
    const normalizedRole = roleValue?.toLowerCase() || '';

    // SUPER_ADMIN has all permissions
    if (
      normalizedRole === 'super_admin' || 
      normalizedRole === 'superadmin' ||
      roleValue === 'SUPER_ADMIN'
    ) {
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

    // Get role value - handle both string and object with code property
    const roleValue = typeof user?.role === 'string' 
      ? user.role 
      : (user?.role as any)?.code || (user?.role as any)?.name || '';
    const normalizedRole = roleValue?.toLowerCase() || '';

    // SUPER_ADMIN has all permissions
    if (
      normalizedRole === 'super_admin' || 
      normalizedRole === 'superadmin' ||
      roleValue === 'SUPER_ADMIN'
    ) {
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

