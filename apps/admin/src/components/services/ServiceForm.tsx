import React, { useState, useRef } from 'react';
import { z } from 'zod';
import { FileText, Globe, DollarSign, List } from 'lucide-react';
import { EntityForm } from '@admin/components/common/EntityForm';
import { FormAIGenerator } from '@admin/components/common/FormAIGenerator';
import { FormTabConfig, FormSubmitAction } from '@admin/types/forms';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import { useLanguageOptions } from '@admin/hooks/useLanguages';
import { ServiceTranslationsSection } from '@admin/components/services/ServiceTranslationsSection';
import { ServiceItemsEditor } from '@admin/components/services/ServiceItemsEditor';

const parseLocalizedNumber = (value: unknown): number => {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return Number(value);

    const normalized = value.trim().replace(/\s+/g, '');
    if (!normalized) return NaN;

    const hasComma = normalized.includes(',');
    const hasDot = normalized.includes('.');

    if (hasComma && hasDot) {
        const lastComma = normalized.lastIndexOf(',');
        const lastDot = normalized.lastIndexOf('.');
        const decimalSep = lastComma > lastDot ? ',' : '.';
        const thousandSep = decimalSep === ',' ? '.' : ',';
        const withoutThousands = normalized.replace(new RegExp(`\\${thousandSep}`, 'g'), '');
        const normalizedDecimal = decimalSep === ','
            ? withoutThousands.replace(',', '.')
            : withoutThousands;
        return Number(normalizedDecimal);
    }

    if (hasComma) {
        const commaCount = (normalized.match(/,/g) || []).length;
        if (commaCount > 1) return Number(normalized.replace(/,/g, ''));
        return /^\d{1,3},\d{3}$/.test(normalized)
            ? Number(normalized.replace(',', ''))
            : Number(normalized.replace(',', '.'));
    }

    if (hasDot) {
        const dotCount = (normalized.match(/\./g) || []).length;
        if (dotCount > 1) return Number(normalized.replace(/\./g, ''));
    }

    return Number(normalized);
};

const serviceSchema = z.object({
    // General (system default)
    name: z.string().min(1, 'Name is required'),
    slug: z.string().optional(),
    description: z.string().optional(),
    content: z.string().optional(),

    // Settings
    unitPrice: z.preprocess((value) => parseLocalizedNumber(value), z.number().min(0)),
    isContactPrice: z.boolean(),
    isActive: z.boolean(),
    thumbnail: z.string().optional(),
    currencyId: z.string().optional().nullable(),

    // Language
    languageCode: z.string().min(1),

    // Items
    items: z.array(z.any()).optional(), // Handled by custom editor

    // Translations
    additionalTranslations: z.array(z.any()).optional(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

export interface ServiceFormSubmitOptions {
    submitAction?: FormSubmitAction;
}

interface ServiceFormProps {
    initialValues?: Partial<ServiceFormData>;
    onSubmit: (data: any, options?: ServiceFormSubmitOptions) => Promise<void>;
    onCancel: () => void;
    isSubmitting?: boolean;
    mode?: 'create' | 'edit';
    activeTab?: number;
    onTabChange?: (index: number) => void;
    showActions?: boolean;
    formId?: string;
}

export const ServiceForm: React.FC<ServiceFormProps> = ({
    initialValues,
    onSubmit,
    onCancel,
    isSubmitting,
    mode = 'create',
    activeTab,
    onTabChange,
    showActions = true,
    formId,
}) => {
    const { t } = useTranslationWithBackend();
    const { languageOptions } = useLanguageOptions();
    const submitActionRef = useRef<FormSubmitAction>('save');

    // State for translations
    const [additionalTranslations, setAdditionalTranslations] = useState<any[]>(initialValues?.additionalTranslations || []);

    // State for items
    const [items, setItems] = useState<any[]>(initialValues?.items || []);

    const primaryLanguage = languageOptions.find(option => option.isDefault)?.value || languageOptions[0]?.value || 'vi';

    const tabs: FormTabConfig[] = [
        {
            id: 'general',
            label: t('services.general', 'General'),
            icon: <FileText className="w-4 h-4" />,
            sections: [
                {
                    title: t('services.basic_info', 'Basic Information'),
                    description: t('services.basic_info_desc', 'Basic details about the service'),
                    icon: <FileText className="w-5 h-5 text-primary-600" />,
                    fields: [
                        {
                            name: 'languageCode',
                            label: t('common.language', 'Language'),
                            type: 'select',
                            required: true,
                            options: languageOptions.map(l => ({ label: l.label, value: l.value })),
                            description: t('services.language_desc', 'Primary language for this service'),
                            disabled: mode === 'edit', // Often safer to lock primary language on edit or handle carefully
                        },
                        {
                            name: 'name',
                            label: t('services.name', 'Service Name'),
                            type: 'text',
                            required: true,
                            placeholder: t('services.name_placeholder', 'e.g. Premium Cleaning'),
                            rightElement: (
                                <FormAIGenerator
                                    targetFieldName="name"
                                    sourceFieldName="content"
                                    targetLabel={t('services.name', 'Service Name')}
                                    sourceLabel={t('services.content', 'Full Content')}
                                    entityType="product"
                                    contentType="title"
                                />
                            ),
                            rightElementPosition: 'inside-input',
                        },
                        {
                            name: 'slug',
                            label: t('services.slug', 'Slug'),
                            type: 'slug',
                            sourceField: 'name',
                            placeholder: t('services.slug_placeholder', 'service-slug'),
                            description: t('services.slug_description', 'URL-friendly identifier'),
                        },
                        {
                            name: 'description',
                            label: t('services.description', 'Short Description'),
                            type: 'textarea',
                            rows: 3,
                            rightElement: (
                                <FormAIGenerator
                                    targetFieldName="description"
                                    sourceFieldName="name"
                                    targetLabel={t('services.description', 'Short Description')}
                                    sourceLabel={t('services.name', 'Service Name')}
                                    entityType="product"
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
                            label: t('services.content', 'Full Content'),
                            type: 'richtext',
                            minHeight: '500px',
                            rightElement: (
                                <FormAIGenerator
                                    targetFieldName="content"
                                    sourceFieldName="name"
                                    targetLabel={t('services.content', 'Full Content')}
                                    sourceLabel={t('services.name', 'Service Name')}
                                    entityType="product"
                                    contentType="description"
                                />
                            ),
                        },
                        {
                            name: 'isActive',
                            label: t('common.active', 'Active'),
                            type: 'checkbox',
                        }
                    ],
                },
                {
                    title: t('services.pricing_media', 'Pricing & Media'),
                    icon: <DollarSign className="w-5 h-5" />,
                    fields: [
                        {
                            name: 'unitPrice',
                            label: t('services.price', 'Unit Price'),
                            type: 'number',
                            min: 0,
                        },
                        {
                            name: 'isContactPrice',
                            label: t('services.contact_price', 'Contact for Price'),
                            type: 'checkbox',
                            description: t('services.contact_price_desc', 'Hide price and show "Contact us" instead'),
                        },
                        {
                            name: 'thumbnail',
                            label: t('services.thumbnail', 'Thumbnail'),
                            type: 'media-upload',
                            accept: 'image/*',
                            rightElement: (
                                <FormAIGenerator
                                    targetFieldName="thumbnail"
                                    sourceFieldName="name"
                                    targetLabel={t('services.thumbnail', 'Thumbnail')}
                                    sourceLabel={t('services.name', 'Service Name')}
                                    entityType="product"
                                    contentType="image"
                                    allowLengthOptions={false}
                                    allowProductLinks={false}
                                    allowStyleOptions={false}
                                />
                            ),
                        }
                    ]
                }
            ],
        },
        {
            id: 'items',
            label: t('services.items', 'Service Items'),
            icon: <List className="w-4 h-4" />,
            sections: [
                {
                    title: t('services.items_list', 'Items List'),
                    description: t('services.items_desc', 'Add sub-items or variants included in this service'),
                    icon: <List className="w-5 h-5" />,
                    fields: [
                        {
                            name: 'items',
                            label: '',
                            type: 'custom',
                            component: (
                                <ServiceItemsEditor
                                    items={items}
                                    onChange={setItems}
                                />
                            )
                        }
                    ]
                }
            ]
        },
        {
            id: 'translations',
            label: t('common.translations', 'Translations'),
            icon: <Globe className="w-4 h-4" />,
            sections: [
                {
                    title: t('common.translations', 'Translations'),
                    description: t('common.translations_desc', 'Manage content in other languages'),
                    icon: <Globe className="w-5 h-5" />,
                    fields: [
                        {
                            name: 'additionalTranslations',
                            label: '',
                            type: 'custom',
                            component: (
                                <ServiceTranslationsSection
                                    translations={additionalTranslations}
                                    onTranslationsChange={setAdditionalTranslations}
                                    primaryLanguage={primaryLanguage}
                                />
                            )
                        }
                    ]
                }
            ]
        }
    ];

    const handleFormSubmit = async (data: any) => {
        const normalizedItems = (items || []).map((item: any, index: number) => ({
            ...item,
            price: (() => {
                if (item?.price === undefined || item?.price === null || item?.price === '') return undefined;
                const parsed = parseLocalizedNumber(item.price);
                return Number.isFinite(parsed) ? parsed : undefined;
            })(),
            sortOrder: item?.sortOrder !== undefined && item?.sortOrder !== null && item?.sortOrder !== ''
                ? Number(item.sortOrder)
                : index,
            translations: Array.isArray(item?.translations)
                ? item.translations.map((tr: any) => ({
                    locale: tr?.locale || '',
                    name: tr?.name || '',
                    description: tr?.description || '',
                })).filter((tr: any) => tr.locale && tr.locale.length >= 2)
                : [],
        }));

        // Merge state
        const submissionData = {
            ...data,
            unitPrice: parseLocalizedNumber(data.unitPrice ?? 0),
            currencyId: data.currencyId || undefined,
            items: normalizedItems,
            additionalTranslations,
            // Prepare translations for backend
            translations: [
                {
                    locale: data.languageCode || primaryLanguage,
                    name: data.name,
                    slug: typeof data.slug === 'string' && data.slug.trim().length > 0 ? data.slug.trim() : undefined,
                    description: data.description,
                    content: data.content
                },
                ...additionalTranslations
            ].filter((tr: any) => tr?.locale && String(tr.locale).length >= 2)
        };

        // Pass the current submit action from the ref (which EntityForm updates)
        await onSubmit(submissionData, { submitAction: submitActionRef.current });
    };

    const defaultValues: any = {
        unitPrice: 0,
        isContactPrice: false,
        isActive: true,
        items: [],
        additionalTranslations: [],
        languageCode: primaryLanguage,
        ...initialValues
    };

    return (
        <EntityForm
            tabs={tabs}
            initialValues={defaultValues}
            validationSchema={serviceSchema}
            onSubmit={handleFormSubmit}
            onCancel={onCancel}
            isSubmitting={isSubmitting}
            mode={mode}
            activeTab={activeTab}
            onTabChange={onTabChange}
            showSaveAndStay={true}
            showActions={showActions}
            formId={formId}
        />
    );
};
