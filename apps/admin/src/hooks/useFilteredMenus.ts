import { useMemo } from 'react';
import { MenuGroup, MenuItem } from '../domains/navigation/types/MenuItem';
import { getRoutePermission } from '../config/route-permissions';
import { useAuth } from '../context/AuthContext';

/**
 * Hook to filter menu items based on user permissions
 * Uses route permissions to determine which menus the user can access
 *
 * @param menuGroups - The raw menu groups from NavigationService
 * @returns Filtered menu groups based on user permissions
 */
export function useFilteredMenus(menuGroups: MenuGroup[]): MenuGroup[] {
  const { user } = useAuth();

  return useMemo(() => {
    // If no user, hide all menus
    if (!user) {
      return [];
    }

    // Get role value - handle both string and object with code property
    const roleValue = typeof user.role === 'string'
      ? user.role
      : (user.role as { code?: string })?.code || '';

    const normalizedRole = roleValue?.toLowerCase() || '';

    // SUPER_ADMIN sees all menus (early return for performance)
    if (
      normalizedRole === 'super_admin' ||
      normalizedRole === 'superadmin' ||
      roleValue === 'SUPER_ADMIN'
    ) {
      return menuGroups;
    }

    // Filter menu items recursively
    const filteredGroups = menuGroups
      .map((group) => ({
        ...group,
        items: filterMenuItems(group.items, user),
      }))
      .filter((group) => group.items.length > 0); // Remove empty groups

    return filteredGroups;
  }, [menuGroups, user]);
}

/**
 * Recursively filter menu items based on user permissions
 *
 * @param items - Menu items to filter
 * @param user - Current user object
 * @returns Filtered menu items
 */
function filterMenuItems(
  items: MenuItem[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: Record<string, any> | null
): MenuItem[] {
  if (!user) {
    return [];
  }

  return items
    .map((item) => {
      // If item has subItems, filter them recursively
      if (item.subItems && item.subItems.length > 0) {
        const filteredSubItems = filterMenuItems(item.subItems, user);

        // Show parent if at least one child is visible
        if (filteredSubItems.length > 0) {
          return {
            ...item,
            subItems: filteredSubItems,
          };
        }

        // Hide parent if all children are hidden
        return null;
      }

      // For leaf items, check permission
      if (hasPermissionForRoute(item.path, user)) {
        return item;
      }

      return null;
    })
    .filter((item): item is MenuItem => item !== null);
}

/**
 * Check if user has permission to access a specific route
 *
 * @param path - Route path to check
 * @param user - Current user object
 * @returns true if user has permission, false otherwise
 */
function hasPermissionForRoute(
  path: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: Record<string, any> | null
): boolean {
  if (!user) {
    return false;
  }

  // Get role value - handle various role formats
  const role = user.role;
  const roleValue = typeof role === 'string'
    ? role
    : typeof role === 'object' && role?.code
    ? role.code
    : '';

  const normalizedRole = roleValue?.toLowerCase() || '';

  // SUPER_ADMIN has access to everything
  if (
    normalizedRole === 'super_admin' ||
    normalizedRole === 'superadmin' ||
    roleValue === 'SUPER_ADMIN'
  ) {
    return true;
  }

  // ADMIN has access to all admin routes (current behavior)
  if (normalizedRole === 'admin' || roleValue === 'ADMIN') {
    return true;
  }

  // For other roles, check specific route permissions
  // This allows for future expansion of role-based access control
  const requiredPermission = getRoutePermission(path);

  // If no specific permission is required or default admin permission,
  // allow access for admin roles
  if (!requiredPermission) {
    return false;
  }

  // For now, only SUPER_ADMIN and ADMIN have access
  // Future: implement granular permission checking here
  // e.g., check if user has specific permission in their role permissions
  return false;
}
