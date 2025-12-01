import React from 'react';
import { FiSend, FiHome } from 'react-icons/fi';
import BaseLayout from '../../components/layout/BaseLayout';
import TelegramNotificationConfigManager from '../../components/notifications/TelegramNotificationConfigManager';

const TelegramConfigsPage: React.FC = () => {
  const breadcrumbs = [
    {
      label: 'Home',
      href: '/',
      icon: <FiHome className="h-4 w-4" />,
    },
    {
      label: 'Telegram Configs',
      icon: <FiSend className="h-4 w-4" />,
    },
  ];

  return (
    <BaseLayout
      title="Telegram Configuration"
      description="Manage Telegram bot configurations for notifications"
      breadcrumbs={breadcrumbs}
    >
      <TelegramNotificationConfigManager />
    </BaseLayout>
  );
};

export default TelegramConfigsPage;



