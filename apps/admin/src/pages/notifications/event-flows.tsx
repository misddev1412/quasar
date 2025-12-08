import React, { useMemo } from 'react';
import { FiBell, FiGitMerge, FiHome } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import BaseLayout from '../../components/layout/BaseLayout';
import { withSeo } from '../../components/SEO/withSeo';
import NotificationEventFlowManager from '../../components/notifications/NotificationEventFlowManager';

const NotificationEventFlowsPage: React.FC = () => {
  const { t } = useTranslation();

  const breadcrumbs = useMemo(() => [
    {
      label: t('navigation.home', 'Home'),
      href: '/',
      icon: <FiHome className="h-4 w-4" />,
    },
    {
      label: t('navigation.notifications', 'Notifications'),
      href: '/notifications',
      icon: <FiBell className="h-4 w-4" />,
    },
    {
      label: t('notificationFlows.title', 'Event Flows'),
      icon: <FiGitMerge className="h-4 w-4" />,
    },
  ], [t]);

  return (
    <BaseLayout
      title={t('notificationFlows.title', 'Notification Event Flows')}
      description={t(
        'notificationFlows.description',
        'Configure multi-channel notification routes for each system event and control recipients, templates, CC, and BCC targets.',
      )}
      breadcrumbs={breadcrumbs}
    >
      <NotificationEventFlowManager />
    </BaseLayout>
  );
};

export default withSeo(NotificationEventFlowsPage, {
  title: 'Notification Event Flows | Quasar Admin',
  description: 'Configure how notifications flow for each event across email, SMS, Telegram, and in-app channels.',
  path: '/notifications/event-flows',
});
