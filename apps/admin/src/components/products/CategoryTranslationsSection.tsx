import React, { useState } from 'react';
import { Plus, Trash2, Globe } from 'lucide-react';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import { FormInput } from '../common/FormInput';
import { TextareaInput } from '../common/TextareaInput';
import { Card } from '../common/Card';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useLanguageOptions } from '../../hooks/useLanguages';
import { generateSlug } from '../../utils/slugUtils';

export interface CategoryTranslationData {
  locale: string;
  name: string;
  description?: string;
}

interface CategoryTranslationsSectionProps {
  translations: CategoryTranslationData[];
  onTranslationsChange: (translations: CategoryTranslationData[]) => void;
  primaryLanguage?: string;
}

export const CategoryTranslationsSection: React.FC<CategoryTranslationsSectionProps> = ({
  translations,
  onTranslationsChange,
  primaryLanguage,
}) => {
  const { t } = useTranslationWithBackend();
  const { languageOptions, isLoading: languagesLoading } = useLanguageOptions();

  const addTranslation = (locale: string) => {
    const newTranslation: CategoryTranslationData = {
      locale,
      name: '',
      description: '',
    };

    onTranslationsChange([...translations, newTranslation]);
  };

  const updateTranslation = (index: number, field: keyof CategoryTranslationData, value: string) => {
    const updatedTranslations = [...translations];
    updatedTranslations[index] = {
      ...updatedTranslations[index],
      [field]: value,
    };
    onTranslationsChange(updatedTranslations);
  };

  const removeTranslation = (index: number) => {
    const updatedTranslations = translations.filter((_, i) => i !== index);
    onTranslationsChange(updatedTranslations);
  };

  // Get available languages (excluding primary and already selected)
  const usedLocales = [primaryLanguage, ...translations.map(t => t.locale)].filter(Boolean);
  const availableLanguages = languageOptions.filter(lang => !usedLocales.includes(lang.value));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {t('categories.additional_translations', 'Additional Language Versions')}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('categories.additional_translations_description', 'Create versions of this category in other languages')}
          </p>
        </div>
        
        {availableLanguages.length > 0 && (
          <div className="flex items-center space-x-2">
            <Select
              value=""
              onChange={(locale) => {
                if (locale) {
                  addTranslation(locale);
                }
              }}
              options={[
                { value: '', label: t('categories.select_language', 'Select language...') },
                ...availableLanguages.map(lang => ({
                  value: lang.value,
                  label: lang.label,
                })),
              ]}
              placeholder={t('categories.add_translation', 'Add translation')}
              disabled={languagesLoading}
            />
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                if (availableLanguages.length > 0) {
                  addTranslation(availableLanguages[0].value);
                }
              }}
              disabled={availableLanguages.length === 0}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('categories.add_translation', 'Add Translation')}
            </Button>
          </div>
        )}
      </div>

      {/* Translations List */}
      {translations.length === 0 ? (
        <Card className="p-8">
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">
              {t('categories.no_additional_languages', 'No Additional Languages')}
            </p>
            <p className="text-sm">
              {t('categories.no_additional_languages_description', 'Add translations to make this category available in other languages.')}
            </p>
            {availableLanguages.length > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => addTranslation(availableLanguages[0].value)}
                className="mt-4 flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                {t('categories.add_first_translation', 'Add Your First Translation')}
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {translations.map((translation, index) => {
            const language = languageOptions.find(lang => lang.value === translation.locale);
            
            return (
              <Card key={`${translation.locale}-${index}`} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🌍</span>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {language?.label || translation.locale}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {translation.locale}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeTranslation(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Category Name */}
                  <FormInput
                    id={`category-name-${index}`}
                    type="text"
                    label={t('categories.name', 'Category Name')}
                    value={translation.name}
                    onChange={(e) => updateTranslation(index, 'name', e.target.value)}
                    placeholder={t('categories.name_placeholder', 'Enter category name')}
                    required
                  />

                  {/* Category Description */}
                  <TextareaInput
                    id={`category-description-${index}`}
                    label={t('categories.description', 'Description')}
                    value={translation.description || ''}
                    onChange={(e) => updateTranslation(index, 'description', e.target.value)}
                    placeholder={t('categories.description_placeholder', 'Enter category description')}
                    rows={3}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Footer note */}
      {availableLanguages.length === 0 && translations.length > 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          {t('categories.all_languages_added', 'All available languages have been added.')}
        </p>
      )}
    </div>
  );
};

export default CategoryTranslationsSection;