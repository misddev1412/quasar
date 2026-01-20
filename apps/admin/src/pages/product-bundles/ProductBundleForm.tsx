import React from 'react';
import { z } from 'zod';
import { Package, Layers, Settings } from 'lucide-react';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { EntityForm } from '../../components/common/EntityForm';
import { FormTabConfig } from '../../types/forms';
import { ProductBundleItemsEditor } from './ProductBundleItemsEditor';

// Define Validation Schema
const productBundleSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    slug: z.string().optional(),
    description: z.string().optional(),
    isActive: z.boolean().default(true),
    items: z.array(z.object({
        label: z.string().min(1, 'Label is required'),
        mode: z.enum(['category', 'product']),
        categoryIds: z.array(z.string()).optional(),
        productIds: z.array(z.string()).optional(),
    })).optional(),
});

type ProductBundleFormData = z.infer<typeof productBundleSchema>;

interface ProductBundleFormProps {
    initialValues?: Partial<ProductBundleFormData>;
    onSubmit: (data: ProductBundleFormData) => Promise<void>;
    isLoading: boolean;
    onCancel?: () => void;
    activeTab?: number;
    onTabChange?: (tabIndex: number) => void;
}

const ProductBundleForm: React.FC<ProductBundleFormProps> = ({
    initialValues,
    onSubmit,
    isLoading,
    onCancel,
    activeTab,
    onTabChange,
}) => {
    const { t } = useTranslationWithBackend();

    const tabs: FormTabConfig[] = [
        {
            id: 'general',
            label: t('common.general_info', 'General Info'),
            icon: <Package className="w-4 h-4" />,
            sections: [
                {
                    title: t('common.general_info', 'General Information'),
                    description: t('product_bundles.general_desc', 'Basic details about this bundle'),
                    icon: <Package className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
                    fields: [
                        {
                            name: 'name',
                            label: t('common.name', 'Name'),
                            type: 'text',
                            required: true,
                            placeholder: t('common.name_placeholder', 'e.g. Creator PC Build'),
                        },
                        {
                            name: 'slug',
                            label: t('common.slug', 'Slug'),
                            type: 'slug',
                            sourceField: 'name',
                            required: false,
                            placeholder: t('common.slug_auto', 'Auto-generated if empty'),
                        },
                        {
                            name: 'description',
                            label: t('common.description', 'Description'),
                            type: 'textarea',
                            required: false,
                            rows: 4,
                            placeholder: t('common.description_placeholder', 'Describe this bundle...'),
                        },
                        {
                            name: 'isActive',
                            label: t('common.isActive', 'Is Active'),
                            type: 'checkbox',
                            required: false,
                        }
                    ],
                },
            ],
        },
        {
            id: 'items',
            label: t('product_bundles.items', 'Bundle Items'),
            icon: <Layers className="w-4 h-4" />,
            sections: [
                {
                    title: t('product_bundles.items', 'Bundle Configuration'),
                    description: t('product_bundles.items_desc', 'Define the steps or components for this bundle'),
                    icon: <Layers className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
                    fields: [], // Custom content handles fields
                    customContent: (
                        // We access the form context inside the custom content via EntityForm's context if needed,
                        // or better, we pass a component that uses useFormContext.
                        // However, EntityForm renders customContent directly.
                        // Let's create a wrapper or just render the editor here.
                        // Since EntityForm passes nothing to customContent, we rely on useFormContext inside the component
                        // OR we need to accept control/register from props if we were inside the render loop.
                        // BUT `ProductBundleItemsEditor` expects props.
                        // `EntityForm` exposes `methods` via `useEntityForm` hook internally but doesn't expose it to `tabs` configuration easily unless we wrap.
                        // A better approach with the current generic EntityForm is to have `ProductBundleItemsEditor` use `useFormContext`.
                        // I will update ProductBundleItemsEditor to use useFormContext instead of props.
                        <ConnectedProductBundleItemsEditor />
                    ),
                },
            ],
        },
    ];

    return (
        <EntityForm
            tabs={tabs}
            initialValues={initialValues}
            onSubmit={onSubmit}
            onCancel={onCancel}
            isSubmitting={isLoading}
            validationSchema={productBundleSchema}
            mode={initialValues ? 'edit' : 'create'}
            activeTab={activeTab}
            onTabChange={onTabChange}
        />
    );
};

// Wrapper to connect to React Hook Form Context
import { useFormContext } from 'react-hook-form';

const ConnectedProductBundleItemsEditor = () => {
    return <ProductBundleItemsEditor />;
};

export default ProductBundleForm;
