import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiGlobe, FiHome } from 'react-icons/fi';
import { StandardFormPage } from '@admin/components/common';
import { EditLanguageForm } from '@admin/components/languages';
import { useToast } from '@admin/contexts/ToastContext';
import { trpc } from '@admin/utils/trpc';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import { UpdateLanguageFormData } from '@admin/utils/validation';

const EditLanguagePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();

  // Fetch language data
  const languageQuery = trpc.adminLanguage.getLanguageById.useQuery(
    { id: id! },
    {
      enabled: !!id,
      retry: false,
    }
  );

  // tRPC mutation for updating language
  const updateLanguageMutation = trpc.adminLanguage.updateLanguage.useMutation({
    onSuccess: (data) => {
      addToast({
        type: 'success',
        title: t('languages.updateSuccess'),
        description: t('languages.updateSuccessDescription'),
      });
      navigate('/languages');
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('languages.updateError'),
        description: error.message || t('languages.updateErrorDescription'),
      });
    },
  });

  const baseBreadcrumbs = useMemo(() => ([
    { label: t('navigation.home'), href: '/', icon: <FiHome className="w-4 h-4" /> },
    { label: t('languages.languages', 'Languages'), href: '/languages', icon: <FiGlobe className="w-4 h-4" /> },
  ]), [t]);

  const language = (languageQuery.data as any)?.data;

  const detailBreadcrumbs = useMemo(() => {
    if (!language) return baseBreadcrumbs;
    return [
      ...baseBreadcrumbs,
      { label: language.name, href: `/languages/${language.id}/edit`, icon: <FiGlobe className="w-4 h-4" /> },
      { label: t('common.edit', 'Edit') },
    ];
  }, [baseBreadcrumbs, language, t]);

  const handleSubmit = async (formData: UpdateLanguageFormData) => {
    if (!id) {
      addToast({
        type: 'error',
        title: t('languages.updateError'),
        description: t('languages.invalidLanguageId'),
      });
      return;
    }

    try {
      await updateLanguageMutation.mutateAsync({
        id,
        data: formData,
      });
    } catch (error) {
      // Error handling is done in the mutation's onError callback
      console.error('Language update error:', error);
    }
  };

  const handleCancel = () => {
    navigate('/languages');
  };

  const formId = 'language-edit-form';

  // Loading state
  if (languageQuery.isLoading) {
    return (
      <StandardFormPage
        title={t('languages.edit', 'Edit Language')}
        description={t('languages.editDescription', 'Update language information')}
        icon={<FiGlobe className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
        entityName={t('languages.language', 'Language')}
        entityNamePlural={t('languages.languages', 'Languages')}
        backUrl="/languages"
        onBack={handleCancel}
        isSubmitting={false}
        showActions={false}
        breadcrumbs={[
          ...baseBreadcrumbs,
          { label: t('languages.edit', 'Edit Language') }
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

  // Error state
  if (languageQuery.error) {
    return (
      <StandardFormPage
        title={t('languages.edit', 'Edit Language')}
        description={t('languages.editDescription', 'Update language information')}
        icon={<FiGlobe className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
        entityName={t('languages.language', 'Language')}
        entityNamePlural={t('languages.languages', 'Languages')}
        backUrl="/languages"
        onBack={handleCancel}
        isSubmitting={false}
        showActions={false}
        breadcrumbs={[
          ...baseBreadcrumbs,
          { label: t('languages.edit', 'Edit Language') }
        ]}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-red-600 dark:text-red-400">
            {t('languages.loadError')}: {languageQuery.error.message}
          </div>
        </div>
      </StandardFormPage>
    );
  }

  // Language not found
  if (!language) {
    return (
      <StandardFormPage
        title={t('languages.edit', 'Edit Language')}
        description={t('languages.editDescription', 'Update language information')}
        icon={<FiGlobe className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
        entityName={t('languages.language', 'Language')}
        entityNamePlural={t('languages.languages', 'Languages')}
        backUrl="/languages"
        onBack={handleCancel}
        isSubmitting={false}
        showActions={false}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-neutral-600 dark:text-neutral-400">
            {t('languages.notFound')}
          </div>
        </div>
      </StandardFormPage>
    );
  }

  return (
    <StandardFormPage
      title={t('languages.editTitle', { name: language.name })}
      description={t('languages.editDescription', 'Update language information')}
      icon={<FiGlobe className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
      entityName={t('languages.language', 'Language')}
      entityNamePlural={t('languages.languages', 'Languages')}
      backUrl="/languages"
      onBack={handleCancel}
      isSubmitting={updateLanguageMutation.isPending}
      formId={formId}
      breadcrumbs={detailBreadcrumbs}
    >
      <div className="space-y-6">
        <EditLanguageForm
          language={language}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={updateLanguageMutation.isPending}
          showActions={false}
          formId={formId}
        />
      </div>
    </StandardFormPage>
  );
};

export default EditLanguagePage;
