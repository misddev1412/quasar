// Role-related types and interfaces for the admin application

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  scope: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  code: string; // UserRole enum value
  description?: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  version: number;
  createdBy?: string;
  updatedBy?: string;
  permissions?: Permission[];
  permissionCount?: number;
  userCount?: number;
}

export interface CreateRoleFormData {
  name: string;
  description?: string;
  isActive?: boolean;
  isDefault?: boolean;
  permissionIds?: string[];
}

export interface UpdateRoleFormData {
  name?: string;
  description?: string;
  isActive?: boolean;
  isDefault?: boolean;
  permissionIds?: string[];
}

export interface RoleFiltersType {
  search?: string;
  isActive?: boolean;
  isDefault?: boolean;
  page?: number;
  limit?: number;
}

export interface RoleStatistics {
  total: number;
  active: number;
  inactive: number;
  default: number;
}

// API Response types
export interface GetRolesResponse {
  data: Role[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RoleResponse {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  permissions?: Permission[];
  permissionCount?: number;
  userCount?: number;
}

// Form field options
export interface RoleFormOption {
  value: string;
  label: string;
  description?: string;
}

// Table column definitions for role listing
export interface RoleTableColumn {
  key: keyof Role | 'actions';
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

// Role action types for UI
export type RoleAction = 'view' | 'edit' | 'delete' | 'duplicate' | 'toggle-status';

export interface RoleActionItem {
  action: RoleAction;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  dangerous?: boolean;
}
