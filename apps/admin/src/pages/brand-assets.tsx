import React from 'react';
import { FiImage, FiHome } from 'react-icons/fi';
import { SiteAssetsManager } from '../components/site-assets/SiteAssetsManager';
import { withSeo } from '../components/SEO/withSeo';
import { Breadcrumb } from '../components/common/Breadcrumb';
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
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            {
              label: 'Home',
              href: '/',
              icon: <FiHome className="w-4 h-4" />
            },
            {
              label: 'Brand Assets',
              icon: <FiImage className="w-4 h-4" />
            }
          ]}
        />

        <SiteAssetsManager />
      </div>
    </BaseLayout>
  );
};

export default withSeo(BrandAssetsPage, {
  title: 'Brand & Site Assets | Quasar Admin',
  description: 'Manage your website\'s visual identity including logos, favicons, and other brand assets',
  path: '/brand-assets',
});