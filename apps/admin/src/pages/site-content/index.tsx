import React, { useState } from 'react';
import { StandardListPage } from '../../components/common';
import { SiteContentContainer } from '../../components/site-content';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import type { ReactNode } from 'react';

const SiteContentListPage: React.FC = () => {
  const { t } = useTranslationWithBackend();
  const [actions, setActions] = useState<Array<{
    label: string;
    onClick: () => void;
    primary?: boolean;
    icon?: ReactNode;
    active?: boolean;
  }>>([]);

  return (
    <StandardListPage
      title={t('siteContent.title', 'Site Content')}
      description={t('siteContent.description', 'Manage storefront policies, guides, and informational pages.')}
      breadcrumbs={[
        { label: t('navigation.home', 'Home'), href: '/' },
        { label: t('siteContent.title', 'Site Content') },
      ]}
      actions={actions}
    >
      <SiteContentContainer onActionsChange={setActions} />
    </StandardListPage>
  );
};

export default SiteContentListPage;
