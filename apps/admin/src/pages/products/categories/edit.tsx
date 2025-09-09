import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiTrash2 } from 'react-icons/fi';
import BaseLayout from '../../../components/layout/BaseLayout';
import { useTranslationWithBackend } from '../../../hooks/useTranslationWithBackend';
import { useToast } from '../../../context/ToastContext';
import { trpc } from '../../../utils/trpc';
import { Loading } from '../../../components/common/Loading';
import { Alert, AlertDescription, AlertTitle } from '../../../components/common/Alert';
import { EditCategoryForm, EditCategoryFormData } from '../../../components/products/EditCategoryForm';

const EditCategoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();

  const utils = trpc.useContext();

  // Data fetching
  const { data: categoryData, isLoading, error } = trpc.adminProductCategories.getById.useQuery(
    { id: id! },
    { enabled: !!id }
  );

  const category = (categoryData as any)?.data;

  // Mutations
  const updateMutation = trpc.adminProductCategories.update.useMutation({
    onSuccess: () => {
      addToast({
        title: t('categories.updateSuccess', 'Category updated successfully'),
        type: 'success',
      });
      utils.adminProductCategories.getTree.invalidate();
      navigate('/products/categories');
    },
    onError: (error) => {
      addToast({
        title: t('common.error', 'Error'),
        description: error.message,
        type: 'error',
      });
    },
  });

  const deleteMutation = trpc.adminProductCategories.delete.useMutation({
    onSuccess: () => {
      addToast({
        title: t('categories.deleteSuccess', 'Category deleted successfully'),
        type: 'success',
      });
      utils.adminProductCategories.getTree.invalidate();
      navigate('/products/categories');
    },
    onError: (error) => {
      addToast({
        title: t('common.error', 'Error'),
        description: error.message,
        type: 'error',
      });
    },
  });

  const handleDelete = () => {
    const confirmDelete = window.confirm(
      t('categories.deleteConfirm', 'Are you sure you want to delete this category? This action cannot be undone.')
    );
    if (confirmDelete && id) {
      deleteMutation.mutate({ id });
    }
  };

  const onSubmit = async (data: EditCategoryFormData) => {
    if (!id) return;
    
    updateMutation.mutate({
      id,
      ...data,
      image: data.image || undefined,
      description: data.description || undefined,
      parentId: data.parentId || undefined,
      slug: data.slug || undefined,
    });
  };

  const actions = [
    {
      label: t('common.back', 'Back'),
      onClick: () => navigate('/products/categories'),
      icon: <FiArrowLeft />,
    },
    {
      label: t('common.delete', 'Delete'),
      onClick: handleDelete,
      variant: 'danger' as const,
      icon: <FiTrash2 />,
    },
  ];

  if (isLoading) {
    return (
      <BaseLayout
        title={t('categories.editCategory', 'Edit Category')}
        description={t('categories.editDescription', 'Update category information')}
        actions={actions}
      >
        <div className="flex items-center justify-center h-64">
          <Loading />
        </div>
      </BaseLayout>
    );
  }

  if (error || !category) {
    return (
      <BaseLayout
        title={t('categories.editCategory', 'Edit Category')}
        description={t('categories.editDescription', 'Update category information')}
        actions={actions}
      >
        <Alert variant="destructive">
          <AlertTitle>{t('common.error', 'Error')}</AlertTitle>
          <AlertDescription>
            {error ? (error as any).message : t('categories.notFound', 'Category not found')}
          </AlertDescription>
        </Alert>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout
      title={t('categories.editCategory', 'Edit Category')}
      description={`${t('categories.editing', 'Editing')}: ${category.name}`}
      actions={actions}
    >
      <EditCategoryForm
        category={category}
        onSubmit={onSubmit}
        onCancel={() => navigate('/products/categories')}
        isSubmitting={updateMutation.isPending}
      />
    </BaseLayout>
  );
};

export default EditCategoryPage;