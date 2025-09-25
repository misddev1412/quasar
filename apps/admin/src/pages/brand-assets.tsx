import React from 'react';
import { SiteAssetsManager } from '../components/site-assets/SiteAssetsManager';
import { withSeo } from '../components/SEO/withSeo';
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
    >
      <SiteAssetsManager />
    </BaseLayout>
  );
};

export default withSeo(BrandAssetsPage, {
  title: 'Brand & Site Assets | Quasar Admin',
  description: 'Manage your website\'s visual identity including logos, favicons, and other brand assets',
  path: '/brand-assets',
});