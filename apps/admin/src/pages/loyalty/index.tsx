import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BaseLayout from '../../components/layout/BaseLayout';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';

const LoyaltyIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslationWithBackend();

  useEffect(() => {
    // Redirect to the stats dashboard when accessing /loyalty
    navigate('/loyalty/stats', { replace: true });
  }, [navigate]);

  return (
    <BaseLayout
      title={t('loyalty.title', 'Loyalty Program')}
      description={t('loyalty.description', 'Loading loyalty program management...')}
      fullWidth={true}
    >
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">
          {t('common.loading', 'Loading...')}
        </div>
      </div>
    </BaseLayout>
  );
};

export default LoyaltyIndexPage;
