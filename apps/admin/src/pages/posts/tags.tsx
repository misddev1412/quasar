import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiMoreVertical, FiEdit2, FiTrash2, FiTag } from 'react-icons/fi';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Dropdown } from '../../components/common/Dropdown';
import { Table, Column } from '../../components/common/Table';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { FormInput } from '../../components/common/FormInput';
import { TextareaInput } from '../../components/common/TextareaInput';
import { Toggle } from '../../components/common/Toggle';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/common/Dialog';
import BaseLayout from '../../components/layout/BaseLayout';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../context/ToastContext';
import { trpc } from '../../utils/trpc';
import { Loading } from '../../components/common/Loading';
import { Alert, AlertDescription, AlertTitle } from '../../components/common/Alert';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Types
interface PostTag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  sortOrder: number;
  isActive: boolean;
  postCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Form schemas
const tagSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  color: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

type TagFormData = z.infer<typeof tagSchema>;

const PostTagsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  
  // State for modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<PostTag | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Search and pagination
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Fetch tags data
  const {
    data: tagsData,
    isLoading,
    error,
    refetch,
  } = trpc.adminPostTags?.getTags?.useQuery() || { data: null };

  // Type-safe data access
  const tagsResponse = (tagsData as any)?.data;
  const tags = tagsResponse?.items as PostTag[] | undefined;
  const totalTags = tagsResponse?.total as number | undefined;

  // Form setup
  const createForm = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      color: '',
      sortOrder: 0,
      isActive: true,
    },
  });

  const editForm = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
  });

  // Mutations
  const createTagMutation = trpc.adminPostTags?.createTag?.useMutation({
    onSuccess: () => {
      addToast({ title: t('tags.createSuccess'), type: 'success' });
      setIsCreateModalOpen(false);
      createForm.reset();
      refetch();
    },
    onError: (error) => {
      addToast({ title: error.message || t('tags.createError'), type: 'error' });
    },
  });

  const updateTagMutation = trpc.adminPostTags?.updateTag?.useMutation({
    onSuccess: () => {
      addToast({ title: t('tags.updateSuccess'), type: 'success' });
      setIsEditModalOpen(false);
      setSelectedTag(null);
      refetch();
    },
    onError: (error) => {
      addToast({ title: error.message || t('tags.updateError'), type: 'error' });
    },
  });

  const deleteTagMutation = trpc.adminPostTags?.deleteTag?.useMutation({
    onSuccess: () => {
      addToast({ title: t('tags.deleteSuccess'), type: 'success' });
      setDeleteConfirmId(null);
      refetch();
    },
    onError: (error) => {
      addToast({ title: error.message || t('tags.deleteError'), type: 'error' });
      setDeleteConfirmId(null);
    },
  });

  // Generate slug from name
  const generateSlug = useCallback((name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }, []);

  // Handle form submissions
  const handleCreateSubmit = useCallback((data: TagFormData) => {
    createTagMutation.mutate(data);
  }, [createTagMutation]);

  const handleEditSubmit = useCallback((data: TagFormData) => {
    if (!selectedTag) return;
    updateTagMutation.mutate({ id: selectedTag.id, data });
  }, [selectedTag, updateTagMutation]);

  // Handle edit tag
  const handleEditTag = useCallback((tag: PostTag) => {
    setSelectedTag(tag);
    editForm.reset({
      name: tag.name,
      slug: tag.slug,
      description: tag.description || '',
      color: tag.color || '',
      sortOrder: tag.sortOrder,
      isActive: tag.isActive,
    });
    setIsEditModalOpen(true);
  }, [editForm]);

  // Handle delete tag
  const handleDeleteTag = useCallback((tagId: string) => {
    deleteTagMutation.mutate({ id: tagId });
  }, [deleteTagMutation]);

  // Auto-generate slug from name
  const handleNameChange = useCallback((form: typeof createForm | typeof editForm) => 
    (name: string) => {
      if (!form.watch('slug')) {
        form.setValue('slug', generateSlug(name));
      }
    }, [generateSlug]);

  // Table columns
  const columns: Column<PostTag>[] = useMemo(() => [
    {
      id: 'name',
      header: t('tags.table.name'),
      isSortable: true,
      accessor: (tag: PostTag) => (
        <div className="flex items-center">
          <div 
            className="w-3 h-3 rounded-full mr-3"
            style={{ backgroundColor: tag.color || '#6B7280' }}
          />
          <div>
            <span className="font-medium text-gray-900 dark:text-white">
              {tag.name}
            </span>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              /{tag.slug}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'description',
      header: t('tags.table.description'),
      accessor: (tag: PostTag) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {tag.description || t('common.noDescription')}
        </span>
      ),
    },
    {
      id: 'postCount',
      header: t('tags.table.posts'),
      isSortable: true,
      accessor: (tag: PostTag) => (
        <span className="text-sm text-gray-900 dark:text-white">
          {tag.postCount || 0}
        </span>
      ),
    },
    {
      id: 'sortOrder',
      header: t('tags.table.sortOrder'),
      isSortable: true,
      accessor: (tag: PostTag) => (
        <span className="text-sm text-gray-900 dark:text-white">
          {tag.sortOrder}
        </span>
      ),
    },
    {
      id: 'isActive',
      header: t('tags.table.status'),
      accessor: (tag: PostTag) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          tag.isActive
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {tag.isActive ? t('common.active') : t('common.inactive')}
        </span>
      ),
    },
    {
      id: 'actions',
      header: t('common.actions'),
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
              onClick: () => setDeleteConfirmId(tag.id),
              className: 'text-red-600 hover:text-red-700',
            },
          ]}
        />
      ),
    },
  ], [t, handleEditTag]);

  if (isLoading) {
    return (
      <BaseLayout title={t('tags.title', 'Post Tags')}>
        <Loading />
      </BaseLayout>
    );
  }

  if (error) {
    return (
      <BaseLayout title={t('tags.title', 'Post Tags')}>
        <Alert variant="destructive">
          <AlertTitle>{t('common.error')}</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title={t('tags.title', 'Post Tags')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('tags.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('tags.description')}
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            {t('tags.create')}
          </Button>
        </div>

        {/* Tags Table */}
        <Card>
          <Table
            data={tags || []}
            columns={columns}
            pagination={{
              currentPage: page,
              totalPages: Math.ceil((totalTags || 0) / limit),
              totalItems: totalTags || 0,
              itemsPerPage: limit,
              onPageChange: setPage,
              onItemsPerPageChange: setLimit,
            }}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            showSearch={true}
          />
        </Card>

        {/* Create Tag Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <FiTag className="w-5 h-5 mr-2" />
                {t('tags.create')}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
              <FormInput
                id="name"
                type="text"
                label={t('tags.name')}
                {...createForm.register('name')}
                error={createForm.formState.errors.name?.message}
                onChange={(e) => {
                  createForm.setValue('name', e.target.value);
                  handleNameChange(createForm)(e.target.value);
                }}
                required
              />
              
              <FormInput
                id="slug"
                type="text"
                label={t('tags.slug')}
                {...createForm.register('slug')}
                error={createForm.formState.errors.slug?.message}
                required
              />
              
              <TextareaInput
                id="description"
                label={t('tags.description')}
                {...createForm.register('description')}
                error={createForm.formState.errors.description?.message}
                rows={3}
              />

              <FormInput
                id="color"
                type="color"
                label={t('tags.color')}
                {...createForm.register('color')}
                error={createForm.formState.errors.color?.message}
              />

              <FormInput
                id="sortOrder"
                type="number"
                label={t('tags.sortOrder')}
                {...createForm.register('sortOrder', { valueAsNumber: true })}
                error={createForm.formState.errors.sortOrder?.message}
              />

              <div className="flex items-center space-x-2">
                <Toggle
                  checked={createForm.watch('isActive')}
                  onChange={() => createForm.setValue('isActive', !createForm.watch('isActive'))}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t('tags.isActive')}
                </span>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={createTagMutation.isPending}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={createTagMutation.isPending}
                  className="flex items-center"
                >
                  {createTagMutation.isPending ? (
                    <Loading size="small" />
                  ) : (
                    <FiPlus className="w-4 h-4 mr-2" />
                  )}
                  {t('tags.create')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Tag Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <FiEdit2 className="w-5 h-5 mr-2" />
                {t('tags.edit')}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormInput
                id="edit-name"
                type="text"
                label={t('tags.name')}
                {...editForm.register('name')}
                error={editForm.formState.errors.name?.message}
                onChange={(e) => {
                  editForm.setValue('name', e.target.value);
                  handleNameChange(editForm)(e.target.value);
                }}
                required
              />
              
              <FormInput
                id="edit-slug"
                type="text"
                label={t('tags.slug')}
                {...editForm.register('slug')}
                error={editForm.formState.errors.slug?.message}
                required
              />
              
              <TextareaInput
                id="edit-description"
                label={t('tags.description')}
                {...editForm.register('description')}
                error={editForm.formState.errors.description?.message}
                rows={3}
              />

              <FormInput
                id="edit-color"
                type="color"
                label={t('tags.color')}
                {...editForm.register('color')}
                error={editForm.formState.errors.color?.message}
              />

              <FormInput
                id="edit-sortOrder"
                type="number"
                label={t('tags.sortOrder')}
                {...editForm.register('sortOrder', { valueAsNumber: true })}
                error={editForm.formState.errors.sortOrder?.message}
              />

              <div className="flex items-center space-x-2">
                <Toggle
                  checked={editForm.watch('isActive')}
                  onChange={() => editForm.setValue('isActive', !editForm.watch('isActive'))}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t('tags.isActive')}
                </span>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedTag(null);
                  }}
                  disabled={updateTagMutation.isPending}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={updateTagMutation.isPending}
                  className="flex items-center"
                >
                  {updateTagMutation.isPending ? (
                    <Loading size="small" />
                  ) : (
                    <FiEdit2 className="w-4 h-4 mr-2" />
                  )}
                  {t('tags.update')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={!!deleteConfirmId}
          onClose={() => setDeleteConfirmId(null)}
          onConfirm={() => deleteConfirmId && handleDeleteTag(deleteConfirmId)}
          title={t('tags.deleteConfirmTitle')}
          message={t('tags.deleteConfirmMessage')}
          confirmText={t('common.delete')}
          cancelText={t('common.cancel')}
          isLoading={deleteTagMutation.isPending}
        />
      </div>
    </BaseLayout>
  );
};

export default PostTagsPage;