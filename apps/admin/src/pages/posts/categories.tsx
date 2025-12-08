import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FiPlus,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiFolder,
  FiFolderPlus,
  FiRefreshCw,
  FiLayers,
  FiEye,
  FiXCircle,
  FiHome,
  FiFileText,
} from 'react-icons/fi';
import { StatisticsGrid, type StatisticData } from '../../components/common/StatisticsGrid';
import { Button } from '../../components/common/Button';
import { Dropdown } from '../../components/common/Dropdown';
import { Table, type Column, type SortDescriptor } from '../../components/common/Table';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { FormInput } from '../../components/common/FormInput';
import { TextareaInput } from '../../components/common/TextareaInput';
import { Select } from '../../components/common/Select';
import { Toggle } from '../../components/common/Toggle';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/common/Dialog';
import BaseLayout from '../../components/layout/BaseLayout';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../context/ToastContext';
import { trpc } from '../../utils/trpc';
import { Loading } from '../../components/common/Loading';
import { Alert, AlertDescription, AlertTitle } from '../../components/common/Alert';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTablePreferences } from '../../hooks/useTablePreferences';

interface PostCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
  parent?: PostCategory;
  children?: PostCategory[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface CategoryWithLevel extends PostCategory {
  level: number;
  hierarchyPath: string;
}

const DEFAULT_VISIBLE_COLUMNS = ['name', 'parent', 'sortOrder', 'status', 'updatedAt', 'actions'] as const;

const createDefaultVisibleColumnSet = () => {
  const set = new Set<string>();
  DEFAULT_VISIBLE_COLUMNS.forEach((col) => set.add(col));
  return set;
};

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  parentId: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

type CategoryFormData = z.infer<typeof categorySchema>;

const DEFAULT_FORM_VALUES: CategoryFormData = {
  name: '',
  slug: '',
  description: '',
  parentId: '',
  sortOrder: 0,
  isActive: true,
};

const PostCategoriesPage: React.FC = () => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();

  const initialTablePreferences = useMemo(
    () => ({
      pageSize: 10,
      visibleColumns: createDefaultVisibleColumnSet(),
    }),
    [],
  );

  const { preferences, updatePageSize, updateVisibleColumns } = useTablePreferences(
    'post-categories-table',
    initialTablePreferences,
  );

  const [limit, setLimit] = useState(preferences.pageSize ?? 10);
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithLevel | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; category?: CategoryWithLevel }>({
    isOpen: false,
  });
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    const initial = preferences.visibleColumns ? new Set(preferences.visibleColumns) : createDefaultVisibleColumnSet();
    DEFAULT_VISIBLE_COLUMNS.forEach((col) => initial.add(col));
    return initial;
  });

  useEffect(() => {
    const base = preferences.visibleColumns ? new Set(preferences.visibleColumns) : createDefaultVisibleColumnSet();
    DEFAULT_VISIBLE_COLUMNS.forEach((col) => base.add(col));
    setVisibleColumns(base);
  }, [preferences.visibleColumns]);

  useEffect(() => {
    if (preferences.pageSize && preferences.pageSize !== limit) {
      setLimit(preferences.pageSize);
    }
  }, [preferences.pageSize, limit]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const parentIdValue = watch('parentId');
  const isActiveValue = watch('isActive');

  const {
    data: categoriesResponse,
    isLoading,
    error,
    refetch,
  } = trpc.adminPostCategories.getCategories.useQuery();

  const rawCategories = useMemo(() => {
    const payload = (categoriesResponse as any)?.data;
    if (!Array.isArray(payload)) return [] as PostCategory[];
    return payload as PostCategory[];
  }, [categoriesResponse]);

  const flattenCategories = useCallback(
    (nodes: PostCategory[], parentPath: string[] = [], level = 0): CategoryWithLevel[] => {
      return nodes.reduce<CategoryWithLevel[]>((acc, category) => {
        const hierarchyPath = [...parentPath, category.name].join(' / ');
        const formatted: CategoryWithLevel = {
          ...category,
          level,
          hierarchyPath,
        };
        acc.push(formatted);

        if (category.children && category.children.length > 0) {
          acc.push(...flattenCategories(category.children, [...parentPath, category.name], level + 1));
        }

        return acc;
      }, []);
    },
    [],
  );

  const flattenedCategories = useMemo(() => {
    if (!rawCategories.length) return [] as CategoryWithLevel[];
    return flattenCategories(rawCategories);
  }, [rawCategories, flattenCategories]);

  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor<CategoryWithLevel>>({
    columnAccessor: 'name',
    direction: 'asc',
  });

  const sortedCategories = useMemo(() => {
    const sorted = [...flattenedCategories];
    const multiplier = sortDescriptor.direction === 'asc' ? 1 : -1;

    sorted.sort((a, b) => {
      switch (sortDescriptor.columnAccessor) {
        case 'sortOrder':
          return (a.sortOrder - b.sortOrder) * multiplier;
        case 'isActive':
          return ((a.isActive ? 1 : 0) - (b.isActive ? 1 : 0)) * multiplier;
        case 'updatedAt': {
          const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return (dateA - dateB) * multiplier;
        }
        case 'name':
        default:
          return a.name.localeCompare(b.name) * multiplier;
      }
    });

    return sorted;
  }, [flattenedCategories, sortDescriptor]);

  const filteredCategories = useMemo(() => {
    if (!searchValue.trim()) return sortedCategories;
    const keyword = searchValue.trim().toLowerCase();
    return sortedCategories.filter((category) => {
      const description = category.description?.toLowerCase() || '';
      return (
        category.name.toLowerCase().includes(keyword) ||
        category.slug.toLowerCase().includes(keyword) ||
        description.includes(keyword) ||
        category.hierarchyPath.toLowerCase().includes(keyword)
      );
    });
  }, [sortedCategories, searchValue]);

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / Math.max(limit, 1)) || 1);
  const currentPage = Math.min(page, totalPages);

  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * limit;
    return filteredCategories.slice(start, start + limit);
  }, [filteredCategories, currentPage, limit]);

  const statisticsCards: StatisticData[] = useMemo(() => {
    const total = flattenedCategories.length;
    const active = flattenedCategories.filter((category) => category.isActive).length;
    const inactive = total - active;
    const rootCategories = flattenedCategories.filter((category) => category.level === 0).length;

    return [
      {
        id: 'total-categories',
        title: t('categories.stats.total', 'Total categories'),
        value: total,
        icon: <FiLayers className="w-5 h-5" />,
      },
      {
        id: 'active-categories',
        title: t('categories.stats.active', 'Active'),
        value: active,
        icon: <FiEye className="w-5 h-5" />,
      },
      {
        id: 'inactive-categories',
        title: t('categories.stats.inactive', 'Inactive'),
        value: inactive,
        icon: <FiXCircle className="w-5 h-5" />,
      },
      {
        id: 'root-categories',
        title: t('categories.stats.root', 'Root categories'),
        value: rootCategories,
        icon: <FiFolder className="w-5 h-5" />,
      },
    ];
  }, [flattenedCategories, t]);

  const parentCategoryOptions = useMemo(() => {
    const options = flattenedCategories
      .filter((category) => !editingCategory || category.id !== editingCategory.id)
      .map((category) => ({
        value: category.id,
        label: `${' '.repeat(category.level * 2)}${category.name}`,
      }));

    return [
      { value: '', label: t('categories.noParent', 'No parent') },
      ...options,
    ];
  }, [flattenedCategories, editingCategory, t]);

  const createCategoryMutation = trpc.adminPostCategories.createCategory.useMutation({
    onSuccess: () => {
      addToast({ title: t('categories.createSuccess'), type: 'success' });
      setIsModalOpen(false);
      reset(DEFAULT_FORM_VALUES);
      refetch();
    },
    onError: (mutationError) => {
      addToast({ title: mutationError.message || t('categories.createError'), type: 'error' });
    },
  });

  const updateCategoryMutation = trpc.adminPostCategories.updateCategory.useMutation({
    onSuccess: () => {
      addToast({ title: t('categories.updateSuccess'), type: 'success' });
      setIsModalOpen(false);
      setEditingCategory(null);
      reset(DEFAULT_FORM_VALUES);
      refetch();
    },
    onError: (mutationError) => {
      addToast({ title: mutationError.message || t('categories.updateError'), type: 'error' });
    },
  });

  const deleteCategoryMutation = trpc.adminPostCategories.deleteCategory.useMutation({
    onSuccess: () => {
      addToast({ title: t('categories.deleteSuccess'), type: 'success' });
      setDeleteModal({ isOpen: false });
      refetch();
    },
    onError: (mutationError) => {
      addToast({ title: mutationError.message || t('categories.deleteError'), type: 'error' });
    },
  });

  const isSaving = createCategoryMutation.isPending || updateCategoryMutation.isPending;

  const generateSlug = useCallback((name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }, []);

  const handleNameChange = useCallback(
    (name: string) => {
      const currentSlug = watch('slug') || '';
      if (!editingCategory || !currentSlug) {
        setValue('slug', generateSlug(name), { shouldDirty: true });
      }
    },
    [editingCategory, generateSlug, setValue, watch],
  );

  const handleCreateCategory = useCallback(() => {
    setEditingCategory(null);
    reset(DEFAULT_FORM_VALUES);
    setIsModalOpen(true);
  }, [reset]);

  const handleCreateChildCategory = useCallback(
    (category: CategoryWithLevel) => {
      setEditingCategory(null);
      reset({
        ...DEFAULT_FORM_VALUES,
        parentId: category.id,
      });
      setIsModalOpen(true);
    },
    [reset],
  );

  const handleEditCategory = useCallback(
    (category: CategoryWithLevel) => {
      setEditingCategory(category);
      reset({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        parentId: category.parentId || '',
        sortOrder: category.sortOrder,
        isActive: category.isActive,
      });
      setIsModalOpen(true);
    },
    [reset],
  );

  const handleDeleteCategory = useCallback((category: CategoryWithLevel) => {
    setDeleteModal({ isOpen: true, category });
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteModal.category) return;
    deleteCategoryMutation.mutate({ id: deleteModal.category.id });
  }, [deleteCategoryMutation, deleteModal.category]);

  const onSubmit = useCallback(
    (data: CategoryFormData) => {
      const cleanedData = {
        ...data,
        description: data.description || undefined,
        parentId: data.parentId || undefined,
      };

      if (editingCategory) {
        updateCategoryMutation.mutate({ id: editingCategory.id, data: cleanedData });
      } else {
        createCategoryMutation.mutate(cleanedData);
      }
    },
    [createCategoryMutation, editingCategory, updateCategoryMutation],
  );

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    setPage(1);
  }, []);

  const handleColumnVisibilityChange = useCallback(
    (columnId: string, visible: boolean) => {
      if (columnId === 'name' || columnId === 'actions') {
        return;
      }

      setVisibleColumns((prev) => {
        const next = new Set(prev);
        if (visible) {
          next.add(columnId);
        } else {
          next.delete(columnId);
        }
        updateVisibleColumns(next);
        return next;
      });
    },
    [updateVisibleColumns],
  );

  const columns: Column<CategoryWithLevel>[] = useMemo(
    () => [
      {
        id: 'name',
        header: t('categories.table.name', 'Category'),
        accessor: (category: CategoryWithLevel) => (
          <div className="flex items-center">
            <div
              className="flex items-center"
              style={{ marginLeft: category.level * 16 }}
            >
              <FiFolder className="w-4 h-4 text-gray-400 mr-2" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900 dark:text-white">{category.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">/{category.slug}</span>
            </div>
          </div>
        ),
        isSortable: true,
        hideable: false,
      },
      {
        id: 'parent',
        header: t('categories.table.parent', 'Parent'),
        accessor: (category: CategoryWithLevel) => (
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {category.parent?.name || t('categories.noParent', 'No parent')}
          </span>
        ),
      },
      {
        id: 'sortOrder',
        header: t('categories.table.sortOrder', 'Sort order'),
        accessor: (category: CategoryWithLevel) => (
          <span className="text-sm text-gray-900 dark:text-white">{category.sortOrder}</span>
        ),
        isSortable: true,
      },
      {
        id: 'status',
        header: t('categories.table.status', 'Status'),
        accessor: (category: CategoryWithLevel) => (
          <span
            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
              category.isActive
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
            }`}
          >
            {category.isActive ? t('common.active') : t('common.inactive')}
          </span>
        ),
        isSortable: true,
        columnAccessor: 'isActive' as keyof CategoryWithLevel,
      },
      {
        id: 'updatedAt',
        header: t('categories.table.updatedAt', 'Updated at'),
        accessor: (category: CategoryWithLevel) => {
          if (!category.updatedAt) {
            return <span className="text-sm text-gray-500 dark:text-gray-400">—</span>;
          }

          const date = new Date(category.updatedAt);
          if (Number.isNaN(date.getTime())) {
            return <span className="text-sm text-gray-500 dark:text-gray-400">—</span>;
          }

          return (
            <div className="flex flex-col text-sm text-gray-700 dark:text-gray-300">
              <span>{date.toLocaleDateString()}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{date.toLocaleTimeString()}</span>
            </div>
          );
        },
        isSortable: true,
      },
      {
        id: 'actions',
        header: t('common.actions', 'Actions'),
        accessor: (category: CategoryWithLevel) => (
          <Dropdown
            button={
              <Button variant="ghost" size="sm">
                <FiMoreVertical className="w-4 h-4" />
              </Button>
            }
            items={[
              {
                label: t('common.edit'),
                icon: <FiEdit2 />,
                onClick: () => handleEditCategory(category),
              },
              {
                label: t('categories.addChild', 'Add child category'),
                icon: <FiFolderPlus />,
                onClick: () => handleCreateChildCategory(category),
              },
              {
                label: t('common.delete'),
                icon: <FiTrash2 />,
                onClick: () => handleDeleteCategory(category),
                className: 'text-red-600 hover:text-red-700',
              },
            ]}
          />
        ),
        hideable: false,
      },
    ],
    [
      t,
      handleCreateChildCategory,
      handleDeleteCategory,
      handleEditCategory,
    ],
  );

  const actions = useMemo(
    () => [
      {
        label: t('categories.create', 'Create category'),
        onClick: handleCreateCategory,
        primary: true,
        icon: <FiPlus />,
      },
      {
        label: t('common.refresh', 'Refresh'),
        onClick: handleRefresh,
        icon: <FiRefreshCw />,
      },
    ],
    [handleCreateCategory, handleRefresh, t],
  );

  const breadcrumbs = useMemo(() => ([
    {
      label: 'Home',
      href: '/',
      icon: <FiHome className="w-4 h-4" />,
    },
    {
      label: 'Posts',
      href: '/posts',
      icon: <FiFileText className="w-4 h-4" />,
    },
    {
      label: t('categories.title', 'Post Categories'),
      icon: <FiLayers className="w-4 h-4" />,
    },
  ]), [t]);

  if (isLoading && !rawCategories.length) {
    return (
      <BaseLayout
        title={t('categories.title', 'Post Categories')}
        description={t('categories.description', 'Organize post categories and hierarchy')}
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
        title={t('categories.title', 'Post Categories')}
        description={t('categories.description', 'Organize post categories and hierarchy')}
        actions={actions}
        fullWidth={true}
        breadcrumbs={breadcrumbs}
      >
        <Alert variant="destructive">
          <AlertTitle>{t('common.error')}</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout
      title={t('categories.title', 'Post Categories')}
      description={t('categories.description', 'Organize post categories and hierarchy')}
      actions={actions}
      fullWidth={true}
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        <StatisticsGrid statistics={statisticsCards} isLoading={isLoading && !rawCategories.length} />

        <Table<CategoryWithLevel>
          tableId="post-categories-table"
          columns={columns}
          data={paginatedCategories}
          isLoading={isLoading && !rawCategories.length}
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          searchPlaceholder={t('categories.searchPlaceholder', 'Search categories...')}
          showFilter={false}
          visibleColumns={visibleColumns}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          showColumnVisibility={true}
          sortDescriptor={sortDescriptor}
          onSortChange={(descriptor) => setSortDescriptor(descriptor)}
          pagination={{
            currentPage,
            totalPages,
            totalItems: filteredCategories.length,
            itemsPerPage: limit,
            onPageChange: (newPage) => setPage(newPage),
            onItemsPerPageChange: (newSize) => {
              setLimit(newSize);
              updatePageSize(newSize);
              setPage(1);
            },
          }}
          enableRowHover={true}
          density="normal"
          onRowClick={handleEditCategory}
          emptyMessage={t('categories.emptyState', 'No categories found')}
          emptyAction={{
            label: t('categories.create', 'Create category'),
            onClick: handleCreateCategory,
            icon: <FiPlus />,
          }}
        />
      </div>

      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsModalOpen(false);
            setEditingCategory(null);
            reset(DEFAULT_FORM_VALUES);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? t('categories.edit', 'Edit category') : t('categories.create', 'Create category')}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? t('categories.editDescription', 'Update category details and hierarchy settings')
                : t('categories.createDescription', 'Create a new category to organize your posts')}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormInput
              id="name"
              type="text"
              label={t('categories.name', 'Name')}
              placeholder={t('categories.namePlaceholder', 'Category name')}
              {...register('name', {
                onChange: (event: React.ChangeEvent<HTMLInputElement>) => handleNameChange(event.target.value),
              })}
              error={errors.name?.message}
            />

            <FormInput
              id="slug"
              type="text"
              label={t('categories.slug', 'Slug')}
              placeholder={t('categories.slugPlaceholder', 'category-slug')}
              {...register('slug')}
              error={errors.slug?.message}
            />

            <TextareaInput
              id="description"
              label={t('categories.description', 'Description')}
              placeholder={t('categories.descriptionPlaceholder', 'Optional description for this category')}
              {...register('description')}
              error={errors.description?.message}
              rows={3}
            />

            <Select
              id="parentId"
              label={t('categories.parent', 'Parent category')}
              value={parentIdValue || ''}
              onChange={(value) => setValue('parentId', value || '', { shouldDirty: true })}
              error={errors.parentId?.message}
              options={parentCategoryOptions}
              placeholder=""
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                id="sortOrder"
                type="number"
                label={t('categories.sortOrder', 'Sort order')}
                placeholder="0"
                {...register('sortOrder', { valueAsNumber: true })}
                error={errors.sortOrder?.message}
              />
              <div className="flex items-end">
                <div className="flex items-center space-x-2">
                  <Toggle
                    checked={isActiveValue}
                    onChange={() => setValue('isActive', !isActiveValue, { shouldDirty: true })}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t('categories.isActive', 'Active')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingCategory(null);
                  reset(DEFAULT_FORM_VALUES);
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                {isSaving ? <Loading size="small" /> : null}
                {editingCategory ? t('common.update') : t('common.create')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        onConfirm={handleConfirmDelete}
        title={t('categories.confirmDeleteTitle', 'Delete category')}
        message={
          deleteModal.category
            ? t('categories.confirmDelete', 'Are you sure you want to delete the category "{{name}}"? This action cannot be undone.')
                .replace('{{name}}', deleteModal.category.name)
            : t('categories.confirmDeleteFallback', 'Are you sure you want to delete this category?')
        }
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        confirmVariant="danger"
        isLoading={deleteCategoryMutation.isPending}
      />
    </BaseLayout>
  );
};

export default PostCategoriesPage;
