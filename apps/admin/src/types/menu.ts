import { MenuType, MenuTarget } from '@shared/enums/menu.enums';
import { Language } from './language';

export interface AdminMenuTranslation {
  id: string;
  locale: string;
  label?: string | null;
  description?: string | null;
  customHtml?: string | null;
  config?: Record<string, unknown> | null;
}

export interface AdminMenu {
  id: string;
  menuGroup: string;
  type: MenuType;
  url?: string | null;
  referenceId?: string | null;
  target: MenuTarget;
  position: number;
  isEnabled: boolean;
  icon?: string | null;
  textColor?: string | null;
  backgroundColor?: string | null;
  config: Record<string, unknown>;
  isMegaMenu: boolean;
  megaMenuColumns?: number | null;
  parentId?: string | null;
  translations: AdminMenuTranslation[];
  children?: AdminMenu[];
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface MenuFormData {
  menuGroup: string;
  type: MenuType;
  url?: string;
  referenceId?: string;
  target: MenuTarget;
  position: number;
  isEnabled: boolean;
  icon?: string;
  textColor?: string;
  backgroundColor?: string;
  config: Record<string, unknown>;
  isMegaMenu: boolean;
  megaMenuColumns?: number;
  parentId?: string;
  translations: Record<string, MenuTranslationFormData>;
}

export interface MenuTranslationFormData {
  label?: string;
  description?: string;
  customHtml?: string;
  config?: Record<string, unknown>;
}

export interface MenuTreeNode extends AdminMenu {
  children: MenuTreeNode[];
  level: number;
}

export interface MenuGroup {
  name: string;
  label: string;
  description?: string;
}

// Re-export Language type as ActiveLanguage for compatibility
export type ActiveLanguage = Language;