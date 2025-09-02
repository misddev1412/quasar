import { useState } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface UseEntityFormProps<T extends FieldValues> {
  initialValues?: Partial<T>;
  onSubmit: (values: T) => Promise<void>;
  validationSchema?: z.ZodSchema<T>;
  mode?: 'onBlur' | 'onChange' | 'onSubmit' | 'onTouched' | 'all';
}

export function useEntityForm<T extends FieldValues = FieldValues>({
  initialValues,
  onSubmit,
  validationSchema,
  mode = 'onBlur',
}: UseEntityFormProps<T>) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<T>({
    resolver: validationSchema ? zodResolver(validationSchema as any) : undefined,
    defaultValues: initialValues as any,
    mode,
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    console.log('🔥 [useEntityForm] handleSubmit called with data:', data);
    console.log('🔥 [useEntityForm] Form state:', {
      errors: form.formState.errors,
      isValid: form.formState.isValid,
      isDirty: form.formState.isDirty,
      touchedFields: form.formState.touchedFields,
    });
    setIsSubmitting(true);
    try {
      await onSubmit(data as T);
    } finally {
      setIsSubmitting(false);
    }
  });

  return { form, handleSubmit, isSubmitting };
}

