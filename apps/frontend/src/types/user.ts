export interface User {
  id: string;
  email: string;
  name?: string;
  username?: string;
  avatar?: string;
  role?: string;
  isActive?: boolean;
  firstName?: string;
  lastName?: string;
  phone?: string;
  emailVerifiedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user?: User;
}