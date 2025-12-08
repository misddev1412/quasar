'use client';

import Layout from '../../../components/layout/Layout';
import ProfileLayout from '../../../components/layout/ProfileLayout';
import { PersonalInformation } from '../../../components/profile/PersonalInformation';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Helmet } from 'react-helmet-async';
import { User } from 'lucide-react';

export default function Page() {
  const t = useTranslations();
  const router = useRouter();

  const handleSectionChange = (section: string) => {
    router.push(`/profile/${section}`);
  };

  return (
    <>
      <Helmet>
        <title>{t('profile.pages.edit.title')}</title>
        <meta name="description" content={t('profile.pages.edit.description')} />
      </Helmet>
      <Layout>
        <ProfileLayout
          activeSection="personal"
          sectionHeader={{
            title: t('pages.profile.personal_info.title'),
            description: t('pages.profile.personal_info.subtitle'),
            icon: User
          }}
        >
          <PersonalInformation onSectionChange={handleSectionChange} />
        </ProfileLayout>
      </Layout>
    </>
  );
}