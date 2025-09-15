import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Card } from './Card';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';

interface TranslationField {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'textarea' | 'slug';
  placeholder?: string;
  required?: boolean;
  rows?: number;
  validation?: {
    maxLength?: number;
    minLength?: number;
  };
  description?: string;
}

interface TranslationTabsProps {
  translations: Record<string, Record<string, string>>;
  onTranslationsChange: (translations: Record<string, Record<string, string>>) => void;
  fields: TranslationField[];
  entityName?: string; // Name of the entity being translated (e.g., "Color Attribute")
  supportedLocales?: Array<{
    code: string;
    name: string;
    flag?: string;
  }>;
}

const DEFAULT_LOCALES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
];

export const TranslationTabs: React.FC<TranslationTabsProps> = ({
  translations,
  onTranslationsChange,
  fields,
  entityName,
  supportedLocales = DEFAULT_LOCALES,
}) => {
  const { t } = useTranslationWithBackend();
  const [activeLocale, setActiveLocale] = useState(supportedLocales[0].code);

  const handleTranslationChange = (locale: string, field: string, value: string) => {
    const updatedTranslations = {
      ...translations,
      [locale]: {
        ...translations[locale],
        [field]: value,
      },
    };
    onTranslationsChange(updatedTranslations);
  };

  const getFieldValue = (locale: string, fieldName: string): string => {
    return translations[locale]?.[fieldName] || '';
  };

  return (
    <div className="space-y-4">
      {/* Language Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
        {supportedLocales.map((locale) => (
          <Button
            key={locale.code}
            type="button"
            variant={activeLocale === locale.code ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveLocale(locale.code)}
            className="rounded-b-none border-b-2 border-transparent data-[active=true]:border-primary-500"
            data-active={activeLocale === locale.code}
          >
            <span className="mr-2">{locale.flag}</span>
            {locale.name}
          </Button>
        ))}
      </div>

      {/* Translation Fields */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {entityName ? t('translations.fieldsFor', { name: entityName }) : t('translations.translationFor', { language: supportedLocales.find(l => l.code === activeLocale)?.name || activeLocale })}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {activeLocale.toUpperCase()}
            </span>
          </div>
          
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <label className="text-sm font-medium">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {field.type === 'textarea' ? (
                <textarea
                  value={getFieldValue(activeLocale, field.name)}
                  onChange={(e) => handleTranslationChange(activeLocale, field.name, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  rows={field.rows || 3}
                  maxLength={field.validation?.maxLength}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              ) : (
                <Input
                  value={getFieldValue(activeLocale, field.name)}
                  onChange={(e) => handleTranslationChange(activeLocale, field.name, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  maxLength={field.validation?.maxLength}
                />
              )}
              
              {field.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {field.description}
                </p>
              )}
              
              {field.validation?.maxLength && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {getFieldValue(activeLocale, field.name).length}/{field.validation.maxLength} characters
                </p>
              )}
            </div>
          ))}

          {Object.keys(translations[activeLocale] || {}).length === 0 && (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              <p className="text-sm">
                {t('translations.noTranslations', 'No translations available for this language yet.')}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};