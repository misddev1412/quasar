import { PermissionScope } from '@shared';
import { getRoutePermission } from '../config/route-permissions';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UserRecord = Record<string, any> | null;

export function isSuperAdminUser(user: UserRecord): boolean {
  if (!user) {
    return false;
  }

  const role = user.role;
  const roleValue = typeof role === 'string'
    ? role
    : typeof role === 'object' && role?.code
    ? role.code
    : '';

  const normalizedRole = String(roleValue || '').toLowerCase();

  return normalizedRole === 'super_admin' || normalizedRole === 'superadmin' || roleValue === 'SUPER_ADMIN';
}

export function hasPermissionForRoute(path: string, user: UserRecord): boolean {
  if (!user) {
    return false;
  }

  if (isSuperAdminUser(user)) {
    return true;
  }

  const requiredPermission = getRoutePermission(path);
  if (!requiredPermission) {
    return false;
  }

  const userPermissions = Array.isArray(user.permissions) ? user.permissions : [];
  if (userPermissions.length === 0) {
    return false;
  }

  const requiredResource = String(requiredPermission.resource).toLowerCase();
  const requiredAction = String(requiredPermission.action).toLowerCase();
  const requiredScope = String(requiredPermission.scope).toLowerCase();

  return userPermissions.some((permission) => {
    if (!permission) {
      return false;
    }

    const permissionResource = String(permission.resource || '').toLowerCase();
    const permissionAction = String(permission.action || '').toLowerCase();
    const permissionScope = String(permission.scope || '').toLowerCase();

    if (permissionResource !== requiredResource || permissionAction !== requiredAction) {
      return false;
    }

    if (requiredScope === PermissionScope.ANY) {
      return permissionScope === PermissionScope.ANY;
    }

    return permissionScope === requiredScope || permissionScope === PermissionScope.ANY;
  });
}
