import { useState } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormSubmitAction, FormSubmitOptions } from '../types/forms';

interface UseEntityFormProps<T extends FieldValues> {
  initialValues?: Partial<T>;
  onSubmit: (values: T, options?: FormSubmitOptions) => Promise<void | unknown>;
  validationSchema?: z.ZodSchema<T>;
  mode?: 'onBlur' | 'onChange' | 'onSubmit' | 'onTouched' | 'all';
  submitActionRef?: React.RefObject<FormSubmitAction>;
}

export function useEntityForm<T extends FieldValues = FieldValues>({
  initialValues,
  onSubmit,
  validationSchema,
  mode = 'onBlur',
  submitActionRef,
}: UseEntityFormProps<T>) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<T>({
    resolver: validationSchema ? zodResolver(validationSchema as any) : undefined,
    defaultValues: initialValues as any,
    mode,
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      const submitAction = submitActionRef?.current || 'save';
      await onSubmit(data as T, { submitAction });
    } finally {
      setIsSubmitting(false);
    }
  });

  return { form, handleSubmit, isSubmitting };
}
