import { MenuGroup, MenuItem } from '../types/MenuItem';

export interface INavigationService {
  getMenuGroups(): MenuGroup[];
  isActiveRoute(path: string, currentPath: string): boolean;
  isSubmenuExpanded(item: MenuItem, collapseState: Record<string, boolean>, currentPath: string): boolean;
  getSubItemsTotalBadge(subItems?: MenuItem[]): number;
  toggleSubMenu(item: MenuItem, currentState: Record<string, boolean>): Record<string, boolean>;
}
