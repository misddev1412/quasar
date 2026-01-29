import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiDollarSign } from 'react-icons/fi';
import { StandardFormPage } from '@admin/components/common';
import { EditCurrencyForm } from '@admin/components/currencies';
import { useToast } from '@admin/contexts/ToastContext';
import { trpc } from '@admin/utils/trpc';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import { UpdateCurrencyFormData } from '@admin/utils/validation';
import { Currency } from '@admin/types/currency';

const EditCurrencyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();

  // Validate that ID is provided
  if (!id) {
    navigate('/currencies');
    return null;
  }

  // tRPC query for fetching currency data
  const currencyQuery = (trpc.adminCurrency as any).getCurrencyById.useQuery(
    { id },
    {
      enabled: !!id,
      onError: (error: any) => {
        addToast({
          type: 'error',
          title: t('currencies.fetchError'),
          description: error.message || t('currencies.fetchErrorDescription'),
        });
        navigate('/currencies');
      },
    }
  );

  // tRPC mutation for updating currency
  const updateCurrencyMutation = (trpc.adminCurrency as any).updateCurrency.useMutation({
    onSuccess: (data) => {
      addToast({
        type: 'success',
        title: t('currencies.updateSuccess'),
        description: t('currencies.updateSuccessDescription'),
      });
      navigate('/currencies');
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('currencies.updateError'),
        description: error.message || t('currencies.updateErrorDescription'),
      });
    },
  });

  const handleSubmit = async (formData: UpdateCurrencyFormData) => {
    if (!id) return;

    try {
      await updateCurrencyMutation.mutateAsync({ id, ...formData });
    } catch (error) {
      // Error handling is done in the mutation's onError callback
      console.error('Currency update error:', error);
    }
  };

  const handleCancel = () => {
    navigate('/currencies');
  };

  const formId = 'currency-edit-form';

  // Loading state
  if (currencyQuery.isLoading) {
    return (
      <StandardFormPage
        title={t('currencies.edit', 'Edit Currency')}
        description={t('currencies.editDescription', 'Update currency information')}
        icon={<FiDollarSign className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
        entityName={t('currencies.currency', 'Currency')}
        entityNamePlural={t('currencies.currencies', 'Currencies')}
        backUrl="/currencies"
        onBack={handleCancel}
        isSubmitting={false}
        showActions={false}
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </StandardFormPage>
    );
  }

  // Error state
  if (currencyQuery.error) {
    return (
      <StandardFormPage
        title={t('currencies.edit', 'Edit Currency')}
        description={t('currencies.editDescription', 'Update currency information')}
        icon={<FiDollarSign className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
        entityName={t('currencies.currency', 'Currency')}
        entityNamePlural={t('currencies.currencies', 'Currencies')}
        backUrl="/currencies"
        onBack={handleCancel}
        isSubmitting={false}
        showActions={false}
      >
        <div className="text-center text-red-600 dark:text-red-400">
          <p className="text-lg font-medium mb-2">
            {t('currencies.fetchError', 'Error Loading Currency')}
          </p>
          <p className="text-sm">
            {currencyQuery.error.message || t('currencies.fetchErrorDescription', 'Failed to load currency data')}
          </p>
          <button
            onClick={() => currencyQuery.refetch()}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            {t('common.retry', 'Retry')}
          </button>
        </div>
      </StandardFormPage>
    );
  }

  // No data found
  if (!currencyQuery.data?.data) {
    return (
      <StandardFormPage
        title={t('currencies.edit', 'Edit Currency')}
        description={t('currencies.editDescription', 'Update currency information')}
        icon={<FiDollarSign className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
        entityName={t('currencies.currency', 'Currency')}
        entityNamePlural={t('currencies.currencies', 'Currencies')}
        backUrl="/currencies"
        onBack={handleCancel}
        isSubmitting={false}
        showActions={false}
      >
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p className="text-lg font-medium mb-2">
            {t('currencies.notFound', 'Currency Not Found')}
          </p>
          <p className="text-sm">
            {t('currencies.notFoundDescription', 'The currency you are trying to edit does not exist')}
          </p>
          <button
            onClick={() => navigate('/currencies')}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            {t('currencies.backToList', 'Back to Currencies')}
          </button>
        </div>
      </StandardFormPage>
    );
  }

  const currency = currencyQuery.data.data as Currency;

  return (
    <StandardFormPage
      title={t('currencies.edit', 'Edit Currency')}
      description={t('currencies.editDescription', 'Update currency information')}
      icon={<FiDollarSign className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
      entityName={t('currencies.currency', 'Currency')}
      entityNamePlural={t('currencies.currencies', 'Currencies')}
      backUrl="/currencies"
      onBack={handleCancel}
      isSubmitting={updateCurrencyMutation.isPending}
      formId={formId}
    >
      <EditCurrencyForm
        currency={currency}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={updateCurrencyMutation.isPending}
        showActions={false}
        formId={formId}
      />
    </StandardFormPage>
  );
};

export default EditCurrencyPage;
