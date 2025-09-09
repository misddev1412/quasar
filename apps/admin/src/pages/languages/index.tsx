import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit3, FiTrash2, FiSettings, FiGlobe, FiStar, FiCheck, FiX, FiMoreVertical, FiEye } from 'react-icons/fi';
import BaseLayout from '../../components/layout/BaseLayout';
import { StatisticsGrid } from '../../components/common/StatisticsGrid';
import { Table, Column } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Dropdown } from '../../components/common/Dropdown';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { LanguageFilters } from '../../components/features/LanguageFilters';
import { useToast } from '../../context/ToastContext';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { trpc } from '../../utils/trpc';
import { Language, LanguageFiltersType } from '../../types/language';
import { useTablePreferences } from '../../hooks/useTablePreferences';
import { useUrlParams, urlParamValidators } from '../../hooks/useUrlParams';

const LanguagesIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();

  // URL state management
  const { getParam, updateParams } = useUrlParams();
  const [showFilters, setShowFilters] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; language?: Language }>({
    isOpen: false,
  });

  // URL parameters
  const page = urlParamValidators.page(getParam('page'));
  const limit = urlParamValidators.number(getParam('limit'), 10) || 10;
  const search = getParam('search') || '';
  const isActive = urlParamValidators.boolean(getParam('isActive'));

  // Build filters for API call
  const filters: LanguageFiltersType = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
      isActive,
    }),
    [page, limit, search, isActive]
  );

  // Table preferences
  const preferences = useTablePreferences('languages-table');

  // Column visibility state - ensure non-hideable columns like 'actions' are always included
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    const initial = preferences.preferences.visibleColumns ? new Set(preferences.preferences.visibleColumns) : new Set(['language', 'status', 'sortOrder', 'createdAt', 'actions']);
    if (!initial.has('actions')) initial.add('actions');
    return initial;
  });

  const updatePageSize = (newSize: number) => {
    preferences.updatePageSize(newSize);
    updateParams({ limit: newSize.toString(), page: '1' });
  };

  const updateVisibleColumns = (columns: Set<string>) => {
    preferences.updateVisibleColumns(columns);
  };

  // tRPC queries
  const languagesQuery = trpc.adminLanguage.getLanguages.useQuery(filters);

  const deleteLanguageMutation = trpc.adminLanguage.deleteLanguage.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: t('languages.deleteSuccess'),
      });
      languagesQuery.refetch();
      setDeleteModal({ isOpen: false });
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('languages.deleteError'),
        description: error.message,
      });
    },
  });

  const toggleStatusMutation = trpc.adminLanguage.toggleLanguageStatus.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: t('languages.statusUpdateSuccess'),
      });
      languagesQuery.refetch();
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('languages.statusUpdateError'),
        description: error.message,
      });
    },
  });

  const setDefaultMutation = trpc.adminLanguage.setDefaultLanguage.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: t('languages.setDefaultSuccess'),
      });
      languagesQuery.refetch();
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('languages.setDefaultError'),
        description: error.message,
      });
    },
  });

  // Data processing
  const { data: apiResponse, isLoading, error } = languagesQuery;
  const languages = Array.isArray((apiResponse as any)?.data?.items) ? (apiResponse as any).data.items : [];
  const pagination = (apiResponse as any)?.data || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  };

  // Statistics
  const statisticsCards = useMemo(() => {
    const stats = {
      total: pagination.total || 0,
      active: Array.isArray(languages) ? languages.filter((lang) => lang.isActive).length : 0,
      inactive: Array.isArray(languages) ? languages.filter((lang) => !lang.isActive).length : 0,
      hasDefault: Array.isArray(languages) ? languages.some((lang) => lang.isDefault) : false,
    };

    return [
      {
        id: 'total-languages',
        title: t('languages.stats.total'),
        value: stats.total.toString(),
        icon: <FiGlobe className="w-5 h-5" />,
        color: 'blue' as const,
      },
      {
        id: 'active-languages',
        title: t('languages.stats.active'),
        value: stats.active.toString(),
        icon: <FiCheck className="w-5 h-5" />,
        color: 'green' as const,
      },
      {
        id: 'inactive-languages',
        title: t('languages.stats.inactive'),
        value: stats.inactive.toString(),
        icon: <FiX className="w-5 h-5" />,
        color: 'red' as const,
      },
      {
        id: 'has-default',
        title: t('languages.stats.hasDefault'),
        value: stats.hasDefault ? t('common.yes') : t('common.no'),
        icon: <FiStar className="w-5 h-5" />,
        color: stats.hasDefault ? 'green' : 'yellow' as const,
      },
    ];
  }, [languages, pagination.total, t]);

  // Event handlers
  const handlePageChange = useCallback((page: number) => {
    updateParams({ page: page.toString() });
  }, [updateParams]);

  const handleFiltersChange = useCallback((newFilters: LanguageFiltersType) => {
    const params: Record<string, string> = { page: '1' };
    if (newFilters.search !== undefined) params.search = newFilters.search;
    if (newFilters.isActive !== undefined) params.isActive = newFilters.isActive.toString();
    if (newFilters.limit !== undefined) params.limit = newFilters.limit.toString();
    updateParams(params);
  }, [updateParams]);

  const handleClearFilters = useCallback(() => {
    updateParams({
      search: '',
      isActive: undefined,
      page: '1',
    });
  }, [updateParams]);

  const handleRefresh = useCallback(() => {
    languagesQuery.refetch();
  }, [languagesQuery]);

  const handleDelete = useCallback((language: Language) => {
    setDeleteModal({ isOpen: true, language });
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteModal.language) {
      deleteLanguageMutation.mutate({ id: deleteModal.language.id });
    }
  }, [deleteModal.language, deleteLanguageMutation]);

  const handleToggleStatus = useCallback((language: Language) => {
    toggleStatusMutation.mutate({ id: language.id });
  }, [toggleStatusMutation]);

  const handleSetDefault = useCallback((language: Language) => {
    setDefaultMutation.mutate({ id: language.id });
  }, [setDefaultMutation]);

  // Table columns
  const columns: Column<Language>[] = useMemo(
    () => [
      {
        id: 'language',
        header: t('languages.table.language'),
        accessor: (language) => (
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {language.icon ? (
                <span className="text-xl">{language.icon}</span>
              ) : (
                <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <FiGlobe className="w-3 h-3 text-gray-500" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {language.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {language.nativeName} ({language.code.toUpperCase()})
              </div>
            </div>
          </div>
        ),
        isSortable: true,
        hideable: true,
      },
      {
        id: 'status',
        header: t('languages.table.status'),
        accessor: (language) => (
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              language.isActive
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {language.isActive ? t('common.active') : t('common.inactive')}
            </span>
            {language.isDefault && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <FiStar className="w-3 h-3 mr-1" />
                {t('languages.default')}
              </span>
            )}
          </div>
        ),
        isSortable: true,
        hideable: true,
      },
      {
        id: 'sortOrder',
        header: t('languages.table.sortOrder'),
        accessor: (language) => (
          <span className="text-gray-900 dark:text-gray-100">
            {language.sortOrder}
          </span>
        ),
        isSortable: true,
        hideable: true,
      },
      {
        id: 'createdAt',
        header: t('languages.table.createdAt'),
        accessor: 'createdAt',
        type: 'datetime',
        isSortable: true,
        hideable: true,
      },
      {
        id: 'actions',
        header: t('common.actions'),
        accessor: (language) => (
          <Dropdown
            button={
              <Button variant="ghost" size="sm" aria-label={`Actions for ${language.name}`}>
                <FiMoreVertical />
              </Button>
            }
            items={[
              {
                label: t('common.view'),
                icon: <FiEye className="w-4 h-4" aria-hidden="true" />,
                onClick: () => navigate(`/languages/${language.id}`)
              },
              {
                label: t('common.edit'),
                icon: <FiEdit3 className="w-4 h-4" aria-hidden="true" />,
                onClick: () => navigate(`/languages/${language.id}/edit`)
              },
              {
                label: language.isActive ? t('common.deactivate') : t('common.activate'),
                icon: language.isActive 
                  ? <FiX className="w-4 h-4" aria-hidden="true" />
                  : <FiCheck className="w-4 h-4" aria-hidden="true" />,
                onClick: () => handleToggleStatus(language),
                disabled: language.isDefault && language.isActive
              },
              {
                label: t('languages.setAsDefault'),
                icon: <FiStar className={`w-4 h-4 ${language.isDefault ? 'fill-current' : ''}`} aria-hidden="true" />,
                onClick: () => handleSetDefault(language),
                disabled: language.isDefault
              },
              {
                label: t('common.delete'),
                icon: <FiTrash2 className="w-4 h-4" aria-hidden="true" />,
                onClick: () => handleDelete(language),
                disabled: language.isDefault,
                className: 'text-red-500 hover:text-red-700'
              },
            ]}
          />
        ),
        isSortable: false,
        hideable: false, // Actions column should always be visible
        width: '80px',
      },
    ],
    [t, navigate, handleToggleStatus, handleSetDefault, handleDelete]
  );

  // Actions for BaseLayout
  const actions = useMemo(() => [
    {
      label: t('languages.create'),
      onClick: () => navigate('/languages/create'),
      primary: true,
      icon: <FiPlus />,
    },
    {
      label: t('common.refresh'),
      onClick: handleRefresh,
      icon: <FiSettings />,
    },
    {
      label: showFilters ? t('common.hideFilters') : t('common.showFilters'),
      onClick: () => setShowFilters(!showFilters),
      icon: <FiSettings />,
    },
  ], [navigate, handleRefresh, showFilters, t]);

  // Count active filters for display
  const activeFilterCount = useMemo(() =>
    Object.values(filters).filter(value =>
      value !== undefined && value !== null && value !== ''
    ).length - 2, // Subtract page and limit
    [filters]
  );

  if (error) {
    return (
      <BaseLayout title="Language Management" description="Manage system languages" actions={actions} fullWidth={true}>
        <div className="text-red-600 dark:text-red-400">
          Error loading languages: {error.message}
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title="Language Management" description="Manage system languages and translations" actions={actions} fullWidth={true}>
      <div className="space-y-6">
        {/* Statistics Cards */}
        <StatisticsGrid
          statistics={statisticsCards}
          isLoading={isLoading}
          skeletonCount={4}
        />

        {/* Filter Panel */}
        {showFilters && (
          <LanguageFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            activeFilterCount={activeFilterCount}
          />
        )}

        {/* Languages Table */}
        <Table<Language>
          tableId="languages-table"
          columns={columns}
          data={languages}
          searchValue={search}
          onSearchChange={(value) => updateParams({ search: value, page: '1' })}
          onFilterClick={() => setShowFilters(!showFilters)}
          isFilterActive={showFilters}
          searchPlaceholder={t('languages.searchPlaceholder')}
          // Column visibility features
          visibleColumns={visibleColumns}
          onColumnVisibilityChange={(columnId, visible) => {
            setVisibleColumns(prev => {
              const newSet = new Set(prev);
              if (visible) {
                newSet.add(columnId);
              } else {
                newSet.delete(columnId);
              }
              // Update preferences for persistence
              updateVisibleColumns(newSet);
              return newSet;
            });
          }}
          showColumnVisibility={true}
          // Enhanced pagination with page size selection
          pagination={{
            currentPage: pagination.page,
            totalPages: pagination.totalPages,
            totalItems: pagination.total,
            itemsPerPage: pagination.limit,
            onPageChange: handlePageChange,
            onItemsPerPageChange: updatePageSize,
          }}
          // Additional features
          enableRowHover={true}
          density="normal"
          // Empty state
          emptyMessage={t('languages.noLanguagesFound')}
          emptyAction={{
            label: t('languages.create'),
            onClick: () => navigate('/languages/create'),
            icon: <FiPlus />,
          }}
          // Loading state
          isLoading={isLoading}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false })}
          onConfirm={confirmDelete}
          title={t('languages.confirmDelete')}
          message={
            deleteModal.language
              ? t('languages.confirmDeleteDescription', { name: deleteModal.language.name })
              : ''
          }
          confirmText={t('common.delete')}
          cancelText={t('common.cancel')}
          confirmVariant="danger"
          isLoading={deleteLanguageMutation.isPending}
        />
      </div>
    </BaseLayout>
  );
};

export default LanguagesIndexPage;