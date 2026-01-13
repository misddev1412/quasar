import { useState, useCallback, ChangeEvent } from 'react';

export interface FormField<T> {
  value: T;
  error?: string;
  touched: boolean;
}

export type FormFields<T> = {
  [K in keyof T]: FormField<T[K]>;
};

export interface FormStateOptions<T> {
  initialValues: T;
  validators?: {
    [K in keyof T]?: (value: T[K], allValues: T) => string | undefined;
  };
  onSubmit?: (values: T) => Promise<void> | void;
}

export interface UseFormStateReturn<T> {
  fields: FormFields<T>;
  values: T;
  errors: { [K in keyof T]?: string };
  touched: { [K in keyof T]?: boolean };
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  handleChange: (field: keyof T) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleChangeValue: (field: keyof T, value: any) => void;
  handleBlur: (field: keyof T) => () => void;
  setFieldError: (field: keyof T, error: string) => void;
  validateField: (field: keyof T) => boolean;
  validateForm: () => boolean;
  resetForm: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export function useFormState<T extends Record<string, any>>(options: FormStateOptions<T>): UseFormStateReturn<T> {
  const { initialValues, validators = {} as FormStateOptions<T>['validators'], onSubmit } = options;

  const createInitialFormFields = (): FormFields<T> => {
    const fields: Partial<FormFields<T>> = {};
    
    Object.keys(initialValues).forEach(key => {
      const fieldKey = key as keyof T;
      fields[fieldKey] = {
        value: initialValues[fieldKey],
        error: undefined,
        touched: false
      };
    });
    
    return fields as FormFields<T>;
  };

  const [fields, setFields] = useState<FormFields<T>>(createInitialFormFields());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const values = Object.keys(fields).reduce((acc, key) => {
    const fieldKey = key as keyof T;
    acc[fieldKey] = fields[fieldKey].value;
    return acc;
  }, {} as T);

  const errors = Object.keys(fields).reduce((acc, key) => {
    const fieldKey = key as keyof T;
    if (fields[fieldKey].error) {
      acc[fieldKey] = fields[fieldKey].error;
    }
    return acc;
  }, {} as { [K in keyof T]?: string });

  const touched = Object.keys(fields).reduce((acc, key) => {
    const fieldKey = key as keyof T;
    if (fields[fieldKey].touched) {
      acc[fieldKey] = true;
    }
    return acc;
  }, {} as { [K in keyof T]?: boolean });

  const isValid = !Object.values(fields).some(field => !!field.error);

  const isDirty = Object.keys(fields).some(key => {
    const fieldKey = key as keyof T;
    return fields[fieldKey].touched && fields[fieldKey].value !== initialValues[fieldKey];
  });

  const validateField = useCallback((field: keyof T): boolean => {
    const validator = validators?.[field];
    
    if (!validator) return true;
    
    const error = validator(values[field], values);
    
    setFields(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        error
      }
    }));
    
    return !error;
  }, [values, validators]);

  const validateForm = useCallback((): boolean => {
    let isValid = true;
    
    Object.keys(values).forEach(key => {
      const field = key as keyof T;
      const validator = validators?.[field];
      
      if (validator) {
        const error = validator(values[field], values);
        
        setFields(prev => ({
          ...prev,
          [field]: {
            ...prev[field],
            error
          }
        }));
        
        if (error) isValid = false;
      }
    });
    
    return isValid;
  }, [values, validators]);

  const handleChange = useCallback((field: keyof T) => (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : e.target.value;
      
    setFields(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        value,
        touched: true
      }
    }));
  }, []);

  const handleChangeValue = useCallback((field: keyof T, value: any) => {
    setFields(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        value,
        touched: true
      }
    }));
  }, []);

  const handleBlur = useCallback((field: keyof T) => () => {
    setFields(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        touched: true
      }
    }));
    
    validateField(field);
  }, [validateField]);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setFields(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        error
      }
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFields(createInitialFormFields());
  }, [initialValues]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isFormValid = validateForm();
    
    if (isFormValid && onSubmit) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [values, validateForm, onSubmit]);

  return {
    fields,
    values,
    errors,
    touched,
    isValid,
    isDirty,
    isSubmitting,
    handleChange,
    handleChangeValue,
    handleBlur,
    setFieldError,
    validateField,
    validateForm,
    resetForm,
    handleSubmit
  };
} 