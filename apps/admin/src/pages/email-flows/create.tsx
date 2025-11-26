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

type EmailFlowFormData = {
  name: string;
  description?: string;
  mailProviderId: string;
  isActive?: boolean;
  priority?: number;
  config?: Record<string, any>;
};

const emailFlowSchema: z.ZodSchema<EmailFlowFormData> = z.object({
  name: z.string().min(2).max(255),
  description: z.string().max(1000).optional(),
  mailProviderId: z.string().uuid(),
  isActive: z.boolean().optional().default(true),
  priority: z.number().int().min(1).max(10).optional().default(5),
  config: z.record(z.any()).optional(),
}) as z.ZodSchema<EmailFlowFormData>;

const CreateEmailFlowPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();
  const [providerOptions, setProviderOptions] = useState<Array<{ value: string; label: string }>>([]);
  const { activeTab, handleTabChange } = useUrlTabs({
    defaultTab: 0,
    tabParam: 'tab',
    tabKeys: ['general'],
  });

  const { data: providersData } = trpc.adminMailProvider.getActiveProviders.useQuery();
  const createMutation = trpc.adminEmailFlow.createFlow.useMutation({
    onSuccess: () => {
      addToast({
        title: t('common.success', 'Success'),
        description: t('email_flows.create_success', 'Email flow created successfully'),
        type: 'success',
      });
      navigate('/email-flows');
    },
    onError: (error) => {
      addToast({
        title: t('common.error', 'Error'),
        description: error.message || t('email_flows.create_failed', 'Failed to create email flow'),
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

  const tabs: FormTabConfig[] = useMemo(() => ([
    {
      id: 'general',
      label: t('email_flows.tabs.general_settings', 'General Settings'),
      icon: <Settings className="w-4 h-4" />,
      sections: [
        {
          title: t('email_flows.sections.basic_information', 'Basic Information'),
          description: t('email_flows.sections.basic_information_description', 'Provide a clear identity and context for this flow.'),
          icon: <FileText className="w-5 h-5" />,
          fields: [
            {
              name: 'name',
              label: t('email_flows.fields.name', 'Flow Name'),
              type: 'text',
              required: true,
              placeholder: t('email_flows.fields.name_placeholder', 'e.g., Transactional Emails'),
              description: t('email_flows.fields.name_description', 'Used across the platform to reference this flow.'),
              icon: <FileText className="w-4 h-4" />,
            },
            {
              name: 'description',
              label: t('email_flows.fields.description', 'Description'),
              type: 'textarea',
              placeholder: t('email_flows.fields.description_placeholder', 'Optional description that explains when this flow runs'),
              rows: 4,
              description: t('email_flows.fields.description_help', 'Share context so other admins understand how to use this flow.'),
            },
          ],
        },
        {
          title: t('email_flows.sections.delivery', 'Delivery & Behavior'),
          description: t('email_flows.sections.delivery_description', 'Choose the provider and control how this flow behaves in execution.'),
          icon: <Server className="w-5 h-5" />,
          fields: [
            {
              name: 'mailProviderId',
              label: t('email_flows.fields.mail_provider', 'Mail Provider'),
              type: 'select',
              required: true,
              options: providerOptions,
              placeholder: t('email_flows.fields.mail_provider_placeholder', 'Select a mail provider'),
              description: t('email_flows.fields.mail_provider_description', 'Select the active provider responsible for sending messages.'),
            },
            {
              name: 'isActive',
              label: t('email_flows.fields.is_active', 'Active'),
              type: 'checkbox',
              description: t('email_flows.fields.is_active_description', 'Disable to pause sending through this flow without deleting it.'),
            },
            {
              name: 'priority',
              label: t('email_flows.fields.priority', 'Priority'),
              type: 'number',
              placeholder: t('email_flows.fields.priority_placeholder', '1-10 (1 = highest)'),
              description: t('email_flows.fields.priority_description', 'Lower numbers run first when multiple flows are eligible.'),
              min: 1,
              max: 10,
              step: 1,
              icon: <Hash className="w-4 h-4" />,
            },
          ],
        },
      ],
    },
  ]), [providerOptions, t]);

  const initialValues: Partial<EmailFlowFormData> = {
    name: '',
    isActive: true,
    priority: 5,
  };

  return (
    <CreatePageTemplate
      title={t('email_flows.create.title', 'Create Email Flow')}
      description={t('email_flows.create.description', 'Create a new email flow to orchestrate outbound messages')}
      icon={<Mail className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
      entityName={t('email_flows.entity_name', 'Email Flow')}
      entityNamePlural={t('email_flows.entity_name_plural', 'Email Flows')}
      backUrl="/email-flows"
      onBack={() => navigate('/email-flows')}
      isSubmitting={createMutation.isPending}
      maxWidth="full"
      breadcrumbs={[
        { label: t('navigation.home', 'Home'), href: '/' },
        { label: t('email_flows.entity_name_plural', 'Email Flows'), onClick: () => navigate('/email-flows') },
        { label: t('email_flows.create.breadcrumb', 'Create Email Flow') },
      ]}
    >
      <EntityForm<EmailFlowFormData>
        tabs={tabs}
        initialValues={initialValues}
        onSubmit={async (data) => {
          await createMutation.mutateAsync(data as any);
        }}
        onCancel={() => navigate('/email-flows')}
        isSubmitting={createMutation.isPending}
        validationSchema={emailFlowSchema}
        submitButtonText={t('email_flows.actions.create', 'Create Flow')}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </CreatePageTemplate>
  );
};

export default CreateEmailFlowPage;
