import { z } from 'zod';
import { isPossiblePhoneNumber, isValidPhoneNumber } from 'react-phone-number-input';
import { UserRole } from '../types/user';

// Common validation schemas
export const commonValidation = {
  email: z.string().email('Please enter a valid email address'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters'),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters'),
  phoneNumber: z.string()
    .refine((value) => {
      if (!value || value === '') return true; // Optional field
      // Use react-phone-number-input validation for better accuracy
      return isPossiblePhoneNumber(value);
    }, 'Please enter a valid phone number')
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
