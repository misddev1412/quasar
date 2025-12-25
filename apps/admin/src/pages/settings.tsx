import React, { useState } from 'react';
import { SettingsManager } from '../components/settings/SettingsManager';
import { withAdminSeo } from '../components/SEO/withAdminSeo';
import BaseLayout from '../components/layout/BaseLayout';
import { useTranslationWithBackend } from '../hooks/useTranslationWithBackend';
import { FiSettings, FiHome } from 'react-icons/fi';

const SettingsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslationWithBackend();
  
  return (
    <BaseLayout
      title={t('admin.system_settings')}
      description={t('settings.manage_settings')}
      actions={[
        {
          label: t('settings.add_setting'),
          onClick: () => setIsModalOpen(true),
          primary: true
        }
      ]}
      breadcrumbs={[
        {
          label: t('navigation.home', 'Home'),
          href: '/',
          icon: <FiHome className="h-4 w-4" />
        },
        {
          label: t('admin.system_settings', 'Settings'),
          icon: <FiSettings className="h-4 w-4" />
        }
      ]}
    >
      <div className="space-y-6">
        <SettingsManager
          isModalOpen={isModalOpen}
          onOpenCreateModal={() => setIsModalOpen(true)}
          onCloseModal={() => setIsModalOpen(false)}
        />
      </div>
    </BaseLayout>
  );
};

export default withAdminSeo(SettingsPage, {
  title: 'System Settings | Quasar Admin',
  description: 'Manage system settings and configuration',
  path: '/settings',
}); 
