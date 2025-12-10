import React from 'react';
import { FiGlobe, FiHome, FiSettings } from 'react-icons/fi';
import BaseLayout from '../../components/layout/BaseLayout';
import { withSeo } from '../../components/SEO/withSeo';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import CheckoutSettingsForm from '../../components/storefront/CheckoutSettingsForm';

const StorefrontCheckoutSettingsPage: React.FC = () => {
  const { t } = useTranslationWithBackend();

  return (
    <BaseLayout
      title={t('storefront.checkout.title', 'Cài đặt checkout storefront')}
      description={t(
        'storefront.checkout.description',
        'Chọn quốc gia mặc định hiển thị trước trên trang thanh toán.'
      )}
      breadcrumbs={[
        {
          label: t('navigation.home', 'Home'),
          href: '/',
          icon: <FiHome className="h-4 w-4" />,
        },
        {
          label: t('navigation.settings', 'Settings'),
          href: '/settings',
          icon: <FiSettings className="h-4 w-4" />,
        },
        {
          label: t('storefront.checkout.nav', 'Checkout storefront'),
          icon: <FiGlobe className="h-4 w-4" />,
        },
      ]}
    >
      <CheckoutSettingsForm />
    </BaseLayout>
  );
};

export default withSeo(StorefrontCheckoutSettingsPage, {
  title: 'Storefront checkout settings | Quasar Admin',
  description: 'Manage storefront checkout defaults',
  path: '/storefront/checkout',
});
