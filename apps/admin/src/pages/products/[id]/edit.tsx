import React, { useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Package } from 'lucide-react';
import { FiHome, FiPackage } from 'react-icons/fi';
import { CreatePageTemplate } from '../../../components/common/CreatePageTemplate';
import { ProductForm, ProductFormData, ProductFormSubmitOptions, ProductFormSubmitAction } from '../../../components/products/ProductForm';
import { useTranslationWithBackend } from '../../../hooks/useTranslationWithBackend';
import { useToast } from '../../../context/ToastContext';
import { useUrlTabs } from '../../../hooks/useUrlTabs';
import { trpc } from '../../../utils/trpc';
import { Product } from '../../../types/product';
import { useAuth } from '../../../hooks/useAuth';
import { canEditRouteResource } from '../../../utils/permission-access';
import { Alert, AlertDescription, AlertTitle } from '../../../components/common/Alert';

const EditProductPage: React.FC = () => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const location = useLocation();
  const trpcContext = trpc.useContext();
  const lastSubmitActionRef = useRef<ProductFormSubmitAction>('save');

  // Use URL tabs hook with tab keys for clean URLs
  const { activeTab, handleTabChange } = useUrlTabs({
    defaultTab: 0,
    tabParam: 'tab',
    tabKeys: ['general', 'media', 'variants', 'specifications', 'translations', 'seo'] // Maps to ProductForm tab IDs
  });

  const {
    data: productData,
    isLoading,
    error,
  } = trpc.adminProducts.detail.useQuery(
    { id: id! },
    {
      enabled: !!id,
    }
  );

  const product = (productData as any)?.data as Product;
  const productOwnerId = product?.createdBy || (product as any)?.created_by;
  const canEdit = canEditRouteResource(location.pathname, user, productOwnerId);
  const isEditRestricted = Boolean(product) && !canEdit;

  const updateProductMutation = trpc.adminProducts.update.useMutation({
    onSuccess: async (_data, variables) => {
      // Ensure any cached detail/list queries refetch with the updated product data
      const productId =
        variables && typeof variables === 'object' && 'id' in variables
          ? (variables as { id?: string }).id
          : undefined;
      await Promise.all([
        productId ? trpcContext.adminProducts.detail.invalidate({ id: productId }) : Promise.resolve(),
        trpcContext.adminProducts.list.invalidate(),
      ]);
      addToast({
        type: 'success',
        title: t('products.product_updated', 'Product updated'),
        description: t('products.product_updated_desc', 'The product has been updated successfully.'),
      });
      const shouldNavigateAway = lastSubmitActionRef.current !== 'save_and_continue';
      if (shouldNavigateAway) {
        navigate('/products');
      }
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: t('products.update_product_error', 'Failed to update product'),
        description: error.message || t('common.error_occurred', 'An error occurred. Please try again.'),
      });
    },
  });

  const handleSubmit = async (data: ProductFormData, options?: ProductFormSubmitOptions) => {
    if (!id) return;
    if (isEditRestricted) {
      addToast({
        type: 'error',
        title: t('common.permission_denied', 'Permission denied'),
        description: t(
          'products.edit_restricted',
          'You can only edit products you created unless you are an admin.'
        ),
      });
      return;
    }

    try {
      lastSubmitActionRef.current =
        options?.submitAction === 'save_and_continue' ? 'save_and_continue' : 'save';

      return await updateProductMutation.mutateAsync({
        id,
        ...data,
      });
    } catch (error) {
      // Error handling is done in the mutation's onError callback
      console.error('Product update error:', error);
    }
  };

  const handleCancel = () => {
    navigate('/products');
  };

  return (
    <CreatePageTemplate
      title={product ? `${t('products.edit_product', 'Edit Product')}: ${product.name}` : t('products.edit_product', 'Edit Product')}
      description={t('products.edit_product_description', 'Update product information, variants, pricing, and inventory details.')}
      icon={<Package className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
      entityName={t('products.product', 'Product')}
      entityNamePlural={t('products.products', 'Products')}
      backUrl="/products"
      onBack={handleCancel}
      isSubmitting={updateProductMutation.isPending}
      maxWidth="full"
      mode="update"
      isLoading={isLoading}
      error={error}
      entityData={product}
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
          label: product ? product.name : t('products.edit_product', 'Edit Product'),
        }
      ]}
    >
      {isEditRestricted && (
        <Alert variant="warning">
          <AlertTitle>{t('common.permission_denied', 'Permission denied')}</AlertTitle>
          <AlertDescription>
            {t(
              'products.edit_restricted',
              'You can only edit products you created unless you are an admin.'
            )}
          </AlertDescription>
        </Alert>
      )}
      {product && (
        <ProductForm
          product={product}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={updateProductMutation.isPending}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          actionsAlignment="end"
          readonly={isEditRestricted}
        />
      )}
    </CreatePageTemplate>
  );
};

export default EditProductPage;
