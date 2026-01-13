import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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

const CreateLoyaltyTierPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  const trpcContext = trpc.useContext();
  const formRef = useRef<LoyaltyTierFormHandle>(null);

  const createTierMutation = trpc.adminLoyaltyTiers.create.useMutation({
    onSuccess: async () => {
      await Promise.all([
        trpcContext.adminLoyaltyTiers.list.invalidate(),
        trpcContext.adminLoyaltyTiers.stats.invalidate(),
      ]);
      addToast({ type: 'success', title: t('loyalty.tier_created_success') });
      navigate('/loyalty/tiers');
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: t('loyalty.tier_create_error'),
        description: error?.message,
      });
    },
  });

  const handleSubmit = async (values: LoyaltyTierFormValues) => {
    try {
      await createTierMutation.mutateAsync(values);
    } catch (error) {
      // Mutations already surface toasts via onError
    }
  };

  return (
    <CreatePageTemplate
      title={t('loyalty.create_tier')}
      description={t('loyalty.create_tier_description')}
      icon={<FiStar className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
      entityName={t('loyalty.tier', 'Loyalty Tier')}
      entityNamePlural={t('loyalty.tiers', 'Loyalty Tiers')}
      backUrl="/loyalty/tiers"
      onBack={() => navigate('/loyalty/tiers')}
      isSubmitting={createTierMutation.isPending}
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
          label: t('loyalty.create_tier'),
        },
      ]}
    >
      <LoyaltyTierForm
        ref={formRef}
        onSubmit={handleSubmit}
        isSubmitting={createTierMutation.isPending}
        onCancel={() => navigate('/loyalty/tiers')}
        submitLabel={t('loyalty.create_tier', 'Create Tier')}
      />
    </CreatePageTemplate>
  );
};

export default CreateLoyaltyTierPage;
