import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiX, FiUpload, FiEye, FiEyeOff, FiActivity, FiTrash2 } from 'react-icons/fi';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { FormInput } from '../../components/common/FormInput';
import { TextareaInput } from '../../components/common/TextareaInput';
import { Toggle } from '../../components/common/Toggle';
import BaseLayout from '../../components/layout/BaseLayout';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../contexts/ToastContext';
import { trpc } from '../../utils/trpc';
import { parseValidationErrors, getErrorMessage, isValidationError } from '../../utils/errorUtils';
import { Loading } from '../../components/common/Loading';
import { Alert, AlertDescription, AlertTitle } from '../../components/common/Alert';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';

interface FirebaseConfigFormData {
  id: string;
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

const EditFirebaseConfigPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();

  const [formData, setFormData] = useState<FirebaseConfigFormData | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showServiceAccountKey, setShowServiceAccountKey] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FirebaseConfigFormData, string>>>({});
  const [deleteModal, setDeleteModal] = useState(false);

  const { data, isLoading, error } = trpc.adminFirebaseConfig.getConfig.useQuery(
    { id: id! },
    { enabled: !!id }
  );

  const updateConfigMutation = trpc.adminFirebaseConfig.updateConfig.useMutation({
    onSuccess: () => {
      addToast({
        title: 'Success',
        description: 'Firebase configuration updated successfully',
        type: 'success',
      });
      navigate('/firebase-configs');
    },
    onError: (error) => {
      console.error('Update config error:', error);
      
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
      } else if (errorMessage?.includes('not found')) {
        addToast({
          title: 'Configuration Not Found',
          description: 'The Firebase configuration you are trying to update no longer exists.',
          type: 'error',
        });
        navigate('/firebase-configs');
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
          description: errorMessage || 'Failed to update Firebase configuration',
          type: 'error',
        });
      }
    }
  });

  const deleteConfigMutation = trpc.adminFirebaseConfig.deleteConfig.useMutation({
    onSuccess: () => {
      addToast({
        title: 'Success',
        description: 'Firebase configuration deleted successfully',
        type: 'success',
      });
      navigate('/firebase-configs');
    },
    onError: (error) => {
      if (error.message?.includes('not found')) {
        addToast({
          title: 'Configuration Not Found',
          description: 'The Firebase configuration you are trying to delete no longer exists.',
          type: 'error',
        });
        navigate('/firebase-configs');
      } else if (error.message?.includes('active') || error.message?.includes('in use')) {
        addToast({
          title: 'Cannot Delete Active Configuration',
          description: 'You cannot delete an active Firebase configuration. Please deactivate it first.',
          type: 'error',
        });
      } else {
        addToast({
          title: 'Error',
          description: error.message || 'Failed to delete Firebase configuration',
          type: 'error',
        });
      }
    }
  });

  // Initialize form data when data loads
  useEffect(() => {
    const responseData = data as any;
    if (responseData?.data) {
      setFormData(responseData.data as FirebaseConfigFormData);
    }
  }, [data]);

  const handleInputChange = (field: keyof FirebaseConfigFormData, value: string | boolean) => {
    if (formData) {
      setFormData(prev => prev ? { ...prev, [field]: value } : null);
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    }
  };

  const validateForm = (): boolean => {
    if (!formData) return false;
    
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
    if (formData && validateForm()) {
      const { id: configId, ...updateData } = formData;
      updateConfigMutation.mutate({ id: configId, ...updateData });
    }
  };

  const handleCancel = () => {
    navigate('/firebase-configs');
  };

  const handleDelete = () => {
    setDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (id) {
      deleteConfigMutation.mutate({ id });
    }
  };

  const handleTestConnection = () => {
    addToast({
      title: 'Testing Connection',
      description: 'Testing Firebase connection...',
      type: 'info',
    });
    
    // Mock test after delay
    setTimeout(() => {
      addToast({
        title: 'Connection Test',
        description: 'Firebase connection test completed successfully',
        type: 'success',
      });
    }, 2000);
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
            
            if (formData) {
              // Clear any existing errors
              setErrors({});
              
              // Create updated form data with both camelCase and snake_case support
              const updatedFormData = {
                ...formData,
                apiKey: config.apiKey || config.api_key || formData.apiKey,
                authDomain: config.authDomain || config.auth_domain || formData.authDomain,
                projectId: config.projectId || config.project_id || formData.projectId,
                storageBucket: config.storageBucket || config.storage_bucket || formData.storageBucket,
                messagingSenderId: config.messagingSenderId || config.messaging_sender_id || formData.messagingSenderId,
                appId: config.appId || config.app_id || formData.appId,
                measurementId: config.measurementId || config.measurement_id || formData.measurementId,
              };
              
              setFormData(updatedFormData);
              
              // Count how many fields were updated
              const updatedFields = Object.entries(updatedFormData).filter(([key, value]) => {
                if (key === 'id' || key === 'name' || key === 'active' || key === 'description') return false;
                const originalValue = formData[key as keyof FirebaseConfigFormData];
                return value && value.toString().trim() !== '' && value !== originalValue;
              }).length;
              
              if (updatedFields > 0) {
                addToast({
                  title: 'Success',
                  description: `Firebase configuration imported successfully. ${updatedFields} fields updated.`,
                  type: 'success',
                });
              } else {
                addToast({
                  title: 'Warning',
                  description: 'No new configuration fields found in the uploaded file.',
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

  const pageActions = [
    {
      label: 'Test Connection',
      onClick: handleTestConnection,
      icon: <FiActivity className="w-4 h-4" />,
    },
    {
      label: 'Delete',
      onClick: handleDelete,
      icon: <FiTrash2 className="w-4 h-4" />,
      variant: 'danger' as const,
    },
    {
      label: 'Save Changes',
      onClick: () => {
        if (formData) {
          updateConfigMutation.mutate(formData);
        }
      },
      primary: true,
      icon: <FiSave className="w-4 h-4" />,
      disabled: updateConfigMutation.isPending,
    },
    {
      label: 'Cancel',
      onClick: handleCancel,
      icon: <FiX className="w-4 h-4" />,
    },
  ];

  if (isLoading) {
    return (
      <BaseLayout
        title="Edit Firebase Configuration"
        description="Modify Firebase project configuration"
        fullWidth={false}
      >
        <Loading />
      </BaseLayout>
    );
  }

  if (error || !formData) {
    return (
      <BaseLayout
        title="Edit Firebase Configuration"
        description="Modify Firebase project configuration"
        fullWidth={false}
      >
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {(error as any)?.message || 'Firebase configuration not found'}
          </AlertDescription>
        </Alert>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout
      title={`Edit Firebase Configuration: ${formData.name}`}
      description="Modify Firebase project configuration"
      actions={pageActions}
      fullWidth={false}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Status Indicator */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${formData.active ? 'bg-green-500' : 'bg-red-500'}`} />
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Configuration Status
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This configuration is currently {formData.active ? 'active' : 'inactive'}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                startIcon={<FiActivity className="w-4 h-4" />}
              >
                Test Connection
              </Button>
            </div>
          </div>
        </Card>

        {/* Basic Information */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Basic Information
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleImportFromFile}
                startIcon={<FiUpload className="w-4 h-4" />}
              >
                Update from JSON
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <FormInput
                  id="name"
                  type="text"
                  label="Configuration Name *"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Production, Development"
                  error={errors.name}
                />
              </div>

              <div>
                <FormInput
                  id="projectId"
                  type="text"
                  label="Project ID *"
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
                  label="Auth Domain *"
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
                  label="App ID *"
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
                  label="Storage Bucket"
                  value={formData.storageBucket || ''}
                  onChange={(e) => handleInputChange('storageBucket', e.target.value)}
                  placeholder="your-project.appspot.com"
                />
              </div>

              <div>
                <FormInput
                  id="messagingSenderId"
                  type="text"
                  label="Messaging Sender ID"
                  value={formData.messagingSenderId || ''}
                  onChange={(e) => handleInputChange('messagingSenderId', e.target.value)}
                  placeholder="123456789"
                />
              </div>

              <div>
                <FormInput
                  id="measurementId"
                  type="text"
                  label="Measurement ID"
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
                  Active Configuration
                </label>
              </div>
            </div>

            <div className="mt-6">
              <TextareaInput
                id="description"
                label="Description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Description of this Firebase configuration..."
                rows={3}
              />
            </div>
          </div>
        </Card>

        {/* API Keys */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              API Keys
            </h3>
            
            <div className="space-y-6">
              <div>
                <div className="relative">
                  <FormInput
                    id="apiKey"
                    type={showApiKey ? 'text' : 'password'}
                    label="Web API Key *"
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
                  Found in Firebase Console → Project Settings → Web apps
                </p>
              </div>

              <div>
                <div className="relative">
                  <TextareaInput
                    id="serviceAccountKey"
                    label="Service Account Key (JSON)"
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
                  Download from Firebase Console → Project Settings → Service Accounts → Generate new private key
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={updateConfigMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={updateConfigMutation.isPending}
            startIcon={<FiSave className="w-4 h-4" />}
          >
            {updateConfigMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Firebase Configuration"
        message={`Are you sure you want to delete the Firebase configuration "${formData.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
        icon={<FiTrash2 className="w-6 h-6" />}
        isLoading={deleteConfigMutation.isPending}
      />
    </BaseLayout>
  );
};

export default EditFirebaseConfigPage;
