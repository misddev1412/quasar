import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit3, FiTrash2, FiSettings, FiFileText, FiCheck, FiX, FiMoreVertical, FiGlobe, FiHome } from 'react-icons/fi';
import BaseLayout from '../../components/layout/BaseLayout';
import { StatisticsGrid } from '../../components/common/StatisticsGrid';
import { Table, Column } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Dropdown } from '../../components/common/Dropdown';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { useToast } from '../../context/ToastContext';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { trpc } from '../../utils/trpc';
import { Translation, TranslationFiltersType } from '../../types/translation';
import { useTablePreferences } from '../../hooks/useTablePreferences';
import { useUrlParams, urlParamValidators } from '../../hooks/useUrlParams';

const TranslationsIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();

  // URL state management
  const { getParam, updateParams } = useUrlParams();
  const [showFilters, setShowFilters] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; translation?: Translation }>({
    isOpen: false,
  });

  // URL parameters
  const page = urlParamValidators.page(getParam('page'));
  const limit = urlParamValidators.number(getParam('limit'), 10) || 10;
  const search = getParam('search') || '';
  const locale = getParam('locale') || undefined;
  const namespace = getParam('namespace') || undefined;
  const isActive = urlParamValidators.boolean(getParam('isActive'));

  // Build filters for API call
  const filters: TranslationFiltersType = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
      locale,
      namespace,
      isActive,
    }),
    [page, limit, search, locale, namespace, isActive]
  );

  // Table preferences
  const preferences = useTablePreferences('translations-table');

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    const initial = preferences.preferences.visibleColumns
      ? new Set(preferences.preferences.visibleColumns)
      : new Set(['key', 'locale', 'value', 'namespace', 'status', 'createdAt', 'actions']);
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
  const translationsQuery = trpc.adminTranslation.getTranslations.useQuery(filters);
  const localesQuery = trpc.adminTranslation.getLocales.useQuery();
  const namespacesQuery = trpc.adminTranslation.getNamespaces.useQuery();

  const deleteTranslationMutation = trpc.adminTranslation.deleteTranslation.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: t('translations.deleteSuccess'),
      });
      translationsQuery.refetch();
      setDeleteModal({ isOpen: false });
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('translations.deleteError'),
        description: error.message,
      });
    },
  });

  const toggleStatusMutation = trpc.adminTranslation.toggleTranslationStatus.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: t('translations.statusUpdateSuccess'),
      });
      translationsQuery.refetch();
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('translations.statusUpdateError'),
        description: error.message,
      });
    },
  });

  // Data processing
  const { data: apiResponse, isLoading, error } = translationsQuery;
  const translations = Array.isArray((apiResponse as any)?.data?.items) ? (apiResponse as any).data.items : [];
  const pagination = (apiResponse as any)?.data || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  };

  const locales = (localesQuery.data as any)?.data || [];
  const namespaces = (namespacesQuery.data as any)?.data || [];

  // Statistics
  const statisticsCards = useMemo(() => {
    const stats = {
      total: pagination.total || 0,
      active: Array.isArray(translations) ? translations.filter((t) => t.isActive).length : 0,
      inactive: Array.isArray(translations) ? translations.filter((t) => !t.isActive).length : 0,
      localesCount: locales.length || 0,
      namespacesCount: namespaces.length || 0,
    };

    return [
      {
        id: 'total-translations',
        title: t('translations.stats.total'),
        value: stats.total.toString(),
        icon: <FiFileText className="w-5 h-5" />,
        color: 'blue' as const,
      },
      {
        id: 'active-translations',
        title: t('translations.stats.active'),
        value: stats.active.toString(),
        icon: <FiCheck className="w-5 h-5" />,
        color: 'green' as const,
      },
      {
        id: 'locales-count',
        title: t('translations.stats.locales'),
        value: stats.localesCount.toString(),
        icon: <FiGlobe className="w-5 h-5" />,
        color: 'purple' as const,
      },
      {
        id: 'namespaces-count',
        title: t('translations.stats.namespaces'),
        value: stats.namespacesCount.toString(),
        icon: <FiSettings className="w-5 h-5" />,
        color: 'orange' as const,
      },
    ];
  }, [translations, pagination.total, locales.length, namespaces.length, t]);

  // Event handlers
  const handlePageChange = useCallback((page: number) => {
    updateParams({ page: page.toString() });
  }, [updateParams]);

  const handleRefresh = useCallback(() => {
    translationsQuery.refetch();
  }, [translationsQuery]);

  const handleDelete = useCallback((translation: Translation) => {
    setDeleteModal({ isOpen: true, translation });
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteModal.translation) {
      deleteTranslationMutation.mutate({ id: deleteModal.translation.id });
    }
  }, [deleteModal.translation, deleteTranslationMutation]);

  const handleToggleStatus = useCallback((translation: Translation) => {
    toggleStatusMutation.mutate({ id: translation.id });
  }, [toggleStatusMutation]);

  // Table columns
  const columns: Column<Translation>[] = useMemo(
    () => [
      {
        id: 'key',
        header: t('translations.table.key'),
        accessor: (translation) => (
          <div className="font-mono text-sm text-gray-900 dark:text-gray-100">
            {translation.key}
          </div>
        ),
        isSortable: true,
        hideable: true,
      },
      {
        id: 'locale',
        header: t('translations.table.locale'),
        accessor: (translation) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {translation.locale.toUpperCase()}
          </span>
        ),
        isSortable: true,
        hideable: true,
      },
      {
        id: 'value',
        header: t('translations.table.value'),
        accessor: (translation) => (
          <div className="max-w-md truncate text-gray-900 dark:text-gray-100">
            {translation.value}
          </div>
        ),
        isSortable: true,
        hideable: true,
      },
      {
        id: 'namespace',
        header: t('translations.table.namespace'),
        accessor: (translation) => (
          <span className="text-gray-600 dark:text-gray-400 text-sm">
            {translation.namespace || '-'}
          </span>
        ),
        isSortable: true,
        hideable: true,
      },
      {
        id: 'status',
        header: t('translations.table.status'),
        accessor: (translation) => (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            translation.isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {translation.isActive ? t('common.active') : t('common.inactive')}
          </span>
        ),
        isSortable: true,
        hideable: true,
      },
      {
        id: 'createdAt',
        header: t('translations.table.createdAt'),
        accessor: 'createdAt',
        type: 'datetime',
        isSortable: true,
        hideable: true,
      },
      {
        id: 'actions',
        header: t('common.actions'),
        accessor: (translation) => (
          <Dropdown
            button={
              <Button variant="ghost" size="sm" aria-label={`Actions for ${translation.key}`}>
                <FiMoreVertical />
              </Button>
            }
            items={[
              {
                label: t('common.edit'),
                icon: <FiEdit3 className="w-4 h-4" aria-hidden="true" />,
                onClick: () => navigate(`/translations/${translation.id}/edit`)
              },
              {
                label: translation.isActive ? t('common.deactivate') : t('common.activate'),
                icon: translation.isActive
                  ? <FiX className="w-4 h-4" aria-hidden="true" />
                  : <FiCheck className="w-4 h-4" aria-hidden="true" />,
                onClick: () => handleToggleStatus(translation)
              },
              {
                label: t('common.delete'),
                icon: <FiTrash2 className="w-4 h-4" aria-hidden="true" />,
                onClick: () => handleDelete(translation),
                className: 'text-red-500 hover:text-red-700'
              },
            ]}
          />
        ),
        isSortable: false,
        hideable: false,
        width: '80px',
      },
    ],
    [t, navigate, handleToggleStatus, handleDelete]
  );

  // Actions for BaseLayout
  const actions = useMemo(() => [
    {
      label: t('translations.create'),
      onClick: () => navigate('/translations/create'),
      primary: true,
      icon: <FiPlus />,
    },
    {
      label: t('common.refresh'),
      onClick: handleRefresh,
      icon: <FiSettings />,
    },
  ], [navigate, handleRefresh, t]);

  const breadcrumbs = useMemo(() => ([
    {
      label: 'Home',
      href: '/',
      icon: <FiHome className="w-4 h-4" />,
    },
    {
      label: t('translations.translations', 'Translations'),
      icon: <FiFileText className="w-4 h-4" />,
    },
  ]), [t]);

  if (error) {
    return (
      <BaseLayout
        title="Translation Management"
        description="Manage system translations"
        actions={actions}
        fullWidth={true}
        breadcrumbs={breadcrumbs}
      >
        <div className="text-red-600 dark:text-red-400">
          Error loading translations: {error.message}
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout
      title="Translation Management"
      description="Manage system translations"
      actions={actions}
      fullWidth={true}
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Statistics Cards */}
        <StatisticsGrid
          statistics={statisticsCards}
          isLoading={isLoading}
          skeletonCount={4}
        />

        {/* Translations Table */}
        <Table<Translation>
          tableId="translations-table"
          columns={columns}
          data={translations}
          searchValue={search}
          onSearchChange={(value) => updateParams({ search: value, page: '1' })}
          searchPlaceholder={t('translations.searchPlaceholder')}
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
          emptyMessage={t('translations.noTranslationsFound')}
          emptyAction={{
            label: t('translations.create'),
            onClick: () => navigate('/translations/create'),
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
          title={t('translations.confirmDelete')}
          message={
            deleteModal.translation
              ? t('translations.confirmDeleteDescription', { key: deleteModal.translation.key })
              : ''
          }
          confirmText={t('common.delete')}
          cancelText={t('common.cancel')}
          confirmVariant="danger"
          isLoading={deleteTranslationMutation.isPending}
        />
      </div>
    </BaseLayout>
  );
};

export default TranslationsIndexPage;
