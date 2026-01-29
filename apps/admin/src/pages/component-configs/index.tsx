import React from 'react';
import { FiBox, FiHome } from 'react-icons/fi';
import { StandardListPage } from '../../components/common';
import { ComponentConfigsManager } from '../../components/component-configs';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';

const ComponentConfigsPage: React.FC = () => {
  const { t } = useTranslationWithBackend();

  return (
    <StandardListPage
      title={t('componentConfigs.title', 'Component Library')}
      description={t('componentConfigs.manageDescription', 'Manage storefront building blocks')}
      breadcrumbs={[
        { label: t('navigation.home', 'Home'), href: '/', icon: <FiHome className="w-4 h-4" /> },
        { label: t('componentConfigs.title', 'Component Library'), icon: <FiBox className="w-4 h-4" /> },
      ]}
    >
      <ComponentConfigsManager />
    </StandardListPage>
  );
};

export default ComponentConfigsPage;
