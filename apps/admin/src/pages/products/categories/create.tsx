import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiFolder } from 'react-icons/fi';
import { StandardFormPage } from '@admin/components/common';
import { CreateCategoryForm } from '@admin/components/products';
import { useToast } from '@admin/contexts/ToastContext';
import { trpc } from '@admin/utils/trpc';
import { CreateCategoryFormData } from '@admin/types/product';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import { useUrlTabs } from '@admin/hooks/useUrlTabs';
import { cleanSlug, generateSlug } from '@admin/utils/slugUtils';

const CategoryCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();
  const [searchParams] = useSearchParams();
  const parentId = searchParams.get('parentId');

  const utils = trpc.useContext();

  // Use URL tabs hook with tab keys for clean URLs
  const { activeTab, handleTabChange } = useUrlTabs({
    defaultTab: 0,
    tabParam: 'tab',
    tabKeys: ['general', 'translations'] // Maps to CreateCategoryForm tab IDs
  });

  // tRPC mutation for creating category
  const createCategoryMutation = trpc.adminProductCategories.create.useMutation({
    onSuccess: (data) => {
      addToast({
        type: 'success',
        title: t('categories.createSuccess', 'Category created successfully'),
      });
      utils.adminProductCategories.getTree.invalidate();
      navigate('/products/categories');
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('common.error', 'Error'),
        description: error.message,
      });
    },
  });

  // Translation mutations
  const createTranslationMutation = trpc.adminProductCategories.createCategoryTranslation.useMutation();

  const handleSubmit = async (formData: CreateCategoryFormData & { translations?: Record<string, any> }) => {
    try {
      // Primary data using 'en' translation or form name if missing
      const enTranslation = formData.translations?.en || {};
      const primaryName = enTranslation.name || formData.name;

      const providedSlug = typeof enTranslation.slug === 'string' ? enTranslation.slug.trim() : '';
      const normalizedSlug = providedSlug
        ? cleanSlug(providedSlug)
        : generateSlug(primaryName || '');

      // Transform form data to match API expectations
      const categoryData = {
        name: primaryName,
        description: enTranslation.description || formData.description || undefined,
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
        // SEO defaults from EN if applicable
        seoTitle: enTranslation.seoTitle || undefined,
        seoDescription: enTranslation.seoDescription || undefined,
        metaKeywords: enTranslation.metaKeywords || undefined,
      };

      const createdCategory = await createCategoryMutation.mutateAsync(categoryData);
      const categoryId = (createdCategory as any)?.data?.id;

      if (categoryId && formData.translations) {
        // Handle all translations from the translations object
        for (const [locale, translation] of Object.entries(formData.translations)) {
          if (translation && (translation.name || translation.description || translation.seoTitle || translation.seoDescription || translation.metaKeywords)) {
            try {
              const translationSlug = translation.slug ? cleanSlug(translation.slug) : generateSlug(translation.name || '');

              await createTranslationMutation.mutateAsync({
                categoryId,
                locale,
                name: translation.name || '',
                description: translation.description || '',
                slug: translationSlug || undefined,
                seoTitle: translation.seoTitle || undefined,
                seoDescription: translation.seoDescription || undefined,
                metaKeywords: translation.metaKeywords || undefined,
              });
            } catch (translationError) {
              console.warn(`Failed to create ${locale} translation:`, translationError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Category creation error:', error);
    }
  };

  const handleCancel = () => {
    navigate('/products/categories');
  };

  const formId = 'product-category-create-form';

  return (
    <StandardFormPage
      title={t('categories.createCategory', 'Create Category')}
      description={t('categories.createDescription', 'Add a new category to organize your products')}
      icon={<FiFolder className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
      entityName={t('common.category', 'Category')}
      entityNamePlural={t('common.categories', 'Categories')}
      backUrl="/products/categories"
      onBack={handleCancel}
      isSubmitting={createCategoryMutation.isPending}
      formId={formId}
      breadcrumbs={[
        {
          label: t('navigation.home', 'Home'),
          href: '/'
        },
        {
          label: t('products.title', 'Products'),
          href: '/products'
        },
        {
          label: t('common.categories', 'Categories'),
          href: '/products/categories'
        },
        {
          label: t('categories.createCategory', 'Create Category')
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
        showActions={false}
        formId={formId}
      />
    </StandardFormPage>
  );
};

export default CategoryCreatePage;
