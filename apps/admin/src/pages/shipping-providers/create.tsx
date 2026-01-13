import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTruck } from 'react-icons/fi';
import { CreatePageTemplate } from '../../components/common/CreatePageTemplate';
import CreateShippingProviderForm, { CreateShippingProviderFormData } from '../../components/shipping-providers/CreateShippingProviderForm';
import { useToast } from '../../contexts/ToastContext';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useUrlTabs } from '../../hooks/useUrlTabs';
import { trpc } from '../../utils/trpc';

const CreateShippingProviderPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();
  const [manualSubmitting, setManualSubmitting] = useState(false);

  const { activeTab, handleTabChange } = useUrlTabs({
    defaultTab: 0,
    tabParam: 'tab',
    tabKeys: ['general', 'configuration'],
  });

  const adminShippingProviders = (trpc as any)['adminShippingProviders'];
  const createShippingProviderMutation =
    adminShippingProviders?.create?.useMutation?.({
      onSuccess: () => {
        addToast({
          type: 'success',
          title: t('shippingProviders.createSuccess'),
        });
        navigate('/shipping-providers');
      },
      onError: (error: any) => {
        addToast({
          type: 'error',
          title: t('shippingProviders.createError'),
          description: error?.message,
        });
      },
      onSettled: () => {
        setManualSubmitting(false);
      },
    }) ?? {
      mutateAsync: async () => {
        throw new Error(t('shippingProviders.apiUnavailable', 'Shipping provider API is not available.'));
      },
      isPending: false,
    };

  const handleSubmit = async (data: CreateShippingProviderFormData) => {
    setManualSubmitting(true);
    try {
      const cleanedApiKey = typeof data.apiKey === 'string' ? data.apiKey.trim() : data.apiKey ?? null;
      const cleanedApiSecret = typeof data.apiSecret === 'string' ? data.apiSecret.trim() : data.apiSecret ?? null;
      const payload: CreateShippingProviderFormData = {
        ...data,
        description: data.description?.trim() ? data.description.trim() : undefined,
        trackingUrl: data.trackingUrl?.trim() ? data.trackingUrl.trim() : undefined,
        apiKey: cleanedApiKey && cleanedApiKey.length > 0 ? cleanedApiKey : null,
        apiSecret: cleanedApiSecret && cleanedApiSecret.length > 0 ? cleanedApiSecret : null,
      };
      await createShippingProviderMutation.mutateAsync(payload);
    } catch (error) {
      if (!adminShippingProviders?.create) {
        addToast({
          type: "error",
          title: t('shippingProviders.apiUnavailable', "Shipping provider API is not available right now."),
        });
      }
    } finally {
      if (!adminShippingProviders?.create) {
        setManualSubmitting(false);
      }
    }
  };

  const handleCancel = () => {
    navigate('/shipping-providers');
  };

  const isSubmitting = manualSubmitting || createShippingProviderMutation.isPending;

  return (
    <CreatePageTemplate
      title={t('shippingProviders.createShippingProvider')}
      description={t('shippingProviders.createShippingProviderDescription')}
      icon={<FiTruck className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
      entityName={t('shippingProviders.entityName', 'Shipping Provider')}
      entityNamePlural={t('shippingProviders.shippingProviders', 'Shipping Providers')}
      backUrl="/shipping-providers"
      onBack={handleCancel}
      isSubmitting={isSubmitting}
      maxWidth="full"
      breadcrumbs={[
        { label: t('navigation.home', 'Home'), href: '/' },
        { label: t('shippingProviders.shippingProviders', 'Shipping Providers'), onClick: handleCancel },
        { label: t('shippingProviders.create', 'Create Shipping Provider') },
      ]}
    >
      <CreateShippingProviderForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </CreatePageTemplate>
  );
};

export default CreateShippingProviderPage;
