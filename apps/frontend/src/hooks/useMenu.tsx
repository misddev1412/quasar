'use client';

import { trpc } from '../utils/trpc';
import { useLocale } from 'next-intl';
import { MenuTarget, MenuType } from '@shared/enums/menu.enums';

export interface MenuItem {
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
  borderColor?: string | null;
  borderWidth?: string | null;
  config: Record<string, unknown>;
  isMegaMenu: boolean;
  megaMenuColumns?: number | null;
  parentId: string | null;
  translations: MenuTranslation[];
  createdAt: Date;
  updatedAt: Date;
  children: MenuItem[];
}

export interface MenuTranslation {
  id: string;
  menuId: string;
  locale: string;
  label?: string | null;
  description?: string | null;
  customHtml?: string | null;
  config?: Record<string, unknown> | null;
}

export interface MenuResponse {
  items: MenuItem[];
  total: number;
  page: number;
  limit: number;
}

const getConfigString = (
  config: Record<string, unknown> | undefined,
  key: string,
) => {
  const value = config?.[key];
  return typeof value === 'string' ? value : undefined;
};

export const useMenu = (menuGroup: string = 'main') => {
  const locale = useLocale();

  const menuData = trpc.clientMenus.getByGroup.useQuery(
    { menuGroup, locale },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      select: (response) => {
        // Assuming the response follows the same format as other API responses
        if (response && typeof response === 'object' && 'data' in response) {
          return response.data as unknown as MenuResponse;
        }
        return response as unknown as MenuResponse;
      },
    }
  );

  const treeData = trpc.clientMenus.getTree.useQuery(
    { menuGroup, locale },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      select: (response) => {
        if (response && typeof response === 'object' && 'data' in response) {
          return response.data as unknown as MenuItem[];
        }
        return response as unknown as MenuItem[];
      },
    }
  );

  // Helper function to get translated label
  const getLabel = (item: MenuItem, fallbackLocale: string = 'en') => {
    const translation = item.translations.find(t => t.locale === locale) ||
      item.translations.find(t => t.locale === fallbackLocale);
    return translation?.label || item.url || '';
  };

  // Helper function to get translated description
  const getDescription = (item: MenuItem, fallbackLocale: string = 'en') => {
    const translation = item.translations.find(t => t.locale === locale) ||
      item.translations.find(t => t.locale === fallbackLocale);
    return translation?.description || '';
  };

  // Helper function to build href from menu item
  const buildHref = (item: MenuItem): string => {
    switch (item.type) {
      case MenuType.LINK:
        return item.url ?? '#';
      case MenuType.CATEGORY:
        if (item.referenceId) {
          return `/categories/${item.referenceId}`;
        }
        return item.url ?? '#';
      case MenuType.PRODUCT:
        if (item.referenceId) {
          return `/products/${item.referenceId}`;
        }
        return item.url ?? '#';
      case MenuType.BRAND:
        if (item.referenceId) {
          return `/brands/${item.referenceId}`;
        }
        return item.url ?? '#';
      case MenuType.NEW_PRODUCTS:
        return '/products?filter=new';
      case MenuType.SALE_PRODUCTS:
        return '/products?filter=sale';
      case MenuType.FEATURED_PRODUCTS:
        return '/products?filter=featured';
      case MenuType.BANNER:
        return item.url ?? '#';
      case MenuType.CUSTOM_HTML:
        return '#';
      case MenuType.SITE_CONTENT: {
        if (item.referenceId) {
          const trimmed = item.referenceId.trim();
          if (trimmed.length > 0) {
            if (/^https?:/i.test(trimmed)) {
              return trimmed;
            }

            if (trimmed.startsWith('/')) {
              return trimmed.startsWith('/pages/') ? trimmed : `/pages${trimmed}`;
            }

            const normalized = trimmed.replace(/^pages\//i, '').replace(/^\/+/, '');
            if (normalized.length > 0) {
              return `/pages/${normalized}`;
            }
          }
        }

        if (item.url) {
          return item.url;
        }

        return '#';
      }
      case MenuType.CALL_BUTTON: {
        const numberFromConfig = getConfigString(item.config, 'callButtonNumber') || item.url || '';
        const trimmed = (numberFromConfig || '').trim();
        if (!trimmed) {
          return '#';
        }

        if (trimmed.startsWith('tel:')) {
          return trimmed;
        }

        const digits = trimmed.replace(/[^+\d]/g, '');
        return digits ? `tel:${digits}` : '#';
      }
      case MenuType.ORDER_TRACKING:
        return '/order-tracking';
      case MenuType.SEARCH_BUTTON:
      case MenuType.LOCALE_SWITCHER:
      case MenuType.THEME_TOGGLE:
      case MenuType.CART_BUTTON:
      case MenuType.USER_PROFILE:
        return '#';
      default:
        return item.url ?? '#';
    }
  };

  // Helper function to filter enabled items and build navigation structure
  const getNavigationItems = (items: MenuItem[] = []) => {
    return items
      .filter(item => item.isEnabled)
      .map(item => ({
        id: item.id,
        type: item.type,
        config: item.config,
        name: getLabel(item),
        href: buildHref(item),
        target: item.target,
        icon: item.icon,
        isMegaMenu: item.isMegaMenu,
        megaMenuColumns: item.megaMenuColumns,
        description: getDescription(item),
        borderColor: item.borderColor || null,
        borderWidth: item.borderWidth || null,
        children: item.children
          .filter(child => child.isEnabled)
          .map(child => ({
            id: child.id,
            type: child.type,
            config: child.config,
            name: getLabel(child),
            href: buildHref(child),
            target: child.target,
            icon: child.icon,
            description: getDescription(child),
            image: (child.config?.image as string) || null,
            badge: (child.config?.badge as string) || null,
            featured: (child.config?.featured as boolean) || false,
            borderColor: child.borderColor || null,
            borderWidth: child.borderWidth || null,
            children: child.children
              .filter(grandChild => grandChild.isEnabled)
              .map(grandChild => ({
                id: grandChild.id,
                type: grandChild.type,
                config: grandChild.config,
                name: getLabel(grandChild),
                href: buildHref(grandChild),
                target: grandChild.target,
                icon: grandChild.icon,
                description: getDescription(grandChild),
                image: (grandChild.config?.image as string) || null,
                badge: (grandChild.config?.badge as string) || null,
                featured: (grandChild.config?.featured as boolean) || false,
                borderColor: grandChild.borderColor || null,
                borderWidth: grandChild.borderWidth || null,
              }))
              .sort((a, b) => {
                const grandChildA = child.children.find(gc => gc.id === a.id);
                const grandChildB = child.children.find(gc => gc.id === b.id);
                return (grandChildA?.position || 0) - (grandChildB?.position || 0);
              }),
          }))
          .sort((a, b) => {
            // Sort by position if available in the original data
            const childA = item.children.find(c => c.id === a.id);
            const childB = item.children.find(c => c.id === b.id);
            return (childA?.position || 0) - (childB?.position || 0);
          }),
      }))
      .sort((a, b) => {
        // Sort by position if available in the original data
        const itemA = items.find(i => i.id === a.id);
        const itemB = items.find(i => i.id === b.id);
        return (itemA?.position || 0) - (itemB?.position || 0);
      });
  };

  const navigationItems = getNavigationItems((treeData.data as unknown as MenuItem[]) || []);
  const flatNavigationItems = getNavigationItems((menuData.data as unknown as MenuResponse)?.items || []);

  return {
    // Raw data
    menuData: (menuData.data as unknown as MenuResponse)?.items || [],
    treeData: (treeData.data as unknown as MenuItem[]) || [],

    // Processed data
    navigationItems,
    flatNavigationItems,

    // Loading states
    isLoading: menuData.isLoading || treeData.isLoading,

    // Errors
    error: menuData.error || treeData.error,

    // Actions
    refetch: () => {
      menuData.refetch();
      treeData.refetch();
    },

    // Helper functions
    getLabel,
    getDescription,
    buildHref,
  };
};

export default useMenu;
