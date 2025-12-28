import React, { useMemo } from 'react';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useLanguageOptions } from '../../hooks/useLanguages';
import { TranslationTabs } from '../common/TranslationTabs';

interface TranslationData {
  locale: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

interface TranslationsSectionProps {
  translations: TranslationData[];
  onTranslationsChange: (translations: TranslationData[]) => void;
  primaryLanguage?: string;
  readonly?: boolean;
}

export const TranslationsSection: React.FC<TranslationsSectionProps> = ({
  translations,
  onTranslationsChange,
  primaryLanguage,
  readonly = false,
}) => {
  const { t } = useTranslationWithBackend();
  const { languageOptions, isLoading: languagesLoading } = useLanguageOptions();

  // Filter available languages to exclude primary language
  // This logic is critical for isolating "additional" (translated) languages from the main language
  const supportedLocales = useMemo(() => {
    return languageOptions
      .filter(lang => lang.value !== primaryLanguage)
      .map(lang => ({
        code: lang.value,
        name: lang.label,
        flag: undefined // Flags are handled by TranslationTabs internal logic or can be added if available
      }));
  }, [languageOptions, primaryLanguage]);

  // Transform array format to Record<locale, Record<field, value>> format for TranslationTabs
  const translationsRecord = useMemo(() => {
    const record: Record<string, any> = {};
    supportedLocales.forEach(locale => {
      record[locale.code] = {};
    });

    translations.forEach(trans => {
      if (record[trans.locale]) {
        record[trans.locale] = {
          title: trans.title,
          slug: trans.slug,
          content: trans.content,
          excerpt: trans.excerpt,
          metaTitle: trans.metaTitle,
          metaDescription: trans.metaDescription,
          metaKeywords: trans.metaKeywords,
        };
      }
    });

    return record;
  }, [translations, supportedLocales]);

  const handleTranslationsChange = (updatedRecord: Record<string, any>) => {
    const newTranslationsArray: TranslationData[] = [];

    Object.entries(updatedRecord).forEach(([locale, values]) => {
      // Only include if there is at least one field filled to avoid empty translation entries
      const hasContent = Object.values(values).some(val => val && String(val).trim() !== '');

      if (hasContent) {
        newTranslationsArray.push({
          locale,
          title: values.title || '',
          slug: values.slug || '',
          content: values.content || '',
          excerpt: values.excerpt || '',
          metaTitle: values.metaTitle || '',
          metaDescription: values.metaDescription || '',
          metaKeywords: values.metaKeywords || '',
        });
      }
    });

    onTranslationsChange(newTranslationsArray);
  };

  if (languagesLoading) {
    return <div>{t('common.loading')}</div>;
  }

  if (supportedLocales.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-6">
      <TranslationTabs
        translations={translationsRecord}
        onTranslationsChange={handleTranslationsChange}
        supportedLocales={supportedLocales}
        fields={[
          {
            name: 'title',
            label: t('posts.title'),
            value: '',
            onChange: () => { },
            type: 'text',
            placeholder: t('form.placeholders.enter_title'),
            required: true,
            disabled: readonly,
          },
          {
            name: 'slug',
            label: t('posts.slug'),
            value: '',
            onChange: () => { },
            type: 'text',
            placeholder: t('posts.slugPlaceholder'),
            required: true,
            description: t('posts.slugRequirements'),
            disabled: readonly,
          },
          {
            name: 'excerpt',
            label: t('posts.shortDescription'),
            value: '',
            onChange: () => { },
            type: 'textarea',
            placeholder: t('posts.shortDescriptionPlaceholder'),
            required: false,
            rows: 3,
            validation: { maxLength: 500 },
            disabled: readonly,
          },
          {
            name: 'content',
            label: t('posts.description'),
            value: '',
            onChange: () => { },
            type: 'richtext',
            placeholder: t('posts.contentPlaceholder'),
            required: true,
            minHeight: '500px',
            disabled: readonly,
          },
          {
            name: 'metaTitle',
            label: t('posts.metaTitle'),
            value: '',
            onChange: () => { },
            type: 'text',
            placeholder: t('posts.metaTitlePlaceholder'),
            required: false,
            validation: { maxLength: 60 },
            disabled: readonly,
          },
          {
            name: 'metaDescription',
            label: t('posts.metaDescription'),
            value: '',
            onChange: () => { },
            type: 'textarea',
            placeholder: t('posts.metaDescriptionPlaceholder'),
            required: false,
            rows: 3,
            validation: { maxLength: 160 },
            disabled: readonly,
          },
          {
            name: 'metaKeywords',
            label: t('posts.metaKeywords'),
            value: '',
            onChange: () => { },
            type: 'text',
            placeholder: t('posts.metaKeywordsPlaceholder'),
            required: false,
            description: t('form.descriptions.meta_keywords_description', 'Separate keywords with commas'),
            disabled: readonly,
          },
        ]}
      />
    </div>
  );
};

export default TranslationsSection;