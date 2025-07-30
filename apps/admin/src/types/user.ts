// User-related types and enums for the admin application

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
  GUEST = 'guest'
}

export interface User {
  id: string;
  username: string;
  email: string;
  isActive: boolean;
  role?: UserRole;
  createdAt: string | Date;
  profile?: {
    firstName: string;
    lastName: string;
  };
}

export interface UserFiltersType {
  role?: UserRole;
  isActive?: boolean;
  dateFrom?: string;
  dateTo?: string;
}
