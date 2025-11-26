import React, { useState, useRef, useEffect } from 'react';
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

// S3 Provider configurations
const S3_PROVIDERS = {
  aws: {
    label: 'Amazon Web Services (AWS) S3',
    endpoint: '',
    forcePathStyle: false,
    description: 'Standard AWS S3 service',
  },
  gcp: {
    label: 'Google Cloud Storage',
    endpoint: 'https://storage.googleapis.com',
    forcePathStyle: false,
    description: 'Google Cloud Storage with S3 compatibility',
  },
  digitalocean: {
    label: 'Digital Ocean Spaces',
    endpoint: '', // Will be set based on region: https://{region}.digitaloceanspaces.com
    forcePathStyle: true,
    description: 'Digital Ocean Spaces S3-compatible storage',
  },
  minio: {
    label: 'MinIO',
    endpoint: '',
    forcePathStyle: true,
    description: 'Self-hosted MinIO object storage',
  },
  custom: {
    label: 'Custom S3-Compatible',
    endpoint: '',
    forcePathStyle: false,
    description: 'Other S3-compatible storage services',
  },
} as const;

type S3Provider = keyof typeof S3_PROVIDERS;

// Helper function to detect provider from endpoint
const detectS3Provider = (endpoint: string = '', forcePathStyle: boolean = false): S3Provider => {
  if (!endpoint || endpoint === '') {
    return 'aws';
  }
  if (endpoint.includes('storage.googleapis.com')) {
    return 'gcp';
  }
  if (endpoint.includes('digitaloceanspaces.com')) {
    return 'digitalocean';
  }
  if (forcePathStyle && endpoint) {
    // If forcePathStyle is true and endpoint exists, likely MinIO or custom
    if (endpoint.includes('minio') || endpoint.includes('localhost') || endpoint.includes('127.0.0.1')) {
      return 'minio';
    }
    return 'custom';
  }
  return 'custom';
};

// Form validation schema that matches StorageConfigFormData exactly
const storageConfigSchema: z.ZodSchema<StorageConfigFormData> = z.object({
  provider: z.enum(['local', 's3']),
  maxFileSize: z.string().min(4), // At least 4 digits (1024 minimum)
  allowedFileTypes: z.array(z.string()).min(1),
  
  // Local storage settings
  localUploadPath: z.string().optional(),
  localBaseUrl: z.string().optional(),
  
  // S3 settings
  s3Provider: z.enum(['aws', 'gcp', 'digitalocean', 'minio', 'custom']).optional(),
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
  s3Provider?: S3Provider;
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
  const formRef = useRef<{ getValues: () => StorageConfigFormData; setValue: (name: string, value: any) => void }>(null);

  // Use URL tabs hook with custom tab keys
  const { activeTab, handleTabChange: originalHandleTabChange } = useUrlTabs({
    defaultTab: 0,
    tabParam: 'tab',
    tabKeys: ['general', 'local', 's3'] // Map to tab IDs for cleaner URLs
  });

  // Clear test result when switching tabs
  const handleTabChange = (index: number) => {
    setTestResult(null);
    originalHandleTabChange(index);
  };

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

  const handleTestConnection = async (provider: 'local' | 's3') => {
    setTestingConnection(true);
    setTestResult(null);

    // Get current form values
    const formValues = formRef.current?.getValues();
    if (!formValues) {
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Unable to get form values. Please try again.',
      });
      setTestingConnection(false);
      return;
    }

    // Merge form values with config defaults for missing values
    const testData: StorageConfigFormData = {
      provider: provider,
      maxFileSize: formValues.maxFileSize || config.maxFileSize?.toString() || '10485760',
      allowedFileTypes: formValues.allowedFileTypes || config.allowedFileTypes || [],
      localUploadPath: formValues.localUploadPath || config.localUploadPath || 'uploads',
      localBaseUrl: formValues.localBaseUrl || config.localBaseUrl || 'http://localhost:3001',
      s3AccessKey: formValues.s3AccessKey || '',
      s3SecretKey: formValues.s3SecretKey || '',
      s3Region: formValues.s3Region || config.s3Region || 'us-east-1',
      s3Bucket: formValues.s3Bucket || config.s3Bucket || '',
      s3Endpoint: formValues.s3Endpoint || config.s3Endpoint || '',
      s3ForcePathStyle: formValues.s3ForcePathStyle !== undefined ? formValues.s3ForcePathStyle : (config.s3ForcePathStyle || false),
    };

    const settings: Record<string, string> = {
      'storage.provider': provider,
      'storage.max_file_size': testData.maxFileSize,
      'storage.allowed_file_types': JSON.stringify(testData.allowedFileTypes),
    };

    if (provider === 'local') {
      if (testData.localUploadPath) settings['storage.local.upload_path'] = testData.localUploadPath;
      if (testData.localBaseUrl) settings['storage.local.base_url'] = testData.localBaseUrl;
    } else if (provider === 's3') {
      if (testData.s3AccessKey) settings['storage.s3.access_key'] = testData.s3AccessKey;
      if (testData.s3SecretKey) settings['storage.s3.secret_key'] = testData.s3SecretKey;
      if (testData.s3Region) settings['storage.s3.region'] = testData.s3Region;
      if (testData.s3Bucket) settings['storage.s3.bucket'] = testData.s3Bucket;
      if (testData.s3Endpoint) settings['storage.s3.endpoint'] = testData.s3Endpoint;
      if (testData.s3ForcePathStyle !== undefined) settings['storage.s3.force_path_style'] = testData.s3ForcePathStyle.toString();
    }

    testConnectionMutation.mutate({
      provider: provider,
      settings,
    });
  };

  const handleCancel = () => {
    navigate('/settings');
  };

  const config = (configData as any)?.data;

  // Auto-fill S3 configuration based on selected provider
  const applyProviderConfig = React.useCallback((provider: S3Provider, region?: string) => {
    if (!formRef.current) return;

    const formValues = formRef.current.getValues();
    const currentRegion = region || formValues.s3Region || 'nyc3';

    switch (provider) {
      case 'aws':
        formRef.current.setValue('s3Endpoint', '');
        formRef.current.setValue('s3ForcePathStyle', false);
        break;
      case 'gcp':
        formRef.current.setValue('s3Endpoint', 'https://storage.googleapis.com');
        formRef.current.setValue('s3ForcePathStyle', false);
        break;
      case 'digitalocean':
        formRef.current.setValue('s3Endpoint', `https://${currentRegion}.digitaloceanspaces.com`);
        formRef.current.setValue('s3ForcePathStyle', true);
        break;
      case 'minio':
        const currentEndpoint = formValues.s3Endpoint || '';
        if (!currentEndpoint || currentEndpoint.includes('amazonaws.com') || currentEndpoint.includes('storage.googleapis.com')) {
          formRef.current.setValue('s3Endpoint', 'http://localhost:9000');
        }
        formRef.current.setValue('s3ForcePathStyle', true);
        break;
      case 'custom':
        // Don't auto-fill for custom, let user configure manually
        break;
    }
  }, []);

  // Watch for provider changes and auto-apply configuration
  useEffect(() => {
    if (!formRef.current || activeTab !== 2) return;

    const interval = setInterval(() => {
      const formValues = formRef.current?.getValues();
      if (!formValues?.s3Provider) return;

      const provider = formValues.s3Provider as S3Provider;
      const currentEndpoint = formValues.s3Endpoint || '';
      const currentForcePathStyle = formValues.s3ForcePathStyle || false;
      const region = formValues.s3Region || 'nyc3';

      // Check if config needs to be applied
      let needsUpdate = false;

      if (provider === 'aws' && (currentEndpoint !== '' || currentForcePathStyle !== false)) {
        needsUpdate = true;
      } else if (provider === 'gcp' && (currentEndpoint !== 'https://storage.googleapis.com' || currentForcePathStyle !== false)) {
        needsUpdate = true;
      } else if (provider === 'digitalocean') {
        const expectedEndpoint = `https://${region}.digitaloceanspaces.com`;
        if (currentEndpoint !== expectedEndpoint || currentForcePathStyle !== true) {
          needsUpdate = true;
        }
      } else if (provider === 'minio' && currentForcePathStyle !== true) {
        needsUpdate = true;
      }

      if (needsUpdate) {
        applyProviderConfig(provider, region);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [activeTab, applyProviderConfig]);

  // Watch for region changes when provider is Digital Ocean
  useEffect(() => {
    if (!formRef.current || activeTab !== 2) return;

    const interval = setInterval(() => {
      const formValues = formRef.current?.getValues();
      if (formValues?.s3Provider === 'digitalocean' && formValues.s3Region) {
        const region = formValues.s3Region;
        const expectedEndpoint = `https://${region}.digitaloceanspaces.com`;
        const currentEndpoint = formValues.s3Endpoint || '';
        
        if (currentEndpoint !== expectedEndpoint) {
          formRef.current.setValue('s3Endpoint', expectedEndpoint);
        }
      }
    }, 300);

    return () => clearInterval(interval);
  }, [activeTab]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

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
        {
          title: 'Test Connection',
          description: 'Test local storage connection',
          icon: <Server className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [],
          customContent: (
            <div className="space-y-4">
              {testResult && activeTab === 1 && (
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
              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={() => handleTestConnection('local')}
                  disabled={testingConnection}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {testingConnection && activeTab === 1 ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Testing Connection...
                    </>
                  ) : (
                    <>
                      <Server className="w-4 h-4" />
                      Test Local Storage Connection
                    </>
                  )}
                </button>
              </div>
            </div>
          ),
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
              name: 's3Provider',
              label: 'S3 Provider',
              type: 'select',
              placeholder: 'Select S3 provider',
              required: false,
              options: [
                { value: 'aws', label: S3_PROVIDERS.aws.label },
                { value: 'gcp', label: S3_PROVIDERS.gcp.label },
                { value: 'digitalocean', label: S3_PROVIDERS.digitalocean.label },
                { value: 'minio', label: S3_PROVIDERS.minio.label },
                { value: 'custom', label: S3_PROVIDERS.custom.label },
              ],
              description: 'Select your S3-compatible storage provider. Endpoint and path style will be auto-configured.',
            },
            {
              name: 's3AccessKey',
              label: 'Access Key ID',
              type: 'text',
              placeholder: config.s3HasCredentials ? 'Enter new access key (leave empty to keep current)' : 'Enter S3 access key',
              required: false,
              description: 'Access Key ID for your S3-compatible storage',
            },
            {
              name: 's3SecretKey',
              label: 'Secret Access Key',
              type: 'password-simple',
              placeholder: config.s3HasCredentials ? 'Enter new secret key (leave empty to keep current)' : 'Enter S3 secret key',
              required: false,
              description: 'Secret Access Key for your S3-compatible storage',
            },
            {
              name: 's3Region',
              label: 'Region',
              type: 'text',
              placeholder: 'us-east-1',
              required: false,
              description: 'Region for your storage (e.g., us-east-1 for AWS, nyc3 for Digital Ocean)',
            },
            {
              name: 's3Bucket',
              label: 'Bucket Name',
              type: 'text',
              placeholder: 'my-bucket',
              required: false,
              description: 'Bucket name for file storage',
            },
            {
              name: 's3Endpoint',
              label: 'Endpoint URL',
              type: 'text',
              placeholder: 'https://s3.example.com',
              required: false,
              description: 'Custom endpoint URL (auto-filled based on provider, editable for Custom provider)',
              dependsOn: { field: 's3Provider', value: 'custom' },
            },
            {
              name: 's3ForcePathStyle',
              label: 'Force Path Style',
              type: 'checkbox',
              required: false,
              description: 'Use path-style URLs instead of virtual-hosted-style URLs (auto-configured based on provider)',
              dependsOn: { field: 's3Provider', value: 'custom' },
            },
          ],
        },
        {
          title: 'Test Connection',
          description: 'Test S3 storage connection',
          icon: <Server className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
          fields: [],
          customContent: (
            <div className="space-y-4">
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
              {testResult && activeTab === 2 && (
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
              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={() => handleTestConnection('s3')}
                  disabled={testingConnection}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {testingConnection && activeTab === 2 ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Testing Connection...
                    </>
                  ) : (
                    <>
                      <Server className="w-4 h-4" />
                      Test S3 Connection
                    </>
                  )}
                </button>
              </div>
            </div>
          ),
        },
      ],
    },
  ];

  // Detect S3 provider from current config
  const detectedProvider = config ? detectS3Provider(config.s3Endpoint || '', config.s3ForcePathStyle || false) : 'aws';

  // Prepare initial values from config
  const initialValues: Partial<StorageConfigFormData> = config ? {
    provider: config.provider,
    maxFileSize: config.maxFileSize?.toString() || '10485760',
    allowedFileTypes: config.allowedFileTypes,
    localUploadPath: config.localUploadPath || '',
    localBaseUrl: config.localBaseUrl || '',
    s3Provider: detectedProvider,
    s3Region: config.s3Region || '',
    s3Bucket: config.s3Bucket || '',
    s3Endpoint: config.s3Endpoint || '',
    s3ForcePathStyle: config.s3ForcePathStyle || false,
    // Don't include sensitive keys in initial values
    s3AccessKey: '',
    s3SecretKey: '',
  } : {};

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
          formRef={formRef}
        />
      </div>
    </CreatePageTemplate>
  );
};

export default StorageConfigPage;
