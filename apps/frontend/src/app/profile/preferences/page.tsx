'use client';

import Layout from '../../../components/layout/Layout';
import ProfileLayout from '../../../components/layout/ProfileLayout';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { useTranslations } from 'next-intl';
import {
  Settings,
  Globe,
  Smartphone,
  Moon,
  Monitor
} from 'lucide-react';
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
        <title>{t('profile.pages.preferences.title')}</title>
        <meta name="description" content={t('profile.pages.preferences.description')} />
      </Helmet>
      <Layout>
        <ProfileLayout activeSection="preferences">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 mb-0">
                {t('profile.preferences.title')}
              </h2>
              <p className="text-gray-600 mb-0">
                {t('profile.preferences.subtitle')}
              </p>
            </CardHeader>
            <CardBody>
              <div className="text-center py-8">
                <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-0">
                  {t('profile.preferences.coming_soon')}
                </h3>
                <p className="text-gray-600 mb-0">
                  {t('profile.preferences.coming_soon_desc')}
                </p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 mb-0">
                {t('profile.preferences.language')}
              </h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900 mb-0">Language</p>
                      <p className="text-sm text-gray-600 mb-0">English (US)</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Change
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900 mb-0">Time Zone</p>
                      <p className="text-sm text-gray-600 mb-0">UTC-8 (Pacific Time)</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Change
                  </button>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 mb-0">
                {t('profile.preferences.appearance')}
              </h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Moon className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900 mb-0">Theme</p>
                      <p className="text-sm text-gray-600 mb-0">Light Mode</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Change
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Monitor className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900 mb-0">Display Density</p>
                      <p className="text-sm text-gray-600 mb-0">Comfortable</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Change
                  </button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </ProfileLayout>
    </Layout>
    </>
  );
}