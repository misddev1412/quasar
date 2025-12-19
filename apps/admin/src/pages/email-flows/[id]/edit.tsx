import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mail, Settings } from 'lucide-react';
import { CreatePageTemplate } from '../../../components/common/CreatePageTemplate';
import { EntityForm } from '../../../components/common/EntityForm';
import { FormTabConfig } from '../../../types/forms';
import { useToast } from '../../../context/ToastContext';
import { trpc } from '../../../utils/trpc';
import { z } from 'zod';
import { Loading } from '../../../components/common/Loading';

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

const EditMailChannelPriorityPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
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
      addToast({ title: 'Success', description: 'Mail channel priority updated successfully', type: 'success' });
      navigate('/email-flows');
    },
    onError: (error) => {
      addToast({ title: 'Error', description: error.message, type: 'error' });
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

  if (isLoading) {
    return <Loading />;
  }

  const flow = (flowData as any)?.data;

  return (
    <CreatePageTemplate
      title="Edit Mail Channel Priority"
      description="Update how this mail channel participates in your priority strategy."
      icon={<Mail className="w-5 h-5" />}
      entityName="Mail Channel Priority"
      entityNamePlural="Mail Channel Priorities"
      backUrl="/email-flows"
      onBack={() => navigate('/email-flows')}
      isSubmitting={updateMutation.isPending}
    >
      <EntityForm<MailChannelPriorityFormData>
        tabs={tabs}
        initialValues={flow as any}
        onSubmit={async (formData) => {
          const payload = {
            ...formData,
            mailTemplateId: formData.mailTemplateId || undefined,
          };
          await updateMutation.mutateAsync({ id: id!, ...payload } as any);
        }}
        onCancel={() => navigate('/email-flows')}
        isSubmitting={updateMutation.isPending}
        validationSchema={mailChannelPrioritySchema}
        submitButtonText="Update Priority"
      />
    </CreatePageTemplate>
  );
};

export default EditMailChannelPriorityPage;
