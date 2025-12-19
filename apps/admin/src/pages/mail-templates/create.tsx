import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Home, Settings, Send, FileText, Users } from 'lucide-react';
import { CreatePageTemplate } from '../../components/common/CreatePageTemplate';
import { useToast } from '../../context/ToastContext';
import { trpc } from '../../utils/trpc';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useEmailChannels } from '../../hooks/useEmailChannels';
import { useUrlTabs } from '../../hooks/useUrlTabs';
import { EntityForm } from '../../components/common/EntityForm';
import { FormTabConfig } from '../../types/forms';
import { z } from 'zod';

// Form data type for create
type CreateMailTemplateFormData = {
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
  emailFlowId: string;
  isActive?: boolean;
};

// Validation schema for create
const createMailTemplateSchema = z.object({
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
  emailFlowId: z.string().uuid(),
  isActive: z.boolean().optional(),
});

const CreateMailTemplatePage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();
  const trpcContext = trpc.useContext();
  const { channels, defaultChannel, isLoading: isLoadingChannels } = useEmailChannels();
  const { data: flowsData, isLoading: isLoadingFlows } = trpc.adminMailChannelPriority.getActiveFlows.useQuery();

  // Use URL tabs hook with tab keys for clean URLs
  const { activeTab, handleTabChange } = useUrlTabs({
    defaultTab: 0,
    tabParam: 'tab',
    tabKeys: ['general', 'settings'] // Maps to tab IDs
  });

  const createTemplateMutation = trpc.adminMailTemplate.createTemplate.useMutation({
    onError: (err) => {
      addToast({
        type: 'error',
        title: t('common.error'),
        description: err.message || t('messages.operation_failed'),
      });
    },
  });

  const initialValues: Partial<CreateMailTemplateFormData> = {
    name: '',
    subject: '',
    body: '',
    type: '',
    description: '',
    variables: '',
    fromEmail: '',
    fromName: '',
    recipientType: 'manual',
    recipientRoles: [],
    emailChannelId: defaultChannel?.value || '',
    emailFlowId: '',
    isActive: true,
  };

  const handleSubmit = async (formData: CreateMailTemplateFormData) => {
    try {
      // Transform variables string back to array
      const variables = typeof formData.variables === 'string' 
        ? formData.variables.split('\n').map(v => v.trim()).filter(v => v.length > 0)
        : formData.variables || [];

      await createTemplateMutation.mutateAsync({
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
        emailFlowId: formData.emailFlowId,
        isActive: formData.isActive ?? true,
      } as any);

      // Invalidate queries to refresh data
      trpcContext.adminMailTemplate.getTemplates.invalidate();

      // Show success toast and navigate back to list
      addToast({
        type: 'success',
        title: t('messages.create_success', 'Created successfully'),
        description: t('mail_templates.template_created_successfully', 'Mail template has been created successfully.'),
      });

      navigate('/mail-templates');
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
      icon: <Settings className="w-4 h-4" />,
      sections: [
        {
          title: t('mail_templates.template_settings', 'Template Settings'),
          description: t('mail_templates.settings_description', 'Configure template status and availability.'),
          icon: <Settings className="w-4 h-4" />,
          fields: [
            {
              name: 'emailFlowId',
              label: t('mail_templates.email_flow', 'Mail Channel Priority'),
              type: 'select',
              placeholder: t('mail_templates.select_email_flow', 'Select mail channel priority'),
              required: true,
              options: (flowsData as any)?.data ? ((flowsData as any).data as any[]).map((flow: any) => ({
                value: flow.id,
                label: `${flow.name} (${flow.mailProvider?.name || 'N/A'})`,
              })) : [],
              icon: <Send className="w-4 h-4" />,
              description: t('mail_templates.email_flow_description', 'Mail channel priority to use for sending this template. Only active priorities with active providers are shown.'),
              disabled: isLoadingFlows,
            },
            {
              name: 'emailChannelId',
              label: t('mail_templates.email_channel', 'Email Channel (Deprecated)'),
              type: 'select',
              placeholder: t('mail_templates.select_email_channel', 'Select email channel (optional)'),
              required: false,
              options: channels.length > 0 ? [
                { value: '', label: t('mail_templates.use_default_channel', 'Use Default Channel') },
                ...channels,
              ] : [],
              icon: <Send className="w-4 h-4" />,
              description: t('mail_templates.email_channel_description', 'Email channel to use for sending this template (deprecated, use Mail Channel Priority instead).'),
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

  return (
    <CreatePageTemplate
      title={t('mail_templates.create_template', 'Create Mail Template')}
      description={t('mail_templates.create_template_description', 'Create a new email template for your application')}
      icon={<Mail className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
      entityName={t('mail_templates.template', 'Template')}
      entityNamePlural={t('mail_templates.templates', 'Mail Templates')}
      backUrl="/mail-templates"
      onBack={handleCancel}
      isSubmitting={createTemplateMutation.isPending}
      maxWidth="full"
      breadcrumbs={[
        {
          label: 'Home',
          href: '/',
        },
        {
          label: t('navigation.mail_templates', 'Mail Templates'),
          onClick: handleCancel,
        },
        {
          label: t('mail_templates.create_template', 'Create Mail Template'),
        }
      ]}
    >
      <EntityForm<CreateMailTemplateFormData>
        tabs={tabs}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createTemplateMutation.isPending}
        validationSchema={createMailTemplateSchema as any}
        submitButtonText={t('common.create')}
        cancelButtonText={t('common.cancel')}
        showCancelButton={true}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </CreatePageTemplate>
  );
};

export default CreateMailTemplatePage;
