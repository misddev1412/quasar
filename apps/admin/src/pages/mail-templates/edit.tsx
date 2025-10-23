import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mail, ArrowLeft, Settings as SettingsIcon, FileText, Users, Send, Home } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import BaseLayout from '../../components/layout/BaseLayout';
import { useToast } from '../../context/ToastContext';
import { trpc } from '../../utils/trpc';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useEmailChannels } from '../../hooks/useEmailChannels';
import { useUrlTabs } from '../../hooks/useUrlTabs';
import { EntityForm } from '../../components/common/EntityForm';
import { FormTabConfig } from '../../types/forms';
import { z } from 'zod';

// Form data type for update
type UpdateMailTemplateFormData = {
  name: string;
  subject: string;
  body: string;
  type: string;
  description?: string;
  variables?: string | string[];
  fromEmail?: string;
  fromName?: string;
  recipientType?: 'manual' | 'roles' | 'all_users';
  recipientRoles?: string[];
  emailChannelId?: string;
  isActive?: boolean;
};

// Validation schema for update
const updateMailTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(255, 'Template name must not exceed 255 characters'),
  subject: z.string().min(1, 'Subject is required').max(500, 'Subject must not exceed 500 characters'),
  body: z.string().min(1, 'Body content is required'),
  type: z.string().min(1, 'Template type is required'),
  description: z.string().optional(),
  variables: z.union([z.string(), z.array(z.string())]).optional(),
  fromEmail: z.string().email().optional().or(z.literal('')),
  fromName: z.string().optional(),
  recipientType: z.enum(['manual', 'roles', 'all_users']).optional(),
  recipientRoles: z.array(z.string()).optional(),
  emailChannelId: z.string().optional(),
  isActive: z.boolean().optional(),
});

const MailTemplateEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();
  const trpcContext = trpc.useContext();
  const { channels, defaultChannel, isLoading: isLoadingChannels } = useEmailChannels();

  // Use URL tabs hook with tab keys for clean URLs
  const { activeTab, handleTabChange } = useUrlTabs({
    defaultTab: 0,
    tabParam: 'tab',
    tabKeys: ['general', 'settings'] // Maps to tab IDs
  });

  const {
    data: templateResponse,
    isLoading,
    error,
  } = trpc.adminMailTemplate.getTemplateById.useQuery(
    { id: id as string },
    { enabled: !!id }
  );

  const updateTemplateMutation = trpc.adminMailTemplate.updateTemplate.useMutation({
    onError: (err) => {
      addToast({
        type: 'error',
        title: t('common.error'),
        description: err.message || t('messages.operation_failed'),
      });
    },
  });

  const initialValues: Partial<UpdateMailTemplateFormData> = useMemo(() => {
    const data = (templateResponse as any)?.data;
    if (!data) return {};
    
    // Convert variables array to string for textarea display
    const variablesString = Array.isArray(data.variables) 
      ? data.variables.join('\n')
      : '';
    
    return {
      name: data.name || '',
      subject: data.subject || '',
      body: data.body || '',
      type: data.type || '',
      description: data.description || '',
      variables: variablesString,
      fromEmail: data.fromEmail || '',
      fromName: data.fromName || '',
      recipientType: data.recipientType || 'manual',
      recipientRoles: data.recipientRoles || [],
      emailChannelId: data.emailChannelId || '',
      isActive: data.isActive ?? true,
    } as any;
  }, [templateResponse]);

  const handleSubmit = async (formData: UpdateMailTemplateFormData) => {
    if (!id) return;

    try {
      // Transform variables string back to array
      const variables = typeof formData.variables === 'string' 
        ? formData.variables.split('\n').map(v => v.trim()).filter(v => v.length > 0)
        : formData.variables || [];

      await updateTemplateMutation.mutateAsync({
        id,
        name: formData.name,
        subject: formData.subject,
        body: formData.body,
        type: formData.type,
        description: formData.description,
        variables,
        fromEmail: formData.fromEmail,
        fromName: formData.fromName,
        recipientType: formData.recipientType,
        recipientRoles: formData.recipientRoles,
        emailChannelId: formData.emailChannelId,
        isActive: formData.isActive ?? true,
      } as any);

      // Invalidate queries to refresh data
      trpcContext.adminMailTemplate.getTemplates.invalidate();
      if (id) trpcContext.adminMailTemplate.getTemplateById.invalidate({ id });

      // Show success toast and stay on current page
      addToast({
        type: 'success',
        title: t('messages.update_success', 'Updated successfully'),
        description: t('mail_templates.template_updated_successfully', 'Mail template has been updated successfully.'),
      });

      // Do not navigate away - stay on the current page
    } catch (err) {
      // Errors are handled per-mutation; this catch is a safeguard
      console.error(err);
    }
  };

  const handleCancel = () => navigate('/mail-templates');

  // Template type options
  const templateTypeOptions = [
    { value: 'user_onboarding', label: t('mail_templates.type_user_onboarding', 'User Onboarding') },
    { value: 'authentication', label: t('mail_templates.type_authentication', 'Authentication') },
    { value: 'notification', label: t('mail_templates.type_notification', 'Notification') },
    { value: 'marketing', label: t('mail_templates.type_marketing', 'Marketing') },
    { value: 'transactional', label: t('mail_templates.type_transactional', 'Transactional') },
    { value: 'system', label: t('mail_templates.type_system', 'System') },
  ];

  // Tabs configuration
  const tabs: FormTabConfig[] = [
    {
      id: 'general',
      label: t('form.tabs.general_information'),
      icon: <Mail className="w-4 h-4" />,
      sections: [
        {
          title: t('form.sections.basic_information'),
          description: t('mail_templates.basic_info_description', 'Define the basic template information and metadata.'),
          icon: <FileText className="w-4 h-4" />,
          fields: [
            {
              name: 'name',
              label: t('mail_templates.name'),
              type: 'text',
              placeholder: t('mail_templates.name_placeholder', 'Enter template name'),
              required: true,
              description: t('mail_templates.name_description', 'Unique identifier for this template'),
            },
            {
              name: 'subject',
              label: t('mail_templates.subject'),
              type: 'text',
              placeholder: t('mail_templates.subject_placeholder', 'Enter email subject'),
              required: true,
              description: t('mail_templates.subject_description', 'Email subject line that recipients will see'),
            },
            {
              name: 'type',
              label: t('mail_templates.type'),
              type: 'select',
              placeholder: t('mail_templates.type_placeholder', 'Select template type'),
              required: true,
              options: templateTypeOptions,
              description: t('mail_templates.type_description', 'Category or purpose of this template'),
            },
            {
              name: 'description',
              label: t('mail_templates.description'),
              type: 'textarea',
              placeholder: t('mail_templates.description_placeholder', 'Enter template description (optional)'),
              required: false,
              rows: 3,
              description: t('mail_templates.description_description', 'Optional description explaining the template purpose'),
            },
          ],
        },
        {
          title: t('mail_templates.sender_section', 'Sender Configuration'),
          description: t('mail_templates.sender_description', 'Configure sender information for this template.'),
          icon: <Mail className="w-4 h-4" />,
          fields: [
            {
              name: 'fromEmail',
              label: t('mail_templates.from_email', 'From Email'),
              type: 'email',
              placeholder: t('mail_templates.from_email_placeholder', 'sender@example.com'),
              required: false,
              description: t('mail_templates.from_email_description', 'Override default sender email for this template'),
            },
            {
              name: 'fromName',
              label: t('mail_templates.from_name', 'From Name'),
              type: 'text',
              placeholder: t('mail_templates.from_name_placeholder', 'Sender Name'),
              required: false,
              description: t('mail_templates.from_name_description', 'Override default sender name for this template'),
            },
          ],
        },
        {
          title: t('mail_templates.recipient_section', 'Recipient Configuration'),
          description: t('mail_templates.recipient_description', 'Configure who will receive emails from this template.'),
          icon: <Users className="w-4 h-4" />,
          fields: [
            {
              name: 'recipientType',
              label: t('mail_templates.recipient_type', 'Recipient Type'),
              type: 'select',
              placeholder: t('mail_templates.recipient_type_placeholder', 'Select recipient type'),
              required: false,
              options: [
                { value: 'manual', label: t('mail_templates.recipient_manual', 'Manual Recipients') },
                { value: 'roles', label: t('mail_templates.recipient_roles', 'Based on User Roles') },
                { value: 'all_users', label: t('mail_templates.recipient_all', 'All Users') },
              ],
              description: t('mail_templates.recipient_type_description', 'How recipients are determined for this template'),
            },
            {
              name: 'recipientRoles',
              label: t('mail_templates.recipient_roles_list', 'Target Roles'),
              type: 'role-multiselect',
              placeholder: t('mail_templates.recipient_roles_placeholder', 'Select roles...'),
              required: false,
              description: t('mail_templates.recipient_roles_description', 'Users with these roles will receive emails (only applies when recipient type is "Based on User Roles")'),
              dependsOn: { field: 'recipientType', value: 'roles' },
            },
          ],
        },
        {
          title: t('mail_templates.content_section', 'Email Content'),
          description: t('mail_templates.content_description', 'Define the email body content and structure.'),
          icon: <FileText className="w-4 h-4" />,
          fields: [
            {
              name: 'body',
              label: t('mail_templates.body'),
              type: 'richtext',
              placeholder: t('mail_templates.body_placeholder', 'Enter email body content'),
              required: true,
              minHeight: '400px',
              description: t('mail_templates.body_description', 'Main email content with HTML support and variable placeholders'),
            },
            {
              name: 'variables',
              label: t('mail_templates.variables'),
              type: 'textarea',
              placeholder: t('mail_templates.variables_placeholder', 'Enter variables (one per line)\ne.g.:\nuser_name\nuser_email\napp_name'),
              required: false,
              rows: 4,
              description: t('mail_templates.variables_description', 'Available variables for this template (e.g., user_name, user_email, app_name)'),
            },
          ],
        },
      ],
    },
    {
      id: 'settings',
      label: t('form.tabs.preferences'),
      icon: <SettingsIcon className="w-4 h-4" />,
      sections: [
        {
          title: t('mail_templates.template_settings', 'Template Settings'),
          description: t('mail_templates.settings_description', 'Configure template status and availability.'),
          icon: <SettingsIcon className="w-4 h-4" />,
          fields: [
            {
              name: 'emailChannelId',
              label: t('mail_templates.email_channel', 'Email Channel'),
              type: 'select',
              placeholder: t('mail_templates.select_email_channel', 'Select email channel (optional)'),
              required: false,
              options: channels.length > 0 ? [
                { value: '', label: t('mail_templates.use_default_channel', 'Use Default Channel') },
                ...channels,
              ] : [],
              icon: <Send className="w-4 h-4" />,
              description: t('mail_templates.email_channel_description', 'Email channel to use for sending this template. Leave empty to use the default channel.'),
              disabled: isLoadingChannels,
            },
            {
              name: 'isActive',
              label: t('mail_templates.is_active'),
              type: 'checkbox',
              required: false,
              description: t('mail_templates.is_active_description', 'Whether this template is active and available for use'),
            },
          ],
        },
      ],
    },
  ];

  const actions = [
    {
      label: t('mail_templates.back_to_templates', 'Back to Templates'),
      onClick: handleCancel,
      icon: <ArrowLeft className="w-4 h-4" />,
    },
  ];

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 md:p-8 text-red-500">
          {t('common.error')}: {(error as any)?.message || 'Failed to load mail template'}
        </div>
      );
    }

    return (
      <EntityForm<UpdateMailTemplateFormData>
        tabs={tabs}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={updateTemplateMutation.isPending}
        validationSchema={updateMailTemplateSchema as any}
        submitButtonText={t('common.update')}
        cancelButtonText={t('common.cancel')}
        showCancelButton={true}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    );
  };

  return (
    <BaseLayout
      title={t('mail_templates.edit_template', 'Edit Mail Template')}
      description={t('mail_templates.template_information_description', 'Update mail template information and settings')}
      actions={actions}
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
              label: 'Mail Templates',
              href: '/mail-templates',
              icon: <Mail className="w-4 h-4" />
            },
            {
              label: 'Edit Template',
              icon: <Mail className="w-4 h-4" />
            }
          ]}
        />

        <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t('mail_templates.template_information', 'Template Information')}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('mail_templates.template_information_description', 'Update mail template information and settings')}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">{renderContent()}</CardContent>
        </Card>
      </div>
    </BaseLayout>
  );
};

export default MailTemplateEditPage;