import React, { useState } from 'react';
import { FolderPlus, Globe, Settings } from 'lucide-react';
import { EntityForm } from '@admin/components/common/EntityForm';
import { TranslationTabs } from '@admin/components/common/TranslationTabs';
import { FormTabConfig } from '@admin/types/forms';
import { CreateCategoryFormData } from '@admin/types/product';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import { useLanguageOptions } from '@admin/hooks/useLanguages';
import { trpc } from '@admin/utils/trpc';
import { generateSlug } from '@admin/utils/slugUtils';
import { z } from 'zod';

const createCategorySchema = z.object({
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

interface CreateCategoryFormProps {
  onSubmit: (data: CreateCategoryFormData & { translations?: Record<string, any> }) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  activeTab?: number;
  onTabChange?: (index: number) => void;
  defaultParentId?: string | null;
  showActions?: boolean;
  formId?: string;
}

export const CreateCategoryForm: React.FC<CreateCategoryFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
  activeTab,
  onTabChange,
  defaultParentId,
  showActions = true,
  formId,
}) => {
  const { t } = useTranslationWithBackend();
  const { languageOptions } = useLanguageOptions();

  // State for managing translations
  const [translations, setTranslations] = useState<Record<string, any>>({
    en: {},
    vi: {},
  });

  const handleTranslationsChange = (nextTranslations: Record<string, any>) => {
    const withAutoSlug = Object.entries(nextTranslations).reduce<Record<string, any>>((acc, [locale, value]) => {
      const translation = value || {};
      const name = typeof translation.name === 'string' ? translation.name.trim() : '';
      const slug = typeof translation.slug === 'string' ? translation.slug.trim() : '';
      const previousTranslation = translations[locale] || {};
      const previousName = typeof previousTranslation.name === 'string' ? previousTranslation.name.trim() : '';
      const previousSlug = typeof previousTranslation.slug === 'string' ? previousTranslation.slug.trim() : '';
      const previousAutoSlug = previousName ? generateSlug(previousName) : '';
      const wasAutoManaged = !previousSlug || (previousAutoSlug && previousSlug === previousAutoSlug);
      const nextSlug = (name && (!slug || wasAutoManaged)) ? generateSlug(name) : translation.slug;

      acc[locale] = {
        ...translation,
        slug: nextSlug,
      };

      return acc;
    }, {});

    setTranslations(withAutoSlug);
  };

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
          icon: <FolderPlus className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
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
              onTranslationsChange={handleTranslationsChange}
              fields={[
                {
                  name: 'name',
                  label: t('categories.name', 'Name'),
                  value: '',
                  onChange: () => { },
                  type: 'text',
                  placeholder: t('categories.name_placeholder', 'Enter category name'),
                  required: false,
                  aiGenerator: {
                    entityType: 'product',
                    contentType: 'title',
                  }
                },
                {
                  name: 'description',
                  label: t('categories.description', 'Description'),
                  value: '',
                  onChange: () => { },
                  type: 'textarea',
                  placeholder: t('categories.description_placeholder', 'Enter category description'),
                  required: false,
                  rows: 3,
                  aiGenerator: {
                    entityType: 'product',
                    contentType: 'description',
                  }
                },
                {
                  name: 'slug',
                  label: t('categories.slug', 'Slug'),
                  value: '',
                  onChange: () => { },
                  type: 'text',
                  placeholder: t('categories.slug_placeholder', 'category-slug'),
                  required: false,
                  description: t('categories.slug_description', 'URL-friendly name (auto-generated from name if empty)'),
                },
                {
                  name: 'seoTitle',
                  label: t('categories.seo_title', 'SEO Title'),
                  value: '',
                  onChange: () => { },
                  type: 'text',
                  placeholder: t('categories.seo_title_placeholder', 'Enter SEO title'),
                  required: false,
                  validation: { maxLength: 60 },
                  description: t('categories.seo_title_description', 'Recommended length: 50-60 characters'),
                  aiGenerator: {
                    entityType: 'product',
                    contentType: 'title',
                    sourceFieldName: 'name',
                    tone: 'seo',
                  }
                },
                {
                  name: 'seoDescription',
                  label: t('categories.seo_description', 'SEO Description'),
                  value: '',
                  onChange: () => { },
                  type: 'textarea',
                  placeholder: t('categories.seo_description_placeholder', 'Enter SEO description'),
                  required: false,
                  rows: 3,
                  validation: { maxLength: 160 },
                  description: t('categories.seo_description_desc', 'Recommended length: 150-160 characters'),
                  aiGenerator: {
                    entityType: 'product',
                    contentType: 'description',
                    sourceFieldName: 'description',
                    tone: 'seo',
                  }
                },
                {
                  name: 'metaKeywords',
                  label: t('categories.meta_keywords', 'Meta Keywords'),
                  value: '',
                  onChange: () => { },
                  type: 'text',
                  placeholder: t('categories.meta_keywords_placeholder', 'keyword1, keyword2, keyword3'),
                  required: false,
                  description: t('categories.meta_keywords_description', 'Separate keywords with commas'),
                  aiGenerator: {
                    entityType: 'product',
                    contentType: 'keywords',
                    sourceFieldName: 'description',
                    tone: 'seo',
                  }
                },
              ]}
              supportedLocales={languageOptions.map(l => ({ code: l.value, name: l.label }))}
            />
          ),
        },
      ],
    },
  ];

  const defaultValues: Partial<CreateCategoryFormData> = {
    name: '',
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
  };

  const handleSubmit = async (data: CreateCategoryFormData) => {
    await onSubmit({
      ...data,
      translations,
    });
  };

  return (
    <EntityForm<CreateCategoryFormData>
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
      showActions={showActions}
      formId={formId}
    />
  );
};
