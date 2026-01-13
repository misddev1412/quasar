import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Settings, Server, Key, Mail as MailIcon, Gauge, Activity } from 'lucide-react';
import { CreatePageTemplate } from '../../components/common/CreatePageTemplate';
import { EntityForm } from '../../components/common/EntityForm';
import { FormTabConfig } from '../../types/forms';
import { useToast } from '../../contexts/ToastContext';
import { trpc } from '../../utils/trpc';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useUrlTabs } from '../../hooks/useUrlTabs';
import { z } from 'zod';

type MailProviderFormData = {
  name: string;
  providerType: string;
  description?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUsername?: string;
  smtpPassword?: string;
  apiKey?: string;
  apiSecret?: string;
  apiHost?: string;
  defaultFromEmail?: string;
  defaultFromName?: string;
  replyToEmail?: string;
  isActive?: boolean;
  rateLimit?: number;
  maxDailyLimit?: number;
  priority?: number;
  config?: Record<string, any>;
  webhookUrl?: string;
};

const mailProviderSchema: z.ZodSchema<MailProviderFormData> = z.object({
  name: z.string().min(2).max(255),
  providerType: z.string().max(100).default('smtp'),
  description: z.string().max(1000).optional(),
  smtpHost: z.string().max(255).optional(),
  smtpPort: z.number().int().min(1).max(65535).optional(),
  smtpSecure: z.boolean().optional(),
  smtpUsername: z.string().max(255).optional(),
  smtpPassword: z.string().max(255).optional(),
  apiKey: z.string().max(500).optional(),
  apiSecret: z.string().max(500).optional(),
  apiHost: z.string().max(255).optional(),
  defaultFromEmail: z.string().email().max(255).optional(),
  defaultFromName: z.string().max(255).optional(),
  replyToEmail: z.string().email().max(255).optional(),
  isActive: z.boolean().optional().default(true),
  rateLimit: z.number().int().min(1).optional(),
  maxDailyLimit: z.number().int().min(1).optional(),
  priority: z.number().int().min(1).max(10).optional().default(5),
  config: z.record(z.any()).optional(),
  webhookUrl: z.string().max(500).optional(),
}) as z.ZodSchema<MailProviderFormData>;

const CreateMailProviderPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();
  const formRef = useRef<{ getValues: () => MailProviderFormData }>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const { activeTab, handleTabChange } = useUrlTabs({
    defaultTab: 0,
    tabParam: 'tab',
    tabKeys: ['general', 'advanced'],
  });

  const createMutation = trpc.adminMailProvider.createProvider.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: t('common.success', 'Success'),
        description: t('mail_providers.create_success', 'Mail provider created successfully'),
      });
      navigate('/mail-providers');
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('common.error', 'Error'),
        description: error.message || t('messages.operation_failed', 'Operation failed'),
      });
    },
  });

  const testConnectionMutation = trpc.adminMailProvider.testConnectionWithData.useMutation({
    onSuccess: (result) => {
      const testResult = (result as any)?.data;
      if (testResult?.success) {
        addToast({
          type: 'success',
          title: t('mail_providers.test_connection_success', 'Connection Test Successful'),
          description: testResult.message || t('mail_providers.connection_test_passed', 'Connection test passed successfully'),
        });
      } else {
        addToast({
          type: 'error',
          title: t('mail_providers.test_connection_failed', 'Connection Test Failed'),
          description: testResult?.message || t('mail_providers.connection_test_failed', 'Connection test failed'),
        });
      }
      setIsTestingConnection(false);
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('mail_providers.test_connection_failed', 'Connection Test Failed'),
        description: error.message || t('mail_providers.connection_test_error', 'Failed to test connection'),
      });
      setIsTestingConnection(false);
    },
  });

  const handleTestConnection = async () => {
    if (!formRef.current) return;
    
    const formValues = formRef.current.getValues();
    
    // Basic validation - check if required fields are filled
    if (!formValues.name || !formValues.providerType) {
      addToast({
        type: 'error',
        title: t('common.error', 'Error'),
        description: t('mail_providers.fill_required_fields', 'Please fill in required fields before testing connection'),
      });
      return;
    }

    // Clean form values: remove null values and only include relevant fields based on providerType
    const cleanFormValues: any = {
      name: formValues.name,
      providerType: formValues.providerType,
      isActive: formValues.isActive ?? true,
      priority: formValues.priority ?? 5,
    };

    // Add SMTP fields if providerType is smtp
    if (formValues.providerType === 'smtp') {
      if (formValues.smtpHost) cleanFormValues.smtpHost = formValues.smtpHost;
      if (formValues.smtpPort) cleanFormValues.smtpPort = formValues.smtpPort;
      if (formValues.smtpSecure !== undefined) cleanFormValues.smtpSecure = formValues.smtpSecure;
      if (formValues.smtpUsername) cleanFormValues.smtpUsername = formValues.smtpUsername;
      if (formValues.smtpPassword) cleanFormValues.smtpPassword = formValues.smtpPassword;
    }

    // Add API fields if providerType is API-based
    if (['sendgrid', 'mailgun', 'ses', 'postmark', 'mandrill', 'mailtrap', 'custom'].includes(formValues.providerType)) {
      if (formValues.apiKey) cleanFormValues.apiKey = formValues.apiKey;
      if (formValues.apiSecret) cleanFormValues.apiSecret = formValues.apiSecret;
      if (formValues.apiHost) cleanFormValues.apiHost = formValues.apiHost;
    }

    // Add optional fields only if they have values
    if (formValues.description) cleanFormValues.description = formValues.description;
    if (formValues.defaultFromEmail) cleanFormValues.defaultFromEmail = formValues.defaultFromEmail;
    if (formValues.defaultFromName) cleanFormValues.defaultFromName = formValues.defaultFromName;
    if (formValues.replyToEmail) cleanFormValues.replyToEmail = formValues.replyToEmail;
    if (formValues.rateLimit) cleanFormValues.rateLimit = formValues.rateLimit;
    if (formValues.maxDailyLimit) cleanFormValues.maxDailyLimit = formValues.maxDailyLimit;
    if (formValues.webhookUrl) cleanFormValues.webhookUrl = formValues.webhookUrl;
    if (formValues.config && Object.keys(formValues.config).length > 0) cleanFormValues.config = formValues.config;

    setIsTestingConnection(true);
    try {
      await testConnectionMutation.mutateAsync(cleanFormValues);
    } catch (error) {
      // Error handled in mutation callbacks
    }
  };

  const tabs: FormTabConfig[] = [
    {
      id: 'general',
      label: t('form.tabs.general', 'General Settings'),
      icon: <Settings className="w-4 h-4" />,
      sections: [
        {
          title: t('mail_providers.basic_information', 'Basic Information'),
          description: t('mail_providers.basic_information_description', 'Configure the basic details of your mail provider.'),
          icon: <Mail className="w-4 h-4" />,
          fields: [
            {
              name: 'name',
              label: t('mail_providers.provider_name', 'Provider Name'),
              type: 'text',
              required: true,
              placeholder: t('mail_providers.provider_name_placeholder', 'e.g., Main SMTP Provider'),
              description: t('mail_providers.provider_name_description', 'A unique name to identify this mail provider'),
              icon: <Mail className="w-4 h-4" />,
            },
            {
              name: 'providerType',
              label: t('mail_providers.provider_type', 'Provider Type'),
              type: 'select',
              required: true,
              options: [
                { value: 'smtp', label: 'SMTP' },
                { value: 'sendgrid', label: 'SendGrid' },
                { value: 'mailgun', label: 'Mailgun' },
                { value: 'ses', label: 'AWS SES' },
                { value: 'postmark', label: 'Postmark' },
                { value: 'mandrill', label: 'Mandrill' },
                { value: 'mailtrap', label: 'Mailtrap' },
                { value: 'custom', label: t('mail_providers.custom', 'Custom') },
              ],
              description: t('mail_providers.provider_type_description', 'Select the type of mail provider you want to configure'),
              icon: <Settings className="w-4 h-4" />,
            },
            {
              name: 'description',
              label: t('mail_providers.description', 'Description'),
              type: 'textarea',
              placeholder: t('mail_providers.description_placeholder', 'Optional description'),
              description: t('mail_providers.description_description', 'A brief description of this mail provider'),
            },
            {
              name: 'priority',
              label: t('mail_providers.priority', 'Priority'),
              type: 'number',
              placeholder: t('mail_providers.priority_placeholder', '1-10 (1 = highest)'),
              description: t('mail_providers.priority_description', 'Priority for sending emails. Lower numbers have higher priority.'),
            },
            {
              name: 'isActive',
              label: t('mail_providers.active', 'Active'),
              type: 'checkbox',
              description: t('mail_providers.active_description', 'Enable or disable this mail provider'),
            },
          ],
        },
        {
          title: t('mail_providers.smtp_settings', 'SMTP Settings'),
          description: t('mail_providers.smtp_settings_description', 'Configure SMTP connection details for sending emails.'),
          icon: <Server className="w-4 h-4" />,
          dependsOn: { field: 'providerType', value: 'smtp' },
          fields: [
            {
              name: 'smtpHost',
              label: t('mail_providers.smtp_host', 'SMTP Host'),
              type: 'text',
              placeholder: t('mail_providers.smtp_host_placeholder', 'smtp.example.com'),
              description: t('mail_providers.smtp_host_description', 'SMTP server hostname or IP address'),
              icon: <Server className="w-4 h-4" />,
              dependsOn: { field: 'providerType', value: 'smtp' },
            },
            {
              name: 'smtpPort',
              label: t('mail_providers.smtp_port', 'SMTP Port'),
              type: 'number',
              placeholder: t('mail_providers.smtp_port_placeholder', '587'),
              description: t('mail_providers.smtp_port_description', 'SMTP server port (usually 587 for TLS or 465 for SSL)'),
              icon: <Server className="w-4 h-4" />,
              dependsOn: { field: 'providerType', value: 'smtp' },
            },
            {
              name: 'smtpUsername',
              label: t('mail_providers.smtp_username', 'SMTP Username'),
              type: 'text',
              description: t('mail_providers.smtp_username_description', 'Username for SMTP authentication'),
              icon: <Key className="w-4 h-4" />,
              dependsOn: { field: 'providerType', value: 'smtp' },
            },
            {
              name: 'smtpPassword',
              label: t('mail_providers.smtp_password', 'SMTP Password'),
              type: 'password-simple',
              description: t('mail_providers.smtp_password_description', 'Password for SMTP authentication'),
              icon: <Key className="w-4 h-4" />,
              dependsOn: { field: 'providerType', value: 'smtp' },
            },
            {
              name: 'smtpSecure',
              label: t('mail_providers.use_tls_ssl', 'Use TLS/SSL'),
              type: 'checkbox',
              description: t('mail_providers.use_tls_ssl_description', 'Enable secure connection using TLS or SSL'),
              dependsOn: { field: 'providerType', value: 'smtp' },
            },
          ],
        },
        {
          title: t('mail_providers.api_settings', 'API Settings'),
          description: t('mail_providers.api_settings_description', 'Configure API credentials for cloud-based mail providers.'),
          icon: <Key className="w-4 h-4" />,
          dependsOn: { field: 'providerType', value: ['sendgrid', 'mailgun', 'ses', 'postmark', 'mandrill', 'mailtrap', 'custom'] },
          fields: [
            {
              name: 'apiKey',
              label: t('mail_providers.api_key', 'API Key'),
              type: 'text',
              placeholder: t('mail_providers.api_key_placeholder', 'For SendGrid, Mailgun, etc.'),
              description: t('mail_providers.api_key_description', 'API key for cloud-based mail providers'),
              icon: <Key className="w-4 h-4" />,
              dependsOn: { field: 'providerType', value: ['sendgrid', 'mailgun', 'ses', 'postmark', 'mandrill', 'mailtrap', 'custom'] },
            },
            {
              name: 'apiSecret',
              label: t('mail_providers.api_secret', 'API Secret'),
              type: 'password-simple',
              description: t('mail_providers.api_secret_description', 'API secret for cloud-based mail providers'),
              icon: <Key className="w-4 h-4" />,
              dependsOn: { field: 'providerType', value: ['sendgrid', 'mailgun', 'ses', 'postmark', 'mandrill', 'mailtrap', 'custom'] },
            },
            {
              name: 'apiHost',
              label: t('mail_providers.api_host', 'API Host'),
              type: 'text',
              placeholder: t('mail_providers.api_host_placeholder', 'e.g., api.sendgrid.net (optional, uses default if empty)'),
              description: t('mail_providers.api_host_description', 'Custom API host for service providers. Leave empty to use default host.'),
              icon: <Server className="w-4 h-4" />,
              dependsOn: { field: 'providerType', value: ['sendgrid', 'mailgun', 'ses', 'postmark', 'mandrill', 'mailtrap', 'custom'] },
            },
          ],
        },
        {
          title: t('mail_providers.email_settings', 'Email Settings'),
          description: t('mail_providers.email_settings_description', 'Configure default email sender information.'),
          icon: <MailIcon className="w-4 h-4" />,
          fields: [
            {
              name: 'defaultFromEmail',
              label: t('mail_providers.default_from_email', 'Default From Email'),
              type: 'email',
              description: t('mail_providers.default_from_email_description', 'Default sender email address'),
              icon: <MailIcon className="w-4 h-4" />,
            },
            {
              name: 'defaultFromName',
              label: t('mail_providers.default_from_name', 'Default From Name'),
              type: 'text',
              description: t('mail_providers.default_from_name_description', 'Default sender name'),
              icon: <MailIcon className="w-4 h-4" />,
            },
            {
              name: 'replyToEmail',
              label: t('mail_providers.reply_to_email', 'Reply-To Email'),
              type: 'email',
              description: t('mail_providers.reply_to_email_description', 'Default reply-to email address'),
              icon: <MailIcon className="w-4 h-4" />,
            },
          ],
        },
        {
          title: t('mail_providers.limits', 'Rate Limits'),
          description: t('mail_providers.limits_description', 'Configure sending rate limits to prevent abuse.'),
          icon: <Gauge className="w-4 h-4" />,
          fields: [
            {
              name: 'rateLimit',
              label: t('mail_providers.rate_limit', 'Rate Limit (emails/hour)'),
              type: 'number',
              description: t('mail_providers.rate_limit_description', 'Maximum number of emails that can be sent per hour'),
            },
            {
              name: 'maxDailyLimit',
              label: t('mail_providers.max_daily_limit', 'Max Daily Limit'),
              type: 'number',
              description: t('mail_providers.max_daily_limit_description', 'Maximum number of emails that can be sent per day'),
            },
            {
              name: 'webhookUrl',
              label: t('mail_providers.webhook_url', 'Webhook URL'),
              type: 'text',
              placeholder: t('mail_providers.webhook_url_placeholder', 'For delivery notifications'),
              description: t('mail_providers.webhook_url_description', 'URL to receive delivery status notifications'),
            },
          ],
        },
      ],
    },
  ];

  const initialValues: Partial<MailProviderFormData> = {
    name: '',
    providerType: 'smtp',
    isActive: true,
    priority: 5,
    smtpSecure: true,
    smtpPort: 587,
  };

  const handleCancel = () => {
    navigate('/mail-providers');
  };

  return (
    <CreatePageTemplate
      title={t('mail_providers.create_mail_provider', 'Create Mail Provider')}
      description={t('mail_providers.create_description', 'Configure a new mail provider for sending emails')}
      icon={<Mail className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
      entityName={t('mail_providers.entity_name', 'Mail Provider')}
      entityNamePlural={t('mail_providers.entity_name_plural', 'Mail Providers')}
      backUrl="/mail-providers"
      onBack={handleCancel}
      isSubmitting={createMutation.isPending}
      maxWidth="full"
      customActions={[
        {
          label: t('mail_providers.test_connection', 'Test Connection'),
          onClick: handleTestConnection,
          icon: <Activity className="w-4 h-4" />,
          variant: 'secondary' as const,
          disabled: isTestingConnection,
        },
      ]}
      breadcrumbs={[
        { label: t('navigation.home', 'Home'), href: '/' },
        { label: t('mail_providers.entity_name_plural', 'Mail Providers'), onClick: handleCancel },
        { label: t('mail_providers.create', 'Create Mail Provider') },
      ]}
    >
      <EntityForm<MailProviderFormData>
        formRef={formRef}
        tabs={tabs}
        initialValues={initialValues}
        onSubmit={async (data) => {
          await createMutation.mutateAsync(data as any);
        }}
        onCancel={handleCancel}
        isSubmitting={createMutation.isPending}
        validationSchema={mailProviderSchema}
        submitButtonText={t('mail_providers.create_provider', 'Create Provider')}
        cancelButtonText={t('common.cancel', 'Cancel')}
        showCancelButton={true}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </CreatePageTemplate>
  );
};

export default CreateMailProviderPage;

