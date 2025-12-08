'use client';

import Layout from '../../components/layout/Layout';
import ProfileLayout from '../../components/layout/ProfileLayout';
import { ProfileOverview } from '../../components/profile/ProfileOverview';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Helmet } from 'react-helmet-async';

export default function Page() {
  const t = useTranslations();
  const router = useRouter();

  const handleSectionChange = (section: string) => {
    router.push(`/profile`);
  };

  return (
    <>
      <Helmet>
        <title>{t('pages.profile.pages.overview.title')}</title>
        <meta name="description" content={t('pages.profile.pages.overview.description')} />
      </Helmet>
      <Layout>
        <ProfileLayout activeSection="overview">
          <ProfileOverview onSectionChange={handleSectionChange} />
        </ProfileLayout>
      </Layout>
    </>
  );
}