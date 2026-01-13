import React, { useState, useEffect } from 'react';
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

interface EditAttributeModalProps {
  isOpen: boolean;
  attribute: any;
  onClose: () => void;
  onSuccess: () => void;
}

interface AttributeValue {
  id?: string;
  value: string;
  displayValue: string;
  sortOrder: number;
  isNew?: boolean;
  isDeleted?: boolean;
}

export const EditAttributeModal: React.FC<EditAttributeModalProps> = ({
  isOpen,
  attribute,
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
  const [initialValues, setInitialValues] = useState<AttributeValue[]>([]);
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({
    en: {},
    vi: {},
  });
  const [initialTranslations, setInitialTranslations] = useState<Record<string, Record<string, string>>>({});

  // Load attribute values
  const { data: valuesData } = trpc.adminProductAttributes.getAttributeValues.useQuery(
    { attributeId: attribute?.id },
    { enabled: !!attribute?.id }
  );

  // Load attribute translations
  const { data: translationsData } = trpc.adminProductAttributes.getAttributeTranslations.useQuery(
    { attributeId: attribute?.id },
    { enabled: !!attribute?.id }
  );

  const updateMutation = trpc.adminProductAttributes.update.useMutation({
    onSuccess: async () => {
      // Handle value changes
      await handleValueChanges();
      
      // Handle translation changes
      await handleTranslationChanges();
      
      addToast({
        title: t('attributes.updateSuccess', 'Attribute updated successfully'),
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

  const createValueMutation = trpc.adminProductAttributes.createAttributeValue.useMutation();
  const updateValueMutation = trpc.adminProductAttributes.updateAttributeValue.useMutation();
  const deleteValueMutation = trpc.adminProductAttributes.deleteAttributeValue.useMutation();
  const createTranslationMutation = trpc.adminProductAttributes.createAttributeTranslation.useMutation();
  const updateTranslationMutation = trpc.adminProductAttributes.updateAttributeTranslation.useMutation();
  const deleteTranslationMutation = trpc.adminProductAttributes.deleteAttributeTranslation.useMutation();

  useEffect(() => {
    if (attribute) {
      setFormData({
        name: attribute.name || '',
        displayName: attribute.displayName || '',
        type: attribute.type || 'TEXT',
        isRequired: attribute.isRequired || false,
        isFilterable: attribute.isFilterable || false,
        sortOrder: attribute.sortOrder || 0,
      });
    }
  }, [attribute]);

  useEffect(() => {
    if (valuesData && typeof valuesData === 'object' && 'data' in valuesData && valuesData.data && Array.isArray(valuesData.data)) {
      const values = valuesData.data.map((value: any) => ({
        id: value.id,
        value: value.value,
        displayValue: value.displayValue || '',
        sortOrder: value.sortOrder,
      }));
      setAttributeValues(values);
      setInitialValues(values);
    }
  }, [valuesData]);

  useEffect(() => {
    if (translationsData && typeof translationsData === 'object' && 'data' in translationsData && translationsData.data && Array.isArray(translationsData.data)) {
      const translationsByLocale: Record<string, Record<string, string>> = {
        en: {},
        vi: {},
      };
      
      translationsData.data.forEach((translation: any) => {
        translationsByLocale[translation.locale] = {
          displayName: translation.displayName || '',
        };
      });
      
      setTranslations(translationsByLocale);
      setInitialTranslations(JSON.parse(JSON.stringify(translationsByLocale)));
    }
  }, [translationsData]);

  const handleValueChanges = async () => {
    const isSelectType = formData.type === 'SELECT' || formData.type === 'MULTISELECT';
    
    if (!isSelectType) return;

    // Create new values
    const newValues = attributeValues.filter(v => v.isNew && !v.isDeleted);
    for (const value of newValues) {
      await createValueMutation.mutateAsync({
        attributeId: attribute.id,
        value: value.value,
        displayValue: value.displayValue || undefined,
        sortOrder: value.sortOrder,
      });
    }

    // Update existing values
    const updatedValues = attributeValues.filter(v => !v.isNew && !v.isDeleted && v.id);
    for (const value of updatedValues) {
      const original = initialValues.find(iv => iv.id === value.id);
      if (original && (
        original.value !== value.value ||
        original.displayValue !== value.displayValue ||
        original.sortOrder !== value.sortOrder
      )) {
        await updateValueMutation.mutateAsync({
          id: value.id!,
          value: value.value,
          displayValue: value.displayValue || undefined,
          sortOrder: value.sortOrder,
        });
      }
    }

    // Delete removed values
    const deletedValues = initialValues.filter(iv => 
      !attributeValues.find(av => av.id === iv.id)
    );
    for (const value of deletedValues) {
      if (value.id) {
        await deleteValueMutation.mutateAsync({ id: value.id });
      }
    }
  };

  const handleTranslationChanges = async () => {
    for (const [locale, translationData] of Object.entries(translations)) {
      const initialTranslation = initialTranslations[locale];
      const currentTranslation = translationData;

      // Check if translation exists and has content
      const hasInitialTranslation = initialTranslation && initialTranslation.displayName;
      const hasCurrentTranslation = currentTranslation && currentTranslation.displayName;

      if (!hasInitialTranslation && hasCurrentTranslation) {
        // Create new translation
        await createTranslationMutation.mutateAsync({
          attributeId: attribute.id,
          locale,
          displayName: currentTranslation.displayName,
        });
      } else if (hasInitialTranslation && hasCurrentTranslation) {
        // Update existing translation if changed
        if (initialTranslation.displayName !== currentTranslation.displayName) {
          await updateTranslationMutation.mutateAsync({
            attributeId: attribute.id,
            locale,
            displayName: currentTranslation.displayName,
          });
        }
      } else if (hasInitialTranslation && !hasCurrentTranslation) {
        // Delete translation if it was removed
        await deleteTranslationMutation.mutateAsync({
          attributeId: attribute.id,
          locale,
        });
      }
    }
  };

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

    updateMutation.mutate({
      id: attribute.id,
      ...formData,
    });
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
      isNew: true,
    }]);
  };

  const handleValueChange = (index: number, field: keyof AttributeValue, value: string) => {
    setAttributeValues(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleRemoveValue = (index: number) => {
    const value = attributeValues[index];
    if (value.isNew) {
      // Remove new values immediately
      setAttributeValues(prev => prev.filter((_, i) => i !== index));
    } else {
      // Mark existing values for deletion
      setAttributeValues(prev => prev.filter((_, i) => i !== index));
    }
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
  const isLoading = updateMutation.isPending || createValueMutation.isPending || 
                   updateValueMutation.isPending || deleteValueMutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between pr-8">
          <h2 className="text-xl font-semibold">
            {t('attributes.edit', 'Edit Attribute')}
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
              entityName={formData.name || t('attributes.edit', 'Edit Attribute')}
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
                    <div key={value.id || index} className="flex space-x-2">
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
              t('common.updating', 'Updating...')
            ) : (
              <>
                <FiSave className="h-4 w-4 mr-2" />
                {t('attributes.update', 'Update Attribute')}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};