import { ReactNode } from 'react';
import { MediaType } from '../components/common/ProductMediaUpload';
import { FieldValues } from 'react-hook-form';

// Generic form field configuration
export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'password-simple' | 'select' | 'multiselect' | 'textarea' | 'checkbox' | 'tel' | 'phone' | 'number' | 'richtext' | 'role-multiselect' | 'category-multiselect' | 'custom' | 'tags' | 'file-types' | 'media-upload' | 'image-gallery' | 'product-media' | 'slug' | 'date';
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
  icon?: ReactNode;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | undefined;
  };
  // Number input specific options (also used for date fields as string)
  min?: number | string;
  max?: number | string;
  step?: number;
  size?: 'sm' | 'md' | 'lg';
  rows?: number; // for textarea
  minHeight?: string; // for richtext editor
  disabled?: boolean;
  description?: string;
  defaultCountry?: string; // for phone input
  dependsOn?: { field: string; value: any }; // for conditional fields
  component?: ReactNode; // for custom components
  onValueChange?: (value: unknown) => void; // callback when field value changes
  // Media upload specific options
  accept?: string; // file types to accept
  maxSize?: number; // max file size in MB
  multiple?: boolean; // allow multiple files
  // Image gallery specific options
  maxImages?: number; // maximum number of images for gallery
  // Product media specific options
  maxItems?: number; // maximum number of media items
  allowedTypes?: MediaType[]; // allowed media types
  // Slug field specific options
  sourceField?: string; // field name to generate slug from
  // Category multiselect specific options
  categorySource?: 'product' | 'post';
}

// Form section configuration
export interface FormSectionConfig {
  title: string;
  description?: string;
  fields: FormFieldConfig[];
  icon?: ReactNode;
  customContent?: ReactNode;
  dependsOn?: { field: string; value: any }; // for conditional sections
}

// Tab configuration for tabbed forms
export interface FormTabConfig {
  id: string;
  label: string;
  icon?: ReactNode;
  sections?: FormSectionConfig[];
  customContent?: ReactNode;
}

export type FormActionsAlignment = 'start' | 'center' | 'end' | 'middle';

// Generic entity form props
export interface EntityFormProps<T extends FieldValues = FieldValues> {
  tabs: FormTabConfig[];
  initialValues?: Partial<T>;
  onSubmit: (values: T) => Promise<void>;
  isSubmitting?: boolean;
  customActions?: ReactNode;
  submitButtonText?: string;
  cancelButtonText?: string;
  onCancel?: () => void;
  className?: string;
  showCancelButton?: boolean;
  // Optional external tab control (for URL persistence)
  activeTab?: number;
  onTabChange?: (index: number) => void;
  actionsAlignment?: FormActionsAlignment;
}

// Form validation result
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Form state for complex forms
export interface FormState<T extends FieldValues = FieldValues> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isDirty: boolean;
}

// Form action types
export type FormAction<T extends FieldValues = FieldValues> =
  | { type: 'SET_VALUE'; field: keyof T; value: any }
  | { type: 'SET_ERROR'; field: keyof T; error: string }
  | { type: 'SET_TOUCHED'; field: keyof T; touched: boolean }
  | { type: 'SET_SUBMITTING'; isSubmitting: boolean }
  | { type: 'RESET_FORM'; initialValues: T }
  | { type: 'SET_ERRORS'; errors: Record<string, string> };
