import React, { useRef, useState } from 'react';
import { FiHome, FiLayout, FiRefreshCw, FiSave } from 'react-icons/fi';
import { BaseLayout } from '@admin/components/layout';
import { withAdminSeo } from '@admin/components/SEO';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import FooterSettingsForm, { FooterSettingsFormRef } from '@admin/components/storefront/FooterSettingsForm';

const StorefrontFooterPage: React.FC = () => {
  const { t } = useTranslationWithBackend();
  const formRef = useRef<FooterSettingsFormRef>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    formRef.current?.save();
  };

  const handleReset = () => {
    formRef.current?.reset();
  };

  return (
    <BaseLayout
      title={t('storefront.footer.title', 'Storefront footer')}
      description={t('storefront.footer.description', 'Control layout, branding, social links, and legal information.')}
      breadcrumbs={[
        {
          label: t('navigation.home', 'Home'),
          href: '/',
          icon: <FiHome className="h-4 w-4" />,
        },
        {
          label: t('storefront.footer.nav', 'Footer builder'),
          icon: <FiLayout className="h-4 w-4" />,
        },
      ]}
      actions={[
        {
          label: t('storefront.footer.actions.reset', 'Reset'),
          onClick: handleReset,
          icon: <FiRefreshCw />,
          disabled: !isDirty || isSaving,
        },
        {
          label: t('storefront.footer.actions.save', 'Save changes'),
          onClick: handleSave,
          primary: true,
          icon: <FiSave />,
          disabled: !isDirty || isSaving,
        },
      ]}
    >
      <FooterSettingsForm
        ref={formRef}
        onDirtyChange={setIsDirty}
        onSavingChange={setIsSaving}
      />
    </BaseLayout>
  );
};

export default withAdminSeo(StorefrontFooterPage, {
  title: 'Storefront footer | Quasar Admin',
  description: 'Customize the storefront footer layout, branding, and links.',
  path: '/storefront/footer',
});
