import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiBox } from 'react-icons/fi';
import type { ApiResponse } from '@backend/trpc/schemas/response.schemas';
import { ComponentConfigForm, type ComponentConfigFormValues } from '../../../components/component-configs/ComponentConfigForm';
import { trpc } from '../../../utils/trpc';
import { useToast } from '../../../contexts/ToastContext';
import { useTranslationWithBackend } from '../../../hooks/useTranslationWithBackend';
import {
  collectDescendantIds,
  findComponentById,
  flattenComponents,
  type ComponentConfigNode,
} from '../../../components/component-configs/componentConfigTree';
import { Button } from '../../../components/common/Button';
import { useUrlTabs } from '../../../hooks/useUrlTabs';
import { CreatePageTemplate } from '../../../components/common/CreatePageTemplate';

const TAB_KEYS = ['structure', 'defaults', 'advanced', 'sidebar'];

type ComponentConfigResponse = ApiResponse<ComponentConfigNode>;
type ComponentConfigsApiResponse = ApiResponse<ComponentConfigNode[]>;

const ComponentConfigEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const componentId = id ?? '';
  const { addToast } = useToast();
  const { t } = useTranslationWithBackend();
  const navigate = useNavigate();

  if (!componentId) {
    navigate('/component-configs');
    return null;
  }

  const listQuery = trpc.adminComponentConfigs.list.useQuery<ComponentConfigsApiResponse>({
    parentId: null,
    includeChildren: true,
    onlyEnabled: false,
  });
  const componentQuery = trpc.adminComponentConfigs.byId.useQuery<ComponentConfigResponse>(
    { id: componentId },
    {
      enabled: Boolean(componentId),
    },
  );

  const updateMutation = trpc.adminComponentConfigs.update.useMutation();

  const componentTree = listQuery.data?.data ?? [];
  const flattenedComponents = useMemo(() => flattenComponents(componentTree), [componentTree]);
  const treeNode = useMemo(() => findComponentById(componentTree, componentId), [componentTree, componentId]);
  const disallowedParentIds = useMemo(
    () => (treeNode ? [treeNode.id, ...collectDescendantIds(treeNode)] : []),
    [treeNode],
  );
  const { activeTab, handleTabChange } = useUrlTabs({
    defaultTab: 0,
    tabParam: 'tab',
    tabKeys: TAB_KEYS,
  });

  const parentOptions = useMemo(
    () => [
      { value: '', label: t('componentConfigs.topLevelComponent') },
      ...flattenedComponents.map(({ node, depth }) => ({
        value: node.id,
        label: `${'— '.repeat(depth)}${node.displayName}`,
      })),
    ],
    [flattenedComponents, t],
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
      await updateMutation.mutateAsync({ id: componentId, data: values });
      addToast({
        title: t('componentConfigs.updateSuccess'),
        description: t('componentConfigs.updateSuccessDescription'),
        type: 'success',
      });
      navigate('/component-configs');
    } catch (error) {
      addToast({
        title: t('componentConfigs.updateFailed'),
        description: error instanceof Error ? error.message : t('common.genericError'),
        type: 'error',
      });
    }
  };

  const handleCancel = () => navigate('/component-configs');

  useEffect(() => {
    if (componentQuery.error) {
      addToast({
        title: t('componentConfigs.fetchFailed'),
        description: componentQuery.error.message || t('common.genericError'),
        type: 'error',
      });
    }
  }, [componentQuery.error, addToast, t]);

  useEffect(() => {
    if (listQuery.error) {
      addToast({
        title: t('componentConfigs.fetchFailed'),
        description: listQuery.error.message || t('common.genericError'),
        type: 'error',
      });
    }
  }, [listQuery.error, addToast, t]);

  const componentResponse = componentQuery.data as ComponentConfigResponse | undefined;
  const component = componentResponse?.data;
  const isSubmitting = updateMutation.isPending;
  const isLoading = componentQuery.isLoading || listQuery.isLoading;

  const templateProps = {
    title: t('componentConfigs.editTitle'),
    description: t('componentConfigs.editDescription'),
    icon: <FiBox className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
    entityName: t('componentConfigs.title'),
    entityNamePlural: t('componentConfigs.title'),
    backUrl: '/component-configs',
    onBack: handleCancel,
    maxWidth: 'full' as const,
  };

  if (isLoading) {
    return (
      <CreatePageTemplate {...templateProps} isSubmitting={false}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </CreatePageTemplate>
    );
  }

  if (componentQuery.error || listQuery.error) {
    const errorMessage = componentQuery.error?.message || listQuery.error?.message || t('common.genericError');
    return (
      <CreatePageTemplate {...templateProps} isSubmitting={false}>
        <div className="text-center text-red-600 dark:text-red-400">
          <p className="text-lg font-medium mb-2">
            {t('componentConfigs.fetchFailed')}
          </p>
          <p className="text-sm">
            {errorMessage}
          </p>
          <Button
            className="mt-4"
            onClick={() => {
              componentQuery.refetch();
              listQuery.refetch();
            }}
          >
            {t('common.retry')}
          </Button>
        </div>
      </CreatePageTemplate>
    );
  }

  if (!component) {
    return (
      <CreatePageTemplate {...templateProps} isSubmitting={false}>
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p className="text-lg font-medium mb-2">
            {t('componentConfigs.componentNotFound')}
          </p>
          <p className="text-sm">
            {t('componentConfigs.componentNotFoundDescription')}
          </p>
          <Button className="mt-4" onClick={handleCancel}>
            {t('componentConfigs.backToList')}
          </Button>
        </div>
      </CreatePageTemplate>
    );
  }

  return (
    <CreatePageTemplate
      {...templateProps}
      isSubmitting={isSubmitting}
    >
      <ComponentConfigForm
        key={componentId}
        mode="edit"
        initialValues={component}
        parentOptions={parentOptions}
        disallowedParentIds={disallowedParentIds}
        componentOptions={componentOptions}
        childComponents={treeNode?.children ?? []}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </CreatePageTemplate>
  );
};

export default ComponentConfigEditPage;
