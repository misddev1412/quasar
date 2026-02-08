import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mail, Settings } from 'lucide-react';
import { StandardFormPage, EntityForm, Loading } from '@admin/components/common';
import { FormTabConfig } from '@admin/types/forms';
import { useToast } from '@admin/contexts/ToastContext';
import { trpc } from '@admin/utils/trpc';
import { z } from 'zod';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';

type MailChannelPriorityFormData = {
  name: string;
  description?: string;
  mailProviderId: string;
  mailTemplateId?: string;
  isActive?: boolean;
  priority?: number;
  config?: Record<string, unknown>;
};

type ProviderOptionSource = {
  id: string;
  name: string;
  providerType: string;
};

type TemplateOptionSource = {
  id: string;
  name: string;
};

type FlowDataResponse = {
  data?: MailChannelPriorityFormData;
};

type ProvidersResponse = {
  data?: ProviderOptionSource[];
};

type TemplatesResponse = {
  data?: {
    items?: TemplateOptionSource[];
  };
};

type UpdateFlowInput = MailChannelPriorityFormData & { id: string };

const mailChannelPrioritySchema: z.ZodSchema<MailChannelPriorityFormData> = z.object({
  name: z.string().min(2).max(255),
  description: z.string().max(1000).optional(),
  mailProviderId: z.string().uuid(),
  isActive: z.boolean().optional().default(true),
  priority: z.number().int().min(1).max(10).optional().default(5),
  config: z.record(z.unknown()).optional(),
}) as z.ZodSchema<MailChannelPriorityFormData>;

const EditMailChannelPriorityPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();
  const [providerOptions, setProviderOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [templateOptions, setTemplateOptions] = useState<Array<{ value: string; label: string }>>([]);

  const { data: flowData, isLoading } = trpc.adminMailChannelPriority.getFlowById.useQuery({ id: id! }, { enabled: !!id });
  const { data: providersData } = trpc.adminMailProvider.getActiveProviders.useQuery();
  const { data: templatesData } = trpc.adminMailTemplate.getTemplates.useQuery({
    page: 1,
    limit: 100,
    sortBy: 'name',
    sortOrder: 'ASC',
  });
  const updateMutation = trpc.adminMailChannelPriority.updateFlow.useMutation({
    onSuccess: () => {
      addToast({
        title: t('common.success', 'Success'),
        description: t('email_flows.update_success', 'Mail channel priority updated successfully'),
        type: 'success',
      });
      navigate('/email-flows');
    },
    onError: (error) => {
      addToast({
        title: t('common.error', 'Error'),
        description: error.message,
        type: 'error',
      });
    },
  });

  useEffect(() => {
    const data = (providersData as ProvidersResponse | undefined)?.data;
    if (data && Array.isArray(data)) {
      const options = data.map((p) => ({
        value: p.id,
        label: `${p.name} (${p.providerType})`,
      }));
      setProviderOptions(options);
    }
  }, [providersData]);

  useEffect(() => {
    const items = (templatesData as TemplatesResponse | undefined)?.data?.items;
    if (Array.isArray(items)) {
      const options = items.map((template) => ({
        value: template.id,
        label: template.name,
      }));
      setTemplateOptions(options);
    }
  }, [templatesData]);

  const tabs: FormTabConfig[] = [
    {
      id: 'general',
      label: 'Priority Settings',
      icon: <Settings className="w-4 h-4" />,
      sections: [
        {
          title: 'Basic Information',
          fields: [
            {
              name: 'name',
              label: 'Priority Name',
              type: 'text',
              required: true,
            },
            {
              name: 'description',
              label: 'Description',
              type: 'textarea',
            },
            {
              name: 'mailProviderId',
              label: 'Mail Channel',
              type: 'select',
              required: true,
              options: providerOptions,
              description: 'Select an active mail channel',
            },
            {
              name: 'mailTemplateId',
              label: 'Mail Template',
              type: 'select',
              options: [
                { value: '', label: 'All templates (default)' },
                ...templateOptions,
              ],
              description: 'Optional: restrict this priority to a single template',
            },
            {
              name: 'isActive',
              label: 'Active',
              type: 'checkbox',
            },
            {
              name: 'priority',
              label: 'Priority Order',
              type: 'number',
            },
          ],
        },
      ],
    },
  ];

  const formId = 'email-flow-edit-form';

  if (isLoading) {
    return (
      <StandardFormPage
        title={t('email_flows.edit.title', 'Edit Mail Channel Priority')}
        description={t('email_flows.edit.description', 'Update how this mail channel participates in your priority strategy.')}
        icon={<Mail className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
        entityName={t('email_flows.entity_name', 'Mail Channel Priority')}
        entityNamePlural={t('email_flows.entity_name_plural', 'Mail Channel Priorities')}
        backUrl="/email-flows"
        onBack={() => navigate('/email-flows')}
        showActions={false}
      >
        <Loading />
      </StandardFormPage>
    );
  }

  const flow = (flowData as FlowDataResponse | undefined)?.data;

  return (
    <StandardFormPage
      title={t('email_flows.edit.title', 'Edit Mail Channel Priority')}
      description={t('email_flows.edit.description', 'Update how this mail channel participates in your priority strategy.')}
      icon={<Mail className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
      entityName={t('email_flows.entity_name', 'Mail Channel Priority')}
      entityNamePlural={t('email_flows.entity_name_plural', 'Mail Channel Priorities')}
      backUrl="/email-flows"
      onBack={() => navigate('/email-flows')}
      isSubmitting={updateMutation.isPending}
      formId={formId}
    >
      <EntityForm<MailChannelPriorityFormData>
        formId={formId}
        tabs={tabs}
        initialValues={flow}
        onSubmit={async (formData) => {
          const payload: MailChannelPriorityFormData = {
            ...formData,
            mailTemplateId: formData.mailTemplateId || undefined,
          };
          await updateMutation.mutateAsync({ id: id!, ...payload } as UpdateFlowInput);
        }}
        onCancel={() => navigate('/email-flows')}
        isSubmitting={updateMutation.isPending}
        validationSchema={mailChannelPrioritySchema}
        submitButtonText="Update Priority"
        showActions={false}
      />
    </StandardFormPage>
  );
};

export default EditMailChannelPriorityPage;
