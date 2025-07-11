import React, { useState } from 'react';
import { SettingsManager } from '../components/settings/SettingsManager';
import { withSeo } from '../components/SEO/withSeo';
import BaseLayout from '../components/layout/BaseLayout';
import { useTranslationWithBackend } from '../hooks/useTranslationWithBackend';

const SettingsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslationWithBackend();
  
  return (
    <BaseLayout
      title={t('admin.system_settings', '系统设置')}
      description={t('settings.manage_settings', '管理系统设置和配置')}
      actions={[
        {
          label: t('settings.add_setting', '添加设置'),
          onClick: () => setIsModalOpen(true),
          primary: true
        }
      ]}
    >
      <SettingsManager 
        isModalOpen={isModalOpen} 
        onOpenCreateModal={() => setIsModalOpen(true)} 
        onCloseModal={() => setIsModalOpen(false)} 
      />
    </BaseLayout>
  );
};

export default withSeo(SettingsPage, {
  title: '系统设置 | Quasar Admin',
  description: '管理系统设置和配置',
  path: '/settings',
}); 