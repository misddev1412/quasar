/**
 * Permission action enumeration
 * Defines the different actions that can be performed on resources
 */
export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXECUTE = 'execute',
  APPROVE = 'approve',
  REJECT = 'reject',
  PUBLISH = 'publish',
  ARCHIVE = 'archive'
}

/**
 * Permission scope enumeration
 * Defines the scope of permissions (own resources vs any resources)
 */
export enum PermissionScope {
  OWN = 'own',
  DEPARTMENT = 'department',
  ORGANIZATION = 'organization',
  ANY = 'any'
}

/**
 * Permission resource enumeration
 * Defines the different resources in the system
 */
export enum PermissionResource {
  USER = 'user',
  PROFILE = 'profile',
  ROLE = 'role',
  PERMISSION = 'permission',
  ORGANIZATION = 'organization',
  DEPARTMENT = 'department',
  PROJECT = 'project',
  REPORT = 'report',
  SETTING = 'setting',
  AUDIT_LOG = 'audit_log'
}

/**
 * Permission type enumeration
 * Categorizes permissions by their nature
 */
export enum PermissionType {
  SYSTEM = 'system',
  BUSINESS = 'business',
  FUNCTIONAL = 'functional',
  DATA = 'data'
} 