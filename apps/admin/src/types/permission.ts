// Permission-related types and interfaces for the admin application

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  scope: string;
  description?: string;
  isActive?: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreatePermissionFormData {
  name: string;
  resource: string;
  action: string;
  scope: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdatePermissionFormData {
  name?: string;
  resource?: string;
  action?: string;
  scope?: string;
  description?: string;
  isActive?: boolean;
}

export interface PermissionFiltersType {
  search?: string;
  resource?: string;
  action?: string;
  scope?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface PermissionStatistics {
  total: number;
  active: number;
  inactive: number;
  byResource: Record<string, number>;
  byAction: Record<string, number>;
  byScope: Record<string, number>;
}

// API Response types
export interface GetPermissionsResponse {
  data: Permission[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PermissionResponse {
  id: string;
  name: string;
  resource: string;
  action: string;
  scope: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Form field options
export interface PermissionFormOption {
  value: string;
  label: string;
  description?: string;
}

// Table column definitions for permission listing
export interface PermissionTableColumn {
  key: keyof Permission | 'actions';
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

// Permission action types for UI
export type PermissionAction = 'view' | 'edit' | 'delete' | 'duplicate' | 'toggle-status';

export interface PermissionActionItem {
  action: PermissionAction;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  dangerous?: boolean;
}

// Resource and action enums/constants
export const PERMISSION_RESOURCES = {
  USER: 'user',
  ROLE: 'role',
  PERMISSION: 'permission',
  SETTINGS: 'settings',
  ANALYTICS: 'analytics',
  SYSTEM: 'system',
} as const;

export const PERMISSION_ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  MANAGE: 'manage',
  EXECUTE: 'execute',
} as const;

export const PERMISSION_SCOPES = {
  OWN: 'own',
  TEAM: 'team',
  ORGANIZATION: 'organization',
  GLOBAL: 'global',
} as const;

export type PermissionResource = typeof PERMISSION_RESOURCES[keyof typeof PERMISSION_RESOURCES];
export type PermissionActionType = typeof PERMISSION_ACTIONS[keyof typeof PERMISSION_ACTIONS];
export type PermissionScope = typeof PERMISSION_SCOPES[keyof typeof PERMISSION_SCOPES];