import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiGlobe } from 'react-icons/fi';
import { CreatePageTemplate } from '../../components/common/CreatePageTemplate';
import { CreateLanguageForm } from '../../components/languages/CreateLanguageForm';
import { useToast } from '../../context/ToastContext';
import { trpc } from '../../utils/trpc';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { CreateLanguageData } from '../../types/language';

const CreateLanguagePage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();

  // tRPC mutation for creating language
  const createLanguageMutation = trpc.adminLanguage.createLanguage.useMutation({
    onSuccess: (data) => {
      addToast({
        type: 'success',
        title: t('languages.createSuccess'),
        description: t('languages.createSuccessDescription'),
      });
      navigate('/languages');
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('languages.createError'),
        description: error.message || t('languages.createErrorDescription'),
      });
    },
  });

  const handleSubmit = async (formData: CreateLanguageData) => {
    try {
      await createLanguageMutation.mutateAsync(formData);
    } catch (error) {
      // Error handling is done in the mutation's onError callback
      console.error('Language creation error:', error);
    }
  };

  const handleCancel = () => {
    navigate('/languages');
  };

  return (
    <CreatePageTemplate
      title={t('languages.create', 'Create Language')}
      description={t('languages.createDescription', 'Add a new language to the system')}
      icon={<FiGlobe className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
      entityName={t('languages.language', 'Language')}
      entityNamePlural={t('languages.languages', 'Languages')}
      backUrl="/languages"
      onBack={handleCancel}
      isSubmitting={createLanguageMutation.isPending}
      maxWidth="full"
    >
      <CreateLanguageForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createLanguageMutation.isPending}
      />
    </CreatePageTemplate>
  );
};

export default CreateLanguagePage;