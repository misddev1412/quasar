import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { FiPlus, FiMoreVertical, FiMenu, FiEdit, FiTrash2, FiRefreshCw, FiFilter, FiChevronDown, FiChevronRight, FiEye, FiEyeOff, FiHome } from 'react-icons/fi';
import { GripVertical } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Dropdown } from '../../components/common/Dropdown';
import { StatisticsGrid, StatisticData } from '../../components/common/StatisticsGrid';
import { Table, Column, SortDescriptor } from '../../components/common/Table';
import BaseLayout from '../../components/layout/BaseLayout';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../context/ToastContext';
import { trpc } from '../../utils/trpc';
import { Loading } from '../../components/common/Loading';
import { Alert, AlertDescription, AlertTitle } from '../../components/common/Alert';
import { useTablePreferences } from '../../hooks/useTablePreferences';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { useMenusManager, AdminMenu, MenuTreeNode } from '../../hooks/useMenusManager';
import { MenuType, MenuTarget } from '@shared/enums/menu.enums';
import { Select, SelectOption } from '../../components/common/Select';
import { Toggle } from '../../components/common/Toggle';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { cn } from '@admin/lib/utils';

const DEFAULT_MENU_GROUP_OPTIONS: SelectOption[] = [
  { value: 'main', label: 'Main Menu' },
  { value: 'footer', label: 'Footer Menu' },
  { value: 'mobile', label: 'Mobile Menu' },
];

const MENU_TYPE_OPTIONS: SelectOption[] = (Object.entries({
  [MenuType.LINK]: 'Custom Link',
  [MenuType.PRODUCT]: 'Product',
  [MenuType.CATEGORY]: 'Category',
  [MenuType.BRAND]: 'Brand',
  [MenuType.NEW_PRODUCTS]: 'New Products',
  [MenuType.SALE_PRODUCTS]: 'Sale Products',
  [MenuType.FEATURED_PRODUCTS]: 'Featured Products',
  [MenuType.BANNER]: 'Banner',
  [MenuType.CUSTOM_HTML]: 'Custom HTML',
}) as Array<[MenuType, string]>).map(([value, label]) => ({
  value,
  label,
}));

const MENU_TARGET_OPTIONS: SelectOption[] = (Object.entries({
  [MenuTarget.SELF]: 'Same window',
  [MenuTarget.BLANK]: 'New window',
}) as Array<[MenuTarget, string]>).map(([value, label]) => ({
  value,
  label,
}));

interface MenuTranslationForm {
  label?: string;
  description?: string;
  customHtml?: string;
  config?: Record<string, unknown>;
}

interface MenuFormState {
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
}

type ReorderMenuItemInput = { id: string; position: number; parentId?: string };

const cloneMenuTree = (nodes: MenuTreeNode[]): MenuTreeNode[] =>
  nodes.map(node => ({
    ...node,
    children: cloneMenuTree(node.children ?? []),
  }));

const refreshMenuTreeMetadata = (nodes: MenuTreeNode[], level = 0): void => {
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

const findMenuNodeLocation = (
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

const reorderMenuTreeNodes = (tree: MenuTreeNode[], sourceId: string, targetId: string): MenuTreeNode[] | null => {
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

const buildReorderItems = (nodes: MenuTreeNode[], parentId: string | null = null): ReorderMenuItemInput[] => {
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

const haveReorderItemsChanged = (
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

// MenuForm Component
const MenuForm: React.FC<{
  menu?: AdminMenu;
  onSubmit: (data: MenuFormState) => void;
  onCancel: () => void;
  languages: any[];
  menuGroups: string[];
  isSubmitting?: boolean;
}> = ({ menu, onSubmit, onCancel, languages, menuGroups, isSubmitting = false }) => {
  const [formData, setFormData] = useState<MenuFormState>(() => {
    if (menu) {
      const translations: Record<string, MenuTranslationForm> = {};
      menu.translations.forEach((translation) => {
        translations[translation.locale] = {
          label: translation.label || undefined,
          description: translation.description || undefined,
          customHtml: translation.customHtml || undefined,
          config: translation.config || undefined,
        };
      });

      return {
        menuGroup: menu.menuGroup,
        type: menu.type,
        url: menu.url || undefined,
        referenceId: menu.referenceId || undefined,
        target: menu.target,
        position: menu.position,
        isEnabled: menu.isEnabled,
        icon: menu.icon || undefined,
        textColor: menu.textColor || undefined,
        backgroundColor: menu.backgroundColor || undefined,
        config: menu.config,
        isMegaMenu: menu.isMegaMenu,
        megaMenuColumns: menu.megaMenuColumns || undefined,
        parentId: menu.parentId || undefined,
        translations,
      };
    }

    const defaultTranslations: Record<string, MenuTranslationForm> = {};
    languages.forEach((lang) => {
      defaultTranslations[lang.code] = {};
    });

    return {
      menuGroup: 'main',
      type: MenuType.LINK,
      target: MenuTarget.SELF,
      position: 0,
      isEnabled: true,
      config: {},
      isMegaMenu: false,
      translations: defaultTranslations,
    };
  });

  const [activeLocale, setActiveLocale] = useState<string>(() => {
    const defaultLanguage = languages.find((language) => language.isDefault);
    return defaultLanguage?.code || languages[0]?.code || 'en';
  });

  const translationLocales = languages.length > 0 ? languages.map((language) => language.code) : ['en'];

  const ensureTranslation = (locale: string) => {
    if (!formData.translations[locale]) {
      setFormData((prev) => ({
        ...prev,
        translations: {
          ...prev.translations,
          [locale]: {
            label: '',
            description: '',
            customHtml: '',
            config: {},
          },
        },
      }));
    }
  };

  useEffect(() => {
    translationLocales.forEach(ensureTranslation);
  }, [translationLocales.join(',')]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateFormData = (field: keyof MenuFormState, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateTranslation = (locale: string, field: keyof MenuTranslationForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [locale]: {
          ...prev.translations[locale],
          [field]: value,
        },
      },
    }));
  };

  const groupOptions: SelectOption[] = [
    ...DEFAULT_MENU_GROUP_OPTIONS,
    ...menuGroups.filter(group => !DEFAULT_MENU_GROUP_OPTIONS.find(opt => opt.value === group))
      .map(group => ({ value: group, label: group })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Menu Group</label>
          <Select
            value={formData.menuGroup}
            onChange={(value) => updateFormData('menuGroup', value)}
            options={groupOptions}
            className="mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <Select
            value={formData.type}
            onChange={(value) => updateFormData('type', value as MenuType)}
            options={MENU_TYPE_OPTIONS}
            className="mt-1"
          />
        </div>
      </div>

      {(formData.type === MenuType.LINK || formData.type === MenuType.BANNER) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">URL</label>
            <Input
              value={formData.url || ''}
              onChange={(e) => updateFormData('url', e.target.value)}
              placeholder="https://example.com"
              className="mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Target</label>
            <Select
              value={formData.target}
              onChange={(value) => updateFormData('target', value as MenuTarget)}
              options={MENU_TARGET_OPTIONS}
              className="mt-1"
            />
          </div>
        </div>
      )}

      {(formData.type === MenuType.PRODUCT || formData.type === MenuType.CATEGORY || formData.type === MenuType.BRAND) && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Reference ID</label>
          <Input
            value={formData.referenceId || ''}
            onChange={(e) => updateFormData('referenceId', e.target.value)}
            placeholder="Product/Category/Brand ID"
            className="mt-1"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Position</label>
          <Input
            type="number"
            value={formData.position}
            onChange={(e) => updateFormData('position', parseInt(e.target.value) || 0)}
            className="mt-1"
          />
        </div>

        <div className="flex items-end gap-4">
          <Toggle
            checked={formData.isEnabled}
            onChange={(checked) => updateFormData('isEnabled', checked)}
            label="Enabled"
          />
          <Toggle
            checked={formData.isMegaMenu}
            onChange={(checked) => updateFormData('isMegaMenu', checked)}
            label="Mega Menu"
          />
        </div>
      </div>

      {/* Translations */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-700">Translations</h4>
          <div className="flex items-center gap-2">
            {translationLocales.map((locale) => (
              <button
                key={locale}
                type="button"
                onClick={() => setActiveLocale(locale)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md border transition-colors',
                  activeLocale === locale
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100',
                )}
              >
                {locale.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
          <div>
            <label className="block text-sm font-medium text-gray-700">Label</label>
            <Input
              value={formData.translations[activeLocale]?.label || ''}
              onChange={(e) => updateTranslation(activeLocale, 'label', e.target.value)}
              placeholder="Menu label"
              className="mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.translations[activeLocale]?.description || ''}
              onChange={(e) => updateTranslation(activeLocale, 'description', e.target.value)}
              placeholder="Menu description"
              rows={3}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {formData.type === MenuType.CUSTOM_HTML && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Custom HTML</label>
              <textarea
                value={formData.translations[activeLocale]?.customHtml || ''}
                onChange={(e) => updateTranslation(activeLocale, 'customHtml', e.target.value)}
                placeholder="Custom HTML content"
                rows={6}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button variant="secondary" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {menu ? 'Update Menu' : 'Create Menu'}
        </Button>
      </div>
    </form>
  );
};

const MenusPage: React.FC = () => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();

  // Table preferences
  const { preferences, updatePageSize, updateVisibleColumns } = useTablePreferences('menus-table', {
    pageSize: 25,
    visibleColumns: new Set(['menu', 'type', 'status', 'position', 'createdAt', 'actions']),
  });

  // State management
  const [selectedMenuGroup, setSelectedMenuGroup] = useState('main');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<AdminMenu | undefined>();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue, setDebouncedSearchValue] = useState('');
  const [localMenuTree, setLocalMenuTree] = useState<MenuTreeNode[]>([]);
  const [draggedMenuId, setDraggedMenuId] = useState<string | null>(null);
  const [dragOriginTree, setDragOriginTree] = useState<MenuTreeNode[] | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dropCommittedRef = useRef(false);
  const dropContextRef = useRef<{ targetId: string; parentId: string | null } | null>(null);

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
    createMenu,
    updateMenu,
    deleteMenu,
    reorderMenus,
    treeQuery,
    languagesQuery,
  } = useMenusManager(selectedMenuGroup);

  useEffect(() => {
    setLocalMenuTree(cloneMenuTree(menuTree));
  }, [menuTree]);

  // Flatten tree for table display
  const flattenMenuTree = useCallback((nodes: MenuTreeNode[], level = 0): (AdminMenu & { level: number; children: MenuTreeNode[] })[] => {
    const result: (AdminMenu & { level: number; children: MenuTreeNode[] })[] = [];
    nodes.forEach(node => {
      result.push({ ...node, level, children: node.children || [] });
      if (node.children && node.children.length > 0 && expandedNodes.has(node.id)) {
        result.push(...flattenMenuTree(node.children, level + 1));
      }
    });
    return result;
  }, [expandedNodes]);

  const flatMenuList = useMemo(() => flattenMenuTree(localMenuTree), [localMenuTree, flattenMenuTree]);

  // Statistics
  const statisticsCards: StatisticData[] = useMemo(() => [
    {
      id: 'total-menus',
      title: 'Total Menu Items',
      value: flatMenuList.length,
      icon: <FiMenu className="w-5 h-5" />,
      enableChart: false,
    },
    {
      id: 'active-menus',
      title: 'Active Items',
      value: flatMenuList.filter(m => m.isEnabled).length,
      icon: <FiEye className="w-5 h-5" />,
      enableChart: false,
    },
    {
      id: 'inactive-menus',
      title: 'Inactive Items',
      value: flatMenuList.filter(m => !m.isEnabled).length,
      icon: <FiEyeOff className="w-5 h-5" />,
      enableChart: false,
    },
    {
      id: 'menu-groups',
      title: 'Menu Groups',
      value: groups.length,
      icon: <FiMenu className="w-5 h-5" />,
      enableChart: false,
    },
  ], [flatMenuList, groups]);

  // Handlers
  const handleAddMenu = () => {
    setEditingMenu(undefined);
    setIsFormModalOpen(true);
  };

  const handleEditMenu = (menu: AdminMenu) => {
    setEditingMenu(menu);
    setIsFormModalOpen(true);
  };

  const handleDeleteMenu = async (menu: AdminMenu) => {
    if (!confirm(`Are you sure you want to delete "${menu.translations[0]?.label || 'this menu item'}"?`)) {
      return;
    }

    try {
      await deleteMenu.mutateAsync({ id: menu.id });
      addToast({ title: 'Menu deleted successfully', type: 'success' });
    } catch (error) {
      addToast({ title: 'Failed to delete menu', type: 'error' });
    }
  };

  const handleRefresh = () => {
    treeQuery.refetch();
    addToast({ title: 'Menus refreshed', type: 'success' });
  };

  const resetDragState = useCallback((restoreOrigin = false) => {
    if (restoreOrigin && dragOriginTree) {
      setLocalMenuTree(cloneMenuTree(dragOriginTree));
    }
    setDraggedMenuId(null);
    setDragOriginTree(null);
    setDragOverId(null);
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

  const handleDragStart = useCallback((event: React.DragEvent<HTMLElement>, menuId: string) => {
    if (reorderMenus.isPending) {
      event.preventDefault();
      return;
    }

    dropCommittedRef.current = false;
    dropContextRef.current = null;
    const snapshot = cloneMenuTree(localMenuTree);
    setDragOriginTree(snapshot);
    setDraggedMenuId(menuId);
    setDragOverId(menuId);

    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', menuId);
  }, [reorderMenus.isPending, localMenuTree]);

  const handleRowDragStart = useCallback((event: React.DragEvent<HTMLElement>, menuId: string) => {
    const target = event.target as HTMLElement | null;

    if (target?.closest('[data-menu-drag-ignore]')) {
      event.preventDefault();
      return;
    }

    handleDragStart(event, menuId);
  }, [handleDragStart]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLElement>, targetId: string) => {
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

    if (!sameParent || dragOverId === targetId) {
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
    const previewTree = reorderMenuTreeNodes(localMenuTree, draggedMenuId, targetId);

    if (previewTree) {
      setLocalMenuTree(previewTree);
    }
  }, [draggedMenuId, flatMenuList, localMenuTree, dragOverId]);

  const handleDragLeave = useCallback((targetId: string) => {
    setDragOverId(prev => (prev === targetId ? null : prev));
  }, []);

  const handleDragEnd = useCallback(() => {
    if (dropCommittedRef.current) {
      dropCommittedRef.current = false;
      resetDragState();
      return;
    }

    resetDragState(true);
  }, [resetDragState]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLElement>, targetId: string) => {
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
    const previousTree = dragOriginTree ? cloneMenuTree(dragOriginTree) : cloneMenuTree(localMenuTree);
    const currentTree = cloneMenuTree(localMenuTree);

    if (!haveReorderItemsChanged(currentTree, previousTree)) {
      resetDragState();
      return;
    }

    setDragOverId(null);
    dropContextRef.current = null;
    void persistMenuOrder(currentTree, previousTree);
  }, [draggedMenuId, flatMenuList, localMenuTree, dragOriginTree, persistMenuOrder, reorderMenus.isPending, addToast, resetDragState]);

  const handleFormSubmit = async (formData: MenuFormState) => {
    try {
      if (editingMenu) {
        await updateMenu.mutateAsync({
          id: editingMenu.id,
          data: formData,
        });
        addToast({ title: 'Menu updated successfully', type: 'success' });
      } else {
        await createMenu.mutateAsync(formData);
        addToast({ title: 'Menu created successfully', type: 'success' });
      }
      setIsFormModalOpen(false);
      setEditingMenu(undefined);
    } catch (error) {
      addToast({ title: 'Failed to save menu', type: 'error' });
    }
  };

  // Table columns
  const columns: Column<AdminMenu & { level: number; children: MenuTreeNode[] }>[] = useMemo(() => [
    {
      id: 'menu',
      header: 'Menu Item',
      accessor: (item) => (
        <div className="flex items-start gap-2">
          <button
            type="button"
            className={cn(
              'p-1 text-gray-400 hover:text-gray-600 transition-colors',
              reorderMenus.isPending ? 'cursor-not-allowed' : 'cursor-grab',
              draggedMenuId === item.id && 'cursor-grabbing opacity-80'
            )}
            data-menu-drag-handle
            aria-label="Reorder menu item"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <div className="flex flex-col flex-1" style={{ paddingLeft: `${item.level * 20}px` }}>
            {item.children && item.children.length > 0 && (
              <button
                data-menu-drag-ignore
                onClick={() => setExpandedNodes(prev => {
                  const next = new Set(prev);
                  if (next.has(item.id)) {
                    next.delete(item.id);
                  } else {
                    next.add(item.id);
                  }
                  return next;
                })}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {expandedNodes.has(item.id) ?
                  <FiChevronDown className="w-3 h-3" /> :
                  <FiChevronRight className="w-3 h-3" />
                }
              </button>
            )}
            {item.icon && <span className="text-xs text-gray-600">{item.icon}</span>}
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {item.translations.find(t => t.locale === 'en')?.label || item.translations[0]?.label || 'Untitled'}
            </span>
          </div>
          {item.url && (
            <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {item.url}
            </span>
          )}
        </div>
      ),
      isSortable: false,
      hideable: true,
    },
    {
      id: 'type',
      header: 'Type',
      accessor: (item) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {MENU_TYPE_OPTIONS.find(opt => opt.value === item.type)?.label || item.type}
        </span>
      ),
      isSortable: true,
      hideable: true,
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (item) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          item.isEnabled
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {item.isEnabled ? 'Active' : 'Inactive'}
        </span>
      ),
      isSortable: true,
      hideable: true,
    },
    {
      id: 'position',
      header: 'Position',
      accessor: 'position',
      isSortable: true,
      hideable: true,
    },
    {
      id: 'createdAt',
      header: 'Created',
      accessor: 'createdAt',
      type: 'datetime',
      isSortable: true,
      hideable: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      width: '80px',
      hideable: false,
      isSortable: false,
      accessor: (item) => (
        <Dropdown
          button={
            <Button variant="ghost" size="sm" data-menu-drag-ignore>
              <FiMoreVertical className="w-4 h-4" />
            </Button>
          }
          items={[
            {
              label: 'Edit',
              icon: <FiEdit className="w-4 h-4" />,
              onClick: () => handleEditMenu(item),
            },
            {
              label: '-',
              onClick: () => {},
              disabled: true,
            },
            {
              label: 'Delete',
              icon: <FiTrash2 className="w-4 h-4" />,
              onClick: () => handleDeleteMenu(item),
              className: 'text-red-600 dark:text-red-400',
            },
          ]}
        />
      ),
    },
  ], [expandedNodes, reorderMenus.isPending, draggedMenuId]);

  // Actions
  const actions = useMemo(() => [
    {
      label: 'Create Menu',
      onClick: handleAddMenu,
      primary: true,
      icon: <FiPlus />,
    },
    {
      label: 'Refresh',
      onClick: handleRefresh,
      icon: <FiRefreshCw />,
    },
  ], [handleAddMenu, handleRefresh]);

  // Group options
  const groupOptions: SelectOption[] = [
    ...DEFAULT_MENU_GROUP_OPTIONS,
    ...groups.filter(group => !DEFAULT_MENU_GROUP_OPTIONS.find(opt => opt.value === group))
      .map(group => ({ value: group, label: group })),
  ];

  if (treeQuery.isLoading) {
    return (
      <BaseLayout title="Menu Management" description="Manage all navigation menus" actions={actions} fullWidth={true}>
        <div className="flex items-center justify-center h-64">
          <Loading />
        </div>
      </BaseLayout>
    );
  }

  if (treeQuery.error) {
    return (
      <BaseLayout title="Menu Management" description="Manage all navigation menus" actions={actions} fullWidth={true}>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{treeQuery.error.message}</AlertDescription>
        </Alert>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title="Menu Management" description="Manage all navigation menus" actions={actions} fullWidth={true}>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            {
              label: t('navigation.home', 'Home'),
              href: '/',
              icon: <FiHome className="w-4 h-4" />
            },
            {
              label: t('navigation.menus', 'Menus'),
              icon: <FiMenu className="w-4 h-4" />
            }
          ]}
        />

        {/* Menu Group Selector */}
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Menu Group:</label>
          <Select
            value={selectedMenuGroup}
            onChange={setSelectedMenuGroup}
            options={groupOptions}
            className="w-48"
          />
        </div>

        {/* Statistics Cards */}
        <StatisticsGrid
          statistics={statisticsCards}
          isLoading={treeQuery.isLoading}
          skeletonCount={4}
        />

        {/* Menu Table */}
        <Table<AdminMenu & { level: number; children: MenuTreeNode[] }>
          tableId="menus-table"
          columns={columns}
          data={flatMenuList}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder="Search menu items..."
          visibleColumns={preferences.visibleColumns}
          onColumnVisibilityChange={(columnId, visible) => {
            const newSet = new Set(preferences.visibleColumns);
            if (visible) {
              newSet.add(columnId);
            } else {
              newSet.delete(columnId);
            }
            updateVisibleColumns(newSet);
          }}
          showColumnVisibility={true}
          enableRowHover={true}
          density="normal"
          emptyMessage="No menu items found"
          emptyAction={{
            label: 'Create Menu Item',
            onClick: handleAddMenu,
            icon: <FiPlus />,
          }}
          rowProps={(item) => ({
            draggable: !reorderMenus.isPending,
            onDragStart: (event) => handleRowDragStart(event, item.id),
            onDragEnd: handleDragEnd,
            onDragOver: (event) => handleDragOver(event, item.id),
            onDrop: (event) => handleDrop(event, item.id),
            onDragLeave: () => handleDragLeave(item.id),
            className: cn(
              reorderMenus.isPending ? 'cursor-not-allowed' : 'cursor-grab',
              draggedMenuId === item.id && 'opacity-60 cursor-grabbing',
              dragOverId === item.id && draggedMenuId !== item.id && 'ring-2 ring-blue-300 dark:ring-blue-600'
            ),
          })}
        />

        {/* Menu Form Modal */}
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingMenu(undefined);
          }}
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {editingMenu ? 'Edit Menu Item' : 'Add Menu Item'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {editingMenu ? 'Update the menu item details and translations.' : 'Create a new menu item with translations.'}
              </p>
            </div>
            {languagesQuery.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <MenuForm
                menu={editingMenu}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setIsFormModalOpen(false);
                  setEditingMenu(undefined);
                }}
                languages={languages}
                menuGroups={groups}
                isSubmitting={createMenu.isPending || updateMenu.isPending}
              />
            )}
          </div>
        </Modal>
      </div>
    </BaseLayout>
  );
};

export default MenusPage;
