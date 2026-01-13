import React, { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiBox } from 'react-icons/fi';
import { ComponentStructureType } from '@shared/enums/component.enums';
import type { ApiResponse } from '@backend/trpc/schemas/response.schemas';
import { ComponentConfigForm, type ComponentConfigFormValues } from '../../components/component-configs/ComponentConfigForm';
import { trpc } from '../../utils/trpc';
import { useToast } from '../../contexts/ToastContext';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { flattenComponents, type ComponentConfigNode } from '../../components/component-configs/componentConfigTree';
import { CreatePageTemplate } from '../../components/common/CreatePageTemplate';
import { useUrlTabs } from '../../hooks/useUrlTabs';

const TAB_KEYS = ['structure', 'defaults', 'advanced', 'sidebar'];

type ComponentConfigsApiResponse = ApiResponse<ComponentConfigNode[]>;

const ComponentConfigCreatePage: React.FC = () => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const parentIdFromQuery = searchParams.get('parentId') ?? '';
  const { activeTab, handleTabChange } = useUrlTabs({
    defaultTab: 0,
    tabParam: 'tab',
    tabKeys: TAB_KEYS,
  });

  const listQuery = trpc.adminComponentConfigs.list.useQuery<ComponentConfigsApiResponse>({
    parentId: null,
    includeChildren: true,
    onlyEnabled: false,
  });

  const createMutation = trpc.adminComponentConfigs.create.useMutation();

  const componentTree = listQuery.data?.data ?? [];
  const flattenedComponents = useMemo(() => flattenComponents(componentTree), [componentTree]);

  const parentOptions = useMemo(
    () => [
      { value: '', label: 'Top-level component' },
      ...flattenedComponents.map(({ node, depth }) => ({
        value: node.id,
        label: `${'— '.repeat(depth)}${node.displayName}`,
      })),
    ],
    [flattenedComponents],
  );

  const componentOptions = useMemo(
    () => flattenedComponents.map(({ node, depth }) => ({
      id: node.id,
      componentKey: node.componentKey,
      displayName: node.displayName,
      depth,
    })),
    [flattenedComponents],
  );

  const handleSubmit = async (values: ComponentConfigFormValues) => {
    try {
      await createMutation.mutateAsync(values);
      addToast({
        title: t('componentConfigs.createSuccess', 'Component created'),
        description: t('componentConfigs.createSuccessDescription', 'New component configuration saved successfully.'),
        type: 'success',
      });
      navigate('/component-configs');
    } catch (error) {
      addToast({
        title: t('componentConfigs.createFailed', 'Unable to create component'),
        description: error instanceof Error ? error.message : t('common.genericError', 'Please try again later.'),
        type: 'error',
      });
    }
  };

  const handleCancel = () => navigate('/component-configs');

  const initialValues = useMemo(
    () => ({
      parentId: parentIdFromQuery || undefined,
      componentType: parentIdFromQuery ? ComponentStructureType.ATOMIC : ComponentStructureType.COMPOSITE,
    }),
    [parentIdFromQuery],
  );

  return (
    <CreatePageTemplate
      title={t('componentConfigs.createTitle', 'Create component configuration')}
      description={t(
        'componentConfigs.createDescription',
        'Define storefront building blocks, schema, and defaults without modal constraints.',
      )}
      icon={<FiBox className="w-5 h-5 text-primary-600" />}
      entityName={t('componentConfigs.title', 'Component')}
      entityNamePlural={t('componentConfigs.title', 'Component Library')}
      backUrl="/component-configs"
      onBack={handleCancel}
      isSubmitting={createMutation.isPending}
      maxWidth="full"
    >
      <ComponentConfigForm
        key={initialValues.parentId ?? 'root'}
        mode="create"
        initialValues={initialValues}
        parentOptions={parentOptions}
        componentOptions={componentOptions}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createMutation.isPending}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </CreatePageTemplate>
  );
};

export default ComponentConfigCreatePage;
