import React, { useState } from 'react';
import { FiX, FiSave, FiPlus } from 'react-icons/fi';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Checkbox } from '../common/Checkbox';
import { Card } from '../common/Card';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { useToast } from '../../contexts/ToastContext';
import { TranslationTabs } from '../common/TranslationTabs';
import { trpc } from '../../utils/trpc';

interface CreateAttributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface AttributeValue {
  value: string;
  displayValue: string;
  sortOrder: number;
}

export const CreateAttributeModal: React.FC<CreateAttributeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    type: 'TEXT' as 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'SELECT' | 'MULTISELECT' | 'COLOR' | 'DATE',
    isRequired: false,
    isFilterable: false,
    sortOrder: 0,
  });
  
  const [attributeValues, setAttributeValues] = useState<AttributeValue[]>([]);
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({
    en: {},
    vi: {},
  });

  const createMutation = (trpc as any).adminProductAttributes?.create?.useMutation({
    onSuccess: async (result) => {
      const attributeId = result.data.id;
      
      // Create translations if any exist
      for (const [locale, translationData] of Object.entries(translations)) {
        if (translationData.displayName) {
          await createTranslationMutation.mutateAsync({
            attributeId,
            locale,
            displayName: translationData.displayName,
          });
        }
      }
      
      // If this is a select type attribute and we have values, create them
      if ((formData.type === 'SELECT' || formData.type === 'MULTISELECT') && attributeValues.length > 0) {
        // Create attribute values
        for (const value of attributeValues) {
          await createValueMutation.mutateAsync({
            attributeId,
            value: value.value,
            displayValue: value.displayValue || undefined,
            sortOrder: value.sortOrder,
          });
        }
      }
      
      addToast({
        title: t('attributes.createSuccess', 'Attribute created successfully'),
        type: 'success',
      });
      onSuccess();
    },
    onError: (error) => {
      addToast({
        title: t('common.error', 'Error'),
        description: error.message,
        type: 'error',
      });
    },
  });

  const createValueMutation = (trpc as any).adminProductAttributes?.createAttributeValue?.useMutation();
  const createTranslationMutation = trpc.adminProductAttributes.createAttributeTranslation.useMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      addToast({
        title: t('common.error', 'Error'),
        description: t('attributes.validation.nameRequired', 'Attribute name is required'),
        type: 'error',
      });
      return;
    }

    // For select types, validate that we have at least one value
    if ((formData.type === 'SELECT' || formData.type === 'MULTISELECT') && attributeValues.length === 0) {
      addToast({
        title: t('common.error', 'Error'),
        description: t('attributes.validation.valuesRequired', 'Select attributes must have at least one value'),
        type: 'error',
      });
      return;
    }

    createMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear values when changing away from select types
    if (field === 'type' && value !== 'SELECT' && value !== 'MULTISELECT') {
      setAttributeValues([]);
    }
  };

  const handleAddValue = () => {
    setAttributeValues(prev => [...prev, {
      value: '',
      displayValue: '',
      sortOrder: prev.length,
    }]);
  };

  const handleValueChange = (index: number, field: keyof AttributeValue, value: string) => {
    setAttributeValues(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleRemoveValue = (index: number) => {
    setAttributeValues(prev => prev.filter((_, i) => i !== index));
  };

  const attributeTypes = [
    { value: 'TEXT', label: t('attributes.types.text', 'Text') },
    { value: 'NUMBER', label: t('attributes.types.number', 'Number') },
    { value: 'BOOLEAN', label: t('attributes.types.boolean', 'Boolean') },
    { value: 'SELECT', label: t('attributes.types.select', 'Select') },
    { value: 'MULTISELECT', label: t('attributes.types.multiselect', 'Multi-select') },
    { value: 'COLOR', label: t('attributes.types.color', 'Color') },
    { value: 'DATE', label: t('attributes.types.date', 'Date') },
  ];

  const isSelectType = formData.type === 'SELECT' || formData.type === 'MULTISELECT';
  const isLoading = createMutation.isPending || createValueMutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between pr-8">
          <h2 className="text-xl font-semibold">
            {t('attributes.create', 'Create Attribute')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('attributes.name', 'Name')} *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={t('attributes.namePlaceholder', 'e.g., color, size, material')}
              required
            />
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('attributes.displayName', 'Display Name')}
            </label>
            <Input
              value={formData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              placeholder={t('attributes.displayNamePlaceholder', 'e.g., Product Color')}
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('attributes.type', 'Type')} *
            </label>
            <Select
              value={formData.type}
              onChange={(value) => handleInputChange('type', value)}
              options={attributeTypes}
            />
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('attributes.sortOrder', 'Sort Order')}
            </label>
            <Input
              type="number"
              value={formData.sortOrder}
              onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
              min="0"
            />
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={formData.isRequired}
              onCheckedChange={(checked) => handleInputChange('isRequired', checked)}
            />
            <label className="text-sm">{t('attributes.isRequired', 'Required')}</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={formData.isFilterable}
              onCheckedChange={(checked) => handleInputChange('isFilterable', checked)}
            />
            <label className="text-sm">{t('attributes.isFilterable', 'Filterable')}</label>
          </div>
        </div>

        {/* Translations */}
        <div className="space-y-4">
          <div className="border-t pt-4">
            <h3 className="text-md font-medium mb-4">
              {t('attributes.translations', 'Translations')}
            </h3>
            <TranslationTabs
              translations={translations}
              onTranslationsChange={setTranslations}
              entityName={formData.name || t('attributes.create', 'Create Attribute')}
              fields={[
                {
                  name: 'displayName',
                  label: t('attributes.displayName', 'Display Name'),
                  value: translations.en?.displayName || '',
                  onChange: () => {}, // Handled by TranslationTabs
                  type: 'text',
                  placeholder: t('attributes.displayNamePlaceholder', 'e.g., Product Color'),
                },
              ]}
            />
          </div>
        </div>

        {/* Attribute Values (for select types) */}
        {isSelectType && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                {t('attributes.values', 'Attribute Values')} *
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddValue}
              >
                <FiPlus className="h-4 w-4 mr-2" />
                {t('attributes.addValue', 'Add Value')}
              </Button>
            </div>

            <Card className="p-4">
              {attributeValues.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  {t('attributes.noValues', 'No values added yet. Click "Add Value" to get started.')}
                </p>
              ) : (
                <div className="space-y-3">
                  {attributeValues.map((value, index) => (
                    <div key={index} className="flex space-x-2">
                      <Input
                        placeholder={t('attributes.valuePlaceholder', 'Value')}
                        value={value.value}
                        onChange={(e) => handleValueChange(index, 'value', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder={t('attributes.displayValuePlaceholder', 'Display Value (optional)')}
                        value={value.displayValue}
                        onChange={(e) => handleValueChange(index, 'displayValue', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveValue(index)}
                      >
                        <FiX className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              t('common.creating', 'Creating...')
            ) : (
              <>
                <FiSave className="h-4 w-4 mr-2" />
                {t('attributes.create', 'Create Attribute')}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};