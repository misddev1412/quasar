import React from 'react';
import { FiSearch, FiHome } from 'react-icons/fi';
import { SeoManager } from '../components/SEO/SeoManager';
import BaseLayout from '../components/layout/BaseLayout';
import { useTranslationWithBackend } from '../hooks/useTranslationWithBackend';
import { withAdminSeo } from '../components/SEO/withAdminSeo';

const SeoPage: React.FC = () => {
  const { t } = useTranslationWithBackend();

  return (
    <BaseLayout
      title={t('admin.seo_title', 'SEO Management')}
      description={t('admin.seo_description', 'Manage SEO settings and meta tags for better search engine visibility')}
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
        <SeoManager />
      </div>
    </BaseLayout>
  );
};

export default withAdminSeo(SeoPage, {
  title: 'SEO Management | Quasar Admin',
  description: 'Manage SEO settings and meta tags for better search engine visibility',
  path: '/seo',
});
