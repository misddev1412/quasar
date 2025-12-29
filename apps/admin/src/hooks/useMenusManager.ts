import { useMemo, useCallback } from 'react';
import { trpc } from '../utils/trpc';
import { trpcClient } from '../utils/trpc';
import { MENU_TYPE_LABELS, MENU_TARGET_LABELS, MenuType, MenuTarget } from '@shared/enums/menu.enums';
import { ApiResponse } from '@backend/trpc/schemas/response.schemas';
import { AdminMenu, MenuFormData, MenuTreeNode, ActiveLanguage } from '../types/menu';

// Re-export types for convenience
export type { AdminMenu, MenuFormData, MenuTreeNode, ActiveLanguage };

type MenusApiResponse = ApiResponse<AdminMenu[]>;
type MenuTreeApiResponse = ApiResponse<MenuTreeNode[]>;
type GroupsApiResponse = ApiResponse<string[]>;
type NextPositionApiResponse = ApiResponse<number>;
type StatisticsApiResponse = ApiResponse<{
  totalMenus: number;
  activeMenus: number;
  inactiveMenus: number;
  totalGroups: number;
  menusByType: Record<string, number>;
  menusByTarget: Record<string, number>;
}>;

export const useMenusManager = (menuGroup?: string) => {
  const utils = trpc.useContext();

  const menusQuery = trpc.adminMenus.list.useQuery<MenusApiResponse>(
    { menuGroup },
    { enabled: true },
  );

  const treeQuery = trpc.adminMenus.tree.useQuery<MenusApiResponse>(
    { menuGroup: menuGroup || 'main' },
    { enabled: Boolean(menuGroup) },
  );

  const groupsQuery = trpc.adminMenus.groups.useQuery<GroupsApiResponse>(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  const languagesQuery = trpc.adminLanguage.getActiveLanguages.useQuery<ApiResponse<ActiveLanguage[]>>(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  const statisticsQuery = trpc.adminMenus.statistics.useQuery<StatisticsApiResponse>(
    { menuGroup },
    { enabled: true, staleTime: 2 * 60 * 1000 }, // Cache for 2 minutes
  );

  const menus = useMemo<AdminMenu[]>(() => {
    const response = menusQuery.data;
    if (!response || !response.data) {
      return [];
    }
    return response.data as unknown as AdminMenu[];
  }, [menusQuery.data]);

  const buildMenuTree = useCallback((flatMenus: AdminMenu[]): MenuTreeNode[] => {
    const menuMap = new Map<string, MenuTreeNode>();
    const rootMenus: MenuTreeNode[] = [];

    // Create all nodes
    flatMenus.forEach(menu => {
      menuMap.set(menu.id, { ...menu, children: [], level: 0 });
    });

    // Build tree structure
    flatMenus.forEach(menu => {
      const node = menuMap.get(menu.id)!;

      if (menu.parentId && menuMap.has(menu.parentId)) {
        const parent = menuMap.get(menu.parentId)!;
        parent.children.push(node);
        node.level = parent.level + 1;
      } else {
        rootMenus.push(node);
      }
    });

    // Sort by position
    const sortNodes = (nodes: MenuTreeNode[]) => {
      nodes.sort((a, b) => a.position - b.position);
      nodes.forEach(node => sortNodes(node.children));
    };

    sortNodes(rootMenus);
    return rootMenus;
  }, []);

  const menuTree = useMemo<MenuTreeNode[]>(() => {
    const response = treeQuery.data;
    if (!response || !response.data) {
      return [];
    }
    // The tree endpoint already returns a tree structure, so use it directly
    return response.data as unknown as MenuTreeNode[];
  }, [treeQuery.data]);

  const groups = useMemo<string[]>(() => {
    const response = groupsQuery.data;
    if (!response || !response.data) {
      return ['main']; // Default group
    }
    return response.data as unknown as string[];
  }, [groupsQuery.data]);

  const languages = useMemo<ActiveLanguage[]>(() => {
    const response = languagesQuery.data;
    if (!response || !response.data) {
      return [];
    }
    return response.data as unknown as ActiveLanguage[];
  }, [languagesQuery.data]);

  const statistics = useMemo(() => {
    const response = statisticsQuery.data;
    if (!response || !response.data) {
      return {
        totalMenus: 0,
        activeMenus: 0,
        inactiveMenus: 0,
        totalGroups: 0,
        menusByType: {},
        menusByTarget: {},
      };
    }
    return response.data;
  }, [statisticsQuery.data]);

  const createMenu = trpc.adminMenus.create.useMutation({
    onSuccess: () => {
      utils.adminMenus.list.invalidate();
      utils.adminMenus.statistics.invalidate({ menuGroup });
      if (menuGroup) {
        utils.adminMenus.tree.invalidate({ menuGroup });
      }
    },
  });

  const updateMenu = trpc.adminMenus.update.useMutation({
    onSuccess: () => {
      utils.adminMenus.list.invalidate();
      utils.adminMenus.statistics.invalidate({ menuGroup });
      if (menuGroup) {
        utils.adminMenus.tree.invalidate({ menuGroup });
      }
    },
  });

  const deleteMenu = trpc.adminMenus.delete.useMutation({
    onSuccess: () => {
      utils.adminMenus.list.invalidate();
      utils.adminMenus.statistics.invalidate({ menuGroup });
      if (menuGroup) {
        utils.adminMenus.tree.invalidate({ menuGroup });
      }
    },
  });

  const reorderMenus = trpc.adminMenus.reorder.useMutation({
    onSuccess: () => {
      utils.adminMenus.list.invalidate();
      utils.adminMenus.statistics.invalidate({ menuGroup });
      if (menuGroup) {
        utils.adminMenus.tree.invalidate({ menuGroup });
      }
    },
  });

  const cloneMenu = (trpc.adminMenus as any).clone.useMutation({
    onSuccess: () => {
      utils.adminMenus.list.invalidate();
      utils.adminMenus.statistics.invalidate({ menuGroup });
      if (menuGroup) {
        utils.adminMenus.tree.invalidate({ menuGroup });
      }
    },
  });

  const fetchChildren = useCallback(
    (input: { menuGroup: string; parentId?: string }) =>
      trpcClient.adminMenus.children.query(input) as Promise<MenuTreeApiResponse>,
    [utils],
  );

  const fetchNextPosition = useCallback(
    (input: { menuGroup: string; parentId?: string }) =>
      trpcClient.adminMenus.getNextPosition.query(input) as Promise<NextPositionApiResponse>,
    [utils],
  );

  const flattenMenuTree = useCallback((tree: MenuTreeNode[]): AdminMenu[] => {
    const result: AdminMenu[] = [];

    const traverse = (nodes: MenuTreeNode[]) => {
      nodes.forEach(node => {
        result.push(node);
        if (node.children.length > 0) {
          traverse(node.children);
        }
      });
    };

    traverse(tree);
    return result;
  }, []);

  const getNextPositionServer = useCallback(async (parentId?: string): Promise<number> => {
    if (!menuGroup) return 0;
    try {
      const response = await fetchNextPosition({ menuGroup, parentId });
      return response?.data ?? 0;
    } catch (error) {
      console.error('Failed to fetch next position from server:', error);
      // Fallback to client-side calculation
      const siblingMenus = parentId
        ? menus.filter(menu => menu.parentId === parentId)
        : menus.filter(menu => !menu.parentId);

      return siblingMenus.length > 0
        ? Math.max(...siblingMenus.map(menu => menu.position)) + 1
        : 0;
    }
  }, [menuGroup, menus, fetchNextPosition]);

  const getNextPosition = useCallback((parentId?: string): number => {
    const siblingMenus = parentId
      ? menus.filter(menu => menu.parentId === parentId)
      : menus.filter(menu => !menu.parentId);

    return siblingMenus.length > 0
      ? Math.max(...siblingMenus.map(menu => menu.position)) + 1
      : 0;
  }, [menus]);

  return {
    menus,
    menuTree,
    groups,
    languages,
    statistics,
    statisticsQuery,
    menusQuery,
    treeQuery,
    groupsQuery,
    languagesQuery,
    createMenu,
    updateMenu,
    deleteMenu,
    reorderMenus,
    cloneMenu,
    fetchChildren,
    fetchNextPosition,
    buildMenuTree,
    flattenMenuTree,
    getNextPosition,
    getNextPositionServer,
    menuTypeLabels: MENU_TYPE_LABELS,
    menuTargetLabels: MENU_TARGET_LABELS,
  };
};
