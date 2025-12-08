import React from 'react';
import { CreateCustomerForm, CreateCustomerFormData } from './CreateCustomerForm';

export interface EditCustomerFormData extends CreateCustomerFormData {
  id: string;
}

interface EditCustomerFormProps {
  initialData: EditCustomerFormData;
  onSubmit: (data: EditCustomerFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const EditCustomerForm: React.FC<EditCustomerFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const handleSubmit = async (formData: CreateCustomerFormData) => {
    await onSubmit({ ...formData, id: initialData.id });
  };

  return (
    <CreateCustomerForm
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
    />
  );
};