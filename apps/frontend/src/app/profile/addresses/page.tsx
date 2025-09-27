'use client';

import Layout from '../../../components/layout/Layout';
import ProfileLayout from '../../../components/layout/ProfileLayout';
import { AddressBook } from '../../../components/profile/AddressBook';
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
        <title>{t('profile.pages.addresses.title')}</title>
        <meta name="description" content={t('profile.pages.addresses.description')} />
      </Helmet>
      <Layout>
        <ProfileLayout activeSection="addresses">
          <AddressBook />
        </ProfileLayout>
      </Layout>
    </>
  );
}