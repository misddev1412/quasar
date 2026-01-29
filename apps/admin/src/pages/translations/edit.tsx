import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiFileText, FiHome } from 'react-icons/fi';
import { StandardFormPage } from '../../components/common';
import { EditTranslationForm } from '../../components/translations';
import { useToast } from '../../contexts/ToastContext';
import { trpc } from '../../utils/trpc';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { UpdateTranslationData } from '../../types/translation';

const EditTranslationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();

  const translationQuery = trpc.adminTranslation.getTranslationById.useQuery(
    { id: id! },
    {
      enabled: !!id,
      retry: false,
    }
  );

  const updateTranslationMutation = trpc.adminTranslation.updateTranslation.useMutation({
    onSuccess: (data) => {
      addToast({
        type: 'success',
        title: t('translations.updateSuccess'),
        description: t('translations.updateSuccessDescription'),
      });
      navigate('/translations');
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('translations.updateError'),
        description: error.message || t('translations.updateErrorDescription'),
      });
    },
  });

  const baseBreadcrumbs = useMemo(() => ([
    { label: t('navigation.home'), href: '/', icon: <FiHome className="w-4 h-4" /> },
    { label: t('translations.translations', 'Translations'), href: '/translations', icon: <FiFileText className="w-4 h-4" /> },
  ]), [t]);

  const handleSubmit = async (formData: UpdateTranslationData) => {
    if (!id) {
      addToast({
        type: 'error',
        title: t('translations.updateError'),
        description: t('translations.invalidTranslationId'),
      });
      return;
    }

    try {
      await updateTranslationMutation.mutateAsync({
        id,
        data: formData,
      });
    } catch (error) {
      console.error('Translation update error:', error);
    }
  };

  const handleCancel = () => {
    navigate('/translations');
  };

  const formId = 'translation-edit-form';

  if (translationQuery.isLoading) {
    return (
      <StandardFormPage
        title={t('translations.edit', 'Edit Translation')}
        description={t('translations.editDescription', 'Update translation information')}
        icon={<FiFileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
        entityName={t('translations.translation', 'Translation')}
        entityNamePlural={t('translations.translations', 'Translations')}
        backUrl="/translations"
        onBack={handleCancel}
        isSubmitting={false}
        showActions={false}
        breadcrumbs={[
          ...baseBreadcrumbs,
          { label: t('translations.edit', 'Edit Translation') }
        ]}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-neutral-600 dark:text-neutral-400">
            {t('common.loading')}...
          </div>
        </div>
      </StandardFormPage>
    );
  }

  if (translationQuery.error) {
    return (
      <StandardFormPage
        title={t('translations.edit', 'Edit Translation')}
        description={t('translations.editDescription', 'Update translation information')}
        icon={<FiFileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
        entityName={t('translations.translation', 'Translation')}
        entityNamePlural={t('translations.translations', 'Translations')}
        backUrl="/translations"
        onBack={handleCancel}
        isSubmitting={false}
        showActions={false}
        breadcrumbs={[
          ...baseBreadcrumbs,
          { label: t('translations.edit', 'Edit Translation') }
        ]}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-red-600 dark:text-red-400">
            {t('translations.loadError')}: {translationQuery.error.message}
          </div>
        </div>
      </StandardFormPage>
    );
  }

  if (!(translationQuery.data as any)?.data) {
    return (
      <StandardFormPage
        title={t('translations.edit', 'Edit Translation')}
        description={t('translations.editDescription', 'Update translation information')}
        icon={<FiFileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
        entityName={t('translations.translation', 'Translation')}
        entityNamePlural={t('translations.translations', 'Translations')}
        backUrl="/translations"
        onBack={handleCancel}
        isSubmitting={false}
        showActions={false}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-neutral-600 dark:text-neutral-400">
            {t('translations.notFound')}
          </div>
        </div>
      </StandardFormPage>
    );
  }

  const translation = (translationQuery.data as any).data;

  return (
    <StandardFormPage
      title={t('translations.edit', 'Edit Translation')}
      description={t('translations.editDescription', 'Update translation information')}
      icon={<FiFileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
      entityName={t('translations.translation', 'Translation')}
      entityNamePlural={t('translations.translations', 'Translations')}
      backUrl="/translations"
      onBack={handleCancel}
      isSubmitting={updateTranslationMutation.isPending}
      formId={formId}
      breadcrumbs={[
        ...baseBreadcrumbs,
        { label: t('translations.edit', 'Edit Translation') }
      ]}
    >
      <EditTranslationForm
        translation={translation}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={updateTranslationMutation.isPending}
        showActions={false}
        formId={formId}
      />
    </StandardFormPage>
  );
};

export default EditTranslationPage;
