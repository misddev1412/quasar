import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { trpc } from '../../services/api';
import { CreatePageTemplate } from '../../components/common/CreatePageTemplate';
import ProductBundleForm from './ProductBundleForm';
import { useToast } from '../../contexts/ToastContext';
import { useUrlTabs } from '../../hooks/useUrlTabs';

const ProductBundleCreatePage: React.FC = () => {
    const { t } = useTranslationWithBackend();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const { activeTab, handleTabChange } = useUrlTabs({
        defaultTab: 0,
        tabParam: 'tab',
        tabKeys: ['general', 'items']
    });

    const createMutation = (trpc as any).productBundles.create.useMutation({
        onSuccess: () => {
            addToast({
                type: 'success',
                title: t('common.createSuccess', 'Created successfully'),
            });
            navigate('/product-bundles');
        },
        onError: (error: any) => {
            addToast({
                type: 'error',
                title: error.message || t('common.error_occurred', 'An error occurred. Please try again.'),
            });
        }
    });

    const handleSubmit = async (data: any) => {
        try {
            await createMutation.mutateAsync(data);
        } catch (error) {
            console.error('Product bundle creation error:', error);
        }
    };

    const handleCancel = () => {
        navigate('/product-bundles');
    };

    const isSubmitting = createMutation.isPending ?? createMutation.isLoading ?? false;

    return (
        <CreatePageTemplate
            title={t('product_bundles.create_title', 'Create Product Bundle')}
            description={t('product_bundles.create_description', 'Create a new bundle of products and categories.')}
            icon={<Package className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
            entityName={t('product_bundles.entity_name', 'Product Bundle')}
            entityNamePlural={t('product_bundles.title', 'Product Bundles')}
            backUrl="/product-bundles"
            onBack={handleCancel}
            mode="create"
            isSubmitting={isSubmitting}
            breadcrumbs={[
                { label: t('navigation.home', 'Home'), href: '/' },
                { label: t('product_bundles.title', 'Product Bundles'), onClick: handleCancel },
                { label: t('product_bundles.create_title', 'Create Product Bundle') }
            ]}
            maxWidth="full"
        >
            <ProductBundleForm
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isSubmitting}
                activeTab={activeTab}
                onTabChange={handleTabChange}
            />
        </CreatePageTemplate>
    );
};

export default ProductBundleCreatePage;
