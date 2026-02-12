import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Package } from 'lucide-react';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import { trpc } from '@admin/services/api';
import { StandardFormPage } from '@admin/components/common';
import ProductBundleForm from '@admin/pages/product-bundles/ProductBundleForm';
import toast from 'react-hot-toast';
import type { ProductBundle, ProductBundleFormInput } from '@admin/types/product-bundle';

const ProductBundleEditPage: React.FC = () => {
    const { t } = useTranslationWithBackend();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const productBundlesApi = (trpc as unknown as Record<string, unknown>).productBundles as {
        get: {
            useQuery: (input: { id?: string }, options: { enabled: boolean }) => {
                data?: ProductBundle;
                isLoading: boolean;
                error?: { message?: string };
            };
        };
        update: {
            useMutation: (options: {
                onSuccess: () => void;
                onError: (error: { message?: string }) => void;
            }) => {
                mutateAsync: (input: { id: string; data: ProductBundleFormInput }) => Promise<void>;
                isLoading: boolean;
            };
        };
    };

    const { data: bundle, isLoading: isFetching, error } = productBundlesApi.get.useQuery(
        { id },
        { enabled: !!id }
    );

    const updateMutation = productBundlesApi.update.useMutation({
        onSuccess: () => {
            toast.success(t('common.updateSuccess', 'Updated successfully'));
            navigate('/product-bundles');
        },
        onError: (error: { message?: string }) => {
            toast.error(error.message);
        }
    });

    const handleSubmit = async (data: ProductBundleFormInput) => {
        if (id) {
            await updateMutation.mutateAsync({ id, data });
        }
    };

    const handleCancel = () => {
        navigate('/product-bundles');
    };

    // Transform data to match form structure
    const initialValues = bundle ? {
        ...bundle,
        items: bundle.items.map((item) => ({
            ...item,
            categoryIds: item.categories?.map((c) => c.id) || [],
            productIds: item.products?.map((p) => p.id) || []
        }))
    } : undefined;

    const formId = 'product-bundle-edit-form';

    return (
        <StandardFormPage
            title={t('product_bundles.edit_title', 'Edit Product Bundle')}
            description={t('product_bundles.edit_description', 'Update product bundle details and configuration.')}
            icon={<Package className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
            entityName={t('product_bundles.entity_name', 'Product Bundle')}
            entityNamePlural={t('product_bundles.title', 'Product Bundles')}
            backUrl="/product-bundles"
            onBack={handleCancel}
            mode="update"
            isLoading={isFetching}
            error={error}
            isSubmitting={updateMutation.isLoading}
            entityData={bundle}
            formId={formId}
            breadcrumbs={[
                { label: t('product_bundles.title', 'Product Bundles'), onClick: handleCancel },
                { label: bundle?.name || t('common.edit', 'Edit') }
            ]}
        >
            <ProductBundleForm
                initialValues={initialValues}
                onSubmit={handleSubmit}
                isLoading={updateMutation.isLoading}
                onCancel={handleCancel}
                showActions={false}
                formId={formId}
            />
        </StandardFormPage>
    );
};

export default ProductBundleEditPage;
