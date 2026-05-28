import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiBox } from 'react-icons/fi';
import type { ApiResponse } from '@backend/trpc/schemas/response.schemas';
import {
  collectDescendantIds,
  ComponentConfigForm,
  ComponentConfigVisualBuilder,
  flattenComponents,
} from '@admin/components/component-configs';
import type {
  ComponentConfigFormValues,
  ComponentConfigNode,
  ComponentConfigVisualBuilderSubmitPayload,
} from '@admin/components/component-configs';
import { trpc } from '@admin/utils/trpc';
import { useToast } from '@admin/contexts/ToastContext';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import {
  findComponentById,
} from '@admin/components/component-configs';
import { Button, StandardFormPage } from '@admin/components/common';

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
  const childReorderMutation = trpc.adminComponentConfigs.update.useMutation();

  const componentTree = listQuery.data?.data ?? [];
  const treeNode = useMemo(() => findComponentById(componentTree, componentId), [componentTree, componentId]);
  const flattenedComponents = useMemo(() => flattenComponents(componentTree), [componentTree]);
  const disallowedParentIds = useMemo(
    () => [componentId, ...collectDescendantIds(treeNode ?? undefined)],
    [componentId, treeNode],
  );
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

  const handleVisualBuilderSubmit = async (payload: ComponentConfigVisualBuilderSubmitPayload) => {
    try {
      await updateMutation.mutateAsync({
        id: componentId,
        data: {
          defaultConfig: payload.defaultConfig,
        },
      });

      const currentChildren = treeNode?.children ?? [];
      if (currentChildren.length > 0) {
        const childById = new Map(currentChildren.map((child) => [child.id, child]));
        const positions = currentChildren.map((child) => child.position).sort((a, b) => a - b);
        const nextOrder = payload.childOrder.filter((childId) => childById.has(childId));
        const failedChildren: string[] = [];

        for (let index = 0; index < nextOrder.length; index += 1) {
          const childId = nextOrder[index];
          const child = childById.get(childId);
          if (!child) {
            continue;
          }

          const nextPosition = positions[index] ?? index;
          if (child.position === nextPosition) {
            continue;
          }

          try {
            await childReorderMutation.mutateAsync({
              id: child.id,
              data: {
                position: nextPosition,
              },
            });
          } catch (_error) {
            failedChildren.push(child.displayName || child.componentKey || child.id);
          }
        }

        if (failedChildren.length > 0) {
          addToast({
            title: t('componentConfigs.partialUpdateFailed', 'Saved with reorder issues'),
            description: t(
              'componentConfigs.partialUpdateFailedDescription',
              `Default config was saved, but ${failedChildren.length} child component(s) could not be reordered. Please retry.`,
            ),
            type: 'error',
          });
          return;
        }
      }

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

  const handleFormSubmit = async (values: ComponentConfigFormValues) => {
    try {
      await updateMutation.mutateAsync({
        id: componentId,
        data: values,
      });

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
  const isSubmitting = updateMutation.isPending || childReorderMutation.isPending;
  const isLoading = componentQuery.isLoading || listQuery.isLoading;
  const isProductsByCategory = component?.componentKey === 'products_by_category';

  const formId = 'component-config-edit-form';

  const templateProps = {
    title: t('componentConfigs.editTitle'),
    description: t('componentConfigs.editDescription'),
    icon: <FiBox className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
    entityName: t('componentConfigs.title'),
    entityNamePlural: t('componentConfigs.title'),
    backUrl: '/component-configs',
    onBack: handleCancel,
    maxWidth: 'full' as const,
    mode: 'update' as const,
  };

  if (isLoading) {
    return (
      <StandardFormPage {...templateProps} isSubmitting={false} showActions={false}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </StandardFormPage>
    );
  }

  if (componentQuery.error || listQuery.error) {
    const errorMessage = componentQuery.error?.message || listQuery.error?.message || t('common.genericError');
    return (
      <StandardFormPage {...templateProps} isSubmitting={false} showActions={false}>
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
      </StandardFormPage>
    );
  }

  if (!component) {
    return (
      <StandardFormPage {...templateProps} isSubmitting={false} showActions={false}>
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
      </StandardFormPage>
    );
  }

  return (
    <StandardFormPage
      {...templateProps}
      isSubmitting={isSubmitting}
      formId={formId}
    >
      {isProductsByCategory ? (
        <ComponentConfigForm
          key={componentId}
          mode="edit"
          initialValues={component}
          parentOptions={parentOptions}
          disallowedParentIds={disallowedParentIds}
          componentOptions={componentOptions}
          childComponents={treeNode?.children ?? []}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          showActions={false}
          formId={formId}
        />
      ) : (
        <ComponentConfigVisualBuilder
          key={componentId}
          component={component}
          childComponents={treeNode?.children ?? []}
          onSave={handleVisualBuilderSubmit}
          isSubmitting={isSubmitting}
          formId={formId}
        />
      )}
    </StandardFormPage>
  );
};

export default ComponentConfigEditPage;
