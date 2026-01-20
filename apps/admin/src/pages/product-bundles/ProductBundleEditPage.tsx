import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Package } from 'lucide-react';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { trpc } from '../../services/api';
import { CreatePageTemplate } from '../../components/common/CreatePageTemplate';
import ProductBundleForm from './ProductBundleForm';
import toast from 'react-hot-toast';

const ProductBundleEditPage: React.FC = () => {
    const { t } = useTranslationWithBackend();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const { data: bundle, isLoading: isFetching, error } = (trpc as any).productBundles.get.useQuery(
        { id },
        { enabled: !!id }
    );

    const updateMutation = (trpc as any).productBundles.update.useMutation({
        onSuccess: () => {
            toast.success(t('common.updateSuccess', 'Updated successfully'));
            navigate('/product-bundles');
        },
        onError: (error: any) => {
            toast.error(error.message);
        }
    });

    const handleSubmit = async (data: any) => {
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
        items: bundle.items.map((item: any) => ({
            ...item,
            categoryIds: item.categories?.map((c: any) => c.id) || [],
            productIds: item.products?.map((p: any) => p.id) || []
        }))
    } : undefined;

    return (
        <CreatePageTemplate
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
            breadcrumbs={[
                { label: t('product_bundles.title', 'Product Bundles'), onClick: handleCancel },
                { label: bundle?.name || t('common.edit', 'Edit') }
            ]}
            maxWidth="full"
        >
            <ProductBundleForm
                initialValues={initialValues}
                onSubmit={handleSubmit}
                isLoading={updateMutation.isLoading}
            />
        </CreatePageTemplate>
    );
};

export default ProductBundleEditPage;
