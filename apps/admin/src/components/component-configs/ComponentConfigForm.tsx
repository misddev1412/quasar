import React, { useMemo, useState } from 'react';
import { ComponentCategory, ComponentStructureType } from '@shared/enums/component.enums';
import { Input } from '../common/Input';
import { Select, type SelectOption } from '../common/Select';
import { Textarea } from '../common/Textarea';
import { Toggle } from '../common/Toggle';
import { Button } from '../common/Button';

export interface ComponentConfigFormValues {
  componentKey: string;
  displayName: string;
  description?: string | null;
  componentType: ComponentStructureType;
  category: ComponentCategory;
  position?: number;
  isEnabled: boolean;
  defaultConfig: Record<string, unknown>;
  configSchema: Record<string, unknown>;
  metadata: Record<string, unknown>;
  allowedChildKeys: string[];
  previewMediaUrl?: string | null;
  parentId?: string | null;
  slotKey?: string | null;
}

interface ComponentConfigFormProps {
  initialValues?: Partial<ComponentConfigFormValues>;
  mode: 'create' | 'edit';
  isSubmitting?: boolean;
  parentOptions: SelectOption[];
  disallowedParentIds?: string[];
  onSubmit: (values: ComponentConfigFormValues) => void;
  onCancel: () => void;
}

const categoryOptions = Object.values(ComponentCategory).map((value) => ({
  value,
  label: value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
}));

const structureOptions = Object.values(ComponentStructureType).map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

type JsonErrorState = Partial<Record<'defaultConfig' | 'configSchema' | 'metadata', string>>;

export const ComponentConfigForm: React.FC<ComponentConfigFormProps> = ({
  initialValues,
  mode,
  isSubmitting = false,
  parentOptions,
  disallowedParentIds = [],
  onSubmit,
  onCancel,
}) => {
  const [formState, setFormState] = useState(() => ({
    componentKey: initialValues?.componentKey ?? '',
    displayName: initialValues?.displayName ?? '',
    description: initialValues?.description ?? '',
    componentType: initialValues?.componentType ?? ComponentStructureType.COMPOSITE,
    category: initialValues?.category ?? ComponentCategory.PRODUCT,
    position: initialValues?.position != null ? String(initialValues.position) : '',
    isEnabled: initialValues?.isEnabled ?? true,
    parentId: initialValues?.parentId ?? '',
    slotKey: initialValues?.slotKey ?? '',
    previewMediaUrl: initialValues?.previewMediaUrl ?? '',
    allowedChildKeys: (initialValues?.allowedChildKeys ?? []).join('\n'),
    defaultConfig: JSON.stringify(initialValues?.defaultConfig ?? {}, null, 2),
    configSchema: JSON.stringify(initialValues?.configSchema ?? {}, null, 2),
    metadata: JSON.stringify(initialValues?.metadata ?? {}, null, 2),
  }));

  const [jsonErrors, setJsonErrors] = useState<JsonErrorState>({});

  const parentSelectOptions = useMemo(() => {
    return parentOptions.map((option) => ({
      ...option,
      disabled: option.disabled || (option.value && disallowedParentIds.includes(option.value)),
    }));
  }, [parentOptions, disallowedParentIds]);

  const updateField = (field: keyof typeof formState, value: string | boolean) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setJsonErrors({});

    if (!formState.componentKey.trim()) {
      setJsonErrors((prev) => ({ ...prev, metadata: 'Component key is required.' }));
      return;
    }

    let parsedDefault: Record<string, unknown> = {};
    let parsedSchema: Record<string, unknown> = {};
    let parsedMetadata: Record<string, unknown> = {};

    try {
      parsedDefault = formState.defaultConfig.trim()
        ? JSON.parse(formState.defaultConfig)
        : {};
    } catch (error) {
      setJsonErrors({ defaultConfig: (error as Error)?.message || 'Invalid JSON' });
      return;
    }

    try {
      parsedSchema = formState.configSchema.trim()
        ? JSON.parse(formState.configSchema)
        : {};
    } catch (error) {
      setJsonErrors({ configSchema: (error as Error)?.message || 'Invalid JSON' });
      return;
    }

    try {
      parsedMetadata = formState.metadata.trim()
        ? JSON.parse(formState.metadata)
        : {};
    } catch (error) {
      setJsonErrors({ metadata: (error as Error)?.message || 'Invalid JSON' });
      return;
    }

    const allowedChildKeys = formState.allowedChildKeys
      .split('\n')
      .map((key) => key.trim())
      .filter(Boolean);

    const payload: ComponentConfigFormValues = {
      componentKey: formState.componentKey.trim(),
      displayName: formState.displayName.trim(),
      description: formState.description?.trim() || undefined,
      componentType: formState.componentType,
      category: formState.category,
      position: formState.position ? Number(formState.position) : undefined,
      isEnabled: formState.isEnabled,
      parentId: formState.parentId ? formState.parentId : undefined,
      slotKey: formState.slotKey?.trim() || undefined,
      previewMediaUrl: formState.previewMediaUrl?.trim() || undefined,
      defaultConfig: parsedDefault,
      configSchema: parsedSchema,
      metadata: parsedMetadata,
      allowedChildKeys,
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">Component Key</label>
          <Input
            value={formState.componentKey}
            onChange={(e) => updateField('componentKey', e.target.value)}
            required
            placeholder="product_card"
          />
          <p className="text-xs text-neutral-500">Unique identifier used by storefront code.</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">Display Name</label>
          <Input
            value={formState.displayName}
            onChange={(e) => updateField('displayName', e.target.value)}
            required
            placeholder="Product Card"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">Component Type</label>
          <Select
            value={formState.componentType}
            onChange={(value) => updateField('componentType', value as ComponentStructureType)}
            options={structureOptions}
            placeholder="Select type"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">Category</label>
          <Select
            value={formState.category}
            onChange={(value) => updateField('category', value as ComponentCategory)}
            options={categoryOptions}
            placeholder="Select category"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">Parent Component</label>
          <Select
            value={formState.parentId}
            onChange={(value) => updateField('parentId', value)}
            options={parentSelectOptions}
            placeholder="Top-level component"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">Slot Key</label>
          <Input
            value={formState.slotKey}
            onChange={(e) => updateField('slotKey', e.target.value)}
            placeholder="media / content / actions"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">Preview Media URL</label>
          <Input
            value={formState.previewMediaUrl}
            onChange={(e) => updateField('previewMediaUrl', e.target.value)}
            placeholder="https://example.com/screenshot.png"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">Position</label>
          <Input
            type="number"
            value={formState.position}
            onChange={(e) => updateField('position', e.target.value)}
            placeholder="Auto"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-neutral-700">Description</label>
          <Textarea
            value={formState.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={3}
            placeholder="Explain where this component is rendered and how it is used."
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-neutral-700">Allowed Child Keys</label>
          <Textarea
            value={formState.allowedChildKeys}
            onChange={(e) => updateField('allowedChildKeys', e.target.value)}
            rows={3}
            placeholder="child_key.one&#10;child_key.two"
          />
          <p className="text-xs text-neutral-500">One component key per line. Determines which sub-components can attach here.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Textarea
          label="Default Config (JSON)"
          value={formState.defaultConfig}
          onChange={(e) => updateField('defaultConfig', e.target.value)}
          rows={8}
          error={jsonErrors.defaultConfig}
        />
        <Textarea
          label="Config Schema (JSON)"
          value={formState.configSchema}
          onChange={(e) => updateField('configSchema', e.target.value)}
          rows={8}
          error={jsonErrors.configSchema}
        />
        <Textarea
          label="Metadata (JSON)"
          value={formState.metadata}
          onChange={(e) => updateField('metadata', e.target.value)}
          rows={6}
          error={jsonErrors.metadata}
          className="md:col-span-2"
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Toggle
          checked={formState.isEnabled}
          onChange={(checked) => updateField('isEnabled', checked)}
          label="Component Enabled"
          description="Disabled components stay in the library but are hidden from selection."
        />
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {mode === 'create' ? 'Create Component' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ComponentConfigForm;
