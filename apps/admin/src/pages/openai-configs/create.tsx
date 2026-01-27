import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { CreatePageTemplate } from '../../components/common/CreatePageTemplate';
import { FormInput } from '../../components/common/FormInput';
import { TextareaInput } from '../../components/common/TextareaInput';
import { Toggle } from '../../components/common/Toggle';
import { Button } from '../../components/common/Button';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../contexts/ToastContext';
import { trpc } from '../../utils/trpc';
import { parseValidationErrors, getErrorMessage, isValidationError } from '../../utils/errorUtils';

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
        title: 'Success',
        description: 'OpenAI configuration created successfully',
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
            title: 'Validation Error',
            description: 'Please check the highlighted fields and correct the errors',
            type: 'error',
          });
        } else {
          addToast({
            title: 'Validation Error',
            description: errorMessage || 'Please check your input and try again',
            type: 'error',
          });
        }
      } else if (errorMessage?.includes('already exists')) {
        setErrors({ name: 'A configuration with this name already exists' });
        addToast({
          title: 'Configuration Exists',
          description: 'An OpenAI configuration with this name already exists. Please choose a different name.',
          type: 'error',
        });
      } else {
        addToast({
          title: 'Error',
          description: errorMessage || 'Failed to create OpenAI configuration',
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

    if (!formData.name.trim()) validationErrors.name = 'Configuration name is required';
    if (!formData.model.trim()) validationErrors.model = 'Model is required';
    if (!formData.apiKey.trim()) validationErrors.apiKey = 'API key is required';

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

  return (
    <CreatePageTemplate
      title={t('openai_configs.create_title', 'Create OpenAI Configuration')}
      description={t('openai_configs.create_description', 'Add a new OpenAI model configuration for content generation')}
      icon={<div className="w-5 h-5 bg-primary-500 rounded" />}
      entityName="OpenAI configuration"
      entityNamePlural="OpenAI configurations"
      backUrl="/openai-configs"
      onBack={handleCancel}
      onCancel={handleCancel}
      showActions={false}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
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
            <FormInput
              id="model"
              type="text"
              label={t('openai_configs.model', 'Model *')}
              value={formData.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
              placeholder="gpt-4o-mini"
              list="openai-models"
              error={errors.model}
            />
            <datalist id="openai-models">
              {MODEL_SUGGESTIONS.map((model) => (
                <option key={model} value={model} />
              ))}
            </datalist>
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
          <div className="relative">
            <FormInput
              id="apiKey"
              type={showApiKey ? 'text' : 'password'}
              label={t('openai_configs.api_key', 'API Key *')}
              value={formData.apiKey}
              onChange={(e) => handleInputChange('apiKey', e.target.value)}
              placeholder="sk-..."
              error={errors.apiKey}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-2 top-8"
              startIcon={showApiKey ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {t('openai_configs.api_key_help', 'Store your OpenAI API key securely.')}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button type="submit" variant="primary" isLoading={createConfigMutation.isPending}>
            {t('common.save', 'Save')}
          </Button>
          <Button type="button" variant="outline" onClick={handleCancel}>
            {t('common.cancel', 'Cancel')}
          </Button>
        </div>
      </form>
    </CreatePageTemplate>
  );
};

export default CreateOpenAiConfigPage;
