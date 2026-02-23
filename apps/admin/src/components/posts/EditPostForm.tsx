import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { AIGenerateButton } from '@admin/components/common/AIGenerateButton';
import { FormAIGenerator } from '@admin/components/common/FormAIGenerator';
import { SEOChecklist } from '@admin/components/common/SEOChecklist';
import { FileText, Settings, Globe, Image, Tag } from 'lucide-react';
import { EntityForm } from '@admin/components/common/EntityForm';
import { FormTabConfig, FormSubmitOptions } from '@admin/types/forms';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import { useLanguageOptions, useActiveLanguages } from '@admin/hooks/useLanguages';
import { z } from 'zod';
import { TranslationsSection } from '@admin/components/posts/TranslationsSection';

// Form validation schema
const editPostSchema = z.object({
  id: z.string().optional(), // For edit mode
  // General content (default language)
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').refine((val) => {
    // Allow Unicode characters but forbid certain special characters
    return val.length > 0 &&
      !val.startsWith('-') &&
      !val.endsWith('-') &&
      !/-{2,}/.test(val) &&
      !/[*+~.()'"!:@#$%^&<>{}[\]\\|`=]/.test(val);
  }, 'Slug must not start/end with hyphens or contain forbidden characters'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().optional(),

  // Language
  languageCode: z.string().min(1, 'Language is required'),

  // Settings
  status: z.enum(['draft', 'published', 'archived', 'scheduled']),
  type: z.enum(['post', 'page', 'news', 'event']),
  featuredImage: z.string().url().optional().or(z.literal('')),
  bannerImage: z.string().url().optional().or(z.literal('')),
  imageGallery: z.array(z.object({
    id: z.string(),
    url: z.string().url(),
    alt: z.string().optional(),
    caption: z.string().optional(),
    order: z.number(),
  })).optional(),
  publishedAt: z.date().optional(),
  scheduledAt: z.date().optional(),
  isFeatured: z.boolean().optional().default(false),
  allowComments: z.boolean().optional().default(true),
  categoryIds: z.array(z.string()).optional(),

  // SEO
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),

  // Additional translations (optional)
  additionalTranslations: z.array(z.object({
    locale: z.string().min(2).max(5),
    title: z.string().min(1, 'Title is required'),
    slug: z.string().min(1, 'Slug is required').refine((val) => {
      // Allow Unicode characters but forbid certain special characters
      return val.length > 0 &&
        !val.startsWith('-') &&
        !val.endsWith('-') &&
        !/-{2,}/.test(val) &&
        !/[*+~.()'"!:@#$%^&<>{}[\]\\|`=]/.test(val);
    }, 'Slug must not start/end with hyphens or contain forbidden characters'),
    content: z.string().min(1, 'Content is required'),
    excerpt: z.string().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    metaKeywords: z.string().optional(),
  })).optional(),
});

type EditPostFormData = z.infer<typeof editPostSchema>;

interface EditPostFormProps {
  initialData?: Partial<EditPostFormData>;
  onSubmit: (data: EditPostFormData, options?: FormSubmitOptions) => Promise<void | unknown>;
  onCancel: () => void;
  isSubmitting?: boolean;
  activeTab?: number;
  onTabChange?: (tabIndex: number) => void;
  readonly?: boolean;
  showActions?: boolean;
  formId?: string;
}



export const EditPostForm: React.FC<EditPostFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  activeTab,
  onTabChange,
  readonly = false,
  showActions = true,
  formId,
}) => {
  const { t } = useTranslationWithBackend();
  const { languageOptions, isLoading: languagesLoading } = useLanguageOptions();
  // useActiveLanguages moved to FormAIGenerator

  // State for managing translations
  const [additionalTranslations, setAdditionalTranslations] = useState<{
    locale: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
  }[]>([]);

  // Initialize translations from initial data
  useEffect(() => {
    if (initialData?.additionalTranslations) {
      const validTranslations = initialData.additionalTranslations.map(translation => ({
        locale: translation.locale || '',
        title: translation.title || '',
        slug: translation.slug || '',
        content: translation.content || '',
        excerpt: translation.excerpt || '',
        metaTitle: translation.metaTitle || '',
        metaDescription: translation.metaDescription || '',
        metaKeywords: translation.metaKeywords || '',
      }));
      setAdditionalTranslations(validTranslations);
    }
  }, [initialData]);

  // Get primary language for filtering  
  const primaryLanguage = initialData?.languageCode || languageOptions.find(option => option.isDefault)?.value || languageOptions[0]?.value || 'en';

  // Define form tabs configuration
  const tabs: FormTabConfig[] = [
    {
      id: 'general',
      label: t('posts.general'),
      icon: <FileText className="w-4 h-4" />,
      sections: [
        {
          title: t('posts.content'),
          description: t('posts.updateDescription') || t('posts.createDescription'),
          icon: <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [
            {
              name: 'languageCode',
              label: t('posts.language'),
              type: 'select',
              placeholder: languagesLoading
                ? t('common.loading')
                : languageOptions.length > 0
                  ? t('form.placeholders.select_language')
                  : t('common.no_languages_available', 'No languages available'),
              required: true,
              disabled: readonly || languagesLoading || languageOptions.length === 0,
              options: languageOptions.map(option => ({
                value: option.value,
                label: option.label,
              })),
              icon: <Globe className="w-4 h-4" />,
              description: languagesLoading
                ? t('common.loading')
                : t('form.descriptions.post_language_description'),
            },
            {
              name: 'title',
              label: t('posts.title'),
              type: 'text',
              placeholder: t('form.placeholders.enter_title'),
              required: true,
              disabled: readonly,
              validation: {
                minLength: 1,
                maxLength: 200,
              },
              rightElement: (
                <FormAIGenerator
                  targetFieldName="title"
                  sourceFieldName="content"
                  targetLabel={t('posts.title')}
                  sourceLabel={t('posts.content')}
                  entityType="post"
                  contentType="title"
                // Calculate tone dynamically? We can't access watch here easily inside JSX without a wrapper or using FormAIGenerator's internal watch.
                // For now, let's keep it simple or we might need to update FormAIGenerator to watch 'type' passed as prop name.
                // Since 'type' is a sibling field, we can't easily pass the value unless we watch it here.
                />
              ),
              rightElementPosition: 'inside-input',
            },
            {
              name: 'slug',
              label: t('posts.slug'),
              type: 'slug',
              placeholder: t('posts.slugPlaceholder', 'post-slug'),
              required: true,
              sourceField: 'title',
              disabled: readonly,
              description: t('form.descriptions.slug_requirements'),
            },
            {
              name: 'excerpt',
              label: t('posts.shortDescription'),
              type: 'textarea',
              placeholder: t('posts.shortDescriptionPlaceholder'),
              required: false,
              disabled: readonly,
              rows: 3,
              validation: {
                maxLength: 500,
              },
              rightElement: (
                <FormAIGenerator
                  targetFieldName="excerpt"
                  sourceFieldName="title"
                  targetLabel={t('posts.shortDescription')}
                  sourceLabel={t('posts.title')}
                  entityType="post"
                  contentType="description"
                  allowImages={false}
                  allowProductLinks={false}
                  allowLengthOptions={false}
                  allowStyleOptions={false}
                  plainTextOutput={true}
                  stripHtmlOutput={true}
                />
              ),
            },
            {
              name: 'content',
              label: t('posts.description'),
              type: 'richtext',
              placeholder: t('posts.contentPlaceholder'),
              required: true,
              disabled: readonly,
              minHeight: '400px',
              validation: {
                minLength: 10,
              },
              rightElement: (
                <FormAIGenerator
                  targetFieldName="content"
                  sourceFieldName="title"
                  targetLabel={t('posts.content')}
                  sourceLabel={t('posts.title')}
                  entityType="post"
                  contentType="description"
                />
              ),
            },
          ],
        },
        {
          title: t('posts.settings'),
          description: t('form.sections.post_settings_description'),
          icon: <Settings className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [
            {
              name: 'status',
              label: t('posts.status'),
              type: 'select',
              placeholder: t('form.placeholders.select_status'),
              required: true,
              disabled: readonly,
              options: [
                { value: 'draft', label: t('posts.status.draft') },
                { value: 'published', label: t('posts.status.published') },
                { value: 'scheduled', label: t('posts.status.scheduled') },
                { value: 'archived', label: t('posts.status.archived') },
              ],
            },
            {
              name: 'type',
              label: t('posts.type'),
              type: 'select',
              placeholder: t('form.placeholders.select_type'),
              required: true,
              disabled: readonly,
              options: [
                { value: 'post', label: t('posts.type.post') },
                { value: 'page', label: t('posts.type.page') },
                { value: 'news', label: t('posts.type.news') },
                { value: 'event', label: t('posts.type.event') },
              ],
              icon: <Tag className="w-4 h-4" />,
            },
            {
              name: 'categoryIds',
              label: t('posts.categories', 'Categories'),
              type: 'category-multiselect',
              placeholder: t('posts.select_categories', 'Select categories'),
              required: false,
              disabled: readonly,
              description: t(
                'posts.categories_description',
                'Assign one or more categories to organize this post.'
              ),
              maxItems: 5,
              categorySource: 'post',
            },
            {
              name: 'isFeatured',
              label: t('posts.isFeatured'),
              type: 'checkbox',
              required: false,
              disabled: readonly,
              description: t('form.descriptions.featured_post_description'),
            },
            {
              name: 'allowComments',
              label: t('posts.allowComments'),
              type: 'checkbox',
              required: false,
              disabled: readonly,
              description: t('form.descriptions.allow_comments_description'),
            },
          ],
        },
      ],
    },
    {
      id: 'media',
      label: t('posts.mediaTab', 'Media'),
      icon: <Image className="w-4 h-4" />,
      sections: [
        {
          title: t('posts.mediaTab', 'Media'),
          description: t('posts.mediaTabDescription', 'Manage featured image and galleries for this post.'),
          icon: <Image className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [
            {
              name: 'featuredImage',
              label: t('posts.featuredImage'),
              type: 'media-upload',
              placeholder: t('posts.featuredImagePlaceholder', 'Upload or drag and drop your featured image'),
              required: false,
              disabled: readonly,
              accept: 'image/*',
              maxSize: 5,
              multiple: false,
              description: t('form.descriptions.featured_image_description'),
            },
            {
              name: 'bannerImage',
              label: t('posts.bannerImage', 'Banner Image'),
              type: 'media-upload',
              placeholder: t('posts.bannerImagePlaceholder', 'Upload or drag and drop your banner image'),
              required: false,
              disabled: readonly,
              accept: 'image/*',
              maxSize: 5,
              multiple: false,
              description: t('form.descriptions.banner_image_description', 'This image will be used as a full-width header banner.'),
            },
            {
              name: 'imageGallery',
              label: t('posts.imageGallery', 'Image Gallery'),
              type: 'image-gallery',
              required: false,
              disabled: readonly,
              maxImages: 15,
              maxSize: 10,
              description: t('posts.imageGalleryDescription', 'Add up to 15 images to create a gallery for this post. Images can be reordered by dragging.'),
            },
          ],
        },
      ],
    },
    {
      id: 'seo',
      label: t('posts.seoMeta'),
      icon: <Settings className="w-4 h-4" />,
      sections: [
        {
          title: t('posts.seoMeta'),
          description: t('form.sections.seo_description'),
          icon: <Settings className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          customContent: (
            <div className="mb-8">
              <SEOChecklist />
            </div>
          ),
          fields: [
            {
              name: 'metaTitle',
              label: t('posts.metaTitle'),
              type: 'text',
              placeholder: t('posts.metaTitlePlaceholder'),
              required: false,
              disabled: readonly,
              fullWidth: true,
              validation: {
                maxLength: 60,
              },
              rightElement: (
                <FormAIGenerator
                  targetFieldName="metaTitle"
                  sourceFieldName="title"
                  targetLabel={t('posts.metaTitle')}
                  sourceLabel={t('posts.title')}
                  entityType="post"
                  contentType="title"
                  tone="seo"
                  allowImages={false}
                />
              ),
              rightElementPosition: 'inside-input',
              description: t('form.descriptions.meta_title_description'),
            },
            {
              name: 'metaDescription',
              label: t('posts.metaDescription'),
              type: 'textarea',
              placeholder: t('posts.metaDescriptionPlaceholder'),
              required: false,
              disabled: readonly,
              rows: 3,
              validation: {
                maxLength: 160,
              },
              rightElement: (
                <FormAIGenerator
                  targetFieldName="metaDescription"
                  sourceFieldName="content"
                  targetLabel={t('posts.metaDescription')}
                  sourceLabel={t('posts.content')}
                  entityType="post"
                  contentType="description"
                  tone="seo"
                  allowImages={false}
                  stripHtmlOutput={true}
                />
              ),
              description: t('form.descriptions.meta_description_description'),
            },
            {
              name: 'metaKeywords',
              label: t('posts.metaKeywords'),
              type: 'tags',
              placeholder: t('posts.metaKeywordsPlaceholder'),
              required: false,
              disabled: readonly,
              fullWidth: true,
              rightElement: (
                <FormAIGenerator
                  targetFieldName="metaKeywords"
                  sourceFieldName="content"
                  targetLabel={t('posts.metaKeywords')}
                  sourceLabel={t('posts.content')}
                  entityType="post"
                  contentType="keywords"
                  tone="seo"
                  allowImages={false}
                  allowLengthOptions={false}
                  allowProductLinks={false}
                  allowStyleOptions={false}
                  stripHtmlOutput={true}
                />
              ),
              description: t('form.descriptions.meta_keywords_description'),
            },
          ],
        },
      ],
    },
    {
      id: 'translations',
      label: t('posts.translations'),
      icon: <Globe className="w-4 h-4" />,
      sections: [
        {
          title: t('posts.translations'),
          description: t('posts.addTranslationDescription'),
          icon: <Globe className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [
            {
              name: 'additionalTranslations',
              label: '',
              type: 'custom',
              required: false,
              disabled: readonly,
              component: (
                <TranslationsSection
                  translations={additionalTranslations}
                  onTranslationsChange={setAdditionalTranslations}
                  primaryLanguage={primaryLanguage}
                  readonly={readonly}
                />
              ),
            },
          ],
        },
      ],
    },
  ];

  // Default values for the form
  const defaultValues: Partial<EditPostFormData> = {
    languageCode: initialData?.languageCode || languageOptions.find(option => option.isDefault)?.value || languageOptions[0]?.value || 'en',
    status: initialData?.status || 'draft',
    type: initialData?.type || 'post',
    isFeatured: initialData?.isFeatured || false,
    allowComments: initialData?.allowComments !== undefined ? initialData.allowComments : true,
    additionalTranslations: [],
    ...initialData,
    categoryIds: initialData?.categoryIds ?? [],
  };

  // Custom submit handler that includes translations
  const handleFormSubmit = async (data: EditPostFormData, options?: FormSubmitOptions) => {
    const formDataWithTranslations = {
      ...data,
      additionalTranslations: additionalTranslations,
    };
    await onSubmit(formDataWithTranslations, options);
  };

  return (
    <EntityForm<EditPostFormData>
      tabs={tabs}
      initialValues={defaultValues}
      onSubmit={handleFormSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      isDisabled={readonly}
      validationSchema={editPostSchema}
      submitButtonText={t('posts.update')}
      cancelButtonText={t('common.cancel')}
      showCancelButton={true}
      activeTab={activeTab}
      onTabChange={onTabChange}
      mode="edit"
      customActions={readonly ? <></> : undefined}
      showActions={showActions}
      formId={formId}
    />
  );
};

export default EditPostForm;
