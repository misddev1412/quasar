import { ReactNode } from 'react';

export interface SubMenuItem {
  icon: ReactNode;
  label: string;
  path: string;
  badge?: number;
}

export interface MenuItem {
  icon: ReactNode;
  label: string;
  path: string;
  badge?: number;
  subItems?: SubMenuItem[];
}

export interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export interface NavigationState {
  activeRoute: string;
  menuCollapseState: Record<string, boolean>;
}