import React from 'react';
import { FiImage, FiHome } from 'react-icons/fi';
import { SiteAssetsManager } from '../components/site-assets/SiteAssetsManager';
import { withAdminSeo } from '../components/SEO/withAdminSeo';
import BaseLayout from '../components/layout/BaseLayout';
import { useTranslationWithBackend } from '../hooks/useTranslationWithBackend';

const BrandAssetsPage: React.FC = () => {
  const { t } = useTranslationWithBackend();

  return (
    <BaseLayout
      title={t('brand.assets_title', 'Brand & Site Assets')}
      description={t('brand.assets_description', 'Manage your website\'s visual identity and brand assets')}
      actions={[
        {
          label: t('brand.refresh_assets', 'Refresh Assets'),
          onClick: () => window.location.reload(),
          primary: false
        }
      ]}
      breadcrumbs={[
        {
          label: t('navigation.home', 'Home'),
          href: '/',
          icon: <FiHome className="h-4 w-4" />
        },
        {
          label: t('brand.assets_title', 'Brand & Site Assets'),
          icon: <FiImage className="h-4 w-4" />
        }
      ]}
    >
      <div className="space-y-6">
        <SiteAssetsManager />
      </div>
    </BaseLayout>
  );
};

export default withAdminSeo(BrandAssetsPage, {
  title: 'Brand & Site Assets | Quasar Admin',
  description: 'Manage your website\'s visual identity including logos, favicons, and other brand assets',
  path: '/brand-assets',
});
