import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import { FiHome, FiPackage } from 'react-icons/fi';
import { CreatePageTemplate } from '../../components/common/CreatePageTemplate';
import { ProductForm, ProductFormData, ProductFormSubmitOptions } from '../../components/products/ProductForm';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../context/ToastContext';
import { useUrlTabs } from '../../hooks/useUrlTabs';
import { trpc } from '../../utils/trpc';

const CreateProductPage: React.FC = () => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Use URL tabs hook with tab keys for clean URLs
  const { activeTab, handleTabChange } = useUrlTabs({
    defaultTab: 0,
    tabParam: 'tab',
    tabKeys: ['general', 'media', 'variants', 'specifications', 'translations', 'seo'] // Maps to ProductForm tab IDs
  });

  const createProductMutation = trpc.adminProducts.create.useMutation({
    onSuccess: (data: any) => {
      addToast({
        type: 'success',
        title: t('products.product_created', 'Product created'),
        description: t('products.product_created_desc', 'The product has been created successfully.'),
      });
      navigate('/products');
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: t('products.create_product_error', 'Failed to create product'),
        description: error.message || t('common.error_occurred', 'An error occurred. Please try again.'),
      });
    },
  });

  const handleSubmit = async (data: ProductFormData, _options?: ProductFormSubmitOptions) => {
    try {
      return await createProductMutation.mutateAsync(data);
    } catch (error) {
      // Error handling is done in the mutation's onError callback
      console.error('Product creation error:', error);
    }
  };

  const handleCancel = () => {
    navigate('/products');
  };

  return (
    <CreatePageTemplate
      title={t('products.create_product', 'Create Product')}
      description={t('products.create_product_description', 'Add a new product to your catalog with variants, pricing, and inventory details.')}
      icon={<Package className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
      entityName={t('products.product', 'Product')}
      entityNamePlural={t('products.products', 'Products')}
      backUrl="/products"
      onBack={handleCancel}
      isSubmitting={createProductMutation.isPending}
      maxWidth="full"
      breadcrumbs={[
        {
          label: t('navigation.home', 'Home'),
          href: '/',
        },
        {
          label: t('products.products', 'Products'),
          onClick: handleCancel,
        },
        {
          label: t('products.create_product', 'Create Product'),
        }
      ]}
    >
      <ProductForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createProductMutation.isPending}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </CreatePageTemplate>
  );
};

export default CreateProductPage;
