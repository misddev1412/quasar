import React, { useState, useRef } from 'react';
import { z } from 'zod';
import { FileText, Globe, DollarSign, List, Image } from 'lucide-react';
import { EntityForm } from '../common/EntityForm';
import { FormTabConfig, FormSubmitAction } from '../../types/forms';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useLanguageOptions } from '../../hooks/useLanguages';
import { ServiceTranslationsSection } from './ServiceTranslationsSection';
import { ServiceItemsEditor } from './ServiceItemsEditor';

const serviceSchema = z.object({
    // General (EN default)
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    content: z.string().optional(),

    // Settings
    unitPrice: z.number().min(0),
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
}

export const ServiceForm: React.FC<ServiceFormProps> = ({
    initialValues,
    onSubmit,
    onCancel,
    isSubmitting,
    mode = 'create',
    activeTab,
    onTabChange,
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
                        },
                        {
                            name: 'description',
                            label: t('services.description', 'Short Description'),
                            type: 'textarea',
                            rows: 3,
                        },
                        {
                            name: 'content',
                            label: t('services.content', 'Full Content'),
                            type: 'richtext',
                            minHeight: '500px',
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
        // Merge state
        const submissionData = {
            ...data,
            items,
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
            ]
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
        />
    );
};
