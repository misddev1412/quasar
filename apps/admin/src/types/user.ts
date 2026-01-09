// User-related types and enums for the admin application

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  STAFF = 'staff',
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
  isVerified?: boolean;
  // Additional filters for expanded functionality
  email?: string; // Email domain or pattern filter
  username?: string; // Username pattern filter
  hasProfile?: boolean; // Users with/without complete profile
  country?: string; // Filter by country from profile
  city?: string; // Filter by city from profile
  lastLoginFrom?: string; // Last login date range start
  lastLoginTo?: string; // Last login date range end
  createdFrom?: string; // Alias for dateFrom (creation date range start)
  createdTo?: string; // Alias for dateTo (creation date range end)
}
