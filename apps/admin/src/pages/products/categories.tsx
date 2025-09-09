import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiPlus, FiMoreVertical, FiFolder, FiFolderPlus, FiEdit2, FiTrash2, FiRefreshCw, FiChevronRight, FiChevronDown, FiActivity, FiEye, FiTag, FiGrid, FiList, FiSearch } from 'react-icons/fi';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Dropdown } from '../../components/common/Dropdown';
import { StatisticsGrid, StatisticData } from '../../components/common/StatisticsGrid';
import { Table, Column } from '../../components/common/Table';
import { CategoryTreeView } from '../../components/products/CategoryTreeView';
import { LazyLoadingCategoryTreeView } from '../../components/products/LazyLoadingCategoryTreeView';
import { FormInput } from '../../components/common/FormInput';
import BaseLayout from '../../components/layout/BaseLayout';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../context/ToastContext';
import { trpc } from '../../utils/trpc';
import { Loading } from '../../components/common/Loading';
import { Alert, AlertDescription, AlertTitle } from '../../components/common/Alert';
import { Category } from '../../types/product';

const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();
  const [searchParams, setSearchParams] = useSearchParams();

  // State management
  const [page, setPage] = useState(() => parseInt(searchParams.get('page') || '1'));
  const [limit, setLimit] = useState(() => parseInt(searchParams.get('limit') || '25'));
  const [searchValue, setSearchValue] = useState(() => searchParams.get('search') || '');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string | number>>(new Set());
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'tree' | 'table'>('tree');

  const utils = trpc.useContext();

  // Data fetching
  const { data: categoriesData, isLoading, error, refetch, isFetching } = trpc.adminProductCategories.getTree.useQuery({
    includeInactive: true,
  });

  // Note: If stats endpoint doesn't exist, we'll calculate stats from the data
  // const { data: statsData, isLoading: statsLoading } = trpc.adminProductCategories.getStats.useQuery(undefined, {
  //   retry: false,
  //   refetchOnWindowFocus: false,
  // });
  
  const statsLoading = false;
  const statsData = null;

  const categories = (categoriesData as any)?.data || [];

  // Flatten the tree structure for table display while preserving hierarchy info
  const flattenCategories = useCallback((cats: Category[], level = 0, parentPath = ''): (Category & { level: number; path: string })[] => {
    const result: (Category & { level: number; path: string })[] = [];
    
    cats.forEach(cat => {
      const path = parentPath ? `${parentPath} > ${cat.name}` : cat.name;
      result.push({ ...cat, level, path });
      
      if (cat.children && cat.children.length > 0) {
        result.push(...flattenCategories(cat.children, level + 1, path));
      }
    });
    
    return result;
  }, []);

  const allFlatCategories = useMemo(() => flattenCategories(categories), [categories, flattenCategories]);
  
  // Filter categories based on search value
  const flatCategories = useMemo(() => {
    if (!searchValue.trim()) return allFlatCategories;
    
    return allFlatCategories.filter(category =>
      category.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchValue.toLowerCase()))
    );
  }, [allFlatCategories, searchValue]);

  // Mutations
  const deleteMutation = trpc.adminProductCategories.delete.useMutation({
    onSuccess: () => {
      addToast({ 
        title: t('categories.deleteSuccess', 'Category deleted successfully'), 
        type: 'success' 
      });
      utils.adminProductCategories.getTree.invalidate();
    },
    onError: (error) => {
      addToast({ 
        title: t('common.error', 'Error'), 
        description: error.message, 
        type: 'error' 
      });
    },
  });

  // Event handlers
  const handleDelete = useCallback(async (id: string) => {
    const confirmDelete = window.confirm(t('categories.deleteConfirm', 'Are you sure you want to delete this category? This action cannot be undone.'));
    if (confirmDelete) {
      deleteMutation.mutate({ id });
    }
  }, [deleteMutation, t]);

  const handleCreateCategory = () => {
    navigate('/products/categories/create');
  };

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleEditCategory = useCallback((category: Category) => {
    navigate(`/products/categories/${category.id}/edit`);
  }, [navigate]);

  const handleAddChildCategory = useCallback((parentCategory: Category) => {
    navigate(`/products/categories/create?parentId=${parentCategory.id}`);
  }, [navigate]);

  const handleDeleteCategory = useCallback(async (category: Category) => {
    const confirmDelete = window.confirm(
      t('categories.deleteConfirm', 'Are you sure you want to delete this category? This action cannot be undone.')
    );
    if (confirmDelete) {
      deleteMutation.mutate({ id: category.id });
    }
  }, [deleteMutation, t]);

  // Statistics data
  const statisticsData = useMemo(() => {
    const apiStats = (statsData as any)?.data;
    if (apiStats) {
      return {
        data: {
          total: apiStats.totalCategories,
          active: apiStats.activeCategories,
          inactive: apiStats.inactiveCategories,
          rootCategories: apiStats.rootCategories,
          maxDepth: apiStats.maxDepth,
        }
      };
    }
    
    // Fallback calculation from current data
    if (!allFlatCategories.length) return null;
    
    const total = allFlatCategories.length;
    const active = allFlatCategories.filter((c) => c.isActive).length;
    const inactive = total - active;
    const rootCategories = allFlatCategories.filter((c) => c.level === 0).length;
    const maxDepth = Math.max(...allFlatCategories.map(c => c.level)) + 1;
    
    return {
      data: {
        total,
        active,
        inactive,
        rootCategories,
        maxDepth,
      }
    };
  }, [allFlatCategories, statsData]);

  // Column definitions
  const columns: Column<Category & { level: number; path: string }>[] = useMemo(() => [
    {
      id: 'category',
      header: t('categories.name', 'Category'),
      accessor: (category) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                className="w-10 h-10 object-cover rounded-lg"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <FiFolder className="w-5 h-5 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex items-center">
            <div className="flex items-center" style={{ marginLeft: `${category.level * 24}px` }}>
              {category.level > 0 && (
                <FiChevronRight className="w-4 h-4 text-gray-400 mr-1" />
              )}
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {category.name}
                </div>
                {category.description && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                    {category.description}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ),
      isSortable: false,
      hideable: false,
    },
    {
      id: 'productsCount',
      header: t('categories.productsCount', 'Products'),
      accessor: (category) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {category.productsCount || 0}
        </span>
      ),
      isSortable: true,
      hideable: true,
    },
    {
      id: 'status',
      header: t('common.status', 'Status'),
      accessor: (category) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            category.isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
          }`}
        >
          {category.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
        </span>
      ),
      isSortable: true,
      hideable: true,
    },
    {
      id: 'createdAt',
      header: t('common.created_at', 'Created At'),
      accessor: 'createdAt',
      type: 'datetime',
      isSortable: true,
      hideable: true,
    },
    {
      id: 'actions',
      header: t('common.actions', 'Actions'),
      accessor: (category) => (
        <Dropdown
          button={
            <Button variant="ghost" size="sm" aria-label={`Actions for ${category.name}`}>
              <FiMoreVertical />
            </Button>
          }
          items={[
            {
              label: t('categories.addSubcategory', 'Add Subcategory'),
              icon: <FiFolderPlus className="w-4 h-4" aria-hidden="true" />,
              onClick: () => navigate(`/products/categories/create?parentId=${category.id}`)
            },
            {
              label: t('common.edit', 'Edit'),
              icon: <FiEdit2 className="w-4 h-4" aria-hidden="true" />,
              onClick: () => navigate(`/products/categories/${category.id}/edit`)
            },
            {
              label: t('common.delete', 'Delete'),
              icon: <FiTrash2 className="w-4 h-4" aria-hidden="true" />,
              onClick: () => handleDelete(category.id),
              className: 'text-red-500 hover:text-red-700'
            },
          ]}
        />
      ),
      hideable: false,
      width: '80px',
    },
  ], [navigate, handleDelete, t]);

  // Actions
  const actions = useMemo(() => [
    {
      label: t('categories.create', 'Create Category'),
      onClick: handleCreateCategory,
      primary: true,
      icon: <FiPlus />,
    },
    {
      label: t('common.refresh', 'Refresh'),
      onClick: handleRefresh,
      icon: <FiRefreshCw />,
    },
  ], [handleCreateCategory, handleRefresh, t]);

  // View mode toggle buttons
  const viewModeButtons = useMemo(() => [
    {
      label: t('categories.treeView', 'Tree View'),
      onClick: () => setViewMode('tree'),
      active: viewMode === 'tree',
      icon: <FiGrid />,
    },
    {
      label: t('categories.tableView', 'Table View'),
      onClick: () => setViewMode('table'),
      active: viewMode === 'table',
      icon: <FiList />,
    },
  ], [viewMode, t]);

  // Statistics cards
  const statisticsCards: StatisticData[] = useMemo(() => {
    if (!statisticsData || typeof statisticsData !== 'object' || !('data' in statisticsData)) return [];

    const stats = (statisticsData as any)?.data;
    if (!stats) return [];

    return [
      {
        id: 'total-categories',
        title: t('categories.totalCategories', 'Total Categories'),
        value: stats.total?.toString() || '0',
        icon: <FiFolder className="w-5 h-5" />,
        enableChart: false,
      },
      {
        id: 'active-categories',
        title: t('categories.activeCategories', 'Active Categories'),
        value: stats.active?.toString() || '0',
        icon: <FiActivity className="w-5 h-5" />,
        enableChart: false,
      },
      {
        id: 'root-categories',
        title: t('categories.rootCategories', 'Root Categories'),
        value: stats.rootCategories?.toString() || '0',
        icon: <FiTag className="w-5 h-5" />,
        enableChart: false,
      },
      {
        id: 'max-depth',
        title: t('categories.maxDepth', 'Max Depth'),
        value: stats.maxDepth?.toString() || '0',
        icon: <FiEye className="w-5 h-5" />,
        enableChart: false,
      },
    ];
  }, [statisticsData, t]);

  if (isLoading) {
    return (
      <BaseLayout 
        title={t('categories.title', 'Categories')} 
        description={t('categories.description', 'Manage product categories')} 
        actions={actions} 
        fullWidth={true}
      >
        <div className="flex items-center justify-center h-64">
          <Loading />
        </div>
      </BaseLayout>
    );
  }

  if (error) {
    return (
      <BaseLayout 
        title={t('categories.title', 'Categories')} 
        description={t('categories.description', 'Manage product categories')} 
        actions={actions} 
        fullWidth={true}
      >
        <Alert variant="destructive">
          <AlertTitle>{t('common.error', 'Error')}</AlertTitle>
          <AlertDescription>{(error as any).message}</AlertDescription>
        </Alert>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout 
      title={t('categories.title', 'Categories')} 
      description={t('categories.description', 'Manage product categories')} 
      actions={actions} 
      fullWidth={true}
    >
      <div className="space-y-6">
        {/* Statistics Cards */}
        <StatisticsGrid
          statistics={statisticsCards}
          isLoading={statsLoading}
          skeletonCount={4}
        />

        {/* Categories View */}
        <Card className="p-0">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {t('categories.list', 'Category List')}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {viewMode === 'tree' 
                    ? t('categories.treeViewDescription', 'Tree view of categories with hierarchy')
                    : t('categories.tableViewDescription', 'Table view of all categories')
                  }
                </p>
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2">
                {/* Search Input for Tree View */}
                {viewMode === 'tree' && (
                  <div className="relative">
                    <FormInput
                      id="category-search"
                      type="text"
                      label=""
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder={t('categories.searchPlaceholder', 'Search categories...')}
                      className="pl-10 w-64"
                    />
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                )}
                
                <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-1">
                  {viewModeButtons.map((button) => (
                    <button
                      key={button.label}
                      onClick={button.onClick}
                      className={`
                        inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                        ${button.active
                          ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                        }
                      `}
                    >
                      {button.icon}
                      <span className="ml-2 hidden sm:inline">{button.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {viewMode === 'tree' ? (
              <LazyLoadingCategoryTreeView
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
                onAddChild={handleAddChildCategory}
                searchValue={searchValue}
                includeInactive={true}
              />
            ) : (
              <Table<Category & { level: number; path: string }>
                tableId="categories-table"
                columns={columns}
                data={flatCategories}
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                searchPlaceholder={t('categories.searchPlaceholder', 'Search categories by name or description...')}
                pagination={{
                  currentPage: page,
                  totalPages: Math.ceil(flatCategories.length / limit),
                  totalItems: flatCategories.length,
                  itemsPerPage: limit,
                  onPageChange: setPage,
                  onItemsPerPageChange: setLimit,
                }}
                enableRowHover={true}
                density="normal"
                emptyMessage={t('categories.noCategories', 'No categories found')}
                emptyAction={{
                  label: t('categories.create', 'Create Category'),
                  onClick: handleCreateCategory,
                  icon: <FiPlus />,
                }}
              />
            )}
          </div>
        </Card>

      </div>
    </BaseLayout>
  );
};

export default CategoriesPage;