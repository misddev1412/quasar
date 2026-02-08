'use client';

import Layout from '../../../components/layout/Layout';
import ProfileLayout from '../../../components/layout/ProfileLayout';
import { LoyaltyDashboard } from '../../../components/profile/LoyaltyDashboard';
import PageBreadcrumbs from '../../../components/common/PageBreadcrumbs';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Helmet } from 'react-helmet-async';

export default function Page() {
  const t = useTranslations();
  const router = useRouter();

  const handleSectionChange = (section: string) => {
    router.push(`/profile/${section}`);
  };

  return (
    <>
      <Helmet>
        <title>{t('profile.pages.loyalty.title')}</title>
        <meta name="description" content={t('profile.pages.loyalty.description')} />
      </Helmet>
      <Layout>
        <PageBreadcrumbs
          items={[
            { label: t('common.home'), href: '/' },
            { label: t('profile.title'), href: '/profile' },
            { label: t('profile.pages.loyalty.title'), isCurrent: true },
          ]}
          fullWidth
        />
        <ProfileLayout activeSection="loyalty">
          <LoyaltyDashboard />
        </ProfileLayout>
      </Layout>
    </>
  );
}
