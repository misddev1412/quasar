import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUrlTabs } from '../../hooks/useUrlTabs';
import { Server, HardDrive, Settings, Database, CheckCircle, XCircle, AlertCircle, Home } from 'lucide-react';
import { CreatePageTemplate } from '../../components/common/CreatePageTemplate';
import { EntityForm } from '../../components/common/EntityForm';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { FormTabConfig } from '../../types/forms';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../context/ToastContext';
import { trpc } from '../../utils/trpc';
import { z } from 'zod';

// Form validation schema that matches StorageConfigFormData exactly
const storageConfigSchema: z.ZodSchema<StorageConfigFormData> = z.object({
  provider: z.enum(['local', 's3']),
  maxFileSize: z.string().min(4), // At least 4 digits (1024 minimum)
  allowedFileTypes: z.array(z.string()).min(1),
  
  // Local storage settings
  localUploadPath: z.string().optional(),
  localBaseUrl: z.string().optional(),
  
  // S3 settings
  s3AccessKey: z.string().optional(),
  s3SecretKey: z.string().optional(),
  s3Region: z.string().optional(),
  s3Bucket: z.string().optional(),
  s3Endpoint: z.string().optional(),
  s3ForcePathStyle: z.boolean().optional(),
}) as z.ZodSchema<StorageConfigFormData>;

type StorageConfigFormData = {
  provider: 'local' | 's3';
  maxFileSize: string;
  allowedFileTypes: string[];
  localUploadPath?: string;
  localBaseUrl?: string;
  s3AccessKey?: string;
  s3SecretKey?: string;
  s3Region?: string;
  s3Bucket?: string;
  s3Endpoint?: string;
  s3ForcePathStyle?: boolean;
};

const StorageConfigPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Use URL tabs hook with custom tab keys
  const { activeTab, handleTabChange } = useUrlTabs({
    defaultTab: 0,
    tabParam: 'tab',
    tabKeys: ['general', 'local', 's3'] // Map to tab IDs for cleaner URLs
  });

  // Fetch current storage configuration
  const { data: configData, isLoading, refetch } = trpc.adminStorage.getStorageConfig.useQuery(undefined);

  // tRPC mutations
  const updateConfigMutation = trpc.adminStorage.updateStorageConfig.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Success',
        description: 'Storage configuration updated successfully',
      });
      refetch();
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Update Failed',
        description: error.message || 'Failed to update storage configuration',
      });
    },
  });

  const testConnectionMutation = trpc.adminStorage.testStorageConnection.useMutation({
    onSuccess: (response) => {
      const data = (response as any)?.data;
      setTestResult(data as { success: boolean; message: string });
      setTestingConnection(false);
    },
    onError: (error) => {
      setTestResult({ success: false, message: error.message });
      setTestingConnection(false);
    },
  });

  const handleSubmit = async (formData: StorageConfigFormData) => {
    try {
      console.log('🚀 [FRONTEND] Form data before processing:', formData);
      
      // Convert string to number for maxFileSize and clean up empty values
      const processedData = {
        provider: formData.provider,
        maxFileSize: Number(formData.maxFileSize),
        allowedFileTypes: formData.allowedFileTypes,
        // Only include non-empty local settings
        ...(formData.localUploadPath && formData.localUploadPath.trim() !== '' && { 
          localUploadPath: formData.localUploadPath.trim() 
        }),
        ...(formData.localBaseUrl && formData.localBaseUrl.trim() !== '' && { 
          localBaseUrl: formData.localBaseUrl.trim() 
        }),
        // Only include non-empty S3 settings
        ...(formData.s3AccessKey && formData.s3AccessKey.trim() !== '' && { 
          s3AccessKey: formData.s3AccessKey.trim() 
        }),
        ...(formData.s3SecretKey && formData.s3SecretKey.trim() !== '' && { 
          s3SecretKey: formData.s3SecretKey.trim() 
        }),
        ...(formData.s3Region && formData.s3Region.trim() !== '' && { 
          s3Region: formData.s3Region.trim() 
        }),
        ...(formData.s3Bucket && formData.s3Bucket.trim() !== '' && { 
          s3Bucket: formData.s3Bucket.trim() 
        }),
        ...(formData.s3Endpoint && formData.s3Endpoint.trim() !== '' && { 
          s3Endpoint: formData.s3Endpoint.trim() 
        }),
        ...(formData.s3ForcePathStyle !== undefined && { 
          s3ForcePathStyle: formData.s3ForcePathStyle 
        }),
      };
      
      console.log('🔄 [FRONTEND] Processed data being sent:', processedData);
      await updateConfigMutation.mutateAsync(processedData);
    } catch (error) {
      console.error('❌ [FRONTEND] Storage config update error:', error);
    }
  };

  const handleTestConnection = async (formData: StorageConfigFormData) => {
    setTestingConnection(true);
    setTestResult(null);

    const settings: Record<string, string> = {
      'storage.provider': formData.provider,
      'storage.max_file_size': formData.maxFileSize,
      'storage.allowed_file_types': JSON.stringify(formData.allowedFileTypes),
    };

    if (formData.provider === 'local') {
      if (formData.localUploadPath) settings['storage.local.upload_path'] = formData.localUploadPath;
      if (formData.localBaseUrl) settings['storage.local.base_url'] = formData.localBaseUrl;
    } else if (formData.provider === 's3') {
      if (formData.s3AccessKey) settings['storage.s3.access_key'] = formData.s3AccessKey;
      if (formData.s3SecretKey) settings['storage.s3.secret_key'] = formData.s3SecretKey;
      if (formData.s3Region) settings['storage.s3.region'] = formData.s3Region;
      if (formData.s3Bucket) settings['storage.s3.bucket'] = formData.s3Bucket;
      if (formData.s3Endpoint) settings['storage.s3.endpoint'] = formData.s3Endpoint;
      if (formData.s3ForcePathStyle !== undefined) settings['storage.s3.force_path_style'] = formData.s3ForcePathStyle.toString();
    }

    testConnectionMutation.mutate({
      provider: formData.provider,
      settings,
    });
  };

  const handleCancel = () => {
    navigate('/settings');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const config = (configData as any)?.data;
  if (!config) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Configuration Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Unable to load storage configuration.
          </p>
          <button
            onClick={() => navigate('/settings')}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Back to Settings
          </button>
        </div>
      </div>
    );
  }

  // Define form tabs configuration
  const tabs: FormTabConfig[] = [
    {
      id: 'general',
      label: 'General Settings',
      icon: <Settings className="w-4 h-4" />,
      sections: [
        {
          title: 'Storage Provider',
          description: 'Choose your file storage provider and configure basic settings',
          icon: <Server className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [
            {
              name: 'provider',
              label: 'Storage Provider',
              type: 'select',
              placeholder: 'Select storage provider',
              required: true,
              options: [
                { value: 'local', label: 'Local Storage' },
                { value: 's3', label: 'Amazon S3 / S3-Compatible' },
              ],
              icon: <Database className="w-4 h-4" />,
              description: 'Choose between local file storage or S3-compatible cloud storage',
            },
            {
              name: 'maxFileSize',
              label: 'Maximum File Size (bytes)',
              type: 'text',
              placeholder: '10485760',
              required: true,
              validation: {
                minLength: 1024,
                maxLength: 104857600,
              },
              description: 'Maximum allowed file size in bytes (1KB - 100MB)',
            },
            {
              name: 'allowedFileTypes',
              label: 'Allowed File Types',
              type: 'file-types',
              placeholder: 'Select file types that users can upload',
              required: true,
              description: 'Choose which file types users can upload to your storage',
            },
          ],
        },
      ],
    },
    {
      id: 'local',
      label: 'Local Storage',
      icon: <HardDrive className="w-4 h-4" />,
      sections: [
        {
          title: 'Local Storage Configuration',
          description: 'Configure local file storage settings',
          icon: <HardDrive className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [
            {
              name: 'localUploadPath',
              label: 'Upload Directory',
              type: 'text',
              placeholder: 'uploads',
              required: false,
              description: 'Directory path for storing uploaded files (relative to project root)',
              // dependsOn: { field: 'provider', value: 'local' }, // Temporarily disabled for testing
            },
            {
              name: 'localBaseUrl',
              label: 'Base URL',
              type: 'text',
              placeholder: 'http://localhost:3000',
              required: false,
              description: 'Base URL for accessing uploaded files',
              // dependsOn: { field: 'provider', value: 'local' }, // Temporarily disabled for testing
            },
          ],
        },
      ],
    },
    {
      id: 's3',
      label: 'S3 Configuration',
      icon: <Server className="w-4 h-4" />,
      sections: [
        {
          title: 'S3 Connection Settings',
          description: 'Configure Amazon S3 or S3-compatible storage',
          icon: <Server className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [
            {
              name: 's3AccessKey',
              label: 'Access Key ID',
              type: 'text',
              placeholder: config.s3HasCredentials ? 'Enter new access key (leave empty to keep current)' : 'Enter S3 access key',
              required: false,
              description: config.s3HasCredentials 
                ? 'AWS S3 Access Key ID (current key is configured but hidden for security)'
                : 'AWS S3 Access Key ID',
              // dependsOn: { field: 'provider', value: 's3' }, // Temporarily disabled for testing
            },
            {
              name: 's3SecretKey',
              label: 'Secret Access Key',
              type: 'password-simple',
              placeholder: config.s3HasCredentials ? 'Enter new secret key (leave empty to keep current)' : 'Enter S3 secret key',
              required: false,
              description: config.s3HasCredentials 
                ? 'AWS S3 Secret Access Key (current key is configured but hidden for security)'
                : 'AWS S3 Secret Access Key',
              // dependsOn: { field: 'provider', value: 's3' }, // Temporarily disabled for testing
            },
            {
              name: 's3Region',
              label: 'Region',
              type: 'text',
              placeholder: 'us-east-1',
              required: false,
              description: 'AWS S3 region',
              // dependsOn: { field: 'provider', value: 's3' }, // Temporarily disabled for testing
            },
            {
              name: 's3Bucket',
              label: 'Bucket Name',
              type: 'text',
              placeholder: 'my-bucket',
              required: false,
              description: 'S3 bucket name for file storage',
              // dependsOn: { field: 'provider', value: 's3' }, // Temporarily disabled for testing
            },
            {
              name: 's3Endpoint',
              label: 'Custom Endpoint (Optional)',
              type: 'text',
              placeholder: 'https://s3.example.com',
              required: false,
              description: 'Custom endpoint for S3-compatible services',
              // dependsOn: { field: 'provider', value: 's3' }, // Temporarily disabled for testing
            },
            {
              name: 's3ForcePathStyle',
              label: 'Force Path Style',
              type: 'checkbox',
              required: false,
              description: 'Use path-style URLs instead of virtual-hosted-style URLs',
              // dependsOn: { field: 'provider', value: 's3' }, // Temporarily disabled for testing
            },
          ],
        },
      ],
    },
  ];

  // Prepare initial values from config
  const initialValues: Partial<StorageConfigFormData> = {
    provider: config.provider,
    maxFileSize: config.maxFileSize?.toString() || '10485760',
    allowedFileTypes: config.allowedFileTypes,
    localUploadPath: config.localUploadPath || '',
    localBaseUrl: config.localBaseUrl || '',
    s3Region: config.s3Region || '',
    s3Bucket: config.s3Bucket || '',
    s3Endpoint: config.s3Endpoint || '',
    s3ForcePathStyle: config.s3ForcePathStyle || false,
    // Don't include sensitive keys in initial values
    s3AccessKey: '',
    s3SecretKey: '',
  };

  return (
    <CreatePageTemplate
      title="Storage Configuration"
      description="Configure file storage settings for local or S3 storage"
      icon={<Database className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
      entityName="Storage"
      entityNamePlural="Storage"
      backUrl="/settings"
      onBack={handleCancel}
      isSubmitting={updateConfigMutation.isPending}
      maxWidth="full"
    >
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            {
              label: 'Home',
              href: '/',
              icon: <Home className="w-4 h-4" />
            },
            {
              label: 'Settings',
              href: '/settings',
              icon: <Settings className="w-4 h-4" />
            },
            {
              label: 'Storage Configuration',
              icon: <HardDrive className="w-4 h-4" />
            }
          ]}
        />
        {/* Connection Test Results */}
        {testResult && (
          <div className={`p-4 rounded-lg border ${
            testResult.success 
              ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
              : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
          }`}>
            <div className="flex items-center space-x-2">
              {testResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              )}
              <p className={`${
                testResult.success 
                  ? 'text-green-800 dark:text-green-200' 
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {testResult.message}
              </p>
            </div>
          </div>
        )}

        {/* Configuration Notice for S3 */}
        {config.provider === 's3' && !config.s3HasCredentials && (
          <div className="p-4 rounded-lg border bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <p className="text-yellow-800 dark:text-yellow-200">
                S3 credentials are not configured. Please provide access keys to enable S3 storage.
              </p>
            </div>
          </div>
        )}

        <EntityForm<StorageConfigFormData>
          tabs={tabs}
          initialValues={initialValues}
          onSubmit={async (data) => {
            console.log('🔥 [FRONTEND DEBUG] EntityForm onSubmit triggered with data:', data);
            console.log('🔥 [FRONTEND DEBUG] Current activeTab:', activeTab);
            console.log('🔥 [FRONTEND DEBUG] Available tabs:', tabs.map((t, i) => `${i}: ${t.id}`));
            await handleSubmit(data);
          }}
          onCancel={handleCancel}
          isSubmitting={updateConfigMutation.isPending}
          validationSchema={storageConfigSchema}
          submitButtonText="Save Configuration"
          cancelButtonText="Cancel"
          showCancelButton={true}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* Test Connection Button */}
        <div className="flex justify-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => {
              // Get current form values for testing
              const testData: StorageConfigFormData = {
                provider: config.provider,
                maxFileSize: config.maxFileSize?.toString() || '10485760',
                allowedFileTypes: config.allowedFileTypes || [],
                localUploadPath: config.localUploadPath || 'uploads',
                localBaseUrl: config.localBaseUrl || 'http://localhost:3001',
                s3AccessKey: '', // User must provide this in the form
                s3SecretKey: '', // User must provide this in the form
                s3Region: config.s3Region || 'us-east-1',
                s3Bucket: config.s3Bucket || '',
                s3Endpoint: config.s3Endpoint || '',
                s3ForcePathStyle: config.s3ForcePathStyle || false,
              };
              handleTestConnection(testData);
            }}
            disabled={testingConnection}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {testingConnection ? 'Testing Connection...' : 'Test Storage Connection'}
          </button>
        </div>
      </div>
    </CreatePageTemplate>
  );
};

export default StorageConfigPage;
