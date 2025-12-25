import React from 'react';
import { FiHome, FiLayout } from 'react-icons/fi';
import BaseLayout from '../../components/layout/BaseLayout';
import { withAdminSeo } from '../../components/SEO/withAdminSeo';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import FooterSettingsForm from '../../components/storefront/FooterSettingsForm';

const StorefrontFooterPage: React.FC = () => {
  const { t } = useTranslationWithBackend();

  return (
    <BaseLayout
      title={t('storefront.footer.title', 'Storefront footer')}
      description={t('storefront.footer.description', 'Control layout, branding, social links, and legal information.')}
      breadcrumbs={[
        {
          label: t('navigation.home', 'Home'),
          href: '/',
          icon: <FiHome className="h-4 w-4" />,
        },
        {
          label: t('storefront.footer.nav', 'Footer builder'),
          icon: <FiLayout className="h-4 w-4" />,
        },
      ]}
    >
      <FooterSettingsForm />
    </BaseLayout>
  );
};

export default withAdminSeo(StorefrontFooterPage, {
  title: 'Storefront footer | Quasar Admin',
  description: 'Customize the storefront footer layout, branding, and links.',
  path: '/storefront/footer',
});
