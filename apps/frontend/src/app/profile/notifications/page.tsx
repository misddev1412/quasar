'use client';

import Layout from '../../../components/layout/Layout';
import ProfileLayout from '../../../components/layout/ProfileLayout';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { Bell } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
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
        <title>{t('profile.pages.notifications.title')}</title>
        <meta name="description" content={t('profile.pages.notifications.description')} />
      </Helmet>
      <Layout>
        <ProfileLayout activeSection="notifications">
        <Card className="border-0 bg-transparent shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Bell className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-0">
                  {t('profile.notifications.title')}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-0">
                  {t('profile.notifications.subtitle')}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="text-center py-12 px-6">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-xl opacity-30"></div>
                <Bell className="w-20 h-20 text-yellow-600 dark:text-yellow-400 mx-auto relative" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-0">
                {t('profile.notifications.coming_soon')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-0">
                {t('profile.notifications.coming_soon_desc')}
              </p>
              <div className="mt-6 inline-flex items-center px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
                Coming Soon
              </div>
            </div>
          </CardBody>
        </Card>
      </ProfileLayout>
    </Layout>
    </>
  );
}