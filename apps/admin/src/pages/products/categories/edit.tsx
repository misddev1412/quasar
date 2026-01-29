import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiFolder, FiTrash2 } from 'react-icons/fi';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import { useToast } from '@admin/contexts/ToastContext';
import { trpc } from '@admin/utils/trpc';
import { StandardFormPage } from '@admin/components/common';
import { EditCategoryForm, EditCategoryFormData } from '@admin/components/products';
import { useUrlTabs } from '@admin/hooks/useUrlTabs';

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

  // Use URL tabs hook with tab keys for clean URLs
  const { activeTab, handleTabChange } = useUrlTabs({
    defaultTab: 0,
    tabParam: 'tab',
    tabKeys: ['general', 'translations', 'seo'] // Maps to EditCategoryForm tab IDs
  });

  const formId = 'product-category-edit-form';
  const resolvedError = error || (!isLoading && !category
    ? new Error(t('categories.notFound', 'Category not found'))
    : null);

  return (
    <StandardFormPage
      title={t('categories.editCategory', 'Edit Category')}
      description={category ? `${t('categories.editing', 'Editing')}: ${category.name}` : t('categories.editDescription', 'Update category information')}
      icon={<FiFolder className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
      entityName={t('common.category', 'Category')}
      entityNamePlural={t('common.categories', 'Categories')}
      backUrl="/products/categories"
      onBack={() => navigate('/products/categories')}
      onCancel={() => navigate('/products/categories')}
      isSubmitting={updateMutation.isPending}
      mode="update"
      isLoading={isLoading}
      error={resolvedError}
      entityData={category}
      formId={formId}
      customActions={[
        {
          label: t('common.delete', 'Delete'),
          onClick: handleDelete,
          icon: <FiTrash2 className="w-4 h-4" />,
          variant: 'outline',
        },
      ]}
      breadcrumbs={[
        {
          label: t('navigation.home', 'Home'),
          href: '/',
        },
        {
          label: t('products.title', 'Products'),
          href: '/products',
        },
        {
          label: t('common.categories', 'Categories'),
          href: '/products/categories',
        },
        {
          label: category ? category.name : t('categories.editCategory', 'Edit Category'),
        }
      ]}
    >
      {category && (
        <EditCategoryForm
          category={category}
          onSubmit={onSubmit}
          onCancel={() => navigate('/products/categories')}
          isSubmitting={updateMutation.isPending}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          showActions={false}
          formId={formId}
        />
      )}
    </StandardFormPage>
  );
};

export default EditCategoryPage;
