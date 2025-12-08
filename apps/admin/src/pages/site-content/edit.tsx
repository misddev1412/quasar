import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import BaseLayout from '../../components/layout/BaseLayout';
import { Alert, AlertDescription, AlertTitle } from '../../components/common/Alert';
import { Loading } from '../../components/common/Loading';
import { useToast } from '../../context/ToastContext';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { trpc } from '../../utils/trpc';
import SiteContentForm, {
  SiteContentFormSubmitPayload,
} from '../../components/site-content/SiteContentForm';
import { defaultSiteContentFormValues, SiteContent } from '../../types/site-content';

const SiteContentEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();

  const siteContentQuery = trpc.adminSiteContents.getSiteContentById.useQuery(
    { id: id || '' },
    { enabled: Boolean(id) },
  );

  const updateMutation = trpc.adminSiteContents.updateSiteContent.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: t('siteContent.notifications.updateSuccessTitle', 'Page updated'),
        description: t('siteContent.notifications.updateSuccessDescription', 'Changes have been saved successfully.'),
      });
      navigate('/site-content');
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('siteContent.notifications.updateErrorTitle', 'Unable to update page'),
        description: error.message || t('siteContent.notifications.updateErrorDescription', 'Please review your updates and try again.'),
      });
    },
  });

  const content = useMemo(() => {
    const response = siteContentQuery.data as any;
    return (response?.data || null) as SiteContent | null;
  }, [siteContentQuery.data]);

  const initialValues = useMemo(() => {
    if (!content) {
      return defaultSiteContentFormValues;
    }

    return {
      ...defaultSiteContentFormValues,
      code: content.code || '',
      title: content.title || '',
      slug: content.slug || '',
      category: content.category,
      status: content.status,
      summary: content.summary ?? '',
      content: content.content ?? '',
      languageCode: content.languageCode || 'vi',
      publishedAt: content.publishedAt ?? '',
      metadata: content.metadata ? JSON.stringify(content.metadata, null, 2) : '',
      displayOrder: content.displayOrder ?? 0,
      isFeatured: content.isFeatured ?? false,
    };
  }, [content]);

  const handleCancel = () => {
    navigate('/site-content');
  };

  const handleSubmit = async ({ formValues, metadata, publishedAt }: SiteContentFormSubmitPayload) => {
    if (!id) return;

    await updateMutation.mutateAsync({
      id,
      data: {
        code: formValues.code.trim(),
        title: formValues.title.trim(),
        slug: formValues.slug.trim(),
        category: formValues.category,
        status: formValues.status,
        summary: formValues.summary?.trim() ? formValues.summary.trim() : undefined,
        content: formValues.content?.trim() ? formValues.content.trim() : undefined,
        languageCode: formValues.languageCode.trim(),
        metadata: metadata ?? null,
        displayOrder: formValues.displayOrder,
        isFeatured: formValues.isFeatured,
        publishedAt: publishedAt ?? null,
      },
    });
  };

  return (
    <BaseLayout
      title={t('siteContent.edit.title', 'Edit Site Content')}
      description={t('siteContent.edit.description', 'Update the content and configuration for this page.')}
      actions={[
        {
          label: t('siteContent.actions.back', 'Back to list'),
          onClick: handleCancel,
          icon: <FiArrowLeft className="w-4 h-4" />,
        },
      ]}
      breadcrumbs={[
        { label: t('navigation.home', 'Home'), href: '/' },
        { label: t('siteContent.title', 'Site Content'), onClick: handleCancel },
        { label: content?.title || t('siteContent.edit.title', 'Edit Site Content') },
      ]}
    >
      {siteContentQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <Loading message={t('siteContent.loading', 'Loading content...')} />
        </div>
      ) : siteContentQuery.error ? (
        <Alert variant="destructive">
          <AlertTitle>{t('siteContent.errors.loadFailedTitle', 'Unable to load content')}</AlertTitle>
          <AlertDescription>{siteContentQuery.error.message}</AlertDescription>
        </Alert>
      ) : !content ? (
        <Alert className="border-amber-200 bg-amber-50 text-amber-900">
          <AlertTitle>{t('siteContent.errors.notFoundTitle', 'Content not found')}</AlertTitle>
          <AlertDescription>
            {t(
              'siteContent.errors.notFoundDescription',
              'We could not locate this page. It may have been removed.',
            )}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              {content.title || content.code}
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {t('siteContent.edit.subtitle', 'Update metadata, content blocks, and publishing preferences.')}
            </p>
          </div>

          <SiteContentForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={updateMutation.isPending}
            mode="edit"
          />
        </div>
      )}
    </BaseLayout>
  );
};

export default SiteContentEditPage;
