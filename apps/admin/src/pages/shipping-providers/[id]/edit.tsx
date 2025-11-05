import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiTruck, FiHome } from 'react-icons/fi';
import { CreatePageTemplate } from '../../../components/common/CreatePageTemplate';
import CreateShippingProviderForm, { CreateShippingProviderFormData } from '../../../components/shipping-providers/CreateShippingProviderForm';
import { useToast } from '../../../context/ToastContext';
import { useTranslationWithBackend } from '../../../hooks/useTranslationWithBackend';
import { useUrlTabs } from '../../../hooks/useUrlTabs';
import { trpc } from '../../../utils/trpc';

const EditShippingProviderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();

  const { activeTab, handleTabChange } = useUrlTabs({
    defaultTab: 0,
    tabParam: 'tab',
    tabKeys: ['general', 'configuration'],
  });

  const adminShippingProviders = (trpc as any)['adminShippingProviders'];

  const shippingProviderQuery = adminShippingProviders?.getById?.useQuery
    ? adminShippingProviders.getById.useQuery(
        { id: id ?? '' },
        { enabled: !!id, retry: false }
      )
    : {
        data: null,
        isLoading: false,
        error: new Error(t('shippingProviders.apiUnavailable', 'Shipping provider API is not available right now.')),
        refetch: () => Promise.resolve(),
      };

  const updateShippingProviderMutation = adminShippingProviders?.update?.useMutation?.({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: t('shippingProviders.updateSuccess', 'Shipping provider updated successfully'),
      });
      navigate('/shipping-providers');
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: t('shippingProviders.updateError', 'Error updating shipping provider'),
        description: error?.message,
      });
    },
  }) ?? {
    mutateAsync: async () => {
      throw new Error(t('shippingProviders.apiUnavailable', 'Shipping provider API is not available right now.'));
    },
    isPending: false,
  };

  const handleSubmit = async (formData: CreateShippingProviderFormData) => {
    if (!id) {
      addToast({
        type: 'error',
        title: t('shippingProviders.updateError', 'Error updating shipping provider'),
        description: t('shippingProviders.invalidId', 'Invalid shipping provider identifier.'),
      });
      return;
    }

    try {
      const cleanedApiKey = typeof formData.apiKey === 'string' ? formData.apiKey.trim() : formData.apiKey ?? null;
      const cleanedApiSecret = typeof formData.apiSecret === 'string' ? formData.apiSecret.trim() : formData.apiSecret ?? null;
      await updateShippingProviderMutation.mutateAsync({
        id,
        data: {
          ...formData,
          description: formData.description?.trim() ? formData.description.trim() : undefined,
          trackingUrl: formData.trackingUrl?.trim() ? formData.trackingUrl.trim() : undefined,
          apiKey: cleanedApiKey && cleanedApiKey.length > 0 ? cleanedApiKey : null,
          apiSecret: cleanedApiSecret && cleanedApiSecret.length > 0 ? cleanedApiSecret : null,
        },
      });
    } catch (error) {
      if (!adminShippingProviders?.update) {
        addToast({
          type: 'error',
          title: t('shippingProviders.apiUnavailable', 'Shipping provider API is not available right now.'),
        });
      }
    }
  };

  const handleCancel = () => {
    navigate('/shipping-providers');
  };

  const baseBreadcrumbs = useMemo(() => ([
    { label: t('navigation.home', 'Home'), href: '/', icon: <FiHome className="w-4 h-4" /> },
    { label: t('shippingProviders.shippingProviders', 'Shipping Providers'), href: '/shipping-providers', icon: <FiTruck className="w-4 h-4" /> },
  ]), [t]);

  const provider = (shippingProviderQuery.data as any)?.data;

  const detailBreadcrumbs = useMemo(() => {
    if (!provider) {
      return [
        ...baseBreadcrumbs,
        { label: t('shippingProviders.edit', 'Edit Shipping Provider') },
      ];
    }

    return [
      ...baseBreadcrumbs,
      { label: provider.name, href: `/shipping-providers/${provider.id}`, icon: <FiTruck className="w-4 h-4" /> },
      { label: t('common.edit', 'Edit') },
    ];
  }, [baseBreadcrumbs, provider?.id, provider?.name, t]);

  if (shippingProviderQuery.isLoading) {
    return (
      <CreatePageTemplate
        title={t('shippingProviders.edit', 'Edit Shipping Provider')}
        description={t('shippingProviders.updateShippingProviderDescription', 'Update shipping provider configuration and status.')}
        icon={<FiTruck className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
        entityName={t('shippingProviders.entityName', 'Shipping Provider')}
        entityNamePlural={t('shippingProviders.shippingProviders', 'Shipping Providers')}
        backUrl="/shipping-providers"
        onBack={handleCancel}
        isSubmitting={false}
        maxWidth="full"
        breadcrumbs={detailBreadcrumbs}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-neutral-600 dark:text-neutral-400">
            {t('common.loading', 'Loading...')}
          </div>
        </div>
      </CreatePageTemplate>
    );
  }

  if (shippingProviderQuery.error) {
    return (
      <CreatePageTemplate
        title={t('shippingProviders.edit', 'Edit Shipping Provider')}
        description={t('shippingProviders.updateShippingProviderDescription', 'Update shipping provider configuration and status.')}
        icon={<FiTruck className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
        entityName={t('shippingProviders.entityName', 'Shipping Provider')}
        entityNamePlural={t('shippingProviders.shippingProviders', 'Shipping Providers')}
        backUrl="/shipping-providers"
        onBack={handleCancel}
        isSubmitting={false}
        maxWidth="full"
        breadcrumbs={detailBreadcrumbs}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-red-600 dark:text-red-400">
            {t('shippingProviders.updateError', 'Error updating shipping provider')}: {shippingProviderQuery.error?.message}
          </div>
        </div>
      </CreatePageTemplate>
    );
  }

  if (!provider) {
    return (
      <CreatePageTemplate
        title={t('shippingProviders.edit', 'Edit Shipping Provider')}
        description={t('shippingProviders.updateShippingProviderDescription', 'Update shipping provider configuration and status.')}
        icon={<FiTruck className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
        entityName={t('shippingProviders.entityName', 'Shipping Provider')}
        entityNamePlural={t('shippingProviders.shippingProviders', 'Shipping Providers')}
        backUrl="/shipping-providers"
        onBack={handleCancel}
        isSubmitting={false}
        maxWidth="full"
        breadcrumbs={detailBreadcrumbs}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-neutral-600 dark:text-neutral-400">
            {t('shippingProviders.notFound', 'Shipping provider not found')}
          </div>
        </div>
      </CreatePageTemplate>
    );
  }

  const initialValues: Partial<CreateShippingProviderFormData> = {
    name: provider.name ?? '',
    code: provider.code ?? '',
    description: provider.description ?? '',
    trackingUrl: provider.trackingUrl ?? '',
    isActive: provider.isActive ?? true,
    apiKey: provider.apiKey ?? '',
    apiSecret: provider.apiSecret ?? '',
  };

  return (
    <CreatePageTemplate
      title={t('shippingProviders.updateShippingProvider', `Update ${provider.name}`, { name: provider.name })}
      description={t('shippingProviders.updateShippingProviderDescription', 'Update shipping provider configuration and status.')}
      icon={<FiTruck className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
      entityName={t('shippingProviders.entityName', 'Shipping Provider')}
      entityNamePlural={t('shippingProviders.shippingProviders', 'Shipping Providers')}
      backUrl="/shipping-providers"
      onBack={handleCancel}
      isSubmitting={updateShippingProviderMutation.isPending}
      maxWidth="full"
      breadcrumbs={detailBreadcrumbs}
    >
      <CreateShippingProviderForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={updateShippingProviderMutation.isPending}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        initialValues={initialValues}
        submitButtonText={t('common.save_changes', 'Save Changes')}
        mode="edit"
      />
    </CreatePageTemplate>
  );
};

export default EditShippingProviderPage;
