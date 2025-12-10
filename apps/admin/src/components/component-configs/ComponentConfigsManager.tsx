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
import { Badge } from '../common/Badge';
import {
  FiBox,
  FiChevronDown,
  FiChevronRight,
  FiEdit2,
  FiEye,
  FiGrid,
  FiLayers,
  FiPlus,
  FiRefreshCw,
  FiSlash,
  FiTag,
  FiTrash2,
} from 'react-icons/fi';
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

  const stats = useMemo(
    () => ({
      total: flattened.length,
      disabled: flattened.filter(({ node }) => !node.isEnabled).length,
      composites: flattened.filter(({ node }) => node.componentType === ComponentStructureType.COMPOSITE).length,
      atomics: flattened.filter(({ node }) => node.componentType === ComponentStructureType.ATOMIC).length,
      categories: new Set(flattened.map(({ node }) => node.category)).size,
    }),
    [flattened],
  );

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
    const indent = depth * 20;

    return (
      <div key={node.id} className="relative">
        {depth > 0 && (
          <div
            className="absolute top-6 bottom-6 border-l border-dashed border-neutral-200"
            style={{ left: indent - 8 }}
          />
        )}
        <div
          className={`group relative overflow-hidden rounded-xl border border-neutral-200/80 bg-white/80 px-4 py-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
            activeComponentId === node.id ? 'ring-2 ring-primary-500/30 shadow-lg' : ''
          }`}
          style={{ marginLeft: indent }}
        >
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {hasChildren && (
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedNodes((prev) => ({
                        ...prev,
                        [node.id]: !isExpanded,
                      }))
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-600 transition hover:border-primary-200 hover:text-primary-700"
                    aria-label={isExpanded ? 'Collapse children' : 'Expand children'}
                  >
                    {isExpanded ? <FiChevronDown className="h-4 w-4" /> : <FiChevronRight className="h-4 w-4" />}
                  </button>
                )}
                <Badge variant="outline" size="sm" className="uppercase tracking-wide">
                  {node.componentType}
                </Badge>
                <Badge variant="secondary" size="sm">
                  {node.category}
                </Badge>
                <span className="text-xs text-neutral-500">Position {node.position ?? 'auto'}</span>
                {node.slotKey && (
                  <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
                    Slot {node.slotKey}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={node.isEnabled ? 'success' : 'destructive'} size="sm">
                  {node.isEnabled ? 'Live' : 'Hidden'}
                </Badge>
                <Toggle
                  checked={node.isEnabled}
                  onChange={(checked) => handleToggleEnabled(node, checked)}
                  label=""
                  size="sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => setActiveComponentId(node.id)}
                className="text-left text-lg font-semibold text-neutral-900 transition hover:text-primary-700"
              >
                {node.displayName}
              </button>
              <div className="text-xs font-mono text-neutral-500">{node.componentKey}</div>
              {node.description && <p className="text-sm text-neutral-600">{node.description}</p>}
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
              {node.allowedChildKeys?.length ? (
                <span className="rounded-full bg-neutral-100 px-3 py-1">{node.allowedChildKeys.length} allowed children</span>
              ) : (
                <span className="rounded-full bg-neutral-100 px-3 py-1">No child restrictions</span>
              )}
              {node.previewMediaUrl && (
                <span className="rounded-full bg-neutral-100 px-3 py-1">Preview attached</span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" onClick={() => setActiveComponentId(node.id)} startIcon={<FiEye className="h-4 w-4" />}>
                View
              </Button>
              <Button variant="ghost" size="sm" onClick={() => openEditModal(node)} startIcon={<FiEdit2 className="h-4 w-4" />}>
                Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={() => openCreateModal(node)} startIcon={<FiPlus className="h-4 w-4" />}>
                Add child
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleDelete(node)} startIcon={<FiTrash2 className="h-4 w-4" />}>
                Delete
              </Button>
            </div>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="space-y-2 pt-2">{node.children!.map((child) => renderComponentRow(child, depth + 1))}</div>
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
      <div className="mb-6 overflow-hidden rounded-2xl border border-primary-900/15 bg-gradient-to-r from-primary-950 via-primary-800 to-slate-900 text-white shadow-lg">
        <div className="flex flex-col gap-6 p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-primary-50/80">Component library</p>
              <h2 className="text-2xl font-semibold leading-tight">Design your storefront building blocks</h2>
              <p className="text-sm text-primary-50/80">Curate defaults, enforce slots, and keep nested structures healthy.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => listQuery.refetch()}
                isLoading={listQuery.isRefetching}
                startIcon={<FiRefreshCw className="h-4 w-4" />}
              >
                Refresh data
              </Button>
              <Button size="sm" onClick={() => openCreateModal()} startIcon={<FiPlus className="h-4 w-4" />}>
                New component
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 shadow-inner backdrop-blur">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.08em] text-primary-50/80">
                <span>Total</span>
                <FiBox className="h-4 w-4" />
              </div>
              <div className="mt-2 text-2xl font-semibold">{stats.total}</div>
              <p className="text-xs text-primary-100/80">Components across the tree</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 shadow-inner backdrop-blur">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.08em] text-primary-50/80">
                <span>Composite</span>
                <FiLayers className="h-4 w-4" />
              </div>
              <div className="mt-2 text-2xl font-semibold">{stats.composites}</div>
              <p className="text-xs text-primary-100/80">Containers orchestrating slots</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 shadow-inner backdrop-blur">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.08em] text-primary-50/80">
                <span>Atomic</span>
                <FiGrid className="h-4 w-4" />
              </div>
              <div className="mt-2 text-2xl font-semibold">{stats.atomics}</div>
              <p className="text-xs text-primary-100/80">Leaf-level building blocks</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 shadow-inner backdrop-blur">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.08em] text-primary-50/80">
                <span>Disabled</span>
                <FiSlash className="h-4 w-4" />
              </div>
              <div className="mt-2 text-2xl font-semibold">{stats.disabled}</div>
              <p className="text-xs text-primary-100/80">Hidden from selection</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 shadow-inner backdrop-blur">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.08em] text-primary-50/80">
                <span>Categories</span>
                <FiTag className="h-4 w-4" />
              </div>
              <div className="mt-2 text-2xl font-semibold">{stats.categories}</div>
              <p className="text-xs text-primary-100/80">Organised by purpose</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
        <div className="rounded-2xl border border-neutral-200/80 bg-white shadow-sm">
          <div className="border-b border-neutral-100 bg-neutral-50/70 px-5 py-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.08em] text-neutral-500">Library controls</p>
                <p className="text-sm text-neutral-600">Filter, search, and manage nesting rules</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => listQuery.refetch()}
                  isLoading={listQuery.isRefetching}
                >
                  Refresh
                </Button>
                <Button size="sm" onClick={() => openCreateModal()}>
                  Create component
                </Button>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <Input
                  placeholder="Search by name, key, or description"
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  className="shadow-inner"
                />
              </div>
              <Select
                value={filters.category}
                options={categoryFilterOptions}
                onChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}
                size="sm"
              />
              <Select
                value={filters.structure}
                options={typeFilterOptions}
                onChange={(value) => setFilters((prev) => ({ ...prev, structure: value }))}
                size="sm"
              />
              <div className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-inner">
                <div>
                  <div className="text-xs uppercase tracking-[0.08em] text-neutral-500">Status</div>
                  <div className="text-sm text-neutral-700">
                    {filters.showDisabled ? 'Including disabled' : 'Only enabled'}
                  </div>
                </div>
                <Toggle
                  checked={filters.showDisabled}
                  onChange={(checked) => setFilters((prev) => ({ ...prev, showDisabled: checked }))}
                  label=""
                  size="sm"
                />
              </div>
            </div>
          </div>

          <div className="p-5">
            {listQuery.isLoading ? (
              <div className="py-16 text-center text-neutral-500">Loading component configurations…</div>
            ) : filteredTree.length === 0 ? (
              <div className="py-16 text-center text-neutral-500">
                <div className="text-sm font-medium text-neutral-700">No components found</div>
                <p className="text-sm text-neutral-500">Adjust filters or create a new component to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">{filteredTree.map((node) => renderComponentRow(node))}</div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.08em] text-neutral-500">Selected component</p>
                <h3 className="text-xl font-semibold text-neutral-900">
                  {detailComponent ? detailComponent.displayName : 'Pick a component'}
                </h3>
                <p className="text-sm text-neutral-600">
                  {detailComponent?.description ?? 'Open a card on the left to inspect defaults and schema.'}
                </p>
              </div>
              {detailComponent && (
                <Badge variant={detailComponent.isEnabled ? 'success' : 'warning'} size="sm">
                  {detailComponent.isEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              )}
            </div>

            {detailComponent && (
              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                    <div className="text-xs uppercase tracking-[0.08em] text-neutral-500">Key</div>
                    <div className="font-mono text-sm text-neutral-800">{detailComponent.componentKey}</div>
                  </div>
                  <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                    <div className="text-xs uppercase tracking-[0.08em] text-neutral-500">Structure</div>
                    <div className="text-sm text-neutral-800 capitalize">{detailComponent.componentType}</div>
                  </div>
                  <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                    <div className="text-xs uppercase tracking-[0.08em] text-neutral-500">Category</div>
                    <div className="text-sm text-neutral-800 capitalize">{detailComponent.category}</div>
                  </div>
                  {detailComponent.slotKey && (
                    <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                      <div className="text-xs uppercase tracking-[0.08em] text-neutral-500">Slot</div>
                      <div className="text-sm text-neutral-800">{detailComponent.slotKey}</div>
                    </div>
                  )}
                  <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 md:col-span-2">
                    <div className="text-xs uppercase tracking-[0.08em] text-neutral-500">Allowed children</div>
                    {detailComponent.allowedChildKeys.length > 0 ? (
                      <div className="mt-1 flex flex-wrap gap-2">
                        {detailComponent.allowedChildKeys.map((key) => (
                          <span key={key} className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                            {key}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-neutral-500">No restrictions</div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.08em] text-neutral-500">Default config</div>
                    <pre className="mt-2 max-h-56 overflow-auto rounded-xl border border-neutral-200 bg-neutral-900 text-neutral-50 shadow-inner">
                      <code className="block whitespace-pre text-xs leading-relaxed px-4 py-3">
                        {JSON.stringify(detailComponent.defaultConfig, null, 2)}
                      </code>
                    </pre>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.08em] text-neutral-500">Config schema</div>
                    <pre className="mt-2 max-h-56 overflow-auto rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-800 shadow-inner">
                      <code className="block whitespace-pre text-xs leading-relaxed px-4 py-3">
                        {JSON.stringify(detailComponent.configSchema, null, 2)}
                      </code>
                    </pre>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.08em] text-neutral-500">Metadata</div>
                    <pre className="mt-2 max-h-48 overflow-auto rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-800 shadow-inner">
                      <code className="block whitespace-pre text-xs leading-relaxed px-4 py-3">
                        {JSON.stringify(detailComponent.metadata, null, 2)}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-gradient-to-r from-neutral-50 to-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-neutral-900">Usage hints</h3>
            <div className="mt-3 space-y-3 text-sm text-neutral-700">
              <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-inner">
                Component keys map directly to storefront UI building blocks (e.g., <code className="font-mono">product_card</code>).
              </div>
              <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-inner">
                Child definitions let merchandisers pick nested components per slot while keeping guardrails.
              </div>
              <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-inner">
                JSON config schema keeps admin forms in sync with engineering contracts.
              </div>
              <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-inner">
                Metadata can store component paths, analytics identifiers, or documentation links for the team.
              </div>
            </div>
          </div>
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
