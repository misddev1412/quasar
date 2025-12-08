import React, { useState, useCallback } from 'react';
import { Control, useFieldArray, UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { FiPlus, FiTrash2, FiFileText, FiGlobe } from 'react-icons/fi';
import { Card } from '../common/Card';
import { FormInput } from '../common/FormInput';
import { TextareaInput } from '../common/TextareaInput';
import { Button } from '../common/Button';
import Tabs from '../common/Tabs';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';

interface Translation {
  locale: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

interface PostTranslationEditorProps {
  control: Control<any>;
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  defaultLocale?: string;
}

export const PostTranslationEditor: React.FC<PostTranslationEditorProps> = ({
  control,
  register,
  errors,
  setValue,
  watch,
  defaultLocale = 'en',
}) => {
  const { t } = useTranslationWithBackend();
  const [activeTab, setActiveTab] = useState(0);

  const { fields: translationFields, append: appendTranslation, remove: removeTranslation } = useFieldArray({
    control,
    name: 'translations',
  });

  // Generate slug from title
  const generateSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }, []);

  // Handle title change to auto-generate slug
  const handleTitleChange = useCallback((index: number, title: string) => {
    const currentSlug = watch(`translations.${index}.slug`);
    if (!currentSlug) {
      setValue(`translations.${index}.slug`, generateSlug(title));
    }
  }, [generateSlug, setValue, watch]);

  // Add new translation
  const addTranslation = useCallback(() => {
    appendTranslation({
      locale: '',
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
    });
  }, [appendTranslation]);

  // Find default language translation (first one or the one matching defaultLocale)
  const defaultTranslationIndex = translationFields.findIndex(
    (field, index) => watch(`translations.${index}.locale`) === defaultLocale
  );
  const actualDefaultIndex = defaultTranslationIndex >= 0 ? defaultTranslationIndex : 0;

  // Get additional translations (excluding the default one)
  const additionalTranslations = translationFields.filter(
    (field, index) => index !== actualDefaultIndex
  );

  return (
    <Tabs
      activeTab={activeTab}
      onTabChange={setActiveTab}
      tabs={[
        {
          label: t('posts.general'),
          icon: <FiFileText className="w-4 h-4" />,
          content: (
            <div className="space-y-6">
              {/* General Content (Default Language) */}
              <Card>
                <div className="p-6 space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('posts.content')} ({defaultLocale.toUpperCase()})
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <FormInput
                        id={`title-${actualDefaultIndex}`}
                        type="text"
                        label={t('posts.title')}
                        {...register(`translations.${actualDefaultIndex}.title`)}
                        error={errors.translations?.[actualDefaultIndex]?.title?.message}
                        onChange={(e) => {
                          handleTitleChange(actualDefaultIndex, e.target.value);
                        }}
                        required
                      />
                    </div>
                    <div>
                      <FormInput
                        id={`slug-${actualDefaultIndex}`}
                        type="text"
                        label={t('posts.slug')}
                        {...register(`translations.${actualDefaultIndex}.slug`)}
                        error={errors.translations?.[actualDefaultIndex]?.slug?.message}
                        placeholder="post-slug"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <TextareaInput
                      id={`excerpt-${actualDefaultIndex}`}
                      label={t('posts.shortDescription')}
                      {...register(`translations.${actualDefaultIndex}.excerpt`)}
                      error={errors.translations?.[actualDefaultIndex]?.excerpt?.message}
                      rows={3}
                      placeholder={t('posts.shortDescriptionPlaceholder')}
                    />
                  </div>

                  <div>
                    <TextareaInput
                      id={`content-${actualDefaultIndex}`}
                      label={t('posts.description')}
                      {...register(`translations.${actualDefaultIndex}.content`)}
                      error={errors.translations?.[actualDefaultIndex]?.content?.message}
                      rows={8}
                      placeholder={t('posts.contentPlaceholder')}
                      required
                    />
                  </div>

                  {/* Hidden locale field for default language */}
                  <input
                    type="hidden"
                    {...register(`translations.${actualDefaultIndex}.locale`)}
                    value={defaultLocale}
                  />
                </div>
              </Card>
            </div>
          ),
        },
        {
          label: t('posts.translations'),
          icon: <FiGlobe className="w-4 h-4" />,
          content: (
            <div className="space-y-6">
              {/* Additional Language Translations */}
              <Card>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t('posts.additionalLanguages')}
                    </h2>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTranslation}
                      className="flex items-center"
                    >
                      <FiPlus className="w-4 h-4 mr-2" />
                      {t('posts.addLanguage')}
                    </Button>
                  </div>

                  {additionalTranslations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <FiGlobe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">
                        {t('posts.noAdditionalLanguages')}
                      </p>
                      <p className="text-sm">
                        {t('posts.noAdditionalLanguagesDescription')}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addTranslation}
                        className="mt-4"
                      >
                        <FiPlus className="w-4 h-4 mr-2" />
                        {t('posts.addFirstLanguage')}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {translationFields.map((field, index) => {
                        // Skip the default language translation
                        if (index === actualDefaultIndex) return null;

                        return (
                          <div key={field.id} className="border rounded-lg p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {t('posts.languageTranslation')} {watch(`translations.${index}.locale`)?.toUpperCase() || `#${index + 1}`}
                              </h3>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTranslation(index)}
                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <FormInput
                                  id={`locale-${index}`}
                                  type="text"
                                  label={t('posts.locale')}
                                  {...register(`translations.${index}.locale`)}
                                  error={errors.translations?.[index]?.locale?.message}
                                  placeholder="vi, fr, es, etc."
                                  required
                                />
                              </div>
                              <div>
                                <FormInput
                                  id={`title-${index}`}
                                  type="text"
                                  label={t('posts.title')}
                                  {...register(`translations.${index}.title`)}
                                  error={errors.translations?.[index]?.title?.message}
                                  onChange={(e) => {
                                    handleTitleChange(index, e.target.value);
                                  }}
                                  required
                                />
                              </div>
                            </div>

                            <div>
                              <FormInput
                                id={`slug-${index}`}
                                type="text"
                                label={t('posts.slug')}
                                {...register(`translations.${index}.slug`)}
                                error={errors.translations?.[index]?.slug?.message}
                                placeholder="post-slug"
                                required
                              />
                            </div>

                            <div>
                              <TextareaInput
                                id={`excerpt-${index}`}
                                label={t('posts.shortDescription')}
                                {...register(`translations.${index}.excerpt`)}
                                error={errors.translations?.[index]?.excerpt?.message}
                                rows={3}
                                placeholder={t('posts.shortDescriptionPlaceholder')}
                              />
                            </div>

                            <div>
                              <TextareaInput
                                id={`content-${index}`}
                                label={t('posts.description')}
                                {...register(`translations.${index}.content`)}
                                error={errors.translations?.[index]?.content?.message}
                                rows={8}
                                placeholder={t('posts.contentPlaceholder')}
                                required
                              />
                            </div>

                            {/* SEO Meta Fields */}
                            <div className="border-t pt-4">
                              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                                {t('posts.seoMeta')}
                              </h4>
                              <div className="space-y-4">
                                <FormInput
                                  id={`meta-title-${index}`}
                                  type="text"
                                  label={t('posts.metaTitle')}
                                  {...register(`translations.${index}.metaTitle`)}
                                  error={errors.translations?.[index]?.metaTitle?.message}
                                  placeholder={t('posts.metaTitlePlaceholder')}
                                />
                                
                                <TextareaInput
                                  id={`meta-description-${index}`}
                                  label={t('posts.metaDescription')}
                                  {...register(`translations.${index}.metaDescription`)}
                                  error={errors.translations?.[index]?.metaDescription?.message}
                                  rows={3}
                                  placeholder={t('posts.metaDescriptionPlaceholder')}
                                />
                                
                                <FormInput
                                  id={`meta-keywords-${index}`}
                                  type="text"
                                  label={t('posts.metaKeywords')}
                                  {...register(`translations.${index}.metaKeywords`)}
                                  error={errors.translations?.[index]?.metaKeywords?.message}
                                  placeholder={t('posts.metaKeywordsPlaceholder')}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          ),
        },
      ]}
    />
  );
};