import React, { useState, useEffect } from 'react';
import { FolderPlus, Globe, Search, Image, Settings } from 'lucide-react';
import { EntityForm } from '../common/EntityForm';
import { TranslationTabs } from '../common/TranslationTabs';
import { FormTabConfig } from '../../types/forms';
import { CreateCategoryFormData } from '../../types/product';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../context/ToastContext';
import { trpc } from '../../utils/trpc';
import { z } from 'zod';

const editCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  parentId: z.string().optional(),
  image: z.string().optional(),
  heroBackgroundImage: z.string().optional(),
  heroOverlayEnabled: z.boolean().optional(),
  heroOverlayColor: z.string().optional(),
  heroOverlayOpacity: z.number().min(0).max(100).optional(),
  showTitle: z.boolean().optional(),
  showProductCount: z.boolean().optional(),
  showSubcategoryCount: z.boolean().optional(),
  showCta: z.boolean().optional(),
  ctaLabel: z.string().optional(),
  ctaUrl: z.string().optional(),
  isActive: z.boolean(),
  sortOrder: z.number().min(0, 'Sort order must be 0 or greater').max(999999, 'Sort order too large'),
});

export interface EditCategoryFormData extends CreateCategoryFormData {
  id: string;
}

interface EditCategoryFormProps {
  category: any; // The category data to edit
  onSubmit: (data: EditCategoryFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  activeTab?: number;
  onTabChange?: (index: number) => void;
}

export const EditCategoryForm: React.FC<EditCategoryFormProps> = ({
  category,
  onSubmit,
  onCancel,
  isSubmitting = false,
  activeTab,
  onTabChange,
}) => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({
    en: {},
    vi: {},
  });
  const [initialTranslations, setInitialTranslations] = useState<Record<string, Record<string, string>>>({});

  const { data: categoriesData } = trpc.adminProductCategories.getTree.useQuery({
    includeInactive: false,
  });
  const categories = (categoriesData as any)?.data || [];

  // Load category translations
  const { data: translationsData } = trpc.adminProductCategories.getCategoryTranslations.useQuery(
    { categoryId: category?.id },
    { enabled: !!category?.id }
  );

  // Translation mutations
  const createTranslationMutation = trpc.adminProductCategories.createCategoryTranslation.useMutation();
  const updateTranslationMutation = trpc.adminProductCategories.updateCategoryTranslation.useMutation();
  const deleteTranslationMutation = trpc.adminProductCategories.deleteCategoryTranslation.useMutation();

  useEffect(() => {
    const translations = (translationsData as any)?.data || [];
    if (Array.isArray(translations)) {
      const translationsByLocale: Record<string, Record<string, string>> = {
        en: {},
        vi: {},
      };
      
      translations.forEach((translation: any) => {
        translationsByLocale[translation.locale] = {
          name: translation.name || '',
          description: translation.description || '',
          slug: translation.slug || '',
          seoTitle: translation.seoTitle || '',
          seoDescription: translation.seoDescription || '',
          metaKeywords: translation.metaKeywords || '',
        };
      });
      
      setTranslations(translationsByLocale);
      setInitialTranslations(JSON.parse(JSON.stringify(translationsByLocale)));
    }
  }, [translationsData]);

  const handleTranslationChanges = async () => {
    try {
      for (const [locale, translationData] of Object.entries(translations)) {
        const initialTranslation = initialTranslations[locale];
        const currentTranslation = translationData;

        // Check if translation exists and has content
        const hasInitialTranslation = initialTranslation && (
          initialTranslation.name || initialTranslation.description || initialTranslation.slug || 
          initialTranslation.seoTitle || initialTranslation.seoDescription || initialTranslation.metaKeywords
        );
        const hasCurrentTranslation = currentTranslation && (
          currentTranslation.name || currentTranslation.description || currentTranslation.slug || 
          currentTranslation.seoTitle || currentTranslation.seoDescription || currentTranslation.metaKeywords
        );

        if (!hasInitialTranslation && hasCurrentTranslation) {
          // Create new translation
          try {
            await createTranslationMutation.mutateAsync({
              categoryId: category.id,
              locale,
              name: currentTranslation.name,
              description: currentTranslation.description,
              slug: currentTranslation.slug,
              seoTitle: currentTranslation.seoTitle,
              seoDescription: currentTranslation.seoDescription,
              metaKeywords: currentTranslation.metaKeywords,
            });
          } catch (error) {
            console.warn('Failed to create category translation:', error);
          }
        } else if (hasInitialTranslation && hasCurrentTranslation) {
          // Update existing translation if changed
          if (initialTranslation.name !== currentTranslation.name || 
              initialTranslation.description !== currentTranslation.description ||
              initialTranslation.slug !== currentTranslation.slug ||
              initialTranslation.seoTitle !== currentTranslation.seoTitle ||
              initialTranslation.seoDescription !== currentTranslation.seoDescription ||
              initialTranslation.metaKeywords !== currentTranslation.metaKeywords) {
            try {
              await updateTranslationMutation.mutateAsync({
                categoryId: category.id,
                locale,
                name: currentTranslation.name,
                description: currentTranslation.description,
                slug: currentTranslation.slug,
                seoTitle: currentTranslation.seoTitle,
                seoDescription: currentTranslation.seoDescription,
                metaKeywords: currentTranslation.metaKeywords,
              });
            } catch (error) {
              console.warn('Failed to update category translation:', error);
            }
          }
        } else if (hasInitialTranslation && !hasCurrentTranslation) {
          // Delete translation if it was removed
          try {
            await deleteTranslationMutation.mutateAsync({
              categoryId: category.id,
              locale,
            });
          } catch (error) {
            console.warn('Failed to delete category translation:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error handling translation changes:', error);
    }
  };

  const renderCategoryOptions = (categories: any[], level = 0): { value: string; label: string }[] => {
    const result: { value: string; label: string }[] = [];
    
    categories.forEach(cat => {
      // Don't show the current category or its descendants as parent options
      if (cat.id === category.id) return;
      
      const indent = '—'.repeat(level);
      result.push({
        value: cat.id,
        label: `${indent} ${cat.name}`
      });

      if (cat.children && cat.children.length > 0) {
        result.push(...renderCategoryOptions(cat.children, level + 1));
      }
    });
    
    return result;
  };

  const categoryOptions = [
    { value: '', label: t('categories.no_parent', 'No parent (root category)') },
    ...renderCategoryOptions(categories)
  ];

  const tabs: FormTabConfig[] = [
    {
      id: 'general',
      label: t('admin.general', 'General'),
      icon: <FolderPlus className="w-4 h-4" />,
      sections: [
        {
          title: t('form.sections.basic_information', 'Basic Information'),
          description: t('categories.basic_info_description', 'Enter the category basic information and details.'),
          icon: <FolderPlus className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [
            {
              name: 'name',
              label: t('categories.name', 'Name'),
              type: 'text',
              placeholder: t('categories.name_placeholder', 'Enter category name'),
              required: true,
              validation: {
                minLength: 1,
                maxLength: 100,
              },
            },
            {
              name: 'description',
              label: t('categories.description', 'Description'),
              type: 'textarea',
              placeholder: t('categories.description_placeholder', 'Enter category description'),
              required: false,
              rows: 3,
            },
          ],
        },
        {
          title: t('categories.category_settings', 'Category Settings'),
          description: t('categories.settings_description', 'Configure category hierarchy and display options.'),
          icon: <Settings className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [
            {
              name: 'parentId',
              label: t('categories.parent_category', 'Parent Category'),
              type: 'select' as const,
              placeholder: t('categories.select_parent', 'Select parent category'),
              required: false,
              options: categoryOptions,
            },
            {
              name: 'sortOrder',
              label: t('categories.sort_order', 'Sort Order'),
              type: 'number',
              placeholder: t('categories.sort_order_placeholder', 'e.g., 0, 10, 20'),
              required: false,
              min: 0,
              max: 999999,
              step: 1,
              description: t('categories.sort_order_description', 'Lower numbers appear first. Use increments of 10 for easier reordering.'),
            },
            {
              name: 'image',
              label: t('categories.image', 'Category Image'),
              type: 'media-upload',
              placeholder: t('categories.select_image', 'Select category image'),
              required: false,
              accept: 'image/*',
              maxSize: 5,
              multiple: false,
              description: t('categories.image_description', 'Upload an image for this category (max 5MB)'),
            },
            {
              name: 'isActive',
              label: t('categories.active', 'Active'),
              type: 'checkbox',
              required: false,
              description: t('categories.active_description', 'Make this category active and visible'),
            },
          ],
        },
        {
          title: t('categories.page_display', 'Category Page Display'),
          description: t('categories.page_display_description', 'Control the hero visuals and visibility on the category page.'),
          icon: <Image className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [
            {
              name: 'heroBackgroundImage',
              label: t('categories.hero_background_image', 'Hero Background Image'),
              type: 'media-upload',
              placeholder: t('categories.select_hero_background', 'Select hero background image'),
              required: false,
              accept: 'image/*',
              maxSize: 5,
              multiple: false,
              description: t('categories.hero_background_description', 'Full-width background image for the category hero (max 5MB).'),
            },
            {
              name: 'heroOverlayEnabled',
              label: t('categories.hero_overlay_enabled', 'Enable Hero Overlay'),
              type: 'checkbox',
              required: false,
            },
            {
              name: 'showTitle',
              label: t('categories.show_title', 'Show Category Title'),
              type: 'checkbox',
              required: false,
            },
            {
              name: 'showProductCount',
              label: t('categories.show_product_count', 'Show Product Count'),
              type: 'checkbox',
              required: false,
            },
            {
              name: 'showSubcategoryCount',
              label: t('categories.show_subcategory_count', 'Show Subcategory Count'),
              type: 'checkbox',
              required: false,
            },
            {
              name: 'showCta',
              label: t('categories.show_cta', 'Show CTA Button'),
              type: 'checkbox',
              required: false,
            },
            {
              name: 'heroOverlayColor',
              label: t('categories.hero_overlay_color', 'Overlay Color'),
              type: 'color',
              placeholder: t('categories.hero_overlay_color_placeholder', '#0f172a'),
              required: false,
              description: t('categories.hero_overlay_color_description', 'Hex or RGB color for the hero overlay.'),
            },
            {
              name: 'heroOverlayOpacity',
              label: t('categories.hero_overlay_opacity', 'Overlay Opacity (%)'),
              type: 'number',
              placeholder: t('categories.hero_overlay_opacity_placeholder', '70'),
              required: false,
              min: 0,
              max: 100,
              step: 1,
            },
            {
              name: 'ctaLabel',
              label: t('categories.cta_label', 'CTA Label'),
              type: 'text',
              placeholder: t('categories.cta_label_placeholder', 'Explore this category'),
              required: false,
            },
            {
              name: 'ctaUrl',
              label: t('categories.cta_url', 'CTA URL'),
              type: 'text',
              placeholder: t('categories.cta_url_placeholder', '/products'),
              required: false,
            },
          ],
        },
      ],
    },
    {
      id: 'translations',
      label: t('admin.translations', 'Translations'),
      icon: <Globe className="w-4 h-4" />,
      sections: [
        {
          title: t('categories.translations', 'Category Translations'),
          description: t('categories.translations_description', 'Manage category names and descriptions in different languages.'),
          icon: <Globe className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [],
          customContent: (
            <TranslationTabs
              translations={translations}
              onTranslationsChange={setTranslations}
              entityName={category.name}
              fields={[
                {
                  name: 'name',
                  label: t('categories.name', 'Name'),
                  value: '',
                  onChange: () => {},
                  type: 'text',
                  placeholder: t('categories.name_placeholder', 'Enter category name'),
                  required: false,
                },
                {
                  name: 'description',
                  label: t('categories.description', 'Description'),
                  value: '',
                  onChange: () => {},
                  type: 'textarea',
                  placeholder: t('categories.description_placeholder', 'Enter category description'),
                  required: false,
                  rows: 3,
                },
                {
                  name: 'slug',
                  label: t('categories.slug', 'Slug'),
                  value: '',
                  onChange: () => {},
                  type: 'text',
                  placeholder: t('categories.slug_placeholder', 'category-slug'),
                  required: false,
                  description: t('categories.slug_description', 'URL-friendly name (auto-generated from name if empty)'),
                },
                {
                  name: 'seoTitle',
                  label: t('categories.seo_title', 'SEO Title'),
                  value: '',
                  onChange: () => {},
                  type: 'text',
                  placeholder: t('categories.seo_title_placeholder', 'Enter SEO title'),
                  required: false,
                  validation: { maxLength: 60 },
                  description: t('categories.seo_title_description', 'Recommended length: 50-60 characters'),
                },
                {
                  name: 'seoDescription',
                  label: t('categories.seo_description', 'SEO Description'),
                  value: '',
                  onChange: () => {},
                  type: 'textarea',
                  placeholder: t('categories.seo_description_placeholder', 'Enter SEO description'),
                  required: false,
                  rows: 3,
                  validation: { maxLength: 160 },
                  description: t('categories.seo_description_desc', 'Recommended length: 150-160 characters'),
                },
                {
                  name: 'metaKeywords',
                  label: t('categories.meta_keywords', 'Meta Keywords'),
                  value: '',
                  onChange: () => {},
                  type: 'text',
                  placeholder: t('categories.meta_keywords_placeholder', 'keyword1, keyword2, keyword3'),
                  required: false,
                  description: t('categories.meta_keywords_description', 'Separate keywords with commas'),
                },
              ]}
            />
          ),
        },
      ],
    },
  ];

  const initialValues: Partial<EditCategoryFormData> = {
    name: category.name || '',
    description: category.description || '',
    parentId: category.parentId || '',
    image: category.image || '',
    heroBackgroundImage: category.heroBackgroundImage || '',
    heroOverlayEnabled: category.heroOverlayEnabled ?? true,
    heroOverlayColor: category.heroOverlayColor || '#0f172a',
    heroOverlayOpacity: category.heroOverlayOpacity ?? 70,
    showTitle: category.showTitle ?? true,
    showProductCount: category.showProductCount ?? true,
    showSubcategoryCount: category.showSubcategoryCount ?? true,
    showCta: category.showCta ?? true,
    ctaLabel: category.ctaLabel || '',
    ctaUrl: category.ctaUrl || '',
    isActive: category.isActive ?? true,
    sortOrder: category.sortOrder ?? 0,
  };

  const handleSubmit = async (data: EditCategoryFormData) => {
    try {
      await onSubmit({
        ...data,
        id: category.id,
      });
      
      // Handle translation changes after successful category update
      await handleTranslationChanges();
    } catch (error) {
      // Let the parent component handle the main error
      throw error;
    }
  };

  return (
    <EntityForm<EditCategoryFormData>
      tabs={tabs}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      validationSchema={editCategorySchema as any}
      submitButtonText={t('admin.update_category', 'Update Category')}
      cancelButtonText={t('common.cancel', 'Cancel')}
      showCancelButton={true}
      activeTab={activeTab}
      onTabChange={onTabChange}
    />
  );
};
