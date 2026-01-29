import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiTrash2, FiCpu } from 'react-icons/fi';
import { Button, PasswordVisibilityToggle, FormInput, Select, TextareaInput, Toggle, StandardFormPage, Loading, Alert, AlertDescription, AlertTitle, ConfirmationModal } from '../../components/common';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../contexts/ToastContext';
import { trpc } from '../../utils/trpc';
import { parseValidationErrors, getErrorMessage, isValidationError } from '../../utils/errorUtils';

interface OpenAiConfigFormData {
  id: string;
  name: string;
  model: string;
  apiKey: string;
  baseUrl?: string;
  active: boolean;
  description?: string;
}

const MODEL_SUGGESTIONS = [
  'gpt-4o-mini',
  'gpt-4o',
  'gpt-4.1-mini',
  'gpt-4.1',
  'gpt-3.5-turbo',
];

const EditOpenAiConfigPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();

  const [formData, setFormData] = useState<OpenAiConfigFormData | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof OpenAiConfigFormData, string>>>({});
  const [deleteModal, setDeleteModal] = useState(false);

  const { data, isLoading, error } = trpc.adminOpenAiConfig.getConfig.useQuery(
    { id: id! },
    { enabled: !!id }
  );

  const updateConfigMutation = trpc.adminOpenAiConfig.updateConfig.useMutation({
    onSuccess: () => {
      addToast({
        title: t('openai_configs.create_success_title', 'Success'),
        description: t('openai_configs.update_success_desc', 'OpenAI configuration updated successfully'),
        type: 'success',
      });
      navigate('/openai-configs');
    },
    onError: (error) => {
      setErrors({});
      const fieldErrors = parseValidationErrors(error);
      const errorMessage = getErrorMessage(error);

      if (isValidationError(error)) {
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
          addToast({
            title: t('common.validation_error', 'Validation Error'),
            description: t('common.validation_description', 'Please check the highlighted fields and correct the errors'),
            type: 'error',
          });
        } else {
          addToast({
            title: t('common.validation_error', 'Validation Error'),
            description: errorMessage || t('common.check_input_try_again', 'Please check your input and try again'),
            type: 'error',
          });
        }
      } else if (errorMessage?.includes('not found')) {
        addToast({
          title: t('openai_configs.config_not_found_title', 'Configuration Not Found'),
          description: t('openai_configs.config_not_found_desc', 'The OpenAI configuration you are trying to update no longer exists.'),
          type: 'error',
        });
        navigate('/openai-configs');
      } else if (errorMessage?.includes('already exists')) {
        setErrors({ name: t('openai_configs.config_exists_desc', 'A configuration with this name already exists') });
        addToast({
          title: t('openai_configs.config_exists_title', 'Configuration Exists'),
          description: t('openai_configs.config_exists_desc', 'An OpenAI configuration with this name already exists. Please choose a different name.'),
          type: 'error',
        });
      } else {
        addToast({
          title: t('common.error', 'Error'),
          description: errorMessage || t('openai_configs.update_error', 'Failed to update OpenAI configuration'),
          type: 'error',
        });
      }
    }
  });

  const deleteConfigMutation = trpc.adminOpenAiConfig.deleteConfig.useMutation({
    onSuccess: () => {
      addToast({
        title: t('openai_configs.create_success_title', 'Success'),
        description: t('openai_configs.delete_success_desc', 'OpenAI configuration deleted successfully'),
        type: 'success',
      });
      navigate('/openai-configs');
    },
    onError: (error) => {
      addToast({
        title: t('common.error', 'Error'),
        description: error.message || t('openai_configs.delete_error', 'Failed to delete OpenAI configuration'),
        type: 'error',
      });
    }
  });

  useEffect(() => {
    const responseData = data as any;
    if (responseData?.data) {
      setFormData(responseData.data as OpenAiConfigFormData);
    }
  }, [data]);

  const handleInputChange = (field: keyof OpenAiConfigFormData, value: string | boolean) => {
    if (formData) {
      setFormData(prev => prev ? { ...prev, [field]: value } : null);
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    }
  };

  const validateForm = (): boolean => {
    if (!formData) return false;

    const validationErrors: Partial<Record<keyof OpenAiConfigFormData, string>> = {};

    if (!formData.name.trim()) validationErrors.name = t('openai_configs.validation.name_required', 'Configuration name is required');
    if (!formData.model.trim()) validationErrors.model = t('openai_configs.validation.model_required', 'Model is required');
    if (!formData.apiKey.trim()) validationErrors.apiKey = t('openai_configs.validation.apikey_required', 'API key is required');

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData && validateForm()) {
      const { id: configId, ...updateData } = formData;
      updateConfigMutation.mutate({
        id: configId,
        ...updateData,
        baseUrl: updateData.baseUrl?.trim() || undefined,
        description: updateData.description?.trim() || undefined,
      });
    }
  };

  const handleCancel = () => {
    navigate('/openai-configs');
  };

  const handleDelete = () => {
    setDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (id) {
      deleteConfigMutation.mutate({ id });
    }
  };

  const formId = 'openai-config-edit-form';

  if (isLoading || !formData) {
    return (
      <StandardFormPage
        title={t('openai_configs.edit_title', 'Edit OpenAI Configuration')}
        description={t('openai_configs.edit_description', 'Update OpenAI configuration details')}
        icon={<div className="w-5 h-5 bg-primary-500 rounded" />}
        entityName={t('openai_configs.config', 'Configuration')}
        entityNamePlural={t('openai_configs.configs', 'OpenAI configurations')}
        backUrl="/openai-configs"
        onBack={handleCancel}
        showActions={false}
      >
        <Loading />
      </StandardFormPage>
    );
  }

  if (error) {
    return (
      <StandardFormPage
        title={t('openai_configs.edit_title', 'Edit OpenAI Configuration')}
        description={t('openai_configs.edit_description', 'Update OpenAI configuration details')}
        icon={<div className="w-5 h-5 bg-primary-500 rounded" />}
        entityName={t('openai_configs.config', 'Configuration')}
        entityNamePlural={t('openai_configs.configs', 'OpenAI configurations')}
        backUrl="/openai-configs"
        onBack={handleCancel}
        showActions={false}
      >
        <Alert variant="destructive">
          <AlertTitle>{t('admin.error', 'Error')}</AlertTitle>
          <AlertDescription>{(error as { message?: string })?.message || 'Failed to load OpenAI configuration'}</AlertDescription>
        </Alert>
      </StandardFormPage>
    );
  }

  return (
    <StandardFormPage
      title={t('openai_configs.edit_title', 'Edit OpenAI Configuration')}
      description={t('openai_configs.edit_description', 'Update OpenAI configuration details')}
      icon={<FiCpu className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
      entityName={t('openai_configs.config', 'Configuration')}
      entityNamePlural={t('openai_configs.configs', 'OpenAI configurations')}
      backUrl="/openai-configs"
      onBack={handleCancel}
      onCancel={handleCancel}
      isSubmitting={updateConfigMutation.isPending}
      mode="update"
      formId={formId}
      customActions={[
        {
          label: t('common.delete', 'Delete'),
          onClick: handleDelete,
          icon: <FiTrash2 className="w-4 h-4" />,
          variant: 'outline',
        },
      ]}
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FormInput
              id="name"
              type="text"
              label={t('openai_configs.name', 'Configuration Name *')}
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={t('openai_configs.name_placeholder', 'Production OpenAI')}
              error={errors.name}
            />
          </div>

          <div>
            <Select
              id="model"
              label={t('openai_configs.model', 'Model *')}
              value={formData.model}
              onChange={(value) => handleInputChange('model', value)}
              options={MODEL_SUGGESTIONS.map(model => ({ value: model, label: model }))}
              placeholder=""
              error={errors.model}
              required
            />
          </div>

          <div>
            <FormInput
              id="baseUrl"
              type="text"
              label={t('openai_configs.base_url', 'Base URL')}
              value={formData.baseUrl || ''}
              onChange={(e) => handleInputChange('baseUrl', e.target.value)}
              placeholder="https://api.openai.com"
            />
          </div>

          <div className="flex items-center space-x-3">
            <Toggle
              checked={formData.active}
              onChange={(checked) => handleInputChange('active', checked)}
            />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('openai_configs.active_config', 'Active Configuration')}
            </label>
          </div>
        </div>

        <div>
          <TextareaInput
            id="description"
            label={t('openai_configs.description', 'Description')}
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder={t('openai_configs.description_placeholder', 'Description of this OpenAI configuration...')}
            rows={3}
          />
        </div>

        <div>
          <FormInput
            id="apiKey"
            type={showApiKey ? 'text' : 'password'}
            label={t('openai_configs.api_key', 'API Key *')}
            value={formData.apiKey}
            onChange={(e) => handleInputChange('apiKey', e.target.value)}
            placeholder="sk-..."
            error={errors.apiKey}
            rightIcon={
              <PasswordVisibilityToggle
                isVisible={showApiKey}
                onToggle={() => setShowApiKey(!showApiKey)}
              />
            }
          />
          <p className="text-xs text-gray-500 mt-1">
            {t('openai_configs.api_key_help', 'Store your OpenAI API key securely.')}
          </p>
        </div>

      </form>

      <ConfirmationModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title={t('openai_configs.delete_modal_title', 'Delete OpenAI Configuration')}
        message={t('openai_configs.delete_modal_message', { name: formData.name, defaultValue: `Are you sure you want to delete "${formData.name}"? This action cannot be undone.` })}
        confirmText={t('common.delete', 'Delete')}
        confirmVariant="danger"
      />
    </StandardFormPage>
  );
};

export default EditOpenAiConfigPage;
