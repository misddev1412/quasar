import { ReactNode } from 'react';

export interface MenuItem {
  icon: ReactNode;
  label: string;
  path: string;
  badge?: number;
  subItems?: MenuItem[];
}

export interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export interface NavigationState {
  activeRoute: string;
  menuCollapseState: Record<string, boolean>;
}