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

const EditEmailFlowPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [providerOptions, setProviderOptions] = useState<Array<{ value: string; label: string }>>([]);

  const { data: flowData, isLoading } = trpc.adminEmailFlow.getFlowById.useQuery({ id: id! }, { enabled: !!id });
  const { data: providersData } = trpc.adminMailProvider.getActiveProviders.useQuery();
  const updateMutation = trpc.adminEmailFlow.updateFlow.useMutation({
    onSuccess: () => {
      addToast({ title: 'Success', description: 'Email flow updated successfully', type: 'success' });
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

  const tabs: FormTabConfig[] = [
    {
      id: 'general',
      label: 'General Settings',
      icon: <Settings className="w-4 h-4" />,
      sections: [
        {
          title: 'Basic Information',
          fields: [
            {
              name: 'name',
              label: 'Flow Name',
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
              label: 'Mail Provider',
              type: 'select',
              required: true,
              options: providerOptions,
              description: 'Select an active mail provider',
            },
            {
              name: 'isActive',
              label: 'Active',
              type: 'checkbox',
            },
            {
              name: 'priority',
              label: 'Priority',
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
      title="Edit Email Flow"
      description="Update email flow configuration"
      icon={<Mail className="w-5 h-5" />}
      entityName="Email Flow"
      entityNamePlural="Email Flows"
      backUrl="/email-flows"
      onBack={() => navigate('/email-flows')}
      isSubmitting={updateMutation.isPending}
    >
      <EntityForm<EmailFlowFormData>
        tabs={tabs}
        initialValues={flow as any}
        onSubmit={async (formData) => {
          await updateMutation.mutateAsync({ id: id!, ...formData } as any);
        }}
        onCancel={() => navigate('/email-flows')}
        isSubmitting={updateMutation.isPending}
        validationSchema={emailFlowSchema}
        submitButtonText="Update Flow"
      />
    </CreatePageTemplate>
  );
};

export default EditEmailFlowPage;

