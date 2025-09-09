import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FolderPlus } from 'lucide-react';
import { CreatePageTemplate } from '../../../components/common/CreatePageTemplate';
import { CreateCategoryForm } from '../../../components/products/CreateCategoryForm';
import { useToast } from '../../../context/ToastContext';
import { trpc } from '../../../utils/trpc';
import { CreateCategoryFormData } from '../../../types/product';
import { useTranslationWithBackend } from '../../../hooks/useTranslationWithBackend';
import { useUrlTabs } from '../../../hooks/useUrlTabs';

const CategoryCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();
  const [searchParams] = useSearchParams();
  const parentId = searchParams.get('parentId');

  // Use URL tabs hook with tab keys for clean URLs
  const { activeTab, handleTabChange } = useUrlTabs({
    defaultTab: 0,
    tabParam: 'tab',
    tabKeys: ['general', 'translations', 'seo'] // Maps to CreateCategoryForm tab IDs
  });

  // tRPC mutation for creating category
  const createCategoryMutation = trpc.adminProductCategories.create.useMutation({
    onSuccess: (data) => {
      addToast({
        type: 'success',
        title: t('messages.category_created_successfully'),
        description: t('messages.category_created_successfully_description'),
      });
      navigate('/products/categories');
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('messages.failed_to_create_category'),
        description: error.message || t('messages.create_category_error_description'),
      });
    },
  });

  const handleSubmit = async (formData: CreateCategoryFormData) => {
    try {
      // Transform form data to match API expectations
      const categoryData = {
        name: formData.name,
        description: formData.description || undefined,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        parentId: parentId || formData.parentId || undefined,
        isActive: formData.isActive ?? true,
        sortOrder: formData.sortOrder ?? 0,
        image: formData.image || undefined,
        seoTitle: formData.seoTitle || undefined,
        seoDescription: formData.seoDescription || undefined,
        metaKeywords: formData.metaKeywords || undefined,
      };

      await createCategoryMutation.mutateAsync(categoryData);
    } catch (error) {
      // Error handling is done in the mutation's onError callback
      console.error('Category creation error:', error);
    }
  };

  const handleCancel = () => {
    navigate('/products/categories');
  };

  return (
    <CreatePageTemplate
      title={t('admin.create_new_category', 'Create New Category')}
      description={t('admin.create_category_description', 'Add a new category to organize your products')}
      icon={<FolderPlus className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
      entityName={t('common.category', 'Category')}
      entityNamePlural={t('common.categories', 'Categories')}
      backUrl="/products/categories"
      onBack={handleCancel}
      isSubmitting={createCategoryMutation.isPending}
      maxWidth="full"
    >
      <CreateCategoryForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createCategoryMutation.isPending}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        defaultParentId={parentId}
      />
    </CreatePageTemplate>
  );
};

export default CategoryCreatePage;