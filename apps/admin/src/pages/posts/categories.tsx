import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiMoreVertical, FiEdit2, FiTrash2, FiFolder, FiFolderPlus } from 'react-icons/fi';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Dropdown } from '../../components/common/Dropdown';
import { Table, Column } from '../../components/common/Table';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { FormInput } from '../../components/common/FormInput';
import { TextareaInput } from '../../components/common/TextareaInput';
import { Select } from '../../components/common/Select';
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
  createdAt: Date;
  updatedAt: Date;
}

// Form schemas
const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  parentId: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

type CategoryFormData = z.infer<typeof categorySchema>;

const PostCategoriesPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<PostCategory | null>(null);

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      sortOrder: 0,
      isActive: true,
    },
  });

  // Fetch categories
  const {
    data: categoriesData,
    isLoading,
    error,
    refetch,
  } = trpc.adminPostCategories.getCategories.useQuery();

  // Type-safe data access
  const categories = (categoriesData as any)?.data as PostCategory[] | undefined;

  // Create category mutation
  const createCategoryMutation = trpc.adminPostCategories.createCategory.useMutation({
    onSuccess: () => {
      addToast({ title: t('categories.createSuccess'), type: 'success' });
      setIsModalOpen(false);
      reset();
      refetch();
    },
    onError: (error) => {
      addToast({ title: error.message || t('categories.createError'), type: 'error' });
    },
  });

  // Update category mutation
  const updateCategoryMutation = trpc.adminPostCategories.updateCategory.useMutation({
    onSuccess: () => {
      addToast({ title: t('categories.updateSuccess'), type: 'success' });
      setIsModalOpen(false);
      setEditingCategory(null);
      reset();
      refetch();
    },
    onError: (error) => {
      addToast({ title: error.message || t('categories.updateError'), type: 'error' });
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = trpc.adminPostCategories.deleteCategory.useMutation({
    onSuccess: () => {
      addToast({ title: t('categories.deleteSuccess'), type: 'success' });
      refetch();
    },
    onError: (error) => {
      addToast({ title: error.message || t('categories.deleteError'), type: 'error' });
    },
  });

  // Handle create category
  const handleCreateCategory = useCallback(() => {
    setEditingCategory(null);
    reset({
      sortOrder: 0,
      isActive: true,
    });
    setIsModalOpen(true);
  }, [reset]);

  // Handle edit category
  const handleEditCategory = useCallback((category: PostCategory) => {
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
  }, [reset]);

  // Handle delete category
  const handleDeleteCategory = useCallback(async (categoryId: string) => {
    if (window.confirm(t('categories.confirmDelete'))) {
      deleteCategoryMutation.mutate({ id: categoryId });
    }
  }, [deleteCategoryMutation, t]);

  // Handle form submission
  const onSubmit = useCallback(async (data: CategoryFormData) => {
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
  }, [editingCategory, createCategoryMutation, updateCategoryMutation]);

  // Generate slug from name
  const generateSlug = useCallback((name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }, []);

  // Handle name change to auto-generate slug
  const handleNameChange = useCallback((name: string) => {
    if (!editingCategory) {
      setValue('slug', generateSlug(name));
    }
  }, [editingCategory, generateSlug, setValue]);

  // Prepare categories for parent selection
  const parentCategoryOptions = useMemo(() => {
    if (!categories) return [];
    
    const buildOptions = (categories: PostCategory[], level = 0): Array<{ value: string; label: string }> => {
      return categories.reduce((acc, category) => {
        if (editingCategory && category.id === editingCategory.id) {
          return acc; // Don't allow selecting self as parent
        }
        
        const prefix = '  '.repeat(level);
        acc.push({
          value: category.id,
          label: `${prefix}${category.name}`,
        });
        
        if (category.children && category.children.length > 0) {
          acc.push(...buildOptions(category.children, level + 1));
        }
        
        return acc;
      }, [] as Array<{ value: string; label: string }>);
    };

    return [
      { value: '', label: t('categories.noParent') },
      ...buildOptions(categories.filter((cat: PostCategory) => !cat.parentId)),
    ];
  }, [categoriesData, editingCategory, t]);

  // Table columns
  const columns: Column<PostCategory>[] = useMemo(() => [
    {
      id: 'name',
      header: t('categories.table.name'),
      isSortable: true,
      accessor: (category: PostCategory) => (
        <div className="flex items-center">
          <FiFolder className="w-4 h-4 mr-2 text-gray-400" />
          <div>
            <span className="font-medium text-gray-900 dark:text-white">
              {category.name}
            </span>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              /{category.slug}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'parent',
      header: t('categories.table.parent'),
      accessor: (category: PostCategory) => (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {category.parent?.name || t('categories.noParent')}
        </span>
      ),
    },
    {
      id: 'sortOrder',
      header: t('categories.table.sortOrder'),
      isSortable: true,
      accessor: (category: PostCategory) => (
        <span className="text-sm text-gray-900 dark:text-white">
          {category.sortOrder}
        </span>
      ),
    },
    {
      id: 'status',
      header: t('categories.table.status'),
      accessor: (category: PostCategory) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          category.isActive
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        }`}>
          {category.isActive ? t('common.active') : t('common.inactive')}
        </span>
      ),
    },
    {
      id: 'actions',
      header: t('common.actions'),
      accessor: (category: PostCategory) => (
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
              label: t('common.delete'),
              icon: <FiTrash2 />,
              onClick: () => handleDeleteCategory(category.id),
              className: 'text-red-600 hover:text-red-700',
            },
          ]}
        />
      ),
    },
  ], [t, handleEditCategory, handleDeleteCategory]);

  if (isLoading) {
    return (
      <BaseLayout title={t('categories.title', 'Post Categories')}>
        <Loading />
      </BaseLayout>
    );
  }

  if (error) {
    return (
      <BaseLayout title={t('categories.title', 'Post Categories')}>
        <Alert variant="destructive">
          <AlertTitle>{t('common.error')}</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title={t('categories.title', 'Post Categories')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('categories.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('categories.description')}
            </p>
          </div>
          <Button
            onClick={handleCreateCategory}
            className="flex items-center"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            {t('categories.create')}
          </Button>
        </div>

        {/* Categories Table */}
        <Card>
          <Table
            data={categories || []}
            columns={columns}
          />
        </Card>

        {/* Create/Edit Modal */}
        <Dialog open={isModalOpen} onOpenChange={(open) => {
          if (!open) {
            setIsModalOpen(false);
            setEditingCategory(null);
            reset();
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? t('categories.edit') : t('categories.create')}
              </DialogTitle>
            </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <FormInput
                id="name"
                type="text"
                label={t('categories.name')}
                {...register('name')}
                error={errors.name?.message}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>

            <div>
              <FormInput
                id="slug"
                type="text"
                label={t('categories.slug')}
                {...register('slug')}
                error={errors.slug?.message}
              />
            </div>

            <div>
              <TextareaInput
                id="description"
                label={t('categories.description')}
                {...register('description')}
                error={errors.description?.message}
                rows={3}
              />
            </div>

            <div>
              <Select
                id="parentId"
                label={t('categories.parent')}
                value={watch('parentId') || ''}
                onChange={(value) => setValue('parentId', value || undefined)}
                error={errors.parentId?.message}
                options={parentCategoryOptions}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormInput
                  id="sortOrder"
                  type="number"
                  label={t('categories.sortOrder')}
                  {...register('sortOrder', { valueAsNumber: true })}
                  error={errors.sortOrder?.message}
                />
              </div>
              <div className="flex items-end">
                <div className="flex items-center space-x-2">
                  <Toggle
                    checked={watch('isActive')}
                    onChange={() => setValue('isActive', !watch('isActive'))}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t('categories.isActive')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingCategory(null);
                  reset();
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
              >
                {createCategoryMutation.isPending || updateCategoryMutation.isPending ? (
                  <Loading size="small" />
                ) : null}
                {editingCategory ? t('common.update') : t('common.create')}
              </Button>
            </div>
          </form>
          </DialogContent>
        </Dialog>
      </div>
    </BaseLayout>
  );
};

export default PostCategoriesPage;
