import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiPlus, FiMoreVertical, FiFolder, FiFolderPlus, FiEdit2, FiTrash2, FiRefreshCw, FiActivity, FiEye, FiTag, FiFilter, FiHome, FiPackage } from 'react-icons/fi';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Dropdown } from '../../components/common/Dropdown';
import { StatisticsGrid, StatisticData } from '../../components/common/StatisticsGrid';
import { LazyLoadingCategoryTreeView } from '../../components/products/LazyLoadingCategoryTreeView';
import { CategoryFilter, CategoryFilterOptions } from '../../components/products/CategoryFilter';
import BaseLayout from '../../components/layout/BaseLayout';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../contexts/ToastContext';
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
  const [searchValue, setSearchValue] = useState(() => searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<CategoryFilterOptions>({
    search: searchParams.get('search') || undefined,
    isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
    parentId: searchParams.get('parentId') || undefined,
    level: searchParams.get('level') ? parseInt(searchParams.get('level')!) : undefined,
    dateFrom: searchParams.get('dateFrom') || undefined,
    dateTo: searchParams.get('dateTo') || undefined,
  });

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

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  const handleFiltersChange = useCallback((newFilters: CategoryFilterOptions) => {
    setFilters(newFilters);
    
    // Update search params
    const params = new URLSearchParams();
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.isActive !== undefined) params.set('isActive', newFilters.isActive.toString());
    if (newFilters.parentId) params.set('parentId', newFilters.parentId);
    if (newFilters.level !== undefined) params.set('level', newFilters.level.toString());
    if (newFilters.dateFrom) params.set('dateFrom', newFilters.dateFrom);
    if (newFilters.dateTo) params.set('dateTo', newFilters.dateTo);
    
    setSearchParams(params);
    
    // Update searchValue for compatibility with existing tree view
    setSearchValue(newFilters.search || '');
  }, [setSearchParams]);

  const handleFiltersReset = useCallback(() => {
    const resetFilters: CategoryFilterOptions = {
      search: undefined,
      isActive: undefined,
      parentId: undefined,
      level: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    };
    setFilters(resetFilters);
    setSearchValue('');
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.isActive !== undefined) count++;
    if (filters.parentId) count++;
    if (filters.level !== undefined) count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    return count;
  }, [filters]);


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

  // Statistics data - calculate from tree structure
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
    if (!categories.length) return null;
    
    // Flatten categories to calculate stats
    const flattenForStats = (cats: Category[], level = 0): (Category & { level: number })[] => {
      const result: (Category & { level: number })[] = [];
      cats.forEach(cat => {
        result.push({ ...cat, level });
        if (cat.children && cat.children.length > 0) {
          result.push(...flattenForStats(cat.children, level + 1));
        }
      });
      return result;
    };
    
    const allCategories = flattenForStats(categories);
    const total = allCategories.length;
    const active = allCategories.filter((c) => c.isActive).length;
    const inactive = total - active;
    const rootCategories = categories.length;
    const maxDepth = Math.max(...allCategories.map(c => c.level)) + 1;
    
    return {
      data: {
        total,
        active,
        inactive,
        rootCategories,
        maxDepth,
      }
    };
  }, [categories, statsData]);


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
    {
      label: showFilters ? t('common.hideFilters', 'Hide Filters') : t('common.showFilters', 'Show Filters'),
      onClick: handleFilterToggle,
      icon: <FiFilter />,
      active: showFilters,
    },
  ], [handleCreateCategory, handleRefresh, handleFilterToggle, showFilters, t]);


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

  const breadcrumbs = useMemo(() => ([
    {
      label: 'Home',
      href: '/',
      icon: <FiHome className="w-4 h-4" />
    },
    {
      label: 'Products',
      href: '/products',
      icon: <FiPackage className="w-4 h-4" />
    },
    {
      label: t('categories.title', 'Categories'),
      icon: <FiFolder className="w-4 h-4" />
    }
  ]), [t]);

  if (isLoading) {
    return (
      <BaseLayout 
        title={t('categories.title', 'Categories')} 
        description={t('categories.description', 'Manage product categories')} 
        actions={actions} 
        fullWidth={true}
        breadcrumbs={breadcrumbs}
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
        breadcrumbs={breadcrumbs}
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
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Statistics Cards */}
        <StatisticsGrid
          statistics={statisticsCards}
          isLoading={statsLoading}
          skeletonCount={4}
        />

        {/* Filter Panel */}
        {showFilters && (
          <CategoryFilter
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleFiltersReset}
            activeFilterCount={activeFilterCount}
          />
        )}

        {/* Categories Tree View */}
        <Card className="p-0">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {t('categories.list', 'Category List')}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t('categories.treeViewDescription', 'Tree view of categories with hierarchy')}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <LazyLoadingCategoryTreeView
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
              onAddChild={handleAddChildCategory}
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              includeInactive={true}
              showFilters={showFilters}
              onFilterClick={handleFilterToggle}
            />
          </div>
        </Card>

      </div>
    </BaseLayout>
  );
};

export default CategoriesPage;
