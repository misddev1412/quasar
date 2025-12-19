import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Settings, FileText, Server, Hash } from 'lucide-react';
import { CreatePageTemplate } from '../../components/common/CreatePageTemplate';
import { EntityForm } from '../../components/common/EntityForm';
import { FormTabConfig } from '../../types/forms';
import { useToast } from '../../context/ToastContext';
import { trpc } from '../../utils/trpc';
import { z } from 'zod';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useUrlTabs } from '../../hooks/useUrlTabs';

type MailChannelPriorityFormData = {
  name: string;
  description?: string;
  mailProviderId: string;
  mailTemplateId?: string;
  isActive?: boolean;
  priority?: number;
  config?: Record<string, any>;
};

const mailChannelPrioritySchema: z.ZodSchema<MailChannelPriorityFormData> = z.object({
  name: z.string().min(2).max(255),
  description: z.string().max(1000).optional(),
  mailProviderId: z.string().uuid(),
  isActive: z.boolean().optional().default(true),
  priority: z.number().int().min(1).max(10).optional().default(5),
  config: z.record(z.any()).optional(),
}) as z.ZodSchema<MailChannelPriorityFormData>;

const CreateMailChannelPriorityPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();
  const [providerOptions, setProviderOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [templateOptions, setTemplateOptions] = useState<Array<{ value: string; label: string }>>([]);
  const { activeTab, handleTabChange } = useUrlTabs({
    defaultTab: 0,
    tabParam: 'tab',
    tabKeys: ['general'],
  });

  const { data: providersData } = trpc.adminMailProvider.getActiveProviders.useQuery();
  const { data: templatesData } = trpc.adminMailTemplate.getTemplates.useQuery({
    page: 1,
    limit: 100,
    sortBy: 'name',
    sortOrder: 'ASC',
  });
  const createMutation = trpc.adminMailChannelPriority.createFlow.useMutation({
    onSuccess: () => {
      addToast({
        title: t('common.success', 'Success'),
        description: t('email_flows.create_success', 'Mail channel priority created successfully'),
        type: 'success',
      });
      navigate('/email-flows');
    },
    onError: (error) => {
      addToast({
        title: t('common.error', 'Error'),
        description: error.message || t('email_flows.create_failed', 'Failed to create mail channel priority'),
        type: 'error',
      });
    },
  });

  useEffect(() => {
    const data = (providersData as any)?.data;
    if (data && Array.isArray(data)) {
      const options = data.map((p: any) => ({
        value: p.id,
        label: `${p.name} (${p.providerType})`,
      }));
      setProviderOptions(options);
    }
  }, [providersData]);

  useEffect(() => {
    const items = (templatesData as any)?.data?.items;
    if (Array.isArray(items)) {
      const options = items.map((template: any) => ({
        value: template.id,
        label: template.name,
      }));
      setTemplateOptions(options);
    }
  }, [templatesData]);

  const tabs: FormTabConfig[] = useMemo(() => ([
    {
      id: 'general',
      label: t('email_flows.tabs.general_settings', 'Priority Settings'),
      icon: <Settings className="w-4 h-4" />,
      sections: [
        {
          title: t('email_flows.sections.basic_information', 'Basic Information'),
          description: t('email_flows.sections.basic_information_description', 'Provide context for this priority configuration.'),
          icon: <FileText className="w-5 h-5" />,
          fields: [
            {
              name: 'name',
              label: t('email_flows.fields.name', 'Priority Name'),
              type: 'text',
              required: true,
              placeholder: t('email_flows.fields.name_placeholder', 'e.g., Primary Transactional Channel'),
              description: t('email_flows.fields.name_description', 'Used across the platform to reference this priority config.'),
              icon: <FileText className="w-4 h-4" />,
            },
            {
              name: 'description',
              label: t('email_flows.fields.description', 'Description'),
              type: 'textarea',
              placeholder: t('email_flows.fields.description_placeholder', 'Optional details about when to use this priority'),
              rows: 4,
              description: t('email_flows.fields.description_help', 'Share context so other admins understand how to use this priority.'),
            },
          ],
        },
        {
          title: t('email_flows.sections.delivery', 'Channel & Behavior'),
          description: t('email_flows.sections.delivery_description', 'Choose the mail channel and priority order.'),
          icon: <Server className="w-5 h-5" />,
          fields: [
            {
              name: 'mailProviderId',
              label: t('email_flows.fields.mail_provider', 'Mail Channel'),
              type: 'select',
              required: true,
              options: providerOptions,
              placeholder: t('email_flows.fields.mail_provider_placeholder', 'Select a mail channel'),
              description: t('email_flows.fields.mail_provider_description', 'Select the active channel responsible for sending messages.'),
            },
            {
              name: 'mailTemplateId',
              label: t('mail_templates.template', 'Mail Template'),
              type: 'select',
              options: [
                { value: '', label: t('email_flows.fields.mail_template_default', 'All templates (default)') },
                ...templateOptions,
              ],
              placeholder: t('email_flows.fields.mail_template_placeholder', 'Select a template (optional)'),
              description: t('email_flows.fields.mail_template_description', 'Restrict this priority to a specific template. Leave blank for global default.'),
            },
            {
              name: 'isActive',
              label: t('email_flows.fields.is_active', 'Active'),
              type: 'checkbox',
              description: t('email_flows.fields.is_active_description', 'Disable to omit this channel from the priority rotation.'),
            },
            {
              name: 'priority',
              label: t('email_flows.fields.priority', 'Priority Order'),
              type: 'number',
              placeholder: t('email_flows.fields.priority_placeholder', '1-10 (1 = highest priority)'),
              description: t('email_flows.fields.priority_description', 'Lower numbers run first when selecting fallback channels.'),
              min: 1,
              max: 10,
              step: 1,
              icon: <Hash className="w-4 h-4" />,
            },
          ],
        },
      ],
    },
  ]), [providerOptions, templateOptions, t]);

  const initialValues: Partial<MailChannelPriorityFormData> = {
    name: '',
    isActive: true,
    priority: 5,
  };

  return (
    <CreatePageTemplate
      title={t('email_flows.create.title', 'Create Mail Channel Priority')}
      description={t('email_flows.create.description', 'Define how your mail channels should be prioritized during delivery.')}
      icon={<Mail className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
      entityName={t('email_flows.entity_name', 'Mail Channel Priority')}
      entityNamePlural={t('email_flows.entity_name_plural', 'Mail Channel Priorities')}
      backUrl="/email-flows"
      onBack={() => navigate('/email-flows')}
      isSubmitting={createMutation.isPending}
      maxWidth="full"
      breadcrumbs={[
        { label: t('navigation.home', 'Home'), href: '/' },
        { label: t('email_flows.entity_name_plural', 'Mail Channel Priorities'), onClick: () => navigate('/email-flows') },
        { label: t('email_flows.create.breadcrumb', 'Create Priority Config') },
      ]}
    >
      <EntityForm<MailChannelPriorityFormData>
        tabs={tabs}
        initialValues={initialValues}
        onSubmit={async (data) => {
          const payload = {
            ...data,
            mailTemplateId: data.mailTemplateId || undefined,
          };
          await createMutation.mutateAsync(payload as any);
        }}
        onCancel={() => navigate('/email-flows')}
        isSubmitting={createMutation.isPending}
        validationSchema={mailChannelPrioritySchema}
        submitButtonText={t('email_flows.actions.create', 'Create Priority Config')}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </CreatePageTemplate>
  );
};

export default CreateMailChannelPriorityPage;
