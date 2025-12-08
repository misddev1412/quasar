import React from 'react';
import { Mail, FileText, Tag, Settings, Eye, Code, Send } from 'lucide-react';
import { EntityForm } from '../common/EntityForm';
import { FormTabConfig } from '../../types/forms';
import { MailTemplate, MailTemplateFormData, MAIL_TEMPLATE_TYPE_OPTIONS } from '../../types/mail-template';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useEmailChannels } from '../../hooks/useEmailChannels';
import { z } from 'zod';

interface EditMailTemplateFormProps {
  template: MailTemplate;
  onSubmit: (data: MailTemplateFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

// Validation schema - make required fields required to match MailTemplateFormData
const editMailTemplateSchema: z.ZodType<MailTemplateFormData> = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255, 'Name must be less than 255 characters'),
  subject: z.string().min(1, 'Subject is required').max(500, 'Subject must be less than 500 characters'),
  body: z.string().min(1, 'Body is required'),
  type: z.string().min(1, 'Type is required'),
  isActive: z.boolean(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  variables: z.union([z.array(z.string()), z.string()]).optional(),
  fromEmail: z.string().email().optional().or(z.literal('')),
  fromName: z.string().optional(),
  recipientType: z.enum(['manual', 'roles', 'all_users']).optional(),
  recipientRoles: z.array(z.string()).optional(),
  emailChannelId: z.string().optional(),
}) as any;

export const EditMailTemplateForm: React.FC<EditMailTemplateFormProps> = ({
  template,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const { t } = useTranslationWithBackend();
  const { channels, defaultChannel, isLoading: isLoadingChannels } = useEmailChannels();

  const tabs: FormTabConfig[] = [
    {
      id: 'basic',
      label: t('mail_templates.basic_information', 'Basic Information'),
      icon: <FileText className="w-4 h-4" />,
      sections: [
        {
          title: t('mail_templates.template_details', 'Template Details'),
          description: t('mail_templates.template_details_description', 'Basic information about the mail template'),
          fields: [
            {
              name: 'name',
              label: t('mail_templates.template_name', 'Template Name'),
              type: 'text',
              placeholder: t('mail_templates.enter_template_name', 'Enter template name'),
              required: true,
              validation: {
                minLength: 2,
                maxLength: 255,
                pattern: /^[a-zA-Z0-9_-]+$/,
              },
              description: t('mail_templates.name_description', 'Unique identifier for the template (alphanumeric, underscore, and dash only)'),
            },
            {
              name: 'type',
              label: t('mail_templates.template_type', 'Template Type'),
              type: 'select',
              placeholder: t('mail_templates.select_template_type', 'Select template type'),
              required: true,
              options: MAIL_TEMPLATE_TYPE_OPTIONS,
              icon: <Tag className="w-4 h-4" />,
              description: t('mail_templates.type_description', 'Category or purpose of this template'),
            },
            {
              name: 'description',
              label: t('mail_templates.description', 'Description'),
              type: 'textarea',
              placeholder: t('mail_templates.enter_description', 'Enter template description (optional)'),
              required: false,
              rows: 3,
              validation: {
                maxLength: 1000,
              },
              description: t('mail_templates.description_description', 'Optional description of the template purpose'),
            },
          ],
        },
      ],
    },
    {
      id: 'content',
      label: t('mail_templates.content', 'Content'),
      icon: <Mail className="w-4 h-4" />,
      sections: [
        {
          title: t('mail_templates.email_content', 'Email Content'),
          description: t('mail_templates.email_content_description', 'Subject and body content for the email template'),
          fields: [
            {
              name: 'subject',
              label: t('mail_templates.email_subject', 'Email Subject'),
              type: 'text',
              placeholder: t('mail_templates.enter_email_subject', 'Enter email subject'),
              required: true,
              validation: {
                minLength: 1,
                maxLength: 500,
              },
              description: t('mail_templates.subject_description', 'Subject line for emails sent using this template. Use {{variable}} for dynamic content.'),
            },
            {
              name: 'body',
              label: t('mail_templates.email_body', 'Email Body'),
              type: 'richtext',
              placeholder: t('mail_templates.enter_email_body', 'Enter email body content'),
              required: true,
              minHeight: '400px',
              description: t('mail_templates.body_description', 'HTML content for the email body. Use {{variable}} for dynamic content.'),
            },
          ],
        },
        {
          title: t('mail_templates.variables', 'Template Variables'),
          description: t('mail_templates.variables_description', 'Define variables that can be used in the template'),
          fields: [
            {
              name: 'variables',
              label: t('mail_templates.available_variables', 'Available Variables'),
              type: 'textarea',
              placeholder: t('mail_templates.add_variable', 'Add variable names (one per line)'),
              required: false,
              rows: 3,
              description: t('mail_templates.variables_help', 'List of variables that can be used in this template. Enter one variable per line. Variables will be auto-detected from content.'),
            },
          ],
        },
      ],
    },
    {
      id: 'settings',
      label: t('mail_templates.settings', 'Settings'),
      icon: <Settings className="w-4 h-4" />,
      sections: [
        {
          title: t('mail_templates.template_settings', 'Template Settings'),
          description: t('mail_templates.template_settings_description', 'Configure template behavior and status'),
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
              label: t('mail_templates.active_status', 'Active Status'),
              type: 'checkbox',
              required: false,
              description: t('mail_templates.active_status_description', 'Whether this template is available for use'),
            },
          ],
        },
        {
          title: t('mail_templates.metadata', 'Metadata'),
          description: t('mail_templates.metadata_description', 'Template creation and modification information'),
          fields: [
            {
              name: 'metadata_info',
              label: t('mail_templates.metadata_info', 'Template Information'),
              type: 'textarea',
              placeholder: '',
              required: false,
              disabled: true,
              rows: 4,
              description: `Created: ${new Date(template.createdAt).toLocaleString()}${template.createdBy ? ` by ${template.createdBy}` : ''}\nLast Updated: ${new Date(template.updatedAt).toLocaleString()}${template.updatedBy ? ` by ${template.updatedBy}` : ''}\nVersion: ${template.version}`,
            },
          ],
        },
      ],
    },
    {
      id: 'preview',
      label: t('mail_templates.preview', 'Preview'),
      icon: <Eye className="w-4 h-4" />,
      sections: [
        {
          title: t('mail_templates.template_preview', 'Template Preview'),
          description: t('mail_templates.preview_description', 'Preview how the template will look with sample data'),
          fields: [
            {
              name: 'preview_note',
              label: t('mail_templates.preview_note', 'Preview Note'),
              type: 'textarea',
              placeholder: t('mail_templates.preview_note_placeholder', 'Use the preview component to test this template with variables'),
              required: false,
              rows: 2,
              disabled: true,
              description: t('mail_templates.preview_note_description', 'You can preview the template with the preview component'),
            },
          ],
        },
      ],
    },
  ];

  // Initial values from the template
  const initialValues: MailTemplateFormData = {
    name: template.name,
    subject: template.subject,
    body: template.body,
    type: template.type,
    isActive: template.isActive,
    description: template.description || '',
    variables: template.variables ? template.variables.join('\n') : '',
    fromEmail: template.fromEmail || '',
    fromName: template.fromName || '',
    recipientType: template.recipientType || 'manual',
    recipientRoles: template.recipientRoles || [],
    emailChannelId: template.emailChannelId || '',
  };

  // Transform form data before submission
  const handleFormSubmit = async (data: MailTemplateFormData) => {
    // Convert variables from textarea string to array if needed
    let processedData = { ...data };
    if (typeof data.variables === 'string') {
      processedData.variables = data.variables
        .split('\n')
        .map(v => v.trim())
        .filter(v => v.length > 0);
    }
    await onSubmit(processedData);
  };

  return (
    <EntityForm<MailTemplateFormData>
      tabs={tabs}
      initialValues={initialValues}
      onSubmit={handleFormSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      validationSchema={editMailTemplateSchema}
      submitButtonText={t('mail_templates.update_template', 'Update Template')}
      cancelButtonText={t('common.cancel', 'Cancel')}
    />
  );
};
