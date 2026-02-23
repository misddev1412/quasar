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

const serviceSchema = z.object({
    // General (EN default)
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    content: z.string().optional(),

    // Settings
    unitPrice: z.coerce.number().min(0),
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

    const primaryLanguage = languageOptions.find(option => option.isDefault)?.value || 'en';

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
            price: item?.price !== undefined && item?.price !== null && item?.price !== ''
                ? Number(item.price)
                : undefined,
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
            unitPrice: Number(data.unitPrice ?? 0),
            currencyId: data.currencyId || undefined,
            items: normalizedItems,
            additionalTranslations,
            // Prepare translations for backend
            translations: [
                {
                    locale: data.languageCode || 'en',
                    name: data.name,
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
        languageCode: 'en',
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
