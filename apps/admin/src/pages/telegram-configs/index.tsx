import React from 'react';
import { FiSend, FiHome } from 'react-icons/fi';
import { StandardListPage } from '@admin/components/common';
import { TelegramNotificationConfigManager } from '@admin/components/notifications';

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
    <StandardListPage
      title="Telegram Configuration"
      description="Manage Telegram bot configurations for notifications"
      breadcrumbs={breadcrumbs}
    >
      <TelegramNotificationConfigManager />
    </StandardListPage>
  );
};

export default TelegramConfigsPage;









