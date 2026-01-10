import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FolderPlus } from 'lucide-react';
import { FiHome, FiPackage, FiFolderPlus } from 'react-icons/fi';
import { CreatePageTemplate } from '../../../components/common/CreatePageTemplate';
import { CreateCategoryForm } from '../../../components/products/CreateCategoryForm';
import { useToast } from '../../../context/ToastContext';
import { trpc } from '../../../utils/trpc';
import { CreateCategoryFormData } from '../../../types/product';
import { useTranslationWithBackend } from '../../../hooks/useTranslationWithBackend';
import { useUrlTabs } from '../../../hooks/useUrlTabs';
import { cleanSlug, generateSlug } from '../../../utils/slugUtils';

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

  // Translation mutations
  const createTranslationMutation = trpc.adminProductCategories.createCategoryTranslation.useMutation();

  const handleSubmit = async (formData: CreateCategoryFormData & { additionalTranslations?: any[] }) => {
    try {
      const providedSlug = typeof formData.slug === 'string' ? formData.slug.trim() : '';
      const normalizedSlug = providedSlug
        ? cleanSlug(providedSlug)
        : generateSlug(formData.name || '');

      // Transform form data to match API expectations
      const categoryData = {
        name: formData.name,
        description: formData.description || undefined,
        slug: normalizedSlug || undefined,
        parentId: parentId || formData.parentId || undefined,
        isActive: formData.isActive ?? true,
        sortOrder: formData.sortOrder ?? 0,
        image: formData.image || undefined,
        heroBackgroundImage: formData.heroBackgroundImage || undefined,
        heroOverlayEnabled: formData.heroOverlayEnabled,
        heroOverlayColor: formData.heroOverlayColor || undefined,
        heroOverlayOpacity: formData.heroOverlayOpacity,
        showTitle: formData.showTitle,
        showProductCount: formData.showProductCount,
        showSubcategoryCount: formData.showSubcategoryCount,
        showCta: formData.showCta,
        ctaLabel: formData.ctaLabel || undefined,
        ctaUrl: formData.ctaUrl || undefined,
        seoTitle: formData.seoTitle || undefined,
        seoDescription: formData.seoDescription || undefined,
        metaKeywords: formData.metaKeywords || undefined,
      };

      const createdCategory = await createCategoryMutation.mutateAsync(categoryData);
      
      // Handle additional translations after category creation
      if (formData.additionalTranslations && formData.additionalTranslations.length > 0 && createdCategory) {
        const categoryId = (createdCategory as any)?.data?.id;
        if (categoryId) {
          try {
            for (const translation of formData.additionalTranslations) {
              if (translation && (translation.name || translation.description)) {
                const translationSlug = generateSlug(translation.name || '');
                await createTranslationMutation.mutateAsync({
                  categoryId,
                  locale: translation.locale,
                  name: translation.name,
                  description: translation.description,
                  slug: translationSlug || undefined,
                });
              }
            }
          } catch (translationError) {
            console.warn('Failed to create some translations:', translationError);
            // Don't fail the entire operation for translation errors
          }
        }
      }
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
      breadcrumbs={[
        {
          label: 'Home',
          href: '/'
        },
        {
          label: 'Products',
          href: '/products'
        },
        {
          label: t('common.categories', 'Categories'),
          href: '/products/categories'
        },
        {
          label: t('admin.create_new_category', 'Create New Category')
        }
      ]}
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
