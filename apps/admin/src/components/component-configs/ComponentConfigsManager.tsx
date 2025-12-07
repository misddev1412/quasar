import React, { useEffect, useMemo, useState } from 'react';
import { ComponentCategory, ComponentStructureType } from '@shared/enums/component.enums';
import { trpc } from '../../utils/trpc';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import { Toggle } from '../common/Toggle';
import { Modal } from '../common/Modal';
import { ComponentConfigForm, type ComponentConfigFormValues } from './ComponentConfigForm';
import { useToast } from '../../context/ToastContext';
import { Input } from '../common/Input';
import type { ApiResponse } from '@backend/trpc/schemas/response.schemas';

type ComponentConfigNode = {
  id: string;
  componentKey: string;
  displayName: string;
  description?: string | null;
  componentType: ComponentStructureType;
  category: ComponentCategory;
  position: number;
  isEnabled: boolean;
  defaultConfig: Record<string, unknown>;
  configSchema: Record<string, unknown>;
  metadata: Record<string, unknown>;
  allowedChildKeys: string[];
  previewMediaUrl?: string | null;
  parentId?: string | null;
  slotKey?: string | null;
  children?: ComponentConfigNode[];
  createdAt?: string;
  updatedAt?: string;
};

type FormState =
  | { mode: 'create'; parent?: ComponentConfigNode | null }
  | { mode: 'edit'; component: ComponentConfigNode };

type ComponentConfigsApiResponse = ApiResponse<ComponentConfigNode[]>;

const categoryFilterOptions = [
  { value: 'all', label: 'All categories' },
  ...Object.values(ComponentCategory).map((value) => ({
    value,
    label: value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  })),
];

const typeFilterOptions = [
  { value: 'all', label: 'All component types' },
  ...Object.values(ComponentStructureType).map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1),
  })),
];

const flattenComponents = (nodes: ComponentConfigNode[], depth = 0): Array<{ node: ComponentConfigNode; depth: number }> => {
  return nodes.flatMap((node) => [
    { node, depth },
    ...(node.children ? flattenComponents(node.children, depth + 1) : []),
  ]);
};

const collectDescendantIds = (node?: ComponentConfigNode): string[] => {
  if (!node?.children?.length) {
    return [];
  }
  return node.children.flatMap((child) => [child.id, ...collectDescendantIds(child)]);
};

const findComponentById = (nodes: ComponentConfigNode[], id?: string | null): ComponentConfigNode | null => {
  if (!id) return null;
  for (const node of nodes) {
    if (node.id === id) return node;
    const childMatch = node.children ? findComponentById(node.children, id) : null;
    if (childMatch) return childMatch;
  }
  return null;
};

interface ComponentConfigsManagerProps {
  className?: string;
}

export const ComponentConfigsManager: React.FC<ComponentConfigsManagerProps> = ({ className }) => {
  const { addToast } = useToast();
  const [filters, setFilters] = useState({
    category: 'all',
    structure: 'all',
    showDisabled: false,
    search: '',
  });
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [activeComponentId, setActiveComponentId] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState | null>(null);

  const queryInput = {
    parentId: null as string | null,
    includeChildren: true,
    category: filters.category !== 'all' ? (filters.category as ComponentCategory) : undefined,
    componentType: filters.structure !== 'all' ? (filters.structure as ComponentStructureType) : undefined,
    onlyEnabled: filters.showDisabled ? false : true,
  };

  const listQuery = trpc.adminComponentConfigs.list.useQuery<ComponentConfigsApiResponse>(queryInput);
  const createMutation = trpc.adminComponentConfigs.create.useMutation();
  const updateMutation = trpc.adminComponentConfigs.update.useMutation();
  const deleteMutation = trpc.adminComponentConfigs.delete.useMutation();

  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const components = listQuery.data?.data ?? [];

  const flattened = useMemo(() => flattenComponents(components), [components]);

  const filteredTree = useMemo(() => {
    if (!filters.search.trim()) {
      return components;
    }
    const keyword = filters.search.trim().toLowerCase();

    const filterNodes = (nodes: ComponentConfigNode[]): ComponentConfigNode[] => {
      const results: ComponentConfigNode[] = [];
      nodes.forEach((node) => {
        const matches =
          node.displayName.toLowerCase().includes(keyword) ||
          node.componentKey.toLowerCase().includes(keyword) ||
          (node.description ?? '').toLowerCase().includes(keyword);

        const childMatches = node.children ? filterNodes(node.children) : [];

        if (matches || childMatches.length > 0) {
          results.push({
            ...node,
            children: childMatches,
          });
        }
      });
      return results;
    };

    return filterNodes(components);
  }, [components, filters.search]);

  useEffect(() => {
    if (!activeComponentId && components.length > 0) {
      setActiveComponentId(components[0].id);
      return;
    }
    if (activeComponentId && components.length > 0) {
      const exists = findComponentById(components, activeComponentId);
      if (!exists) {
        setActiveComponentId(components[0]?.id ?? null);
      }
    }
  }, [components, activeComponentId]);

  const parentOptions = useMemo(() => {
    return [
      { value: '', label: 'Top-level component' },
      ...flattened.map(({ node, depth }) => ({
        value: node.id,
        label: `${'— '.repeat(depth)}${node.displayName}`,
      })),
    ];
  }, [flattened]);

  const openCreateModal = (parent?: ComponentConfigNode) => {
    setFormState({ mode: 'create', parent });
  };

  const openEditModal = (component: ComponentConfigNode) => {
    setFormState({ mode: 'edit', component });
  };

  const closeModal = () => {
    setFormState(null);
  };

  const handleSubmitForm = async (values: ComponentConfigFormValues) => {
    try {
      if (formState?.mode === 'edit') {
        await updateMutation.mutateAsync({ id: formState.component.id, data: values });
        addToast({ title: 'Component updated', description: `${formState.component.displayName} saved successfully.`, type: 'success' });
      } else {
        await createMutation.mutateAsync(values);
        addToast({ title: 'Component created', description: 'New component configuration available.', type: 'success' });
      }
      closeModal();
      listQuery.refetch();
    } catch (error) {
      addToast({
        title: 'Unable to save component',
        description: error instanceof Error ? error.message : 'Please try again later.',
        type: 'error',
      });
    }
  };

  const handleToggleEnabled = async (component: ComponentConfigNode, nextValue: boolean) => {
    try {
      await updateMutation.mutateAsync({ id: component.id, data: { isEnabled: nextValue } });
      listQuery.refetch();
      addToast({
        title: nextValue ? 'Component enabled' : 'Component disabled',
        description: component.displayName,
        type: 'success',
      });
    } catch (error) {
      addToast({
        title: 'Unable to update status',
        description: error instanceof Error ? error.message : 'Please try again later.',
        type: 'error',
      });
    }
  };

  const handleDelete = async (component: ComponentConfigNode) => {
    const confirmed = window.confirm(
      `Delete "${component.displayName}" and detach all of its children? This cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync({ id: component.id });
      addToast({ title: 'Component deleted', description: component.displayName, type: 'success' });
      if (activeComponentId === component.id) {
        setActiveComponentId(null);
      }
      listQuery.refetch();
    } catch (error) {
      addToast({
        title: 'Unable to delete component',
        description: error instanceof Error ? error.message : 'Please try again later.',
        type: 'error',
      });
    }
  };

  const renderComponentRow = (node: ComponentConfigNode, depth = 0) => {
    const hasChildren = (node.children?.length ?? 0) > 0;
    const isExpanded = expandedNodes[node.id] ?? true;
    return (
      <div key={node.id}>
        <div
          className={`group border rounded-xl p-4 mb-3 bg-white shadow-sm hover:shadow-md transition cursor-default ${
            activeComponentId === node.id ? 'ring-2 ring-primary-200' : ''
          }`}
          style={{ marginLeft: depth * 24 }}
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                {hasChildren && (
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedNodes((prev) => ({
                        ...prev,
                        [node.id]: !isExpanded,
                      }))
                    }
                    className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                  >
                    {isExpanded ? 'Collapse' : 'Expand'}
                  </button>
                )}
                <span className="text-sm uppercase tracking-wide text-neutral-400">
                  {node.componentType}
                </span>
                <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
                  {node.category}
                </span>
              </div>
              <div
                className="text-lg font-semibold text-neutral-900 hover:text-primary-700 cursor-pointer"
                onClick={() => setActiveComponentId(node.id)}
              >
                {node.displayName}
              </div>
              <div className="text-xs font-mono text-neutral-500">{node.componentKey}</div>
              {node.description && <p className="text-sm text-neutral-600">{node.description}</p>}
              <div className="flex flex-wrap items-center gap-3">
                {node.slotKey && (
                  <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                    Slot: {node.slotKey}
                  </span>
                )}
                <span className="text-xs text-neutral-500">Position {node.position}</span>
                <Toggle
                  checked={node.isEnabled}
                  onChange={(checked) => handleToggleEnabled(node, checked)}
                  label="Enabled"
                  size="sm"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 md:justify-end">
              <Button variant="ghost" size="sm" onClick={() => setActiveComponentId(node.id)}>
                View details
              </Button>
              <Button variant="ghost" size="sm" onClick={() => openEditModal(node)}>
                Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={() => openCreateModal(node)}>
                Add child
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleDelete(node)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="space-y-2">{node.children!.map((child) => renderComponentRow(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  const detailComponent = findComponentById(components, activeComponentId);

  const disallowedParentIds =
    formState?.mode === 'edit'
      ? [formState.component.id, ...collectDescendantIds(formState.component)]
      : [];

  return (
    <div className={className}>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          <Select
            value={filters.category}
            options={categoryFilterOptions}
            onChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}
          />
          <Select
            value={filters.structure}
            options={typeFilterOptions}
            onChange={(value) => setFilters((prev) => ({ ...prev, structure: value }))}
          />
          <Input
            placeholder="Search by name, key, or description"
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          />
          <Toggle
            checked={filters.showDisabled}
            onChange={(checked) => setFilters((prev) => ({ ...prev, showDisabled: checked }))}
            label="Include disabled components"
          />
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => listQuery.refetch()} isLoading={listQuery.isRefetching}>
            Refresh
          </Button>
          <Button onClick={() => openCreateModal()}>
            New component
          </Button>
        </div>
      </div>

      {listQuery.isLoading ? (
        <div className="py-20 text-center text-neutral-500">Loading component configurations…</div>
      ) : filteredTree.length === 0 ? (
        <div className="py-20 text-center text-neutral-500">
          No component configurations match your filters.
        </div>
      ) : (
        <div className="space-y-2">{filteredTree.map((node) => renderComponentRow(node))}</div>
      )}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Component details</h3>
          {detailComponent ? (
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-neutral-500">Key</div>
                <div className="font-mono text-sm">{detailComponent.componentKey}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-neutral-500">Structure</div>
                  <div className="text-sm">{detailComponent.componentType}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-neutral-500">Category</div>
                  <div className="text-sm">{detailComponent.category}</div>
                </div>
                {detailComponent.slotKey && (
                  <div>
                    <div className="text-sm font-medium text-neutral-500">Slot</div>
                    <div className="text-sm">{detailComponent.slotKey}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-neutral-500">Allowed child keys</div>
                  {detailComponent.allowedChildKeys.length > 0 ? (
                    <div className="text-sm text-neutral-700">
                      {detailComponent.allowedChildKeys.join(', ')}
                    </div>
                  ) : (
                    <div className="text-sm text-neutral-400">No restrictions</div>
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-neutral-500 mb-1">Default config</div>
                <pre className="bg-neutral-900 text-neutral-50 text-xs rounded-lg p-4 overflow-auto max-h-56">
                  {JSON.stringify(detailComponent.defaultConfig, null, 2)}
                </pre>
              </div>
              <div>
                <div className="text-sm font-medium text-neutral-500 mb-1">Metadata</div>
                <pre className="bg-neutral-50 text-neutral-800 text-xs rounded-lg p-4 overflow-auto max-h-56 border border-neutral-100">
                  {JSON.stringify(detailComponent.metadata, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-sm text-neutral-500">Select a component to inspect its configuration.</div>
          )}
        </div>
        <div className="rounded-xl border border-dashed border-neutral-300 p-6 bg-white">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Usage hints</h3>
          <ul className="space-y-3 text-sm text-neutral-600 list-disc list-inside">
            <li>Component keys map directly to storefront UI building blocks (e.g., `product_card`).</li>
            <li>Child definitions let merchandisers pick nested components per slot.</li>
            <li>JSON config schema is optional but recommended for dynamic admin forms.</li>
            <li>Metadata can store component paths, analytics identifiers, or documentation links.</li>
          </ul>
        </div>
      </div>

      <Modal isOpen={!!formState} onClose={closeModal} size="xl">
        {formState && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-neutral-900">
                {formState.mode === 'edit'
                  ? `Edit ${formState.component.displayName}`
                  : formState.parent
                    ? `Add child to ${formState.parent.displayName}`
                    : 'Create component'}
              </h3>
              <p className="text-sm text-neutral-500">
                {formState.mode === 'edit'
                  ? 'Update component definition and downstream slots.'
                  : 'Define component defaults, schema, and placement rules.'}
              </p>
            </div>
            <ComponentConfigForm
              mode={formState.mode}
              initialValues={
                formState.mode === 'edit'
                  ? formState.component
                  : { parentId: formState.parent?.id ?? undefined, componentType: formState.parent ? ComponentStructureType.ATOMIC : ComponentStructureType.COMPOSITE }
              }
              parentOptions={parentOptions}
              disallowedParentIds={disallowedParentIds}
              isSubmitting={isMutating}
              onSubmit={handleSubmitForm}
              onCancel={closeModal}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ComponentConfigsManager;
