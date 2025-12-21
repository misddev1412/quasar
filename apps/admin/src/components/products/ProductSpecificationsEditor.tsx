import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../common/Button';
import { FormInput } from '../common/FormInput';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { stripNumberLeadingZeros } from '../../utils/inputUtils';
import { SpecificationLabelSelect, SpecificationLabelOption } from './SpecificationLabelSelect';
import { Modal } from '../common/Modal';
import { trpc } from '../../utils/trpc';
import { useToast } from '../../context/ToastContext';
import { BASE_LABEL_CLASS } from '../common/styles';

export interface ProductSpecificationFormItem {
  id?: string;
  name: string;
  value: string;
  sortOrder?: number;
  labelId?: string | null;
  labelName?: string | null;
  labelGroupName?: string | null;
  labelGroupCode?: string | null;
  _tempId: string;
}

type SpecificationField =
  | 'name'
  | 'value'
  | 'sortOrder'
  | 'labelId'
  | 'labelName'
  | 'labelGroupName'
  | 'labelGroupCode';

interface ProductSpecificationsEditorProps {
  items: ProductSpecificationFormItem[];
  onAdd: () => void;
  onRemove: (tempId: string) => void;
  onChange: (tempId: string, field: SpecificationField, value: string) => void;
}

export const ProductSpecificationsEditor: React.FC<ProductSpecificationsEditorProps> = ({
  items,
  onAdd,
  onRemove,
  onChange,
}) => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  const [labelOptionsCache, setLabelOptionsCache] = useState<Record<string, SpecificationLabelOption>>({});
  const [isLabelModalOpen, setLabelModalOpen] = useState(false);
  const defaultGroupLabel = t('products.specification_default_group', 'General');

  const handleSortOrderChange = (tempId: string, value: string) => {
    onChange(tempId, 'sortOrder', value);
  };

  const handleLabelCacheUpdate = useCallback((options: SpecificationLabelOption[]) => {
    setLabelOptionsCache((prev) => {
      const next = { ...prev };
      let changed = false;

      options.forEach((option) => {
        if (!option?.value) {
          return;
        }
        const existing = next[option.value];
        if (
          !existing ||
          existing.label !== option.label ||
          existing.groupName !== option.groupName ||
          existing.groupCode !== option.groupCode
        ) {
          next[option.value] = option;
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, []);

  useEffect(() => {
    const derived: SpecificationLabelOption[] = items
      .filter((spec) => spec.labelId && (spec.labelName || spec.name))
      .map((spec) => ({
        value: spec.labelId as string,
        label: spec.labelName || spec.name,
        groupName: spec.labelGroupName || defaultGroupLabel,
        groupCode: spec.labelGroupCode || null,
      }));

    if (derived.length > 0) {
      handleLabelCacheUpdate(derived);
    }
  }, [items, defaultGroupLabel, handleLabelCacheUpdate]);

  const handleLabelSelect = (tempId: string, option: SpecificationLabelOption | null) => {
    if (!option) {
      onChange(tempId, 'labelId', '');
      onChange(tempId, 'labelName', '');
      onChange(tempId, 'labelGroupName', '');
      onChange(tempId, 'labelGroupCode', '');
      onChange(tempId, 'name', '');
      return;
    }

    const isDuplicateLabel = items.some(
      (item) => item._tempId !== tempId && item.labelId && item.labelId === option.value,
    );
    if (isDuplicateLabel) {
      addToast({
        type: 'warning',
        title: t('common.warning', 'Warning'),
        description: t('products.specification_label_duplicate_error', 'This specification label has already been added.'),
      });
      return;
    }

    onChange(tempId, 'labelId', option.value);
    onChange(tempId, 'labelName', option.label);
    onChange(tempId, 'labelGroupName', option.groupName || '');
    onChange(tempId, 'labelGroupCode', option.groupCode || '');
    onChange(tempId, 'name', option.label);
  };

  const hasSpecifications = items.length > 0;

  return (
    <div className="space-y-4">
      {hasSpecifications ? (
        <div className="space-y-4">
          {items.map((spec, index) => (
            <div
              key={spec._tempId}
              className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    {t('products.specification_number', 'Specification #{number}', { number: index + 1 })}
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {t('products.specification_help', 'Provide a clear label and value. Sort order controls display priority.')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(spec._tempId)}
                  startIcon={<Trash2 size={16} />}
                >
                  {t('common.remove', 'Remove')}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={BASE_LABEL_CLASS}>
                    {t('products.specification_label', 'Label')}
                  </label>
                  <SpecificationLabelSelect
                    value={spec.labelId ?? null}
                    labelName={spec.labelName ?? spec.name}
                    labelGroupName={spec.labelGroupName ?? null}
                    labelGroupCode={spec.labelGroupCode ?? null}
                    placeholder={t('products.specification_label_placeholder', 'Select specification label')}
                    cache={labelOptionsCache}
                    onCacheUpdate={handleLabelCacheUpdate}
                    onChange={(option) => handleLabelSelect(spec._tempId, option)}
                    onAddLabel={() => setLabelModalOpen(true)}
                    addLabelText={t('products.add_spec_label_option', 'Thêm thông số')}
                  />
                </div>
                <FormInput
                  id={`${spec._tempId}-sortOrder`}
                  label={t('products.sort_order', 'Sort Order')}
                  type="number"
                  placeholder="0"
                  value={spec.sortOrder?.toString() ?? ''}
                  onChange={(event) => {
                    const sanitizedValue = stripNumberLeadingZeros(event.target.value);
                    if (sanitizedValue !== event.target.value) {
                      event.target.value = sanitizedValue;
                    }
                    handleSortOrderChange(spec._tempId, sanitizedValue);
                  }}
                  min={0}
                />
              </div>

              <div className="mt-3">
                <FormInput
                  id={`${spec._tempId}-value`}
                  label={t('products.specification_value', 'Value')}
                  type="text"
                  placeholder={t('products.specification_value_placeholder', 'Describe the specification detail')}
                  value={spec.value}
                  onChange={(event) => onChange(spec._tempId, 'value', event.target.value)}
                  required
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/40 p-6 text-center space-y-3">
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            {t('products.specifications_empty_description', 'Add structured product information such as materials, dimensions, or technical details.')}
          </p>
          <Button
            variant="primary"
            size="sm"
            startIcon={<Plus size={16} />}
            onClick={onAdd}
            className="mx-auto"
          >
            {t('products.add_specification', 'Add Specification')}
          </Button>
        </div>
      )}

      <div className="pt-2 flex flex-wrap gap-3 justify-center">
        {hasSpecifications && (
          <Button
            variant="outline"
            size="sm"
            startIcon={<Plus size={16} />}
            onClick={onAdd}
          >
            {t('products.add_another_specification', 'Add Another Specification')}
          </Button>
        )}
      </div>

      <QuickAddSpecificationLabelModal
        isOpen={isLabelModalOpen}
        onClose={() => setLabelModalOpen(false)}
        onCreated={(option) => handleLabelCacheUpdate([option])}
      />
    </div>
  );
};

interface QuickAddSpecificationLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (option: SpecificationLabelOption) => void;
}

const QuickAddSpecificationLabelModal: React.FC<QuickAddSpecificationLabelModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  const createLabelMutation = trpc.adminProductSpecificationLabels.create.useMutation();
  const [label, setLabel] = useState('');
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const defaultGroupLabel = t('products.specification_default_group', 'General');

  const resetForm = () => {
    setLabel('');
    setGroupName('');
    setDescription('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    const trimmedLabel = label.trim();
    const trimmedGroup = groupName.trim();
    if (!trimmedLabel) {
      addToast({
        type: 'error',
        title: t('common.error', 'Error'),
        description: t('products.specification_label_required', 'Please provide a label.'),
      });
      return;
    }

    try {
      const response = await createLabelMutation.mutateAsync({
        label: trimmedLabel,
        groupName: trimmedGroup || undefined,
        description: description.trim() || undefined,
      });

      const created = (response as any)?.data;
      if (created?.id) {
        const option: SpecificationLabelOption = {
          value: created.id,
          label: created.label,
          groupName: created.groupName || trimmedGroup || defaultGroupLabel,
          groupCode: created.groupCode ?? null,
        };
        onCreated(option);
        addToast({
          type: 'success',
          title: t('common.success', 'Success'),
          description: t('products.specification_label_created', 'Specification label created successfully.'),
        });
        handleClose();
      }
    } catch (error) {
      console.error('Failed to create specification label', error);
      addToast({
        type: 'error',
        title: t('common.error', 'Error'),
        description: error instanceof Error ? error.message : t('products.specification_label_create_error', 'Unable to create specification label.'),
      });
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {t('products.quick_add_spec_label', 'Thêm thông số')}
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {t('products.quick_add_spec_label_help', 'Create reusable specification labels grouped by category.')}
          </p>
        </div>
        <FormInput
          id="spec-label-name"
          label={t('products.specification_label_name', 'Label')}
          type="text"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          required
        />
        <FormInput
          id="spec-label-group"
          label={t('products.specification_label_group_optional', 'Group (optional)')}
          type="text"
          value={groupName}
          onChange={(event) => setGroupName(event.target.value)}
        />
        <FormInput
          id="spec-label-description"
          label={t('products.specification_label_description', 'Description (optional)')}
          type="text"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={handleClose} type="button">
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            type="button"
            variant="primary"
            isLoading={createLabelMutation.isPending}
            onClick={() => handleSubmit()}
          >
            {t('common.save', 'Save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductSpecificationsEditor;
