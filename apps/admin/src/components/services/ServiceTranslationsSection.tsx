import React, { useMemo } from 'react';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useLanguageOptions } from '../../hooks/useLanguages';
import { TranslationTabs } from '../common/TranslationTabs';

export interface ServiceTranslationData {
    locale: string;
    name: string;
    description: string;
    content: string;
}

interface ServiceTranslationsSectionProps {
    translations: ServiceTranslationData[];
    onTranslationsChange: (translations: ServiceTranslationData[]) => void;
    primaryLanguage?: string;
    readonly?: boolean;
}

export const ServiceTranslationsSection: React.FC<ServiceTranslationsSectionProps> = ({
    translations,
    onTranslationsChange,
    primaryLanguage,
    readonly = false,
}) => {
    const { t } = useTranslationWithBackend();
    const { languageOptions, isLoading: languagesLoading } = useLanguageOptions();

    // Filter available languages to exclude primary language
    const supportedLocales = useMemo(() => {
        return languageOptions
            .filter(lang => lang.value !== primaryLanguage)
            .map(lang => ({
                code: lang.value,
                name: lang.label,
                flag: undefined
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
                    name: trans.name,
                    description: trans.description,
                    content: trans.content,
                };
            }
        });

        return record;
    }, [translations, supportedLocales]);

    const handleTranslationsChange = (updatedRecord: Record<string, any>) => {
        const newTranslationsArray: ServiceTranslationData[] = [];

        Object.entries(updatedRecord).forEach(([locale, values]) => {
            // Only include if there is at least one field filled
            const hasContent = Object.values(values).some(val => val && String(val).trim() !== '');

            if (hasContent) {
                newTranslationsArray.push({
                    locale,
                    name: values.name || '',
                    description: values.description || '',
                    content: values.content || '',
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
                        name: 'name',
                        label: t('services.name', 'Service Name'),
                        value: '',
                        onChange: () => { },
                        type: 'text',
                        placeholder: t('services.name_placeholder', 'e.g. Premium Cleaning'),
                        required: true,
                        disabled: readonly,
                    },
                    {
                        name: 'description',
                        label: t('services.description', 'Short Description'),
                        value: '',
                        onChange: () => { },
                        type: 'textarea',
                        placeholder: t('services.description_placeholder', 'Service summary'),
                        required: false,
                        rows: 3,
                        disabled: readonly,
                    },
                    {
                        name: 'content',
                        label: t('services.content', 'Full Content'),
                        value: '',
                        onChange: () => { },
                        type: 'richtext',
                        placeholder: t('services.content_placeholder', 'Detailed service description...'),
                        required: false,
                        minHeight: '500px',
                        disabled: readonly,
                    },
                ]}
            />
        </div>
    );
};
