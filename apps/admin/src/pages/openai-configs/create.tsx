import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCpu } from 'react-icons/fi';
import { PasswordVisibilityToggle, StandardFormPage, FormInput, Select, TextareaInput, Toggle, Button } from '@admin/components/common';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import { useToast } from '@admin/contexts/ToastContext';
import { trpc } from '@admin/utils/trpc';
import { parseValidationErrors, getErrorMessage, isValidationError } from '@admin/utils/errorUtils';

interface OpenAiConfigFormData {
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

const CreateOpenAiConfigPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();

  const [formData, setFormData] = useState<OpenAiConfigFormData>({
    name: '',
    model: MODEL_SUGGESTIONS[0],
    apiKey: '',
    baseUrl: '',
    active: true,
    description: '',
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof OpenAiConfigFormData, string>>>({});

  const createConfigMutation = trpc.adminOpenAiConfig.createConfig.useMutation({
    onSuccess: () => {
      addToast({
        title: t('openai_configs.create_success_title', 'Success'),
        description: t('openai_configs.create_success_desc', 'OpenAI configuration created successfully'),
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
          description: errorMessage || t('openai_configs.create_error', 'Failed to create OpenAI configuration'),
          type: 'error',
        });
      }
    }
  });

  const handleInputChange = (field: keyof OpenAiConfigFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
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
    if (validateForm()) {
      const payload = {
        ...formData,
        baseUrl: formData.baseUrl?.trim() || undefined,
        description: formData.description?.trim() || undefined,
      };
      createConfigMutation.mutate(payload);
    }
  };

  const handleCancel = () => {
    navigate('/openai-configs');
  };

  const formId = 'openai-config-create-form';

  return (
    <StandardFormPage
      title={t('openai_configs.create_title', 'Create OpenAI Configuration')}
      description={t('openai_configs.create_description', 'Add a new OpenAI model configuration for content generation')}
      icon={<FiCpu className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
      entityName={t('openai_configs.config', 'Configuration')}
      entityNamePlural={t('openai_configs.configs', 'OpenAI configurations')}
      backUrl="/openai-configs"
      onBack={handleCancel}
      onCancel={handleCancel}
      isSubmitting={createConfigMutation.isPending}
      formId={formId}
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
    </StandardFormPage>
  );
};

export default CreateOpenAiConfigPage;
