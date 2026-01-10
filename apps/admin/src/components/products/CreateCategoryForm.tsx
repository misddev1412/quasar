import React, { useState } from 'react';
import { FolderPlus, Globe, Search, Image, Settings } from 'lucide-react';
import { EntityForm } from '../common/EntityForm';
import { CategoryTranslationsSection, CategoryTranslationData } from './CategoryTranslationsSection';
import { FormTabConfig } from '../../types/forms';
import { CreateCategoryFormData } from '../../types/product';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useLanguageOptions } from '../../hooks/useLanguages';
import { trpc } from '../../utils/trpc';
import { z } from 'zod';

const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().optional(),
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
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  languageCode: z.string().min(1, 'Language is required'),
  additionalTranslations: z.array(z.object({
    locale: z.string().min(2).max(5),
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
  })).optional(),
});

interface CreateCategoryFormProps {
  onSubmit: (data: CreateCategoryFormData & { additionalTranslations?: CategoryTranslationData[] }) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  activeTab?: number;
  onTabChange?: (index: number) => void;
  defaultParentId?: string | null;
}

export const CreateCategoryForm: React.FC<CreateCategoryFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
  activeTab,
  onTabChange,
  defaultParentId,
}) => {
  const { t } = useTranslationWithBackend();
  const { languageOptions, isLoading: languagesLoading } = useLanguageOptions();
  
  // State for managing translations
  const [additionalTranslations, setAdditionalTranslations] = useState<CategoryTranslationData[]>([]);
  
  // Get primary language (default to first available language)
  const primaryLanguage = languageOptions.length > 0 ? languageOptions[0].value : 'en';

  const { data: categoriesData } = trpc.adminProductCategories.getTree.useQuery({
    includeInactive: false,
  });
  const categories = (categoriesData as any)?.data || [];

  const renderCategoryOptions = (categories: any[], level = 0): { value: string; label: string }[] => {
    const result: { value: string; label: string }[] = [];
    
    categories.forEach(category => {
      const indent = '—'.repeat(level);
      result.push({
        value: category.id,
        label: `${indent} ${category.name}`
      });

      if (category.children && category.children.length > 0) {
        result.push(...renderCategoryOptions(category.children, level + 1));
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
              name: 'slug',
              label: t('categories.slug', 'Slug'),
              type: 'slug',
              placeholder: t('categories.slug_placeholder', 'category-slug'),
              required: false,
              sourceField: 'name',
              description: t('categories.slug_description', 'URL-friendly name (auto-generated from name if empty)'),
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
            ...(defaultParentId ? [] : [{
              name: 'parentId',
              label: t('categories.parent_category', 'Parent Category'),
              type: 'select' as const,
              placeholder: t('categories.select_parent', 'Select parent category'),
              required: false,
              options: categoryOptions,
            }]),
            {
              name: 'languageCode',
              label: t('categories.primary_language', 'Primary Language'),
              type: 'select' as const,
              placeholder: t('categories.select_language', 'Select language'),
              required: true,
              options: languageOptions,
              description: t('categories.primary_language_description', 'The main language for this category'),
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
          description: t('categories.translations_description', 'Manage category translations in different languages.'),
          icon: <Globe className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [
            {
              name: 'additionalTranslations',
              label: '',
              type: 'custom',
              required: false,
              component: (
                <CategoryTranslationsSection
                  translations={additionalTranslations}
                  onTranslationsChange={setAdditionalTranslations}
                  primaryLanguage={primaryLanguage}
                />
              ),
            },
          ],
        },
      ],
    },
    {
      id: 'seo',
      label: t('admin.seo',   'SEO'),
      icon: <Search className="w-4 h-4" />,
      sections: [
        {
          title: t('categories.seo_optimization', 'SEO Optimization'),
          description: t('categories.seo_description', 'Optimize your category for search engines.'),
          icon: <Search className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [
            {
              name: 'seoTitle',
              label: t('categories.seo_title', 'SEO Title'),
              type: 'text',
              placeholder: t('categories.seo_title_placeholder', 'Enter SEO title'),
              required: false,
              validation: {
                maxLength: 60,
              },
              description: t('categories.seo_title_description', 'Recommended length: 50-60 characters'),
            },
            {
              name: 'seoDescription',
              label: t('categories.seo_description', 'SEO Description'),
              type: 'textarea',
              placeholder: t('categories.seo_description_placeholder', 'Enter SEO description'),
              required: false,
              rows: 3,
              validation: {
                maxLength: 160,
              },
              description: t('categories.seo_description_desc', 'Recommended length: 150-160 characters'),
            },
            {
              name: 'metaKeywords',
              label: t('categories.meta_keywords', 'Meta Keywords'),
              type: 'text',
              placeholder: t('categories.meta_keywords_placeholder', 'keyword1, keyword2, keyword3'),
              required: false,
              description: t('categories.meta_keywords_description', 'Separate keywords with commas'),
            },
          ],
        },
      ],
    },
  ];

  const defaultValues: Partial<CreateCategoryFormData & { languageCode: string; additionalTranslations: CategoryTranslationData[] }> = {
    name: '',
    slug: '',
    description: '',
    parentId: defaultParentId || '',
    image: '',
    heroBackgroundImage: '',
    heroOverlayEnabled: true,
    heroOverlayColor: '#0f172a',
    heroOverlayOpacity: 70,
    showTitle: true,
    showProductCount: true,
    showSubcategoryCount: true,
    showCta: true,
    ctaLabel: '',
    ctaUrl: '',
    isActive: true,
    sortOrder: 0,
    seoTitle: '',
    seoDescription: '',
    metaKeywords: '',
    languageCode: primaryLanguage,
    additionalTranslations: [],
  };

  const handleSubmit = async (data: CreateCategoryFormData & { languageCode: string; additionalTranslations?: CategoryTranslationData[] }) => {
    const formDataWithTranslations = {
      ...data,
      additionalTranslations: additionalTranslations,
    };
    await onSubmit(formDataWithTranslations);
  };

  return (
    <EntityForm<CreateCategoryFormData & { languageCode: string; additionalTranslations?: CategoryTranslationData[] }>
      tabs={tabs}
      initialValues={defaultValues}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      validationSchema={createCategorySchema as any}
      submitButtonText={t('admin.create_category', 'Create Category')}
      cancelButtonText={t('common.cancel', 'Cancel')}
      showCancelButton={true}
      activeTab={activeTab}
      onTabChange={onTabChange}
    />
  );
};
