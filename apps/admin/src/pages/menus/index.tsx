import React, { useMemo, useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiPlus, FiMenu, FiRefreshCw, FiHome, FiFilter } from 'react-icons/fi';
import { Select } from '../../components/common/Select';
import { StatisticsGrid, StatisticData } from '../../components/common/StatisticsGrid';
import BaseLayout from '../../components/layout/BaseLayout';
import { Loading } from '../../components/common/Loading';
import { Alert, AlertDescription, AlertTitle } from '../../components/common/Alert';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { useMenuPage, useMenuDragHandlers, flattenMenuTree, SUB_MENU_GROUP } from '../../hooks/useMenuPage';
import { AdminMenu, MenuTreeNode } from '../../hooks/useMenusManager';
import { MenuTable } from '../../components/menus/MenuTable';
import { MenuFormModal } from '../../components/menus/MenuFormModal';
import { menuStyles } from '../../components/menus/MenuStyles';
import { cn } from '@admin/lib/utils';
import { Toggle } from '../../components/common/Toggle';
import { useSettings } from '../../hooks/useSettings';
import { useTranslation } from 'react-i18next';
const SUB_MENU_VISIBILITY_SETTING_KEY = 'storefront.sub_menu_enabled';

const MenusPage: React.FC = () => {
  const { t } = useTranslation();
  const params = useParams<{ group?: string }>();
  const navigate = useNavigate();
  const currentGroup = params.group?.trim() || 'main';

  const menuPage = useMenuPage(currentGroup);
  const {
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
    handleRefresh,
    resetDragState,
    persistMenuOrder,
    handleFormSubmit,
    toggleNodeExpansion,
  } = menuPage;
  const {
    settings: storefrontSettings,
    isLoading: isStorefrontSettingsLoading,
    updateSetting: updateStorefrontSetting,
    createSetting: createStorefrontSetting,
  } = useSettings({ group: 'storefront-ui' });
  const [isUpdatingSubMenuVisibility, setIsUpdatingSubMenuVisibility] = useState(false);
  const [pendingSubMenuVisibility, setPendingSubMenuVisibility] = useState<boolean | null>(null);
  const pageTitle = t('menus.page.title', 'Menu Management');
  const pageDescription = t('menus.page.description', 'Manage all navigation menus');

  const subMenuVisibilitySetting = useMemo(
    () => storefrontSettings.find(setting => setting.key === SUB_MENU_VISIBILITY_SETTING_KEY),
    [storefrontSettings],
  );
  const resolvedSubMenuVisibility = useMemo(
    () => (subMenuVisibilitySetting ? subMenuVisibilitySetting.value !== 'false' : true),
    [subMenuVisibilitySetting],
  );
  const effectiveSubMenuVisibility = pendingSubMenuVisibility ?? resolvedSubMenuVisibility;
  const subMenuVisibilitySettingId = subMenuVisibilitySetting?.id;

  const handleSubMenuVisibilityChange = useCallback(async (checked: boolean) => {
    const previousValue = effectiveSubMenuVisibility;
    setPendingSubMenuVisibility(checked);
    setIsUpdatingSubMenuVisibility(true);

    try {
      if (subMenuVisibilitySettingId) {
        await updateStorefrontSetting(subMenuVisibilitySettingId, {
          value: checked ? 'true' : 'false',
        });
      } else {
        await createStorefrontSetting({
          key: SUB_MENU_VISIBILITY_SETTING_KEY,
          value: checked ? 'true' : 'false',
          type: 'boolean',
          group: 'storefront-ui',
          isPublic: true,
          description: 'Controls whether the storefront sub navigation bar is visible.',
        });
      }

      addToast({
        type: 'success',
        title: checked
          ? t('menus.subMenu.enabledToastTitle', 'Sub menu enabled')
          : t('menus.subMenu.disabledToastTitle', 'Sub menu hidden'),
        description: checked
          ? t('menus.subMenu.enabledToastDescription', 'The storefront sub menu bar will be displayed.')
          : t('menus.subMenu.disabledToastDescription', 'The storefront sub menu bar is now hidden.'),
      });
      setPendingSubMenuVisibility(null);
    } catch (error) {
      console.error('Failed to update sub menu visibility', error);
      setPendingSubMenuVisibility(previousValue);
      addToast({
        type: 'error',
        title: t('menus.subMenu.errorToastTitle', 'Unable to update sub menu visibility'),
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setIsUpdatingSubMenuVisibility(false);
    }
  }, [addToast, createStorefrontSetting, effectiveSubMenuVisibility, subMenuVisibilitySettingId, t, updateStorefrontSetting]);

  const handleMenuGroupChange = useCallback((value: string) => {
    setSelectedMenuGroup(value);
    navigate(`/menus/${value}`);
  }, [navigate, setSelectedMenuGroup]);

  // Drag handlers
  const dragHandlers = useMenuDragHandlers(
    localMenuTree,
    useMemo(() => flattenMenuTree(localMenuTree), [localMenuTree]),
    draggedMenuId,
    setDraggedMenuId,
    setDragOriginTree,
    setLocalMenuTree,
    setDragOverId,
    dragOverIdRef,
    dropCommittedRef,
    dropContextRef,
    persistMenuOrder,
    addToast,
    reorderMenus,
    resetDragState,
  );

  const flatMenuList = useMemo(() => flattenMenuTree(localMenuTree, 0, menuPage.loadedChildren), [localMenuTree, menuPage.loadedChildren]);

  // Filter menu list based on expanded nodes - recursively show children if parent is expanded
  const visibleMenuList = useMemo(() => {
    const result: (AdminMenu & { level: number; children: MenuTreeNode[] })[] = [];
    const flatMenuMap = new Map(flatMenuList.map(item => [item.id, item]));

    const addItemIfVisible = (item: AdminMenu & { level: number; children: MenuTreeNode[] }) => {
      result.push(item);

      // Only show children if this node is expanded
      if (!expandedNodes.has(item.id)) {
        return;
      }

      // Get children from loaded children data or from the item's children
      const loadedChildrenData = menuPage.loadedChildren.get(item.id) || [];
      const treeChildren = item.children || [];

      // Use loaded children if available, otherwise use tree children
      const childrenToShow = loadedChildrenData.length > 0 ? loadedChildrenData : treeChildren;

      childrenToShow.forEach(child => {
        const childId = typeof child === 'object' ? child.id : child;
        const childItem = flatMenuMap.get(childId);

        if (childItem) {
          addItemIfVisible(childItem); // Recursive call to show all descendant levels
        }
      });
    };

    // Start with root items (level 0)
    flatMenuList.filter(item => item.level === 0).forEach(item => {
      addItemIfVisible(item);
    });

    return result;
  }, [flatMenuList, expandedNodes, menuPage.loadedChildren]);

  // Statistics - use the dedicated statistics API for accurate counts
  const statisticsCards: StatisticData[] = useMemo(() => [
    {
      id: 'total-menus',
      title: t('menus.statistics.total', 'Total Menu Items'),
      value: statistics.totalMenus,
      icon: <FiMenu className="w-5 h-5" />,
      enableChart: false,
    },
    {
      id: 'active-menus',
      title: t('menus.statistics.active', 'Active Items'),
      value: statistics.activeMenus,
      icon: <FiMenu className="w-5 h-5" />,
      enableChart: false,
    },
    {
      id: 'inactive-menus',
      title: t('menus.statistics.inactive', 'Inactive Items'),
      value: statistics.inactiveMenus,
      icon: <FiMenu className="w-5 h-5" />,
      enableChart: false,
    },
    {
      id: 'menu-groups',
      title: t('menus.statistics.groups', 'Menu Groups'),
      value: statistics.totalGroups,
      icon: <FiMenu className="w-5 h-5" />,
      enableChart: false,
    },
  ], [statistics, t]);

  // Override actions with icons for consistency
  const actionsWithIcons = useMemo(() => [
    {
      label: t('menus.actions.create', 'Create Menu'),
      onClick: handleAddMenu,
      primary: true,
      icon: <FiPlus />,
    },
    {
      label: t('menus.actions.refresh', 'Refresh'),
      onClick: handleRefresh,
      icon: <FiRefreshCw />,
    },
    {
      label: showFilters ? t('menus.actions.hideFilters', 'Hide Filters') : t('menus.actions.showFilters', 'Show Filters'),
      onClick: () => setShowFilters(!showFilters),
      icon: <FiFilter />,
      active: showFilters,
    },
  ], [handleAddMenu, handleRefresh, showFilters, setShowFilters, t]);

  if (treeQuery.isLoading) {
    return (
      <BaseLayout title={pageTitle} description={pageDescription} actions={actionsWithIcons} fullWidth={true}>
        <div className={cn(menuStyles.itemsCenter, menuStyles.justifyCenter, menuStyles.minH64)}>
          <Loading />
        </div>
      </BaseLayout>
    );
  }

  if (treeQuery.error) {
    return (
      <BaseLayout title={pageTitle} description={pageDescription} actions={actionsWithIcons} fullWidth={true}>
        <Alert variant="destructive">
          <AlertTitle>{t('common.error', 'Error')}</AlertTitle>
          <AlertDescription>{treeQuery.error.message}</AlertDescription>
        </Alert>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title={pageTitle} description={pageDescription} actions={actionsWithIcons} fullWidth={true}>
      <div className={menuStyles.spaceY6}>
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={breadcrumbItems.map(item => ({
            ...item,
            icon: item.icon ?? (item.href === '/' ? <FiHome className="w-4 h-4" /> : <FiMenu className="w-4 h-4" />),
          }))}
        />

        {/* Menu Group Selector */}
        <div className={cn(menuStyles.flex, menuStyles.itemsCenter, menuStyles.gap4)}>
          <label className={menuStyles.formLabel}>{t('menus.page.menuGroupLabel', 'Menu Group:')}</label>
          <Select
            value={selectedMenuGroup}
            onChange={handleMenuGroupChange}
            options={groupOptions}
            className="w-48"
          />
        </div>

        {selectedMenuGroup === SUB_MENU_GROUP && (
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/40 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {t('menus.subMenu.cardTitle', 'Show sub menu on storefront')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('menus.subMenu.cardDescription', 'Toggle the dedicated sub navigation bar that appears below the header.')}
              </p>
            </div>
            <Toggle
              checked={effectiveSubMenuVisibility}
              onChange={handleSubMenuVisibilityChange}
              disabled={isStorefrontSettingsLoading || isUpdatingSubMenuVisibility}
              aria-label={t('menus.subMenu.toggleAriaLabel', 'Toggle sub menu visibility')}
            />
          </div>
        )}

        {/* Statistics Cards */}
        <StatisticsGrid
          statistics={statisticsCards}
          isLoading={statisticsQuery.isLoading}
          skeletonCount={4}
        />

        {/* Menu Table */}
        <MenuTable
          flatMenuList={visibleMenuList}
          preferences={preferences}
          updateVisibleColumns={updateVisibleColumns}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          expandedNodes={expandedNodes}
          toggleNodeExpansion={toggleNodeExpansion}
          draggedMenuId={draggedMenuId}
          dragOverId={dragOverId}
          reorderMenus={reorderMenus}
          onEditMenu={handleEditMenu}
          onDeleteMenu={handleDeleteMenu}
          onAddMenu={handleAddMenu}
          handleRowDragStart={dragHandlers.handleRowDragStart}
          handleDragEnd={dragHandlers.handleDragEnd}
          handleDragOver={dragHandlers.handleDragOver}
          handleDrop={dragHandlers.handleDrop}
          handleDragLeave={dragHandlers.handleDragLeave}
          loadingChildren={menuPage.loadingChildren}
          hasChildren={new Set(flatMenuList.filter(item =>
    ((item as any).hasChildren) ||
    (menuPage.loadedChildren.has(item.id) && (menuPage.loadedChildren.get(item.id) || []).length > 0) ||
    (item.children && item.children.length > 0)
  ).map(item => item.id))}
        />

        {/* Menu Form Modal */}
        <MenuFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingMenu(undefined);
          }}
          editingMenu={editingMenu}
          languages={languages}
          languagesQuery={languagesQuery}
          groups={groups}
          menuTree={menuTree}
          currentMenuGroup={selectedMenuGroup}
          onSubmit={handleFormSubmit}
          isSubmitting={createMenu.isPending || updateMenu.isPending}
        />
      </div>
    </BaseLayout>
  );
};

export default MenusPage;
