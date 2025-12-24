import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiHome, FiLayout } from 'react-icons/fi';
import BaseLayout from '../../components/layout/BaseLayout';
import { SectionsManager } from '../../components/sections/SectionsManager';

const SectionsPage: React.FC = () => {
  const { t } = useTranslation();
  const params = useParams<{ page?: string }>();
  const navigate = useNavigate();
  const page = params.page || 'home';

  const handlePageChange = (nextPage: string) => {
    if (!nextPage) return;
    navigate(`/sections/${nextPage}`);
  };

  return (
    <BaseLayout
      title={t('sections.page.title')}
      description={t('sections.page.description')}
      breadcrumbs={[
        {
          label: t('sections.page.home'),
          href: '/',
          icon: <FiHome className="w-4 h-4" />
        },
        {
          label: t('sections.page.breadcrumb'),
          icon: <FiLayout className="w-4 h-4" />
        }
      ]}
    >
      <div className="space-y-6">
        <SectionsManager page={page} onPageChange={handlePageChange} />
      </div>
    </BaseLayout>
  );
};

export default SectionsPage;
