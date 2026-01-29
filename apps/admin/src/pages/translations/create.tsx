import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFileText } from 'react-icons/fi';
import { StandardFormPage } from '@admin/components/common';
import { CreateTranslationForm } from '@admin/components/translations';
import { useToast } from '@admin/contexts/ToastContext';
import { trpc } from '@admin/utils/trpc';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import { CreateTranslationData } from '@admin/types/translation';

const CreateTranslationPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();

  const createTranslationMutation = trpc.adminTranslation.createTranslation.useMutation({
    onSuccess: (data) => {
      addToast({
        type: 'success',
        title: t('translations.createSuccess'),
        description: t('translations.createSuccessDescription'),
      });
      navigate('/translations');
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('translations.createError'),
        description: error.message || t('translations.createErrorDescription'),
      });
    },
  });

  const handleSubmit = async (formData: CreateTranslationData) => {
    try {
      await createTranslationMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Translation creation error:', error);
    }
  };

  const handleCancel = () => {
    navigate('/translations');
  };

  const formId = 'translation-create-form';

  return (
    <StandardFormPage
      title={t('translations.create', 'Create Translation')}
      description={t('translations.createDescription', 'Add a new translation to the system')}
      icon={<FiFileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
      entityName={t('translations.translation', 'Translation')}
      entityNamePlural={t('translations.translations', 'Translations')}
      backUrl="/translations"
      onBack={handleCancel}
      isSubmitting={createTranslationMutation.isPending}
      formId={formId}
    >
      <CreateTranslationForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createTranslationMutation.isPending}
        showActions={false}
        formId={formId}
      />
    </StandardFormPage>
  );
};

export default CreateTranslationPage;
