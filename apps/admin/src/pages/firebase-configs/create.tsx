import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiEye, FiEyeOff } from 'react-icons/fi';
import { CreatePageTemplate } from '../../components/common/CreatePageTemplate';
import { FormInput } from '../../components/common/FormInput';
import { TextareaInput } from '../../components/common/TextareaInput';
import { Toggle } from '../../components/common/Toggle';
import { Button } from '../../components/common/Button';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../context/ToastContext';
import { trpc } from '../../utils/trpc';
import { parseValidationErrors, getErrorMessage, isValidationError } from '../../utils/errorUtils';

interface FirebaseConfigFormData {
  name: string;
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  measurementId?: string;
  serviceAccountKey?: string;
  active: boolean;
  description?: string;
}

const CreateFirebaseConfigPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();

  const [formData, setFormData] = useState<FirebaseConfigFormData>({
    name: '',
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: '',
    serviceAccountKey: '',
    active: true,
    description: '',
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [showServiceAccountKey, setShowServiceAccountKey] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FirebaseConfigFormData, string>>>({});

  const createConfigMutation = trpc.adminFirebaseConfig.createConfig.useMutation({
    onSuccess: () => {
      addToast({
        title: 'Success',
        description: 'Firebase configuration created successfully',
        type: 'success',
      });
      navigate('/firebase-configs');
    },
    onError: (error) => {
      console.error('Create config error:', error);
      
      // Clear any existing errors first
      setErrors({});
      
      // Parse field-specific validation errors
      const fieldErrors = parseValidationErrors(error);
      const errorMessage = getErrorMessage(error);
      
      // Check if this is a validation error
      if (isValidationError(error)) {
        // If we found field-specific errors, set them
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
          addToast({
            title: 'Validation Error',
            description: 'Please check the highlighted fields and correct the errors',
            type: 'error',
          });
        } else {
          // Generic validation error
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
          description: 'A Firebase configuration with this name already exists. Please choose a different name.',
          type: 'error',
        });
      } else {
        // Generic error
        addToast({
          title: 'Error',
          description: errorMessage || 'Failed to create Firebase configuration',
          type: 'error',
        });
      }
    }
  });

  const handleInputChange = (field: keyof FirebaseConfigFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const validationErrors: Partial<Record<keyof FirebaseConfigFormData, string>> = {};
    
    if (!formData.name.trim()) validationErrors.name = 'Configuration name is required';
    if (!formData.apiKey.trim()) validationErrors.apiKey = 'API key is required';
    if (!formData.authDomain.trim()) validationErrors.authDomain = 'Auth domain is required';
    if (!formData.projectId.trim()) validationErrors.projectId = 'Project ID is required';
    if (!formData.appId.trim()) validationErrors.appId = 'App ID is required';

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
      createConfigMutation.mutate(formData);
    }
  };

  const handleCancel = () => {
    navigate('/firebase-configs');
  };

  const handleImportFromFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const config = JSON.parse(e.target?.result as string);
            
            // Clear any existing errors
            setErrors({});
            
            // Detect file type and handle accordingly
            let updatedFormData = { ...formData };
            
            if (config.type === 'service_account') {
              // This is a Firebase Admin SDK service account file
              updatedFormData = {
                ...formData,
                projectId: config.project_id || '',
                name: formData.name || `${config.project_id}-config`,
                serviceAccountKey: JSON.stringify(config, null, 2),
                // For service account, we can only fill in project-based fields
                authDomain: `${config.project_id}.firebaseapp.com`,
                storageBucket: `${config.project_id}.appspot.com`,
              };
              
              addToast({
                title: 'Service Account Detected',
                description: 'Imported Firebase Admin SDK service account. You still need to add Web App configuration (API Key, App ID, etc.) from Firebase Console.',
                type: 'warning',
              });
            } else {
              // This should be a web app configuration
              updatedFormData = {
                ...formData,
                apiKey: config.apiKey || config.api_key || '',
                authDomain: config.authDomain || config.auth_domain || '',
                projectId: config.projectId || config.project_id || '',
                storageBucket: config.storageBucket || config.storage_bucket || '',
                messagingSenderId: config.messagingSenderId || config.messaging_sender_id || '',
                appId: config.appId || config.app_id || '',
                measurementId: config.measurementId || config.measurement_id || '',
                name: formData.name || config.projectId || config.project_id || `${config.projectId || config.project_id}-config`,
              };
            }
            // Update form data
            setFormData(updatedFormData);
            
            // Count how many fields were imported (only if not a service account)
            if (config.type !== 'service_account') {
              const importedFields = Object.entries(updatedFormData).filter(([key, value]) => {
                if (key === 'name' || key === 'active' || key === 'description') return false;
                return value && value.toString().trim() !== '';
              }).length;
              
              if (importedFields > 0) {
                addToast({
                  title: 'Success',
                  description: `Firebase configuration imported successfully. ${importedFields} fields populated.`,
                  type: 'success',
                });
              } else {
                addToast({
                  title: 'Warning',
                  description: 'No valid Firebase configuration fields found in the uploaded file.',
                  type: 'warning',
                });
              }
            }
          } catch (error) {
            console.error('Import error:', error);
            addToast({
              title: 'Error',
              description: 'Invalid JSON file. Please ensure you upload a valid Firebase configuration file.',
              type: 'error',
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <CreatePageTemplate
      title={t('firebase_configs.create_config', 'Create Firebase Configuration')}
      description={t('firebase_configs.create_config_description', 'Add a new Firebase project configuration')}
      icon={<FiUpload className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
      entityName={t('firebase_configs.config', 'Configuration')}
      entityNamePlural={t('firebase_configs.configs', 'Firebase Configurations')}
      backUrl="/firebase-configs"
      onBack={handleCancel}
      isSubmitting={createConfigMutation.isPending}
      maxWidth="4xl"
      customActions={[
        {
          label: t('firebase_configs.import_from_json', 'Import from JSON'),
          onClick: handleImportFromFile,
          icon: <FiUpload className="w-4 h-4" />,
          variant: 'outline',
        },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FormInput
              id="name"
              type="text"
              label={t('firebase_configs.config_name', 'Configuration Name *')}
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={t('firebase_configs.config_name_placeholder', 'e.g., Production, Development')}
              error={errors.name}
            />
          </div>

          <div>
            <FormInput
              id="projectId"
              type="text"
              label={t('firebase_configs.project_id', 'Project ID *')}
              value={formData.projectId}
              onChange={(e) => handleInputChange('projectId', e.target.value)}
              placeholder="your-project-id"
              error={errors.projectId}
            />
          </div>

          <div>
            <FormInput
              id="authDomain"
              type="text"
              label={t('firebase_configs.auth_domain', 'Auth Domain *')}
              value={formData.authDomain}
              onChange={(e) => handleInputChange('authDomain', e.target.value)}
              placeholder="your-project.firebaseapp.com"
              error={errors.authDomain}
            />
          </div>

          <div>
            <FormInput
              id="appId"
              type="text"
              label={t('firebase_configs.app_id', 'App ID *')}
              value={formData.appId}
              onChange={(e) => handleInputChange('appId', e.target.value)}
              placeholder="1:123456789:web:abcdef"
              error={errors.appId}
            />
          </div>

          <div>
            <FormInput
              id="storageBucket"
              type="text"
              label={t('firebase_configs.storage_bucket', 'Storage Bucket')}
              value={formData.storageBucket || ''}
              onChange={(e) => handleInputChange('storageBucket', e.target.value)}
              placeholder="your-project.appspot.com"
            />
          </div>

          <div>
            <FormInput
              id="messagingSenderId"
              type="text"
              label={t('firebase_configs.messaging_sender_id', 'Messaging Sender ID')}
              value={formData.messagingSenderId || ''}
              onChange={(e) => handleInputChange('messagingSenderId', e.target.value)}
              placeholder="123456789"
            />
          </div>

          <div>
            <FormInput
              id="measurementId"
              type="text"
              label={t('firebase_configs.measurement_id', 'Measurement ID')}
              value={formData.measurementId || ''}
              onChange={(e) => handleInputChange('measurementId', e.target.value)}
              placeholder="G-XXXXXXX"
            />
          </div>

          <div className="flex items-center space-x-3">
            <Toggle
              checked={formData.active}
              onChange={(checked) => handleInputChange('active', checked)}
            />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('firebase_configs.active_config', 'Active Configuration')}
            </label>
          </div>
        </div>

        <div>
          <TextareaInput
            id="description"
            label={t('firebase_configs.description', 'Description')}
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder={t('firebase_configs.description_placeholder', 'Description of this Firebase configuration...')}
            rows={3}
          />
        </div>

        <div className="space-y-6">
          <div>
            <div className="relative">
              <FormInput
                id="apiKey"
                type={showApiKey ? 'text' : 'password'}
                label={t('firebase_configs.web_api_key', 'Web API Key *')}
                value={formData.apiKey}
                onChange={(e) => handleInputChange('apiKey', e.target.value)}
                placeholder="AIzaSyC..."
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
              {t('firebase_configs.api_key_help', 'Found in Firebase Console → Project Settings → Web apps')}
            </p>
          </div>

          <div>
            <div className="relative">
              <TextareaInput
                id="serviceAccountKey"
                label={t('firebase_configs.service_account_key', 'Service Account Key (JSON)')}
                value={formData.serviceAccountKey || ''}
                onChange={(e) => handleInputChange('serviceAccountKey', e.target.value)}
                placeholder='{"type": "service_account", "project_id": "...", ...}'
                rows={6}
                className={showServiceAccountKey ? '' : 'font-mono text-xs'}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowServiceAccountKey(!showServiceAccountKey)}
                className="absolute right-2 top-8"
                startIcon={showServiceAccountKey ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {t('firebase_configs.service_account_help', 'Download from Firebase Console → Project Settings → Service Accounts → Generate new private key')}
            </p>
          </div>
        </div>
      </form>
    </CreatePageTemplate>
  );
};

export default CreateFirebaseConfigPage;
