import { z } from 'zod';
import { isPossiblePhoneNumber, isValidPhoneNumber } from 'react-phone-number-input';
import { UserRole } from '../types/user';
import i18n from '../i18n';

// Common validation schemas
export const commonValidation = {
  email: z.string().email(i18n.t('validation.email_invalid')),
  username: z.string()
    .min(3, i18n.t('validation.username_min_length'))
    .max(50, i18n.t('validation.username_max_length'))
    .regex(/^[a-zA-Z0-9_-]+$/, i18n.t('validation.username_invalid_chars')),
  password: z.string()
    .min(8, i18n.t('validation.password_min_length'))
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, i18n.t('validation.password_requirements')),
  firstName: z.string()
    .min(2, i18n.t('validation.first_name_min_length'))
    .max(50, i18n.t('validation.first_name_max_length')),
  lastName: z.string()
    .min(2, i18n.t('validation.last_name_min_length'))
    .max(50, i18n.t('validation.last_name_max_length')),
  phoneNumber: z.string()
    .refine((value) => {
      if (!value || value === '') return true; // Optional field
      // Use react-phone-number-input validation for better accuracy
      return isPossiblePhoneNumber(value);
    }, i18n.t('validation.phone_invalid'))
    .optional()
    .or(z.literal('')),
};

// User creation validation schema
export const createUserSchema = z.object({
  // General Information
  email: commonValidation.email,
  username: commonValidation.username,
  firstName: commonValidation.firstName,
  lastName: commonValidation.lastName,
  password: commonValidation.password,
  phoneNumber: commonValidation.phoneNumber,
  
  // User Settings
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
  
  // Preferences (can be extended)
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;

// Role validation schemas
export const createRoleSchema = z.object({
  name: z.string()
    .min(2, 'Role name must be at least 2 characters')
    .max(100, 'Role name must not exceed 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Role name can only contain letters, numbers, spaces, hyphens, and underscores'),
  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  permissionIds: z.string().optional(),
});

export const updateRoleSchema = z.object({
  name: z.string()
    .min(2, 'Role name must be at least 2 characters')
    .max(100, 'Role name must not exceed 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Role name can only contain letters, numbers, spaces, hyphens, and underscores')
    .optional(),
  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  permissionIds: z.string().optional(),
});

export type CreateRoleFormData = z.infer<typeof createRoleSchema>;
export type UpdateRoleFormData = z.infer<typeof updateRoleSchema>;

// Language validation schemas
export const createLanguageSchema = z.object({
  code: z.string()
    .min(2, 'Language code must be at least 2 characters')
    .max(10, 'Language code must not exceed 10 characters')
    .regex(/^[a-z]{2}(-[A-Z]{2})?$/, 'Language code must be in format: en, en-US, etc.'),
  name: z.string()
    .min(2, 'Language name must be at least 2 characters')
    .max(100, 'Language name must not exceed 100 characters'),
  nativeName: z.string()
    .min(2, 'Native name must be at least 2 characters')
    .max(100, 'Native name must not exceed 100 characters'),
  icon: z.string()
    .max(10, 'Icon must not exceed 10 characters')
    .optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  sortOrder: z.number()
    .min(0, 'Sort order must be a positive number')
    .max(9999, 'Sort order must not exceed 9999')
    .optional(),
});

export const updateLanguageSchema = z.object({
  code: z.string()
    .min(2, 'Language code must be at least 2 characters')
    .max(10, 'Language code must not exceed 10 characters')
    .regex(/^[a-z]{2}(-[A-Z]{2})?$/, 'Language code must be in format: en, en-US, etc.')
    .optional(),
  name: z.string()
    .min(2, 'Language name must be at least 2 characters')
    .max(100, 'Language name must not exceed 100 characters')
    .optional(),
  nativeName: z.string()
    .min(2, 'Native name must be at least 2 characters')
    .max(100, 'Native name must not exceed 100 characters')
    .optional(),
  icon: z.string()
    .max(10, 'Icon must not exceed 10 characters')
    .optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  sortOrder: z.number()
    .min(0, 'Sort order must be a positive number')
    .max(9999, 'Sort order must not exceed 9999')
    .optional(),
});

export type CreateLanguageFormData = z.infer<typeof createLanguageSchema>;
export type UpdateLanguageFormData = z.infer<typeof updateLanguageSchema>;

// Validation helper functions
export const validateField = (schema: z.ZodSchema, value: any): string | undefined => {
  try {
    schema.parse(value);
    return undefined;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message;
    }
    return 'Invalid value';
  }
};

export const validateForm = <T>(schema: z.ZodSchema<T>, values: any): { isValid: boolean; errors: Record<string, string> } => {
  try {
    schema.parse(values);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0] as string] = err.message;
        }
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: 'Validation failed' } };
  }
};

// User role options for select components
export const userRoleOptions = [
  { value: UserRole.USER, label: 'User' },
  { value: UserRole.MANAGER, label: 'Manager' },
  { value: UserRole.ADMIN, label: 'Admin' },
  { value: UserRole.SUPER_ADMIN, label: 'Super Admin' },
];

// Password strength checker
export const checkPasswordStrength = (password: string): { score: number; feedback: string[] } => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  else feedback.push('Use at least 8 characters');

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Include lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Include uppercase letters');

  if (/\d/.test(password)) score += 1;
  else feedback.push('Include numbers');

  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  else feedback.push('Include special characters');

  return { score, feedback };
};
