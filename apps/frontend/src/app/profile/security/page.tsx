'use client';

import Layout from '../../../components/layout/Layout';
import ProfileLayout from '../../../components/layout/ProfileLayout';
import { Security } from '../../../components/profile/Security';
import { Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Helmet } from 'react-helmet-async';

export default function Page() {
  const t = useTranslations();

  return (
    <>
      <Helmet>
        <title>{t('pages.profile.security.title')}</title>
        <meta name="description" content={t('pages.profile.security.description')} />
      </Helmet>
      <Layout>
        <ProfileLayout activeSection="security">
          <Security />
        </ProfileLayout>
      </Layout>
    </>
  );
}