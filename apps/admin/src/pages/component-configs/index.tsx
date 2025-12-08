import React from 'react';
import { FiBox, FiHome } from 'react-icons/fi';
import BaseLayout from '../../components/layout/BaseLayout';
import { ComponentConfigsManager } from '../../components/component-configs/ComponentConfigsManager';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';

const ComponentConfigsPage: React.FC = () => {
  const { t } = useTranslationWithBackend();

  return (
    <BaseLayout
      title={t('componentConfigs.title', 'Component Library')}
      description={t(
        'componentConfigs.description',
        'Define storefront building blocks, default configuration, and parent-child relationships.',
      )}
      breadcrumbs={[
        { label: t('navigation.home', 'Home'), href: '/', icon: <FiHome className="w-4 h-4" /> },
        { label: t('componentConfigs.title', 'Component Library'), icon: <FiBox className="w-4 h-4" /> },
      ]}
    >
      <ComponentConfigsManager />
    </BaseLayout>
  );
};

export default ComponentConfigsPage;
