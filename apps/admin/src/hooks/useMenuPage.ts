import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useToast } from '../contexts/ToastContext';
import { useTranslationWithBackend } from '../hooks/useTranslationWithBackend';
import { useTablePreferences } from '../hooks/useTablePreferences';
import { useMenusManager, AdminMenu, MenuTreeNode } from '../hooks/useMenusManager';
import type { BreadcrumbItem } from '../components/common/Breadcrumb';
import { MenuType, MenuTarget } from '@shared/enums/menu.enums';

type MenuSelectOption = { value: MenuType; label: string; disabled?: boolean };

export interface MenuTranslationForm {
  label?: string;
  description?: string;
  customHtml?: string;
  config?: Record<string, unknown>;
}

export interface MenuFormState {
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
  translations: Record<string, MenuTranslationForm>;
  // Enhanced customization options
  badge?: {
    text: string;
    color: string;
    backgroundColor: string;
  };
  hoverEffect?: 'none' | 'scale' | 'slide' | 'fade';
  customClass?: string;
  imageSize?: 'small' | 'medium' | 'large';
  showDescription?: boolean;
  subMenuVariant?: 'link' | 'button';
  minimalStyling?: boolean;
  buttonBorderRadius?: string;
  buttonSize?: 'small' | 'medium' | 'large';
  buttonAnimation?: 'none' | 'pulse' | 'float' | 'ring';
  // Section customization (for mega menu sections)
  columnSpan?: number;
  borderColor?: string;
  borderWidth?: string;
  titleColor?: string;
  showTitle?: boolean;
  maxItems?: number;
  layout?: 'vertical' | 'grid' | 'horizontal';
  // Banner customization
  bannerConfig?: {
    title?: string;
    subtitle?: string;
    description?: string;
    backgroundColor?: string;
    textColor?: string;
    buttonText?: string;
    buttonLink?: string;
    backgroundImage?: string;
    position?: 'top' | 'bottom';
  };
}

export type ReorderMenuItemInput = { id: string; position: number; parentId?: string };

export const TOP_MENU_GROUP = 'top';
export const SUB_MENU_GROUP = 'sub';

export const DEFAULT_MENU_GROUP_OPTIONS = [
  { value: 'main', label: 'Main Menu' },
  { value: SUB_MENU_GROUP, label: 'Sub Menu' },
  { value: TOP_MENU_GROUP, label: 'Top Menu' },
  { value: 'footer', label: 'Footer Menu' },
  { value: 'mobile', label: 'Mobile Menu' },
];

export const MENU_TYPE_OPTIONS: MenuSelectOption[] = [
  { value: MenuType.LINK, label: 'Custom Link' },
  { value: MenuType.PRODUCT, label: 'Product' },
  { value: MenuType.CATEGORY, label: 'Category' },
  { value: MenuType.BRAND, label: 'Brand' },
  { value: MenuType.NEW_PRODUCTS, label: 'New Products' },
  { value: MenuType.SALE_PRODUCTS, label: 'Sale Products' },
  { value: MenuType.FEATURED_PRODUCTS, label: 'Featured Products' },
  { value: MenuType.BANNER, label: 'Banner' },
  { value: MenuType.CUSTOM_HTML, label: 'Custom HTML' },
  { value: MenuType.SITE_CONTENT, label: 'Site Content' },
  { value: MenuType.SEARCH_BUTTON, label: 'Search Button' },
  { value: MenuType.SEARCH_BAR, label: 'Search Bar' },
  { value: MenuType.LOCALE_SWITCHER, label: 'Locale Switcher' },
  { value: MenuType.THEME_TOGGLE, label: 'Dark/Light Toggle' },
  { value: MenuType.CART_BUTTON, label: 'Cart Button' },
  { value: MenuType.USER_PROFILE, label: 'User Profile' },
  { value: MenuType.CALL_BUTTON, label: 'Call Button' },
  { value: MenuType.ORDER_TRACKING, label: 'Order Tracking' },
];

export const TOP_MENU_TYPE_OPTIONS: MenuSelectOption[] = [
  { value: MenuType.TOP_PHONE, label: 'Phone Call' },
  { value: MenuType.TOP_EMAIL, label: 'Email' },
  { value: MenuType.TOP_CURRENT_TIME, label: 'Current Time' },
  { value: MenuType.TOP_MARQUEE, label: 'Marquee Ticker' },
];

export const ALL_MENU_TYPE_OPTIONS: MenuSelectOption[] = [
  ...MENU_TYPE_OPTIONS,
  ...TOP_MENU_TYPE_OPTIONS,
];

export const TOP_MENU_ALLOWED_TYPES: MenuType[] = [
  MenuType.LINK,
  MenuType.CUSTOM_HTML,
  MenuType.THEME_TOGGLE,
  MenuType.USER_PROFILE,
  MenuType.CART_BUTTON,
  MenuType.ORDER_TRACKING,
  MenuType.LOCALE_SWITCHER,
  MenuType.TOP_PHONE,
  MenuType.TOP_EMAIL,
  MenuType.TOP_CURRENT_TIME,
  MenuType.TOP_MARQUEE,
];

export const MENU_TARGET_OPTIONS = (Object.entries({
  [MenuTarget.SELF]: 'Same window',
  [MenuTarget.BLANK]: 'New window',
}) as Array<[MenuTarget, string]>).map(([value, label]) => ({
  value,
  label,
}));

export const useMenuPage = (initialGroup: string = 'main') => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();

  // Table preferences
  const { preferences, updatePageSize, updateVisibleColumns } = useTablePreferences('menus-table', {
    pageSize: 25,
    visibleColumns: new Set(['menu', 'type', 'status', 'position', 'createdAt', 'actions']),
  });

  // State management
  const [selectedMenuGroup, setSelectedMenuGroup] = useState(initialGroup);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<AdminMenu | undefined>();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [hasInitialized, setHasInitialized] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue, setDebouncedSearchValue] = useState('');
  const [localMenuTree, setLocalMenuTree] = useState<MenuTreeNode[]>([]);
  const [draggedMenuId, setDraggedMenuId] = useState<string | null>(null);
  const [dragOriginTree, setDragOriginTree] = useState<MenuTreeNode[] | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragOverIdRef = useRef<string | null>(null);
  const dropCommittedRef = useRef(false);
  const dropContextRef = useRef<{ targetId: string; parentId: string | null } | null>(null);

  useEffect(() => {
    setSelectedMenuGroup(initialGroup);
  }, [initialGroup]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue]);

  // Menu manager hooks
  const {
    menuTree,
    groups,
    languages,
    statistics,
    statisticsQuery,
    createMenu,
    updateMenu,
    deleteMenu,
    reorderMenus,
    cloneMenu,
    fetchChildren,
    fetchNextPosition,
    treeQuery,
    languagesQuery,
    getNextPositionServer,
  } = useMenusManager(selectedMenuGroup);

  // State for lazy loaded children
  const [loadedChildren, setLoadedChildren] = useState<Map<string, MenuTreeNode[]>>(new Map());
  const [loadingChildren, setLoadingChildren] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLocalMenuTree(cloneMenuTree(menuTree));

    // For lazy loading, don't auto-expand by default
    // Only set initialization flag
    if (menuTree.length > 0 && !hasInitialized) {
      setHasInitialized(true);
    }
  }, [menuTree]);

  // Auto-reload children for expanded nodes when menu tree changes
  // This ensures that if children are modified/added/deleted, the expanded nodes show fresh data
  useEffect(() => {
    if (!hasInitialized) return;

    // Reload children for all currently expanded nodes to ensure fresh data
    expandedNodes.forEach(nodeId => {
      setLoadingChildren(prev => new Set(prev).add(nodeId));

      void fetchChildren({ menuGroup: selectedMenuGroup, parentId: nodeId })
        .then(data => {
          const children = (data?.data ?? []) as unknown as MenuTreeNode[];
          setLoadedChildren(prev => {
            const newMap = new Map(prev);
            newMap.set(nodeId, children);
            return newMap;
          });
        })
        .catch((error) => {
          console.error('Failed to refresh menu children:', error);
          addToast({ title: 'Failed to refresh menu children', type: 'error' });
        })
        .finally(() => {
          setLoadingChildren(prev => {
            const newSet = new Set(prev);
            newSet.delete(nodeId);
            return newSet;
          });
        });
    });
  }, [menuTree, hasInitialized, selectedMenuGroup, expandedNodes, fetchChildren, addToast]);

  // Handlers
  const handleAddMenu = useCallback(() => {
    setEditingMenu(undefined);
    setIsFormModalOpen(true);
  }, []);

  const handleEditMenu = useCallback((menu: AdminMenu) => {
    setEditingMenu(menu);
    setIsFormModalOpen(true);
  }, []);

  const handleDeleteMenu = useCallback(async (menu: AdminMenu) => {
    if (!confirm(`Are you sure you want to delete "${menu.translations[0]?.label || 'this menu item'}"?`)) {
      return;
    }

    try {
      await deleteMenu.mutateAsync({ id: menu.id });
      addToast({ title: 'Menu deleted successfully', type: 'success' });
    } catch (error) {
      addToast({ title: 'Failed to delete menu', type: 'error' });
    }
  }, [deleteMenu, addToast]);

  const handleCloneMenu = useCallback(async (menu: AdminMenu) => {
    try {
      await cloneMenu.mutateAsync({ id: menu.id });
      addToast({ title: 'Menu cloned successfully', type: 'success' });
    } catch (error) {
      addToast({ title: 'Failed to clone menu', type: 'error' });
    }
  }, [cloneMenu, addToast]);

  const handleRefresh = useCallback(() => {
    treeQuery.refetch();
    addToast({ title: 'Menus refreshed', type: 'success' });
  }, [treeQuery, addToast]);

  const resetDragState = useCallback((restoreOrigin = false) => {
    if (restoreOrigin && dragOriginTree) {
      setLocalMenuTree(cloneMenuTree(dragOriginTree));
    }
    setDraggedMenuId(null);
    setDragOriginTree(null);
    setDragOverId(null);
    dragOverIdRef.current = null;
    dropCommittedRef.current = false;
    dropContextRef.current = null;
  }, [dragOriginTree]);

  const persistMenuOrder = useCallback(async (updatedTree: MenuTreeNode[], previousTree: MenuTreeNode[]) => {
    const reorderItems = buildReorderItems(updatedTree);

    try {
      await reorderMenus.mutateAsync({
        menuGroup: selectedMenuGroup,
        items: reorderItems,
      });
      addToast({ title: 'Menu order updated', type: 'success' });
    } catch (error) {
      setLocalMenuTree(previousTree);
      addToast({ title: 'Failed to reorder menus', type: 'error' });
    }
  }, [reorderMenus, selectedMenuGroup, addToast]);

  const handleFormSubmit = useCallback(async (formData: MenuFormState) => {
    try {
      if (editingMenu) {
        await updateMenu.mutateAsync({
          id: editingMenu.id,
          data: formData,
        });
        addToast({ title: 'Menu updated successfully', type: 'success' });
      } else {
        // For new menus, get the next available position from server
        const nextPosition = await getNextPositionServer(formData.parentId);
        const menuDataWithPosition = {
          ...formData,
          position: nextPosition,
        };
        await createMenu.mutateAsync(menuDataWithPosition);
        addToast({ title: 'Menu created successfully', type: 'success' });
      }
      setIsFormModalOpen(false);
      setEditingMenu(undefined);
    } catch (error) {
      addToast({ title: 'Failed to save menu', type: 'error' });
    }
  }, [editingMenu, updateMenu, createMenu, addToast, getNextPositionServer]);

  const toggleNodeExpansion = useCallback(async (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      const isExpanding = !next.has(nodeId);

      if (isExpanding) {
        next.add(nodeId);

        // Always fetch children from server when expanding to ensure fresh data
        setLoadingChildren(prev => new Set(prev).add(nodeId));

        void fetchChildren({ menuGroup: selectedMenuGroup, parentId: nodeId })
          .then(data => {
            const children = (data?.data ?? []) as unknown as MenuTreeNode[];
            setLoadedChildren(prev => {
              const newMap = new Map(prev);
              newMap.set(nodeId, children);
              return newMap;
            });
          })
          .catch((error) => {
            console.error('Failed to load menu children:', error);
            addToast({ title: 'Failed to load menu children', type: 'error' });
          })
          .finally(() => {
            setLoadingChildren(prev => {
              const newSet = new Set(prev);
              newSet.delete(nodeId);
              return newSet;
            });
          });
      } else {
        next.delete(nodeId);
      }

      return next;
    });
  }, [selectedMenuGroup, fetchChildren, addToast]);

  // Group options
  const groupOptions = useMemo(() => [
    ...DEFAULT_MENU_GROUP_OPTIONS,
    ...groups.filter(group => !DEFAULT_MENU_GROUP_OPTIONS.find(opt => opt.value === group))
      .map(group => ({ value: group, label: group })),
  ], [groups]);

  const currentGroupLabel = useMemo(() => (
    groupOptions.find(opt => opt.value === selectedMenuGroup)?.label ?? selectedMenuGroup
  ), [groupOptions, selectedMenuGroup]);

  // Breadcrumb items
  const breadcrumbItems = useMemo<BreadcrumbItem[]>(() => [
    {
      label: t('navigation.home', 'Home'),
      href: '/',
    },
    {
      label: t('navigation.menus', 'Menus'),
      href: '/menus/main',
    },
    {
      label: currentGroupLabel,
    },
  ], [t, currentGroupLabel]);

  // Actions
  const actions = useMemo(() => [
    {
      label: 'Create Menu',
      onClick: handleAddMenu,
      primary: true,
    },
    {
      label: 'Refresh',
      onClick: handleRefresh,
    },
  ], [handleAddMenu, handleRefresh]);

  return {
    // State
    selectedMenuGroup,
    setSelectedMenuGroup,
    isFormModalOpen,
    setIsFormModalOpen,
    editingMenu,
    setEditingMenu,
    expandedNodes,
    showFilters,
    setShowFilters,
    searchValue,
    setSearchValue,
    localMenuTree,
    setLocalMenuTree,
    draggedMenuId,
    setDraggedMenuId,
    dragOverId,
    setDragOverId,
    dragOverIdRef,
    dropCommittedRef,
    dropContextRef,
    setDragOriginTree,

    // State
    loadedChildren,
    loadingChildren,

    // Data
    preferences,
    updatePageSize,
    updateVisibleColumns,
    menuTree,
    groups,
    languages,
    statistics,
    statisticsQuery,
    createMenu,
    updateMenu,
    deleteMenu,
    reorderMenus,
    treeQuery,
    languagesQuery,
    breadcrumbItems,
    groupOptions,
    actions,
    addToast,

    // Handlers
    handleAddMenu,
    handleEditMenu,
    handleDeleteMenu,
    handleCloneMenu,
    handleRefresh,
    resetDragState,
    persistMenuOrder,
    handleFormSubmit,
    toggleNodeExpansion,
  };
};

export const useMenuDragHandlers = (
  localMenuTree: MenuTreeNode[],
  flatMenuList: (AdminMenu & { level: number; children: MenuTreeNode[] })[],
  draggedMenuId: string | null,
  setDraggedMenuId: React.Dispatch<React.SetStateAction<string | null>>,
  setDragOriginTree: React.Dispatch<React.SetStateAction<MenuTreeNode[] | null>>,
  setLocalMenuTree: React.Dispatch<React.SetStateAction<MenuTreeNode[]>>,
  setDragOverId: React.Dispatch<React.SetStateAction<string | null>>,
  dragOverIdRef: React.MutableRefObject<string | null>,
  dropCommittedRef: React.MutableRefObject<boolean>,
  dropContextRef: React.MutableRefObject<{ targetId: string; parentId: string | null } | null>,
  persistMenuOrder: (updatedTree: MenuTreeNode[], previousTree: MenuTreeNode[]) => Promise<void>,
  addToast: (toast: { title: string; type: string }) => void,
  reorderMenus: any,
  resetDragState: (restoreOrigin?: boolean) => void,
) => {
  const dragOriginTreeRef = useRef<MenuTreeNode[] | null>(null);

  const handleDragStart = useCallback((event: React.DragEvent<HTMLTableRowElement>, menuId: string) => {
    if (reorderMenus.isPending) {
      event.preventDefault();
      return;
    }

    dropCommittedRef.current = false;
    dropContextRef.current = null;
    const snapshot = cloneMenuTree(localMenuTree);
    setDragOriginTree(snapshot);
    dragOriginTreeRef.current = snapshot;
    setDraggedMenuId(menuId);
    setDragOverId(menuId);
    dragOverIdRef.current = menuId;

    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', menuId);
  }, [reorderMenus.isPending, localMenuTree, setDraggedMenuId, setDragOriginTree]);

  const handleRowDragStart = useCallback((event: React.DragEvent<HTMLTableRowElement>, menuId: string) => {
    const target = event.target as HTMLElement | null;

    if (target?.closest('[data-drag-ignore],[data-menu-drag-ignore]')) {
      event.preventDefault();
      return;
    }

    handleDragStart(event, menuId);
  }, [handleDragStart]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLTableRowElement>, targetId: string) => {
    event.preventDefault();

    if (!draggedMenuId || draggedMenuId === targetId) {
      return;
    }

    const draggedItem = flatMenuList.find(menu => menu.id === draggedMenuId);
    const targetItem = flatMenuList.find(menu => menu.id === targetId);

    if (!draggedItem || !targetItem) {
      dropContextRef.current = null;
      return;
    }

    const sameParent = (draggedItem.parentId ?? null) === (targetItem.parentId ?? null);
    event.dataTransfer.dropEffect = sameParent ? 'move' : 'none';

    if (!sameParent || dragOverIdRef.current === targetId) {
      if (!sameParent) {
        dropContextRef.current = null;
      }
      return;
    }

    dropContextRef.current = {
      targetId,
      parentId: targetItem.parentId ?? null,
    };
    setDragOverId(targetId);
    dragOverIdRef.current = targetId;
    const previewTree = reorderMenuTreeNodes(localMenuTree, draggedMenuId, targetId);

    if (previewTree) {
      setLocalMenuTree(previewTree);
    }
  }, [draggedMenuId, flatMenuList, localMenuTree]);

  const handleDragLeave = useCallback((targetId: string) => {
    const newValue = dragOverIdRef.current === targetId ? null : targetId;
    setDragOverId(newValue);
    dragOverIdRef.current = newValue;
  }, []);

  const handleDragEnd = useCallback(() => {
    if (dropCommittedRef.current) {
      dropCommittedRef.current = false;
      resetDragState();
      return;
    }

    resetDragState(true);
  }, [resetDragState]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLTableRowElement>, targetId: string) => {
    event.preventDefault();

    if (!draggedMenuId) {
      resetDragState(true);
      return;
    }

    if (reorderMenus.isPending) {
      resetDragState(true);
      return;
    }

    const dropContext = dropContextRef.current;
    const effectiveTargetId = dropContext?.targetId ?? targetId;

    if (!effectiveTargetId) {
      resetDragState(true);
      return;
    }

    const draggedItem = flatMenuList.find(menu => menu.id === draggedMenuId);
    const targetItem = flatMenuList.find(menu => menu.id === effectiveTargetId);

    if (!draggedItem || !targetItem) {
      resetDragState(true);
      return;
    }

    const sameParent = (draggedItem.parentId ?? null) === (targetItem.parentId ?? null);

    if (!sameParent) {
      addToast({ title: 'You can only reorder items within the same parent menu', type: 'info' });
      resetDragState(true);
      return;
    }

    dropCommittedRef.current = true;
    const previousTreeSnapshot = dragOriginTreeRef.current
      ? cloneMenuTree(dragOriginTreeRef.current)
      : cloneMenuTree(localMenuTree);
    const currentTree = cloneMenuTree(localMenuTree);

    if (!haveReorderItemsChanged(currentTree, previousTreeSnapshot)) {
      resetDragState();
      return;
    }

    setDragOverId(null);
    dragOverIdRef.current = null;
    dropContextRef.current = null;
    dragOriginTreeRef.current = null;
    void persistMenuOrder(currentTree, previousTreeSnapshot);
  }, [draggedMenuId, flatMenuList, localMenuTree, persistMenuOrder, reorderMenus.isPending, addToast, resetDragState]);

  return {
    handleDragStart,
    handleRowDragStart,
    handleDragOver,
    handleDragLeave,
    handleDragEnd,
    handleDrop,
  };
};

// Helper functions
const getAllDescendantIds = (menu: MenuTreeNode): string[] => {
  const ids: string[] = [];

  const traverse = (node: MenuTreeNode) => {
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => {
        ids.push(child.id);
        traverse(child);
      });
    }
  };

  traverse(menu);
  return ids;
};

export const cloneMenuTree = (nodes: MenuTreeNode[]): MenuTreeNode[] =>
  nodes.map(node => ({
    ...node,
    children: cloneMenuTree(node.children ?? []),
  }));

export const refreshMenuTreeMetadata = (nodes: MenuTreeNode[], level = 0): void => {
  nodes.forEach((node, index) => {
    node.level = level;
    node.position = index;
    if (node.children && node.children.length > 0) {
      refreshMenuTreeMetadata(node.children, level + 1);
    }
  });
};

interface MenuNodeLocation {
  parentId: string | null;
  parentArray: MenuTreeNode[];
  index: number;
}

export const findMenuNodeLocation = (
  nodes: MenuTreeNode[],
  nodeId: string,
  parentId: string | null = null,
): MenuNodeLocation | null => {
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (node.id === nodeId) {
      return { parentId, parentArray: nodes, index };
    }

    const childLocation = findMenuNodeLocation(node.children ?? [], nodeId, node.id);
    if (childLocation) {
      return childLocation;
    }
  }
  return null;
};

export const reorderMenuTreeNodes = (tree: MenuTreeNode[], sourceId: string, targetId: string): MenuTreeNode[] | null => {
  if (sourceId === targetId) {
    return null;
  }

  const clonedTree = cloneMenuTree(tree);
  const sourceLocation = findMenuNodeLocation(clonedTree, sourceId);
  const targetLocation = findMenuNodeLocation(clonedTree, targetId);

  if (!sourceLocation || !targetLocation) {
    return null;
  }

  const normalizedSourceParent = sourceLocation.parentId ?? null;
  const normalizedTargetParent = targetLocation.parentId ?? null;

  if (normalizedSourceParent !== normalizedTargetParent) {
    return null;
  }

  if (sourceLocation.parentArray !== targetLocation.parentArray) {
    return null;
  }

  const siblings = sourceLocation.parentArray;
  const sourceIndex = sourceLocation.index;
  const targetIndex = targetLocation.index;
  const [movedNode] = siblings.splice(sourceIndex, 1);

  if (!movedNode) {
    return null;
  }

  siblings.splice(targetIndex, 0, movedNode);

  refreshMenuTreeMetadata(clonedTree);

  return clonedTree;
};

export const buildReorderItems = (nodes: MenuTreeNode[], parentId: string | null = null): ReorderMenuItemInput[] => {
  const items: ReorderMenuItemInput[] = [];

  nodes.forEach((node, index) => {
    items.push({
      id: node.id,
      position: index,
      ...(parentId ? { parentId } : {}),
    });

    if (node.children && node.children.length > 0) {
      items.push(...buildReorderItems(node.children, node.id));
    }
  });

  return items;
};

export const haveReorderItemsChanged = (
  nextTree: MenuTreeNode[],
  previousTree: MenuTreeNode[],
): boolean => {
  const prevItems = buildReorderItems(previousTree);
  const nextItems = buildReorderItems(nextTree);

  if (prevItems.length !== nextItems.length) {
    return true;
  }

  for (let index = 0; index < nextItems.length; index += 1) {
    const nextItem = nextItems[index];
    const prevItem = prevItems[index];

    if (
      nextItem.id !== prevItem.id ||
      nextItem.position !== prevItem.position ||
      (nextItem.parentId ?? null) !== (prevItem.parentId ?? null)
    ) {
      return true;
    }
  }

  return false;
};

export const flattenMenuTree = (
  nodes: MenuTreeNode[],
  level = 0,
  loadedChildren?: Map<string, MenuTreeNode[]>
): (AdminMenu & { level: number; children: MenuTreeNode[] })[] => {
  const result: (AdminMenu & { level: number; children: MenuTreeNode[] })[] = [];

  nodes.forEach(node => {
    // Get children from loaded data first, then fallback to node children
    const loaded = loadedChildren?.get(node.id);
    const baseChildren = Array.isArray(node.children) ? node.children : [];

    // Use loaded children if available, otherwise use tree children
    const childrenToUse = loaded || baseChildren;

    const hasAnyChildren = childrenToUse.length > 0;

    result.push({
      ...(node as AdminMenu),
      level,
      children: childrenToUse,
      ...(hasAnyChildren ? { hasChildren: true } : {}),
    } as any);

    // Recursively flatten all children
    if (childrenToUse.length > 0) {
      result.push(...flattenMenuTree(childrenToUse, level + 1, loadedChildren));
    }
  });

  return result;
};
