import { useMemo } from 'react';
import { MenuGroup, MenuItem } from '../domains/navigation/types/MenuItem';
import { useAuth } from '../context/AuthContext';
import { hasPermissionForRoute, isSuperAdminUser } from '../utils/permission-access';

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
    // SUPER_ADMIN sees all menus (early return for performance)
    if (isSuperAdminUser(user)) {
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
