import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../common/Button';
import { FormInput } from '../common/FormInput';
import { TextareaInput } from '../common/TextareaInput';

export interface ProductSpecificationFormItem {
  id?: string;
  name: string;
  value: string;
  sortOrder?: number;
  _tempId: string;
}

interface ProductSpecificationsEditorProps {
  items: ProductSpecificationFormItem[];
  onAdd: () => void;
  onRemove: (tempId: string) => void;
  onChange: (tempId: string, field: 'name' | 'value' | 'sortOrder', value: string) => void;
}

export const ProductSpecificationsEditor: React.FC<ProductSpecificationsEditorProps> = ({
  items,
  onAdd,
  onRemove,
  onChange,
}) => {
  const handleSortOrderChange = (tempId: string, value: string) => {
    onChange(tempId, 'sortOrder', value);
  };

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/40 p-6 text-center space-y-3">
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Add structured product information such as materials, dimensions, or technical details.
          </p>
          <Button variant="primary" size="sm" startIcon={<Plus size={16} />} onClick={onAdd}>
            Add Specification
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((spec, index) => (
            <div
              key={spec._tempId}
              className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    Specification #{index + 1}
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Provide a clear label and value. Sort order controls display priority.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(spec._tempId)}
                  startIcon={<Trash2 size={16} />}
                >
                  Remove
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  id={`${spec._tempId}-name`}
                  label="Label"
                  type="text"
                  placeholder="e.g., Material"
                  value={spec.name}
                  onChange={(event) => onChange(spec._tempId, 'name', event.target.value)}
                  required
                />
                <FormInput
                  id={`${spec._tempId}-sortOrder`}
                  label="Sort Order"
                  type="number"
                  placeholder="0"
                  value={spec.sortOrder?.toString() ?? ''}
                  onChange={(event) => handleSortOrderChange(spec._tempId, event.target.value)}
                  min={0}
                />
              </div>

              <TextareaInput
                id={`${spec._tempId}-value`}
                label="Value"
                placeholder="Describe the specification detail"
                value={spec.value}
                onChange={(event) => onChange(spec._tempId, 'value', event.target.value)}
                rows={3}
                required
              />
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="pt-2">
          <Button variant="outline" size="sm" startIcon={<Plus size={16} />} onClick={onAdd}>
            Add Another Specification
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductSpecificationsEditor;
