import React, { useEffect, useMemo, useState } from 'react';
import { LayoutDashboard, FileText, Settings, CalendarClock } from 'lucide-react';
import Tabs from '../../components/common/Tabs';
import { FormSection } from '../../components/common/FormSection';
import { Input } from '../../components/common/Input';
import { TextareaInput } from '../../components/common/TextareaInput';
import { Select, SelectOption } from '../../components/common/Select';
import { Toggle } from '../../components/common/Toggle';
import { Button } from '../../components/common/Button';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useLanguageOptions } from '../../hooks/useLanguages';
import { RichTextEditor } from '../../components/common/RichTextEditor';
import { SiteContentCategory, SiteContentStatus } from '@shared/enums/site-content.enums';
import {
  SiteContentFormValues,
  defaultSiteContentFormValues,
} from '../../types/site-content';

export interface SiteContentFormSubmitPayload {
  formValues: SiteContentFormValues;
  metadata: Record<string, unknown> | null;
  publishedAt?: Date;
}

interface SiteContentFormProps {
  initialValues?: SiteContentFormValues;
  onSubmit: (payload: SiteContentFormSubmitPayload) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  mode?: 'create' | 'edit';
  activeTab?: number;
  onTabChange?: (index: number) => void;
}

const toDateTimeLocalString = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
};

export const SiteContentForm: React.FC<SiteContentFormProps> = ({
  initialValues = defaultSiteContentFormValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = 'create',
  activeTab,
  onTabChange,
}) => {
  const { t } = useTranslationWithBackend();
  const [formValues, setFormValues] = useState<SiteContentFormValues>({
    ...defaultSiteContentFormValues,
    ...initialValues,
    summary: initialValues.summary ?? '',
    content: initialValues.content ?? '',
    metadata: initialValues.metadata ?? '',
    publishedAt: initialValues.publishedAt
      ? toDateTimeLocalString(initialValues.publishedAt)
      : '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [internalActiveTab, setInternalActiveTab] = useState(0);

  const currentTab = activeTab ?? internalActiveTab;
  const handleInternalTabChange = onTabChange ?? setInternalActiveTab;

  const { languageOptions, isLoading: languagesLoading } = useLanguageOptions();

  const languageSelectOptions: SelectOption[] = useMemo(
    () =>
      languageOptions.map((option) => ({
        value: option.value,
        label: option.label,
      })),
    [languageOptions],
  );

  useEffect(() => {
    setFormValues({
      ...defaultSiteContentFormValues,
      ...initialValues,
      summary: initialValues.summary ?? '',
      content: initialValues.content ?? '',
      metadata: initialValues.metadata ?? '',
      publishedAt: initialValues.publishedAt
        ? toDateTimeLocalString(initialValues.publishedAt)
        : '',
    });
    setErrors({});
    setMetadataError(null);
  }, [initialValues]);

  useEffect(() => {
    if (languageOptions.length === 0) {
      return;
    }

    const hasCurrentLanguage = languageOptions.some(
      (option) => option.value === formValues.languageCode,
    );

    if (!hasCurrentLanguage) {
      const fallback =
        languageOptions.find((option) => option.isDefault) || languageOptions[0];

      if (fallback) {
        setFormValues((prev) => ({
          ...prev,
          languageCode: fallback.value,
        }));
      }
    }
  }, [languageOptions, formValues.languageCode]);

  const categoryOptions: SelectOption[] = useMemo(
    () =>
      Object.values(SiteContentCategory).map((value) => ({
        value,
        label: t(`siteContent.category.${value}`, value.replace(/_/g, ' ')),
      })),
    [t],
  );

  const statusOptions: SelectOption[] = useMemo(
    () =>
      Object.values(SiteContentStatus).map((value) => ({
        value,
        label: t(`siteContent.status.${value}`, value.replace(/_/g, ' ')),
      })),
    [t],
  );

  const handleChange = (
    field: keyof SiteContentFormValues,
    parser?: (value: any) => any,
  ) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = parser ? parser(event.target.value) : event.target.value;
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSelectChange = (
    field: keyof SiteContentFormValues,
  ) => (value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value as any,
    }));
  };

  const handleToggle = (field: keyof SiteContentFormValues) => (checked: boolean) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: checked as any,
    }));
  };

  const validate = (): boolean => {
    const validationErrors: Record<string, string> = {};

    if (!formValues.code.trim()) {
      validationErrors.code = t('siteContent.errors.codeRequired', 'Code is required');
    }

    if (!formValues.title.trim()) {
      validationErrors.title = t('siteContent.errors.titleRequired', 'Title is required');
    }

    if (!formValues.slug.trim()) {
      validationErrors.slug = t('siteContent.errors.slugRequired', 'Slug is required');
    }

    if (!formValues.languageCode.trim()) {
      validationErrors.languageCode = t('siteContent.errors.languageRequired', 'Language code is required');
    }

    if (Number.isNaN(formValues.displayOrder)) {
      validationErrors.displayOrder = t('siteContent.errors.displayOrderInvalid', 'Display order must be a number');
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMetadataError(null);

    if (!validate()) {
      return;
    }

    let metadata: Record<string, unknown> | null = null;

    if (formValues.metadata && formValues.metadata.trim()) {
      try {
        metadata = JSON.parse(formValues.metadata);
      } catch (error) {
        console.error('Invalid metadata JSON:', error);
        setMetadataError(
          t('siteContent.errors.metadataInvalid', 'Metadata must be valid JSON'),
        );
        handleInternalTabChange(2);
        return;
      }
    }

    let publishedAtDate: Date | undefined;
    if (formValues.publishedAt) {
      const parsed = new Date(formValues.publishedAt);
      if (Number.isNaN(parsed.getTime())) {
        setErrors((prev) => ({
          ...prev,
          publishedAt: t('siteContent.errors.publishedAtInvalid', 'Published date is invalid'),
        }));
        handleInternalTabChange(2);
        return;
      }
      publishedAtDate = parsed;
    }

    await onSubmit({
      formValues,
      metadata,
      publishedAt: publishedAtDate,
    });
  };

  const tabItems = [
    {
      label: t('siteContent.tabs.general', 'General'),
      icon: <LayoutDashboard className="w-4 h-4" />,
      content: (
        <div className="space-y-8">
          <FormSection
            title={t('siteContent.sections.basicInformation', 'Basic Information')}
            description={t(
              'siteContent.sections.basicInformationDescription',
              'Define the key identifying details about this page.',
            )}
            icon={<LayoutDashboard className="w-5 h-5 text-primary-500 dark:text-primary-400" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-800 dark:text-neutral-200" htmlFor="code">
                  {t('siteContent.fields.code', 'Content Code')} <span className="text-red-500">*</span>
                </label>
                <Input
                  id="code"
                  value={formValues.code}
                  onChange={handleChange('code')}
                  placeholder={t('siteContent.placeholders.code', 'privacy_policy')}
                  inputSize="md"
                />
                {errors.code && <p className="text-sm text-error">{errors.code}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-800 dark:text-neutral-200" htmlFor="slug">
                  {t('siteContent.fields.slug', 'Slug')} <span className="text-red-500">*</span>
                </label>
                <Input
                  id="slug"
                  value={formValues.slug}
                  onChange={handleChange('slug')}
                  placeholder={t('siteContent.placeholders.slug', 'privacy-policy')}
                  inputSize="md"
                />
                {errors.slug && <p className="text-sm text-error">{errors.slug}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-neutral-800 dark:text-neutral-200" htmlFor="title">
                  {t('siteContent.fields.title', 'Title')} <span className="text-red-500">*</span>
                </label>
                <Input
                  id="title"
                  value={formValues.title}
                  onChange={handleChange('title')}
                  placeholder={t('siteContent.placeholders.title', 'Privacy Policy')}
                  inputSize="md"
                />
                {errors.title && <p className="text-sm text-error">{errors.title}</p>}
              </div>
            </div>
          </FormSection>

          <FormSection
            title={t('siteContent.sections.categorization', 'Categorization & Visibility')}
            description={t(
              'siteContent.sections.categorizationDescription',
              'Assign this page to the appropriate category and publishing status.',
            )}
            icon={<Settings className="w-5 h-5 text-primary-500 dark:text-primary-400" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label={t('siteContent.fields.category', 'Category')}
                value={formValues.category}
                onChange={handleSelectChange('category')}
                options={categoryOptions}
                size="md"
              />

              <Select
                label={t('siteContent.fields.status', 'Status')}
                value={formValues.status}
                onChange={handleSelectChange('status')}
                options={statusOptions}
                size="md"
              />

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-800 dark:text-neutral-200" htmlFor="languageCode">
                  {t('siteContent.fields.languageCode', 'Language Code')} <span className="text-red-500">*</span>
                </label>
                <Select
                  id="languageCode"
                  value={formValues.languageCode}
                  onChange={handleSelectChange('languageCode')}
                  options={languageSelectOptions}
                  placeholder={
                    languagesLoading
                      ? t('common.loading', 'Loading...')
                      : languageSelectOptions.length > 0
                        ? t('siteContent.placeholders.language', 'Select a language')
                        : t('siteContent.placeholders.languageUnavailable', 'No languages available')
                  }
                  disabled={languagesLoading || languageSelectOptions.length === 0}
                  required
                  size="md"
                />
                {errors.languageCode && <p className="text-sm text-error">{errors.languageCode}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-800 dark:text-neutral-200" htmlFor="displayOrder">
                  {t('siteContent.fields.displayOrder', 'Display Order')}
                </label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={formValues.displayOrder}
                  inputSize="md"
                  onChange={(event) => {
                    const numericValue = parseInt(event.target.value, 10);
                    setFormValues((prev) => ({
                      ...prev,
                      displayOrder: Number.isNaN(numericValue) ? 0 : numericValue,
                    }));
                  }}
                />
                {errors.displayOrder && <p className="text-sm text-error">{errors.displayOrder}</p>}
              </div>
            </div>
          </FormSection>
        </div>
      ),
    },
    {
      label: t('siteContent.tabs.content', 'Content'),
      icon: <FileText className="w-4 h-4" />,
      content: (
        <div className="space-y-8">
          <FormSection
            title={t('siteContent.sections.contentBlocks', 'Content blocks')}
            description={t(
              'siteContent.sections.contentBlocksDescription',
              'Craft the summary and full body copy for this page.',
            )}
            icon={<FileText className="w-5 h-5 text-primary-500 dark:text-primary-400" />}
          >
            <TextareaInput
              id="summary"
              label={t('siteContent.fields.summary', 'Summary')}
              placeholder={t('siteContent.placeholders.summary', 'Short description...')}
              value={formValues.summary}
              onChange={(event) => handleChange('summary')(event)}
              rows={3}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-800 dark:text-neutral-200" htmlFor="content">
                {t('siteContent.fields.content', 'Content Body')}
              </label>
              <RichTextEditor
                value={formValues.content || ''}
                onChange={(value) =>
                  setFormValues((prev) => ({
                    ...prev,
                    content: value,
                  }))
                }
                placeholder={t('siteContent.placeholders.content', 'Full content for this page...')}
                minHeight="480px"
              />
            </div>
          </FormSection>
        </div>
      ),
    },
    {
      label: t('siteContent.tabs.settings', 'Settings'),
      icon: <Settings className="w-4 h-4" />,
      content: (
        <div className="space-y-8">
          <FormSection
            title={t('siteContent.sections.publishing', 'Publishing preferences')}
            description={t(
              'siteContent.sections.publishingDescription',
              'Control scheduling, ordering, and featured placement.',
            )}
            icon={<CalendarClock className="w-5 h-5 text-primary-500 dark:text-primary-400" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-800 dark:text-neutral-200" htmlFor="publishedAt">
                  {t('siteContent.fields.publishedAt', 'Published At')}
                </label>
                <Input
                  id="publishedAt"
                  type="datetime-local"
                  value={formValues.publishedAt}
                  onChange={handleChange('publishedAt')}
                  inputSize="md"
                />
                {errors.publishedAt && <p className="text-sm text-error">{errors.publishedAt}</p>}
              </div>
            </div>

            <Toggle
              checked={formValues.isFeatured}
              onChange={handleToggle('isFeatured')}
              label={t('siteContent.fields.isFeatured', 'Mark as featured')}
              description={t('siteContent.fields.isFeaturedHint', 'Highlight this page in prominent placements.')}
            />
          </FormSection>

          <FormSection
            title={t('siteContent.sections.metadata', 'Metadata & SEO')}
            description={t(
              'siteContent.sections.metadataDescription',
              'Include structured metadata to power SEO and integrations.',
            )}
            icon={<Settings className="w-5 h-5 text-primary-500 dark:text-primary-400" />}
          >
            <TextareaInput
              id="metadata"
              label={t('siteContent.fields.metadata', 'Metadata (JSON)')}
              placeholder={t('siteContent.placeholders.metadata', '{ "seoTitle": "..." }')}
              value={formValues.metadata}
              onChange={(event) => handleChange('metadata')(event)}
              rows={6}
            />
            {metadataError && <p className="text-sm text-error">{metadataError}</p>}
          </FormSection>
        </div>
      ),
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs
        tabs={tabItems}
        activeTab={currentTab}
        onTabChange={handleInternalTabChange}
      />

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {t('common.cancel', 'Cancel')}
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting
            ? t('siteContent.actions.saving', 'Saving...')
            : mode === 'edit'
              ? t('siteContent.actions.update', 'Update Page')
              : t('siteContent.actions.create', 'Create Page')}
        </Button>
      </div>
    </form>
  );
};

export default SiteContentForm;
