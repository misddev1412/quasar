import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiMoreVertical, FiEdit2, FiTrash2, FiTag, FiRefreshCw, FiEye, FiXCircle } from 'react-icons/fi';
import { StatisticsGrid, type StatisticData } from '../../components/common/StatisticsGrid';
import { Button } from '../../components/common/Button';
import { Dropdown } from '../../components/common/Dropdown';
import { Table, Column, type SortDescriptor } from '../../components/common/Table';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { FormInput } from '../../components/common/FormInput';
import { TextareaInput } from '../../components/common/TextareaInput';
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
import slugify from 'slugify';

// Types
interface PostTag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  is_active: boolean;
  postCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Form schemas
const tagSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  color: z.string().optional().refine((val) => {
    if (!val || val === '') return true; // Allow empty values
    return /^#[0-9A-Fa-f]{6}$/.test(val); // Validate hex color if provided
  }, 'Color must be a valid hex color'),
  isActive: z.boolean().default(true),
});

type TagFormData = z.infer<typeof tagSchema>;

const DEFAULT_FORM_VALUES: TagFormData = {
  name: '',
  slug: '',
  description: '',
  color: '',
  isActive: true,
};

const DEFAULT_VISIBLE_COLUMNS = ['name', 'description', 'posts', 'status', 'actions'] as const;

const createDefaultVisibleColumnSet = () => {
  const set = new Set<string>();
  DEFAULT_VISIBLE_COLUMNS.forEach((col) => set.add(col));
  return set;
};

const PostTagsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();

  // Table preferences with persistence
  const { preferences, updatePageSize, updateVisibleColumns } = useTablePreferences(
    'post-tags-table',
    {
      pageSize: 10,
      visibleColumns: createDefaultVisibleColumnSet(),
    },
  );

  // State for modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<PostTag | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; tag?: PostTag }>({
    isOpen: false,
  });
  const [originalSlug, setOriginalSlug] = useState<string>('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Search and pagination
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(preferences.pageSize ?? 10);

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    const initial = preferences.visibleColumns ? new Set(preferences.visibleColumns) : createDefaultVisibleColumnSet();
    DEFAULT_VISIBLE_COLUMNS.forEach((col) => initial.add(col));
    return initial;
  });

  // Sort state
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor<PostTag>>({
    columnAccessor: 'name',
    direction: 'asc',
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

  // Fetch tags data
  const {
    data: tagsData,
    isLoading,
    error,
    refetch,
  } = trpc.adminPostTags.getTags.useQuery();

  // Debug logging
  console.log('tagsData:', tagsData);

  // Type-safe data access - try multiple possible paths
  let tagsResponse;
  let rawTags;

  // Try different possible response structures
  const data = tagsData as any;
  if (data?.result?.data?.data) {
    tagsResponse = data.result.data.data;
  } else if (data?.result?.data) {
    tagsResponse = data.result.data;
  } else if (data?.data) {
    tagsResponse = data.data;
  } else if (Array.isArray(data)) {
    tagsResponse = data;
  } else {
    tagsResponse = data;
  }

  console.log('Final tagsResponse:', tagsResponse);
  rawTags = tagsResponse as PostTag[] | undefined || [];
  console.log('Final rawTags:', rawTags, 'Length:', rawTags.length);
  const totalTags = rawTags.length;

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const isActiveValue = watch('isActive');

  // Mutations
  const createTagMutation = trpc.adminPostTags.createTag.useMutation({
    onSuccess: () => {
      addToast({ title: t('tags.createSuccess'), type: 'success' });
      setIsModalOpen(false);
      reset(DEFAULT_FORM_VALUES);
      refetch();
    },
    onError: (error) => {
      let errorMessage = t('tags.createError', 'Failed to create tag');

      // Handle specific error cases
      if (error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
        errorMessage = t('tags.duplicateError', 'A tag with this slug already exists. Please use a different slug.');
      } else if (error.message) {
        errorMessage = error.message;
      }

      addToast({ title: errorMessage, type: 'error' });
    },
  });

  const updateTagMutation = trpc.adminPostTags.updateTag.useMutation({
    onSuccess: () => {
      addToast({ title: t('tags.updateSuccess'), type: 'success' });
      setIsModalOpen(false);
      setSelectedTag(null);
      reset(DEFAULT_FORM_VALUES);
      refetch();
    },
    onError: (error) => {
      addToast({ title: error.message || t('tags.updateError'), type: 'error' });
    },
  });

  const deleteTagMutation = trpc.adminPostTags.deleteTag.useMutation({
    onSuccess: () => {
      addToast({ title: t('tags.deleteSuccess'), type: 'success' });
      setDeleteModal({ isOpen: false });
      refetch();
    },
    onError: (error) => {
      addToast({ title: error.message || t('tags.deleteError'), type: 'error' });
    },
  });

  const isSaving = createTagMutation.isPending || updateTagMutation.isPending;

  // Sorting and filtering logic
  const sortedTags = useMemo(() => {
    const sorted = [...rawTags];
    const multiplier = sortDescriptor.direction === 'asc' ? 1 : -1;

    sorted.sort((a, b) => {
      switch (sortDescriptor.columnAccessor) {
        case 'is_active':
          return ((a.is_active ? 1 : 0) - (b.is_active ? 1 : 0)) * multiplier;
        case 'postCount':
          return ((a.postCount || 0) - (b.postCount || 0)) * multiplier;
        case 'name':
        default:
          return a.name.localeCompare(b.name) * multiplier;
      }
    });

    return sorted;
  }, [rawTags, sortDescriptor]);

  const filteredTags = useMemo(() => {
    if (!searchValue.trim()) return sortedTags;
    const keyword = searchValue.trim().toLowerCase();
    return sortedTags.filter((tag) => {
      const description = tag.description?.toLowerCase() || '';
      return (
        tag.name.toLowerCase().includes(keyword) ||
        tag.slug.toLowerCase().includes(keyword) ||
        description.includes(keyword)
      );
    });
  }, [sortedTags, searchValue]);

  const totalPages = Math.max(1, Math.ceil(filteredTags.length / Math.max(limit, 1)) || 1);
  const currentPage = Math.min(page, totalPages);

  const paginatedTags = useMemo(() => {
    const start = (currentPage - 1) * limit;
    const result = filteredTags.slice(start, start + limit);
    console.log('filteredTags:', filteredTags, 'currentPage:', currentPage, 'limit:', limit, 'paginatedTags:', result);
    return result;
  }, [filteredTags, currentPage, limit]);

  // Statistics
  const statisticsCards: StatisticData[] = useMemo(() => {
    const total = rawTags.length;
    const active = rawTags.filter((tag) => tag.is_active).length;
    const inactive = total - active;
    const totalPosts = rawTags.reduce((sum, tag) => sum + (tag.postCount || 0), 0);

    return [
      {
        id: 'total-tags',
        title: t('tags.stats.total', 'Total tags'),
        value: total,
        icon: <FiTag className="w-5 h-5" />,
      },
      {
        id: 'active-tags',
        title: t('tags.stats.active', 'Active'),
        value: active,
        icon: <FiEye className="w-5 h-5" />,
      },
      {
        id: 'inactive-tags',
        title: t('tags.stats.inactive', 'Inactive'),
        value: inactive,
        icon: <FiXCircle className="w-5 h-5" />,
      },
      {
        id: 'total-posts',
        title: t('tags.stats.posts', 'Total posts'),
        value: totalPosts,
        icon: <FiTag className="w-5 h-5" />,
      },
    ];
  }, [rawTags, t]);

  // Generate unique slug from name (supports Vietnamese and other languages)
  const generateSlug = useCallback((name: string) => {
    // Configure slugify for Vietnamese and other languages
    const slug = slugify(name, {
      lower: true,
      strict: true, // Remove special characters except hyphens and underscores
      trim: true,
      locale: 'vi', // Vietnamese locale
      replacement: '-',
      remove: undefined, // Use default remove pattern
    });

    // Additional cleaning for any remaining special characters
    let cleanSlug = slug
      .replace(/[^a-z0-9-]/g, '') // Keep only lowercase letters, numbers, and hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

    // If slug is empty after cleaning, generate a fallback
    if (!cleanSlug) {
      cleanSlug = 'tag';
    }

    // Check if slug already exists and append number if needed
    const existingSlugs = rawTags.map(tag => tag.slug).filter(Boolean);
    let finalSlug = cleanSlug;
    let counter = 1;

    while (existingSlugs.includes(finalSlug)) {
      finalSlug = `${cleanSlug}-${counter}`;
      counter++;
    }

    return finalSlug;
  }, [rawTags]);

  // Test Vietnamese slug generation (for debugging)
  const testVietnameseSlug = useCallback(() => {
    const testCases = [
      'Thẻ Tiếng Việt',
      'Sản Phẩm Mới',
      'Tin Tức Công Nghệ',
      'Đồ Ăn Ngon',
      'Cửa Hàng Online',
    ];

    console.log('=== Vietnamese Slug Test ===');
    testCases.forEach(testCase => {
      const result = generateSlug(testCase);
      console.log(`"${testCase}" → "${result}"`);
    });
    console.log('=== End Test ===');
  }, [generateSlug]);

  // Handle form submissions
  const onSubmit = useCallback((data: TagFormData) => {
    // Check for duplicate slug when creating new tag
    if (!selectedTag) {
      const existingSlugs = rawTags.map(tag => tag.slug).filter(Boolean);
      if (existingSlugs.includes(data.slug)) {
        addToast({
          title: t('tags.duplicateError', 'A tag with this slug already exists. Please use a different slug.'),
          type: 'error'
        });
        return;
      }
    }

    const cleanedData = {
      ...data,
      description: data.description || undefined,
      color: data.color && data.color !== '' ? data.color : undefined,
    };

    if (selectedTag) {
      updateTagMutation.mutate({ id: selectedTag.id, data: cleanedData });
    } else {
      createTagMutation.mutate(cleanedData);
    }
  }, [createTagMutation, selectedTag, updateTagMutation, rawTags, addToast, t]);

  // Handle edit tag
  const handleEditTag = useCallback((tag: PostTag) => {
    setSelectedTag(tag);
    setOriginalSlug(tag.slug);
    setSlugManuallyEdited(false);
    reset({
      name: tag.name,
      slug: tag.slug,
      description: tag.description || '',
      color: tag.color || '',
      isActive: tag.is_active,
    });
    setIsModalOpen(true);
  }, [reset]);

  // Handle delete tag
  const handleDeleteTag = useCallback((tag: PostTag) => {
    setDeleteModal({ isOpen: true, tag });
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteModal.tag) return;
    deleteTagMutation.mutate({ id: deleteModal.tag.id });
  }, [deleteTagMutation, deleteModal.tag]);

  // Auto-generate slug from name
  const handleNameChange = useCallback((name: string) => {
    const currentSlug = watch('slug') || '';

    // Auto-generate slug if:
    // 1. Creating new tag (!selectedTag), OR
    // 2. Editing tag AND slug hasn't been manually edited AND slug is empty or matches original slug
    if (!selectedTag) {
      // Create mode: always auto-generate
      setValue('slug', generateSlug(name), { shouldDirty: true });
    } else if (!slugManuallyEdited && (!currentSlug || currentSlug === originalSlug)) {
      // Edit mode: auto-generate only if slug hasn't been manually edited
      const newSlug = generateSlug(name);
      setValue('slug', newSlug, { shouldDirty: true });
      setOriginalSlug(newSlug); // Update original slug to track changes
    }
  }, [selectedTag, slugManuallyEdited, originalSlug, generateSlug, setValue, watch]);

  // Handle manual slug editing
  const handleSlugChange = useCallback((value: string) => {
    // Mark as manually edited if user changes slug
    if (selectedTag && value !== originalSlug) {
      setSlugManuallyEdited(true);
    }
  }, [selectedTag, originalSlug]);

  // Handlers
  const handleCreateTag = useCallback(() => {
    setSelectedTag(null);
    reset(DEFAULT_FORM_VALUES);
    setIsModalOpen(true);
  }, [reset]);

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

  const actions = useMemo(
    () => [
      {
        label: t('tags.create', 'Create tag'),
        onClick: handleCreateTag,
        primary: true,
        icon: <FiPlus />,
      },
      {
        label: t('common.refresh', 'Refresh'),
        onClick: handleRefresh,
        icon: <FiRefreshCw />,
      },
    ],
    [handleCreateTag, handleRefresh, t],
  );

  // Table columns
  const columns: Column<PostTag>[] = useMemo(
    () => [
      {
        id: 'name',
        header: t('tags.table.name', 'Name'),
        accessor: (tag: PostTag) => (
          <div className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-3"
              style={{ backgroundColor: tag.color || '#6B7280' }}
            />
            <div className="flex flex-col">
              <span className="font-medium text-gray-900 dark:text-white">{tag.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">/{tag.slug}</span>
            </div>
          </div>
        ),
        isSortable: true,
        columnAccessor: 'name' as keyof PostTag,
        hideable: false,
      },
      {
        id: 'description',
        header: t('tags.table.description', 'Description'),
        accessor: (tag: PostTag) => (
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {tag.description || t('common.noDescription', 'No description')}
          </span>
        ),
      },
      {
        id: 'posts',
        header: t('tags.table.posts', 'Posts'),
        accessor: (tag: PostTag) => (
          <span className="text-sm text-gray-900 dark:text-white">{tag.postCount || 0}</span>
        ),
        isSortable: true,
        columnAccessor: 'postCount' as keyof PostTag,
      },
      {
        id: 'status',
        header: t('tags.table.status', 'Status'),
        accessor: (tag: PostTag) => (
          <span
            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
              tag.is_active
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
            }`}
          >
            {tag.is_active ? t('common.active') : t('common.inactive')}
          </span>
        ),
        isSortable: true,
        columnAccessor: 'is_active' as keyof PostTag,
      },
      {
        id: 'actions',
        header: t('common.actions', 'Actions'),
        accessor: (tag: PostTag) => (
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
                onClick: () => handleEditTag(tag),
              },
              {
                label: t('common.delete'),
                icon: <FiTrash2 />,
                onClick: () => handleDeleteTag(tag),
                className: 'text-red-600 hover:text-red-700',
              },
            ]}
          />
        ),
        hideable: false,
      },
    ],
    [t, handleEditTag, handleDeleteTag],
  );

  if (isLoading && !rawTags.length) {
    return (
      <BaseLayout
        title={t('tags.title', 'Post Tags')}
        description={t('tags.description', 'Manage post tags and categorization')}
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
        title={t('tags.title', 'Post Tags')}
        description={t('tags.description', 'Manage post tags and categorization')}
        actions={actions}
        fullWidth={true}
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
      title={t('tags.title', 'Post Tags')}
      description={t('tags.description', 'Manage post tags and categorization')}
      actions={actions}
      fullWidth={true}
    >
      <div className="space-y-6">
        <StatisticsGrid statistics={statisticsCards} isLoading={isLoading && !rawTags.length} />

        <Table<PostTag>
          tableId="post-tags-table"
          columns={columns}
          data={paginatedTags}
          isLoading={isLoading && !rawTags.length}
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          searchPlaceholder={t('tags.searchPlaceholder', 'Search tags...')}
          showFilter={false}
          visibleColumns={visibleColumns}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          showColumnVisibility={true}
          sortDescriptor={sortDescriptor}
          onSortChange={(descriptor) => setSortDescriptor(descriptor)}
          pagination={{
            currentPage,
            totalPages,
            totalItems: filteredTags.length,
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
          onRowClick={handleEditTag}
          emptyMessage={t('tags.emptyState', 'No tags found')}
          emptyAction={{
            label: t('tags.create', 'Create tag'),
            onClick: handleCreateTag,
            icon: <FiPlus />,
          }}
        />
      </div>

            <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsModalOpen(false);
            setSelectedTag(null);
            setOriginalSlug('');
            setSlugManuallyEdited(false);
            reset(DEFAULT_FORM_VALUES);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedTag ? t('tags.edit', 'Edit tag') : t('tags.create', 'Create tag')}
            </DialogTitle>
            <DialogDescription>
              {selectedTag
                ? t('tags.editDescription', 'Update tag details and settings')
                : t('tags.createDescription', 'Create a new tag to categorize your posts')}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormInput
              id="name"
              type="text"
              label={t('tags.name', 'Name')}
              placeholder={t('tags.namePlaceholder', 'Tag name')}
              {...register('name', {
                onChange: (event: React.ChangeEvent<HTMLInputElement>) => handleNameChange(event.target.value),
              })}
              error={errors.name?.message}
            />

            <FormInput
              id="slug"
              type="text"
              label={t('tags.slug', 'Slug')}
              placeholder={t('tags.slugPlaceholder', 'tag-slug')}
              {...register('slug', {
                onChange: (event: React.ChangeEvent<HTMLInputElement>) => handleSlugChange(event.target.value),
              })}
              error={errors.slug?.message}
            />

            <TextareaInput
              id="description"
              label={t('tags.description', 'Description')}
              placeholder={t('tags.descriptionPlaceholder', 'Optional description for this tag')}
              {...register('description')}
              error={errors.description?.message}
              rows={3}
            />

            <FormInput
              id="color"
              type="color"
              label={t('tags.color', 'Color')}
              placeholder={t('tags.colorPlaceholder', 'Choose a color (optional)')}
              {...register('color')}
              error={errors.color?.message}
            />

            <div className="flex items-center space-x-2">
              <Toggle
                checked={isActiveValue}
                onChange={() => setValue('isActive', !isActiveValue, { shouldDirty: true })}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('tags.isActive', 'Active')}
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedTag(null);
                  setOriginalSlug('');
                  setSlugManuallyEdited(false);
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
                {selectedTag ? t('common.update') : t('common.create')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        onConfirm={handleConfirmDelete}
        title={t('tags.confirmDeleteTitle', 'Delete tag')}
        message={
          deleteModal.tag
            ? t('tags.confirmDelete', 'Are you sure you want to delete the tag "{{name}}"? This action cannot be undone.')
                .replace('{{name}}', deleteModal.tag.name)
            : t('tags.confirmDeleteFallback', 'Are you sure you want to delete this tag?')
        }
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        confirmVariant="danger"
        isLoading={deleteTagMutation.isPending}
      />
    </BaseLayout>
  );
};

export default PostTagsPage;