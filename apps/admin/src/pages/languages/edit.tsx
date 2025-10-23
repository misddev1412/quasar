import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiGlobe, FiHome } from 'react-icons/fi';
import { CreatePageTemplate } from '../../components/common/CreatePageTemplate';
import { EditLanguageForm } from '../../components/languages/EditLanguageForm';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { useToast } from '../../context/ToastContext';
import { trpc } from '../../utils/trpc';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { UpdateLanguageFormData } from '../../utils/validation';

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

  // Loading state
  if (languageQuery.isLoading) {
    return (
      <CreatePageTemplate
        title={t('languages.edit', 'Edit Language')}
        description={t('languages.editDescription', 'Update language information')}
        icon={<FiGlobe className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
        entityName={t('languages.language', 'Language')}
        entityNamePlural={t('languages.languages', 'Languages')}
        backUrl="/languages"
        onBack={handleCancel}
        isSubmitting={false}
        maxWidth="full"
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-neutral-600 dark:text-neutral-400">
            {t('common.loading')}...
          </div>
        </div>
      </CreatePageTemplate>
    );
  }

  // Error state
  if (languageQuery.error) {
    return (
      <CreatePageTemplate
        title={t('languages.edit', 'Edit Language')}
        description={t('languages.editDescription', 'Update language information')}
        icon={<FiGlobe className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
        entityName={t('languages.language', 'Language')}
        entityNamePlural={t('languages.languages', 'Languages')}
        backUrl="/languages"
        onBack={handleCancel}
        isSubmitting={false}
        maxWidth="full"
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-red-600 dark:text-red-400">
            {t('languages.loadError')}: {languageQuery.error.message}
          </div>
        </div>
      </CreatePageTemplate>
    );
  }

  // Language not found
  if (!(languageQuery.data as any)?.data) {
    return (
      <CreatePageTemplate
        title={t('languages.edit', 'Edit Language')}
        description={t('languages.editDescription', 'Update language information')}
        icon={<FiGlobe className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
        entityName={t('languages.language', 'Language')}
        entityNamePlural={t('languages.languages', 'Languages')}
        backUrl="/languages"
        onBack={handleCancel}
        isSubmitting={false}
        maxWidth="full"
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-neutral-600 dark:text-neutral-400">
            {t('languages.notFound')}
          </div>
        </div>
      </CreatePageTemplate>
    );
  }

  const language = (languageQuery.data as any).data;

  return (
    <CreatePageTemplate
      title={t('languages.editTitle', { name: language.name })}
      description={t('languages.editDescription', 'Update language information')}
      icon={<FiGlobe className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
      entityName={t('languages.language', 'Language')}
      entityNamePlural={t('languages.languages', 'Languages')}
      backUrl="/languages"
      onBack={handleCancel}
      isSubmitting={updateLanguageMutation.isPending}
      maxWidth="full"
    >
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            {
              label: 'Home',
              href: '/',
              icon: <FiHome className="w-4 h-4" />
            },
            {
              label: 'Languages',
              href: '/languages',
              icon: <FiGlobe className="w-4 h-4" />
            },
            {
              label: 'Edit Language',
              icon: <FiGlobe className="w-4 h-4" />
            }
          ]}
        />

        <EditLanguageForm
          language={language}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={updateLanguageMutation.isPending}
        />
      </div>
    </CreatePageTemplate>
  );
};

export default EditLanguagePage;