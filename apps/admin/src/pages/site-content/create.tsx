import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { CreatePageTemplate } from '../../components/common/CreatePageTemplate';
import { useToast } from '../../context/ToastContext';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useUrlTabs } from '../../hooks/useUrlTabs';
import { trpc } from '../../utils/trpc';
import SiteContentForm, {
  SiteContentFormSubmitPayload,
} from '../../components/site-content/SiteContentForm';
import { defaultSiteContentFormValues } from '../../types/site-content';

const SiteContentCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();

  const { activeTab, handleTabChange } = useUrlTabs({
    defaultTab: 0,
    tabParam: 'tab',
    tabKeys: ['general', 'content', 'settings'],
  });

  const createMutation = trpc.adminSiteContents.createSiteContent.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: t('siteContent.notifications.createSuccessTitle', 'Page created'),
        description: t(
          'siteContent.notifications.createSuccessDescription',
          'The page is now available in your storefront.',
        ),
      });
      navigate('/site-content');
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('siteContent.notifications.createErrorTitle', 'Unable to create page'),
        description:
          error.message ||
          t(
            'siteContent.notifications.createErrorDescription',
            'Please review your input and try again.',
          ),
      });
    },
  });

  const handleSubmit = async ({ formValues, metadata, publishedAt }: SiteContentFormSubmitPayload) => {
    await createMutation.mutateAsync({
      code: formValues.code.trim(),
      title: formValues.title.trim(),
      slug: formValues.slug.trim(),
      category: formValues.category,
      status: formValues.status,
      summary: formValues.summary?.trim() ? formValues.summary.trim() : undefined,
      content: formValues.content?.trim() ? formValues.content.trim() : undefined,
      languageCode: formValues.languageCode.trim(),
      metadata: metadata ?? undefined,
      displayOrder: formValues.displayOrder,
      isFeatured: formValues.isFeatured,
      publishedAt: publishedAt,
    });
  };

  const handleCancel = () => {
    navigate('/site-content');
  };

  return (
    <CreatePageTemplate
      title={t('siteContent.create.title', 'Create Site Content')}
      description={t(
        'siteContent.create.description',
        'Craft a new informational page for your storefront.',
      )}
      icon={<FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
      entityName={t('siteContent.pageLabel', 'Page')}
      entityNamePlural={t('siteContent.title', 'Site Content')}
      backUrl="/site-content"
      onBack={handleCancel}
      isSubmitting={createMutation.isPending}
      maxWidth="full"
      breadcrumbs={[
        { label: t('navigation.home', 'Home'), href: '/' },
        { label: t('siteContent.title', 'Site Content'), onClick: handleCancel },
        { label: t('siteContent.create.title', 'Create Site Content') },
      ]}
    >
      <SiteContentForm
        initialValues={defaultSiteContentFormValues}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createMutation.isPending}
        mode="create"
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </CreatePageTemplate>
  );
};

export default SiteContentCreatePage;
