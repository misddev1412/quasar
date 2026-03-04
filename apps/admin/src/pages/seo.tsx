import React from 'react';
import { FiSearch, FiHome } from 'react-icons/fi';
import { SeoManager, withAdminSeo } from '@admin/components/SEO';
import { BaseLayout } from '@admin/components/layout';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import { useState } from 'react';

const SeoPage: React.FC = () => {
  const { t } = useTranslationWithBackend();
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  return (
    <BaseLayout
      title={t('admin.seo_title', 'SEO Management')}
      description={t('admin.seo_description', 'Manage SEO settings and meta tags for better search engine visibility')}
      actions={[
        {
          label: t('seo.add_rule', 'Add Rule'),
          onClick: () => setCreateModalOpen(true),
          primary: true,
        },
      ]}
      breadcrumbs={[
        {
          label: t('navigation.home', 'Home'),
          href: '/',
          icon: <FiHome className="h-4 w-4" />
        },
        {
          label: t('admin.seo_management', 'SEO Management'),
          icon: <FiSearch className="h-4 w-4" />
        }
      ]}
    >
      <div className="space-y-6">
        <SeoManager
          showTopAction={false}
          isCreateModalOpen={isCreateModalOpen}
          onCreateModalChange={setCreateModalOpen}
        />
      </div>
    </BaseLayout>
  );
};

export default withAdminSeo(SeoPage, {
  title: 'SEO Management | Quasar Admin',
  description: 'Manage SEO settings and meta tags for better search engine visibility',
  path: '/seo',
});
