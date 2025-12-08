import React from 'react';
import { Globe, RefreshCw } from 'lucide-react';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useLanguageOptions } from '../../hooks/useLanguages';
import { TagInput } from '../common/TagInput';
import { generateSlug } from '../../utils/slugUtils';

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
}

export const TranslationsSection: React.FC<TranslationsSectionProps> = ({
  translations,
  onTranslationsChange,
  primaryLanguage,
}) => {
  const { t } = useTranslationWithBackend();
  const { languageOptions, isLoading: languagesLoading } = useLanguageOptions();

  const addTranslation = (locale: string) => {
    const newTranslation: TranslationData = {
      locale,
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
    };
    onTranslationsChange([...translations, newTranslation]);
  };

  const updateTranslation = (index: number, field: keyof TranslationData, value: string) => {
    const updated = [...translations];
    updated[index] = { ...updated[index], [field]: value };
    onTranslationsChange(updated);
  };

  const removeTranslation = (index: number) => {
    onTranslationsChange(translations.filter((_, i) => i !== index));
  };

  const availableLanguages = languageOptions.filter(lang => 
    lang.value !== primaryLanguage &&
    !translations.some(trans => trans.locale === lang.value)
  );

  return (
    <div className="w-full space-y-6">
      {/* Add Translation Section */}
      <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('posts.addTranslation')}
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          onChange={(e) => {
            if (e.target.value) {
              addTranslation(e.target.value);
              e.target.value = '';
            }
          }}
          disabled={languagesLoading}
        >
          <option value="">
            {languagesLoading ? t('common.loading') : t('posts.selectLanguageToAdd')}
          </option>
          {availableLanguages.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      {/* Existing Translations */}
      {translations.length > 0 ? (
        <div className="w-full space-y-4">
          {translations.map((translation, index) => {
            const langInfo = languageOptions.find(lang => lang.value === translation.locale);
            return (
              <div
                key={`${translation.locale}-${index}`}
                className="w-full border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              >
                {/* Translation Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🌐</span>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {langInfo?.label || translation.locale.toUpperCase()}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {translation.title || t('posts.untitledTranslation')}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTranslation(index)}
                    className="p-1 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400"
                    title={t('common.delete')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Translation Form */}
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('posts.title')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={translation.title}
                        onChange={(e) => updateTranslation(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder={t('form.placeholders.enter_title')}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('posts.slug')} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={translation.slug}
                          onChange={(e) => updateTranslation(index, 'slug', e.target.value)}
                          className="w-full px-3 py-2 pr-20 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="post-slug"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const autoSlug = generateSlug(translation.title);
                            updateTranslation(index, 'slug', autoSlug);
                          }}
                          disabled={!translation.title}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-primary-600 dark:text-gray-500 dark:hover:text-primary-400 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={t('posts.generateSlugFromTitle')}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('posts.shortDescription')}
                    </label>
                    <textarea
                      value={translation.excerpt || ''}
                      onChange={(e) => updateTranslation(index, 'excerpt', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder={t('posts.shortDescriptionPlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('posts.description')} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={translation.content}
                      onChange={(e) => updateTranslation(index, 'content', e.target.value)}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder={t('posts.contentPlaceholder')}
                      required
                    />
                  </div>

                  {/* Meta Fields */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                      {t('posts.seoMeta')}
                    </h5>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('posts.metaTitle')}
                        </label>
                        <input
                          type="text"
                          value={translation.metaTitle || ''}
                          onChange={(e) => updateTranslation(index, 'metaTitle', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder={t('posts.metaTitlePlaceholder')}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('posts.metaDescription')}
                        </label>
                        <textarea
                          value={translation.metaDescription || ''}
                          onChange={(e) => updateTranslation(index, 'metaDescription', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder={t('posts.metaDescriptionPlaceholder')}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('posts.metaKeywords')}
                        </label>
                        <TagInput
                          value={
                            typeof translation.metaKeywords === 'string' 
                              ? translation.metaKeywords.split(',').map(tag => tag.trim()).filter(Boolean)
                              : []
                          }
                          onChange={(tags) => {
                            updateTranslation(index, 'metaKeywords', tags.join(', '));
                          }}
                          placeholder={t('posts.metaKeywordsPlaceholder')}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t('posts.noTranslations')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {t('posts.addTranslationDescription')}
          </p>
        </div>
      )}
    </div>
  );
};

export default TranslationsSection;