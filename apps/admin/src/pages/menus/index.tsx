import React, { useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiPlus, FiMenu, FiRefreshCw, FiHome, FiFilter } from 'react-icons/fi';
import { Select, SelectOption } from '../../components/common/Select';
import { StatisticsGrid, StatisticData } from '../../components/common/StatisticsGrid';
import BaseLayout from '../../components/layout/BaseLayout';
import { Loading } from '../../components/common/Loading';
import { Alert, AlertDescription, AlertTitle } from '../../components/common/Alert';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { useMenuPage, useMenuDragHandlers, flattenMenuTree } from '../../hooks/useMenuPage';
import { AdminMenu, MenuTreeNode } from '../../hooks/useMenusManager';
import { MenuTable } from '../../components/menus/MenuTable';
import { MenuFormModal } from '../../components/menus/MenuFormModal';
import { menuStyles } from '../../components/menus/MenuStyles';
import { cn } from '@admin/lib/utils';



const MenusPage: React.FC = () => {
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
      title: 'Total Menu Items',
      value: statistics.totalMenus,
      icon: <FiMenu className="w-5 h-5" />,
      enableChart: false,
    },
    {
      id: 'active-menus',
      title: 'Active Items',
      value: statistics.activeMenus,
      icon: <FiMenu className="w-5 h-5" />,
      enableChart: false,
    },
    {
      id: 'inactive-menus',
      title: 'Inactive Items',
      value: statistics.inactiveMenus,
      icon: <FiMenu className="w-5 h-5" />,
      enableChart: false,
    },
    {
      id: 'menu-groups',
      title: 'Menu Groups',
      value: statistics.totalGroups,
      icon: <FiMenu className="w-5 h-5" />,
      enableChart: false,
    },
  ], [statistics]);

  // Override actions with icons for consistency
  const actionsWithIcons = useMemo(() => [
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
    {
      label: showFilters ? 'Hide Filters' : 'Show Filters',
      onClick: () => setShowFilters(!showFilters),
      icon: <FiFilter />,
      active: showFilters,
    },
  ], [handleAddMenu, handleRefresh, showFilters, setShowFilters]);

  if (treeQuery.isLoading) {
    return (
      <BaseLayout title="Menu Management" description="Manage all navigation menus" actions={actionsWithIcons} fullWidth={true}>
        <div className={cn(menuStyles.itemsCenter, menuStyles.justifyCenter, menuStyles.minH64)}>
          <Loading />
        </div>
      </BaseLayout>
    );
  }

  if (treeQuery.error) {
    return (
      <BaseLayout title="Menu Management" description="Manage all navigation menus" actions={actionsWithIcons} fullWidth={true}>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{treeQuery.error.message}</AlertDescription>
        </Alert>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title="Menu Management" description="Manage all navigation menus" actions={actionsWithIcons} fullWidth={true}>
      <div className={menuStyles.spaceY6}>
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={breadcrumbItems.map(item => ({
            ...item,
            icon: item.label === 'Home' ? <FiHome className="w-4 h-4" /> : <FiMenu className="w-4 h-4" />
          }))}
        />

        {/* Menu Group Selector */}
        <div className={cn(menuStyles.flex, menuStyles.itemsCenter, menuStyles.gap4)}>
          <label className={menuStyles.formLabel}>Menu Group:</label>
          <Select
            value={selectedMenuGroup}
            onChange={handleMenuGroupChange}
            options={groupOptions}
            className="w-48"
          />
        </div>

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
