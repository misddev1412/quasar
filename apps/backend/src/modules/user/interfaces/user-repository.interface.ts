import { User } from '../entities/user.entity';
import { UserProfile } from '../entities/user-profile.entity';

export interface CreateUserDto {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role?: string;
}

export interface UpdateUserDto {
  email?: string;
  username?: string;
  isActive?: boolean;
  role?: string;
}

export interface UpdateUserProfileDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  avatar?: string;
  bio?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
}

export interface IUserRepository {
  createUser(createUserDto: CreateUserDto): Promise<User>;
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findWithProfile(id: string): Promise<User | null>;
  update(id: string, updateUserDto: UpdateUserDto): Promise<User | null>;
  updateProfile(userId: string, updateProfileDto: UpdateUserProfileDto): Promise<UserProfile | null>;
  delete(id: string): Promise<boolean>;
} 