import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiTrash2, FiHome, FiPackage, FiEdit3, FiFolder } from 'react-icons/fi';
import { BaseLayout } from '@admin/components/layout';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import { useToast } from '@admin/contexts/ToastContext';
import { trpc } from '@admin/utils/trpc';
import { Loading, Alert, AlertDescription, AlertTitle } from '@admin/components/common';
import { EditCategoryForm, EditCategoryFormData } from '@admin/components/products';

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
    
    const payload = {
      id,
      ...data,
      image: data.image || undefined,
      heroBackgroundImage: data.heroBackgroundImage || undefined,
      heroOverlayEnabled: data.heroOverlayEnabled,
      heroOverlayColor: data.heroOverlayColor || undefined,
      heroOverlayOpacity: data.heroOverlayOpacity,
      description: data.description || undefined,
      parentId: data.parentId || undefined,
      slug: data.slug || undefined,
      showTitle: data.showTitle,
      showProductCount: data.showProductCount,
      showSubcategoryCount: data.showSubcategoryCount,
      showCta: data.showCta,
      ctaLabel: data.ctaLabel || undefined,
      ctaUrl: data.ctaUrl || undefined,
    } as Parameters<typeof updateMutation.mutate>[0];

    updateMutation.mutate(payload);
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

  const breadcrumbs = [
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
      label: t('common.categories', 'Categories'),
      href: '/products/categories',
      icon: <FiFolder className="w-4 h-4" />
    },
    {
      label: t('categories.editCategory', 'Edit Category'),
      icon: <FiEdit3 className="w-4 h-4" />
    }
  ];

  if (isLoading) {
    return (
      <BaseLayout
        title={t('categories.editCategory', 'Edit Category')}
        description={t('categories.editDescription', 'Update category information')}
        actions={actions}
        breadcrumbs={breadcrumbs}
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
        breadcrumbs={breadcrumbs}
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
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        <EditCategoryForm
          category={category}
          onSubmit={onSubmit}
          onCancel={() => navigate('/products/categories')}
          isSubmitting={updateMutation.isPending}
        />
      </div>
    </BaseLayout>
  );
};

export default EditCategoryPage;
