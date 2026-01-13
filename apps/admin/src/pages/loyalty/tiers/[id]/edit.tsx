import React, { useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';
import { CreatePageTemplate } from '../../../../components/common/CreatePageTemplate';
import { useTranslationWithBackend } from '../../../../hooks/useTranslationWithBackend';
import { useToast } from '../../../../contexts/ToastContext';
import { trpc } from '../../../../utils/trpc';
import {
  LoyaltyTierForm,
  LoyaltyTierFormHandle,
  LoyaltyTierFormValues,
} from '../../../../components/loyalty/LoyaltyTierForm';
import { LoyaltyTier } from '../../../../types/loyalty';
import { Alert, AlertDescription, AlertTitle } from '../../../../components/common/Alert';

const EditLoyaltyTierPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  const trpcContext = trpc.useContext();
  const formRef = useRef<LoyaltyTierFormHandle>(null);

  const {
    data: tierResponse,
    isLoading,
    error,
    isFetching,
  } = trpc.adminLoyaltyTiers.detail.useQuery(
    { id: id || '' },
    {
      enabled: Boolean(id),
      retry: false,
    }
  );

  const tier = useMemo(() => {
    return (tierResponse as any)?.data as LoyaltyTier | undefined;
  }, [tierResponse]);

  const updateTierMutation = trpc.adminLoyaltyTiers.update.useMutation({
    onSuccess: async () => {
      await Promise.all([
        trpcContext.adminLoyaltyTiers.list.invalidate(),
        trpcContext.adminLoyaltyTiers.stats.invalidate(),
        id ? trpcContext.adminLoyaltyTiers.detail.invalidate({ id }) : Promise.resolve(),
      ]);
      addToast({
        type: 'success',
        title: t('loyalty.tier_updated_success', 'Tier updated successfully'),
      });
      navigate('/loyalty/tiers');
    },
    onError: (mutationError: any) => {
      addToast({
        type: 'error',
        title: t('loyalty.tier_update_error', 'Failed to update tier'),
        description: mutationError?.message,
      });
    },
  });

  const handleSubmit = async (values: LoyaltyTierFormValues) => {
    if (!id) return;
    try {
      await updateTierMutation.mutateAsync({
        id,
        ...values,
      });
    } catch {
      // Error is handled in the mutation onError callback
    }
  };

  const handleBack = () => navigate('/loyalty/tiers');

  const isTierLoading = (isLoading || isFetching) && !tier && !error;

  return (
    <CreatePageTemplate
      title={t('loyalty.edit_tier', 'Edit Tier')}
      description={t(
        'loyalty.edit_tier_description',
        'Update tier requirements, appearance, and benefits'
      )}
      icon={<FiStar className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
      entityName={t('loyalty.tier', 'Loyalty Tier')}
      entityNamePlural={t('loyalty.tiers', 'Loyalty Tiers')}
      backUrl="/loyalty/tiers"
      onBack={handleBack}
      isSubmitting={updateTierMutation.isPending}
      mode="update"
      isLoading={isTierLoading}
      error={error}
      entityData={tier}
      maxWidth="full"
      breadcrumbs={[
        {
          label: t('navigation.home', 'Home'),
          href: '/',
        },
        {
          label: t('loyalty.title'),
          href: '/loyalty/tiers',
        },
        {
          label: tier?.name || t('loyalty.edit_tier', 'Edit Tier'),
        },
      ]}
    >
      {tier ? (
        <LoyaltyTierForm
          ref={formRef}
          defaultValues={tier}
          onSubmit={handleSubmit}
          isSubmitting={updateTierMutation.isPending}
          onCancel={handleBack}
          submitLabel={t('common.save_changes', 'Save Changes')}
        />
      ) : !isTierLoading && !error ? (
        <Alert variant="destructive">
          <AlertTitle>{t('loyalty.tier_not_found', 'Tier not found')}</AlertTitle>
          <AlertDescription>
            {t(
              'loyalty.tier_not_found_description',
              'The requested loyalty tier could not be located.'
            )}
          </AlertDescription>
        </Alert>
      ) : null}
    </CreatePageTemplate>
  );
};

export default EditLoyaltyTierPage;
