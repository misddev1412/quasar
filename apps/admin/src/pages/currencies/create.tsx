import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiDollarSign } from 'react-icons/fi';
import { CreatePageTemplate } from '../../components/common/CreatePageTemplate';
import { CreateCurrencyForm } from '../../components/currencies/CreateCurrencyForm';
import { useToast } from '../../context/ToastContext';
import { trpc } from '../../utils/trpc';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { CreateCurrencyData } from '../../types/currency';

const CreateCurrencyPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();

  // tRPC mutation for creating currency - using placeholder for now
  const createCurrencyMutation = trpc.adminCurrency.createCurrency.useMutation({
    onSuccess: (data) => {
      addToast({
        type: 'success',
        title: t('currencies.createSuccess'),
        description: t('currencies.createSuccessDescription'),
      });
      navigate('/currencies');
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('currencies.createError'),
        description: error.message || t('currencies.createErrorDescription'),
      });
    },
  });

  const handleSubmit = async (formData: CreateCurrencyData) => {
    try {
      await createCurrencyMutation.mutateAsync(formData);
    } catch (error) {
      // Error handling is done in the mutation's onError callback
      console.error('Currency creation error:', error);
    }
  };

  const handleCancel = () => {
    navigate('/currencies');
  };

  return (
    <CreatePageTemplate
      title={t('currencies.create', 'Create Currency')}
      description={t('currencies.createDescription', 'Add a new currency to the system')}
      icon={<FiDollarSign className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
      entityName={t('currencies.currency', 'Currency')}
      entityNamePlural={t('currencies.currencies', 'Currencies')}
      backUrl="/currencies"
      onBack={handleCancel}
      isSubmitting={createCurrencyMutation.isPending}
      maxWidth="full"
    >
      <CreateCurrencyForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createCurrencyMutation.isPending}
      />
    </CreatePageTemplate>
  );
};

export default CreateCurrencyPage;