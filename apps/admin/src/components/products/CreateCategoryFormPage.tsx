import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, X, FolderPlus, Globe, Search } from 'lucide-react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import Tabs from '../common/Tabs';
import { FormInput } from '../common/FormInput';
import { TextareaInput } from '../common/TextareaInput';
import { Select } from '../common/Select';
import { Toggle } from '../common/Toggle';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { trpc } from '../../utils/trpc';
import { CreateCategoryFormData, Category } from '../../types/product';

const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
  parentId: z.string().optional(),
  image: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
  sortOrder: z.number().min(0).default(0),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
});

type CreateCategoryFormSchema = z.infer<typeof createCategorySchema>;

interface CreateCategoryFormPageProps {
  onSubmit: (data: CreateCategoryFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  activeTab?: number;
  onTabChange?: (tab: number) => void;
  defaultParentId?: string | null;
}

export const CreateCategoryFormPage: React.FC<CreateCategoryFormPageProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
  activeTab = 0,
  onTabChange,
  defaultParentId,
}) => {
  const { t } = useTranslationWithBackend();
  const [currentTab, setCurrentTab] = useState(activeTab);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateCategoryFormSchema>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      parentId: defaultParentId || '',
      image: '',
      isActive: true,
      sortOrder: 0,
      seoTitle: '',
      seoDescription: '',
      metaKeywords: '',
    },
  });

  // Watch name field to auto-generate slug
  const nameValue = watch('name');
  React.useEffect(() => {
    if (nameValue) {
      const slug = nameValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setValue('slug', slug);
    }
  }, [nameValue, setValue]);

  // Convert schema data to interface data
  const handleFormSubmit = (data: CreateCategoryFormSchema) => {
    const formData: CreateCategoryFormData = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      parentId: data.parentId,
      image: data.image,
      isActive: data.isActive,
      sortOrder: data.sortOrder,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      metaKeywords: data.metaKeywords,
    };
    onSubmit(formData);
  };

  const { data: categoriesData } = trpc.adminProductCategories.getTree.useQuery({
    includeInactive: false,
  });
  const categories = (categoriesData as any)?.data || [];

  const handleTabChangeInternal = (tabIndex: number) => {
    setCurrentTab(tabIndex);
    onTabChange?.(tabIndex);
  };

  const renderCategoryOptions = (categories: Category[], level = 0): { value: string; label: string }[] => {
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

  const tabsData = [
    {
      label: t('admin.general', 'General'),
      icon: <FolderPlus className="w-4 h-4" />,
      content: (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <FormInput
                    {...field}
                    id="name"
                    type="text"
                    label={`${t('categories.name', 'Name')} *`}
                    placeholder={t('categories.name_placeholder', 'Enter category name')}
                    required
                    error={errors.name?.message}
                  />
                )}
              />

              <Controller
                name="slug"
                control={control}
                render={({ field }) => (
                  <FormInput
                    {...field}
                    id="slug"
                    type="text"
                    label={t('categories.slug', 'Slug')}
                    placeholder={t('categories.slug_placeholder', 'category-slug')}
                    error={errors.slug?.message}
                  />
                )}
              />
            </div>

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextareaInput
                  {...field}
                  id="description"
                  label={t('categories.description', 'Description')}
                  placeholder={t('categories.description_placeholder', 'Enter category description')}
                  rows={3}
                />
              )}
            />

            {!defaultParentId && (
              <div className="space-y-2">
                <Controller
                  name="parentId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label={t('categories.parent_category', 'Parent Category')}
                      value={field.value || ''}
                      onChange={field.onChange}
                      options={[
                        { value: '', label: t('categories.no_parent', 'No parent (root category)') },
                        ...renderCategoryOptions(categories)
                      ]}
                      placeholder={t('categories.select_parent', 'Select parent category')}
                    />
                  )}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Controller
                name="image"
                control={control}
                render={({ field }) => (
                  <FormInput
                    {...field}
                    id="image"
                    type="url"
                    label={t('categories.image', 'Image URL')}
                    placeholder="https://example.com/image.jpg"
                    error={errors.image?.message}
                  />
                )}
              />

              <Controller
                name="sortOrder"
                control={control}
                render={({ field }) => (
                  <FormInput
                    {...field}
                    id="sortOrder"
                    type="number"
                    label={t('categories.sort_order', 'Sort Order')}
                    value={field.value?.toString() || '0'}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    error={errors.sortOrder?.message}
                  />
                )}
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  {t('categories.status', 'Status')}
                </label>
                <div className="flex items-center space-x-2">
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <Toggle
                        checked={field.value}
                        onChange={field.onChange}
                        label={t('categories.active', 'Active')}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      )
    },
    {
      label: t('admin.translations', 'Translations'),
      icon: <Globe className="w-4 h-4" />,
      content: (
        <Card className="p-6">
          <div className="text-center py-8">
            <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('categories.translations_coming_soon', 'Translations Coming Soon')}
            </h3>
            <p className="text-gray-600">
              {t('categories.translations_description', 'Multi-language support for categories will be available in a future update.')}
            </p>
          </div>
        </Card>
      )
    },
    {
      label: t('admin.seo', 'SEO'),
      icon: <Search className="w-4 h-4" />,
      content: (
        <Card className="p-6">
          <div className="space-y-4">
            <Controller
              name="seoTitle"
              control={control}
              render={({ field }) => (
                <FormInput
                  {...field}
                  id="seoTitle"
                  type="text"
                  label={t('categories.seo_title', 'SEO Title')}
                  placeholder={t('categories.seo_title_placeholder', 'Enter SEO title')}
                  error={errors.seoTitle?.message}
                />
              )}
            />

            <Controller
              name="seoDescription"
              control={control}
              render={({ field }) => (
                <TextareaInput
                  {...field}
                  id="seoDescription"
                  label={t('categories.seo_description', 'SEO Description')}
                  placeholder={t('categories.seo_description_placeholder', 'Enter SEO description')}
                  rows={3}
                />
              )}
            />

            <Controller
              name="metaKeywords"
              control={control}
              render={({ field }) => (
                <FormInput
                  {...field}
                  id="metaKeywords"
                  type="text"
                  label={t('categories.meta_keywords', 'Meta Keywords')}
                  placeholder={t('categories.meta_keywords_placeholder', 'keyword1, keyword2, keyword3')}
                  error={errors.metaKeywords?.message}
                />
              )}
            />
          </div>
        </Card>
      )
    }
  ];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Tabs
        tabs={tabsData}
        activeTab={currentTab}
        onTabChange={handleTabChangeInternal}
      />

      <div className="flex items-center justify-end space-x-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          {t('common.cancel', 'Cancel')}
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isSubmitting ? t('common.creating', 'Creating...') : t('common.create', 'Create')}
        </Button>
      </div>
    </form>
  );
};