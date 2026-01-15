import { PermissionAction, PermissionScope } from '@shared';

type PermissionRecord = {
  resource?: string;
  action?: string;
  scope?: string | PermissionScope;
  isActive?: boolean;
};

export function resolvePermissionScope(
  permissions: PermissionRecord[] | undefined,
  resource: string,
  action: PermissionAction,
  isSuperAdmin?: boolean
): PermissionScope | null {
  if (isSuperAdmin) {
    return PermissionScope.ANY;
  }

  if (!permissions || permissions.length === 0) {
    return null;
  }

  const normalizedResource = String(resource).toLowerCase();
  const normalizedAction = String(action).toLowerCase();

  const activePermissions = permissions.filter((permission) => permission && permission.isActive !== false);

  const hasAny = activePermissions.some((permission) => {
    const permissionResource = String(permission.resource || '').toLowerCase();
    const permissionAction = String(permission.action || '').toLowerCase();
    const permissionScope = String(permission.scope || '').toLowerCase();
    return (
      permissionResource === normalizedResource &&
      permissionAction === normalizedAction &&
      permissionScope === PermissionScope.ANY
    );
  });

  if (hasAny) {
    return PermissionScope.ANY;
  }

  const hasOwn = activePermissions.some((permission) => {
    const permissionResource = String(permission.resource || '').toLowerCase();
    const permissionAction = String(permission.action || '').toLowerCase();
    const permissionScope = String(permission.scope || '').toLowerCase();
    return (
      permissionResource === normalizedResource &&
      permissionAction === normalizedAction &&
      permissionScope === PermissionScope.OWN
    );
  });

  return hasOwn ? PermissionScope.OWN : null;
}
