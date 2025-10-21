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

export const useMenu = (menuGroup: string = 'main') => {
  const locale = useLocale();

  const menuData = trpc.clientMenus.getByGroup.useQuery(
    { menuGroup, locale },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      select: (response) => {
        // Assuming the response follows the same format as other API responses
        if (response && typeof response === 'object' && 'data' in response) {
          return response.data as MenuResponse;
        }
        return response as MenuResponse;
      },
    }
  );

  const treeData = trpc.clientMenus.getTree.useQuery(
    { menuGroup, locale },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      select: (response) => {
        if (response && typeof response === 'object' && 'data' in response) {
          return response.data as MenuItem[];
        }
        return response as MenuItem[];
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
        name: getLabel(item),
        href: buildHref(item),
        target: item.target,
        icon: item.icon,
        isMegaMenu: item.isMegaMenu,
        megaMenuColumns: item.megaMenuColumns,
        description: getDescription(item),
        children: item.children
          .filter(child => child.isEnabled)
          .map(child => ({
            id: child.id,
            name: getLabel(child),
            href: buildHref(child),
            target: child.target,
            icon: child.icon,
            description: getDescription(child),
            image: (child.config?.image as string) || null,
            badge: (child.config?.badge as string) || null,
            featured: (child.config?.featured as boolean) || false,
            children: child.children
              .filter(grandChild => grandChild.isEnabled)
              .map(grandChild => ({
                id: grandChild.id,
                name: getLabel(grandChild),
                href: buildHref(grandChild),
                target: grandChild.target,
                icon: grandChild.icon,
                description: getDescription(grandChild),
                image: (grandChild.config?.image as string) || null,
                badge: (grandChild.config?.badge as string) || null,
                featured: (grandChild.config?.featured as boolean) || false,
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

  const navigationItems = getNavigationItems(treeData.data || []);
  const flatNavigationItems = getNavigationItems(menuData.data?.items || []);

  return {
    // Raw data
    menuData: menuData.data?.items || [],
    treeData: treeData.data || [],

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
