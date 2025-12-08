import { FieldPath, FieldValues, UseFormSetValue, UseFormTrigger } from 'react-hook-form';
import { generateSecurePassword } from '../utils/password';

export interface UsePasswordGenerationOptions<T extends FieldValues> {
  newPasswordFieldName?: FieldPath<T> | 'newPassword';
  confirmPasswordFieldName?: FieldPath<T> | 'confirmPassword';
}

export function usePasswordGeneration<T extends FieldValues = FieldValues>(
  setValue: UseFormSetValue<T>,
  trigger: UseFormTrigger<T>,
  options?: UsePasswordGenerationOptions<T>,
) {
  const newField = (options?.newPasswordFieldName || 'newPassword') as FieldPath<T>;
  const confirmField = (options?.confirmPasswordFieldName || 'confirmPassword') as FieldPath<T>;

  const generateAndApply = (targetField?: FieldPath<T>, length = 14) => {
    const generated = generateSecurePassword(length);
    const theTarget = (targetField || newField) as FieldPath<T>;

    setValue(theTarget, generated as any, { shouldDirty: true, shouldTouch: true, shouldValidate: true });

    // If generating for new password, also sync confirm
    if (theTarget === newField) {
      setValue(confirmField, generated as any, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
      trigger(confirmField);
    }
    trigger(theTarget);
  };

  return { generateAndApply };
}

