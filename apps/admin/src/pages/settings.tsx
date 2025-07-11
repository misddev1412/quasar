import React from 'react';
import AppLayout from '../components/layout/AppLayout';
import { SettingsManager } from '../components/settings/SettingsManager';
import { withSeo } from '../components/SEO/withSeo';

const SettingsPage: React.FC = () => {
  return (
    <AppLayout>
      <SettingsManager />
    </AppLayout>
  );
};

export default withSeo(SettingsPage, {
  title: '系统设置 | Quasar Admin',
  description: '管理系统设置和配置',
  path: '/settings',
}); 