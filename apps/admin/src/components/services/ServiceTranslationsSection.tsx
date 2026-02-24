import React, { useMemo } from 'react';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import { useLanguageOptions } from '@admin/hooks/useLanguages';
import { TranslationTabs } from '@admin/components/common/TranslationTabs';
import { generateSlug } from '@admin/utils/slugUtils';

export interface ServiceTranslationData {
    locale: string;
    name: string;
    slug?: string;
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
                    slug: trans.slug,
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
                const normalizedName = (values.name || '').trim();
                const normalizedSlug = (values.slug || '').trim();
                const autoSlug = normalizedSlug || (normalizedName ? generateSlug(normalizedName) : '');

                newTranslationsArray.push({
                    locale,
                    name: values.name || '',
                    slug: autoSlug || undefined,
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
                        aiGenerator: {
                            entityType: 'product',
                            contentType: 'title',
                            sourceFieldName: 'content',
                        },
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
                        aiGenerator: {
                            entityType: 'product',
                            contentType: 'description',
                            sourceFieldName: 'name',
                            allowImages: false,
                            allowProductLinks: false,
                            allowLengthOptions: false,
                            allowStyleOptions: false,
                            plainTextOutput: true,
                        },
                    },
                    {
                        name: 'slug',
                        label: t('services.slug', 'Slug'),
                        value: '',
                        onChange: () => { },
                        type: 'text',
                        placeholder: t('services.slug_placeholder', 'service-slug'),
                        required: false,
                        description: t('services.slug_description', 'URL-friendly identifier'),
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
                        aiGenerator: {
                            entityType: 'product',
                            contentType: 'description',
                            sourceFieldName: 'name',
                        },
                    },
                ]}
            />
        </div>
    );
};
