import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository';
import { AuthService } from '../../../../auth/auth.service';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { User } from '../../entities/user.entity';
import { ApiStatusCodes, UserRole } from '@shared';
import { 
  AdminCreateUserDto, 
  AdminUpdateUserDto, 
  AdminUserResponseDto,
  AdminUpdateUserProfileDto
} from '../../dto/admin/admin-user.dto';
import { PaginatedDto } from '@shared/classes/pagination.dto';

export interface AdminUserFilters {
  page: number;
  limit: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
}

@Injectable()
export class AdminUserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
    private readonly responseHandler: ResponseService,
  ) {}

  async createUser(createUserDto: AdminCreateUserDto): Promise<AdminUserResponseDto> {
    const existingUser = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw this.responseHandler.createError(
        ApiStatusCodes.CONFLICT,
        'User with this email already exists',
        'CONFLICT'
      );
    }

    try {
      const hashedPassword = await this.authService.hashPassword(createUserDto.password);
      
      const userData = {
        ...createUserDto,
        password: hashedPassword,
        // TODO: Handle role assignment through UserRole entity
        // role: createUserDto.role || UserRole.USER,
      };

      const user = await this.userRepository.createUser(userData);
      // Get the user with profile after creation
      const userWithProfile = await this.userRepository.findWithProfile(user.id);
      return this.toAdminUserResponse(userWithProfile || user);
    } catch (error) {
      if (error.code && error.code.includes('10')) {
        throw error; // Re-throw our structured errors
      }
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to create user',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async getAllUsers(filters: AdminUserFilters): Promise<PaginatedDto<AdminUserResponseDto>> {
    // This would typically use a more sophisticated query with pagination
    // For now, we'll use a simple approach
    const users = await this.userRepository.findAll();
    
    let filteredUsers = users;
    
    if (filters.search) {
      filteredUsers = filteredUsers.filter(user => {
        const searchLower = filters.search.toLowerCase();
        const emailMatch = user.email.toLowerCase().includes(searchLower);
        const usernameMatch = user.username.toLowerCase().includes(searchLower);
        // Only search in profile if it exists
        const profileMatch = user.profile ? 
          (user.profile.firstName?.toLowerCase().includes(searchLower) || 
           user.profile.lastName?.toLowerCase().includes(searchLower)) : false;
        
        return emailMatch || usernameMatch || profileMatch;
      });
    }

    // TODO: Implement role filtering with UserRole entity
    // if (filters.role) {
    //   filteredUsers = filteredUsers.filter(user => user.role === filters.role);
    // }

    if (filters.isActive !== undefined) {
      filteredUsers = filteredUsers.filter(user => user.isActive === filters.isActive);
    }

    const total = filteredUsers.length;
    const totalPages = Math.ceil(total / filters.limit);
    const startIndex = (filters.page - 1) * filters.limit;
    const endIndex = startIndex + filters.limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return {
      items: paginatedUsers.map(user => this.toAdminUserResponse(user)),
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages,
    };
  }

  async getUserById(id: string): Promise<AdminUserResponseDto> {
    const user = await this.userRepository.findWithProfile(id);
    if (!user) {
      throw this.responseHandler.createError(
        ApiStatusCodes.NOT_FOUND,
        'User not found',
        'NOT_FOUND'
      );
    }
    return this.toAdminUserResponse(user);
  }

  async updateUser(id: string, updateUserDto: AdminUpdateUserDto): Promise<AdminUserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw this.responseHandler.createError(
        ApiStatusCodes.NOT_FOUND,
        'User not found',
        'NOT_FOUND'
      );
    }

    try {
      const updatedUser = await this.userRepository.update(id, updateUserDto);
      if (!updatedUser) {
        throw this.responseHandler.createError(
          ApiStatusCodes.NOT_FOUND,
          'User not found',
          'NOT_FOUND'
        );
      }
      
      // Get user with profile after update
      const userWithProfile = await this.userRepository.findWithProfile(id);
      return this.toAdminUserResponse(userWithProfile || updatedUser);
    } catch (error) {
      if (error.code && error.code.includes('10')) {
        throw error; // Re-throw our structured errors
      }
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to update user',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async updateUserProfile(id: string, updateProfileDto: AdminUpdateUserProfileDto): Promise<AdminUserResponseDto> {
    const user = await this.userRepository.findWithProfile(id);
    if (!user) {
      throw this.responseHandler.createError(
        ApiStatusCodes.NOT_FOUND,
        'User not found',
        'NOT_FOUND'
      );
    }

    try {
      const profileUpdateData = {
        ...updateProfileDto,
        ...(updateProfileDto.dateOfBirth && { dateOfBirth: new Date(updateProfileDto.dateOfBirth) }),
      };
      await this.userRepository.updateProfile(id, profileUpdateData);
      const updatedUser = await this.userRepository.findWithProfile(id);
      if (!updatedUser) {
        throw this.responseHandler.createError(
          ApiStatusCodes.NOT_FOUND,
          'User could not be found after profile update',
          'NOT_FOUND'
        );
      }
      return this.toAdminUserResponse(updatedUser);
    } catch (error) {
      if (error.code && error.code.includes('10')) {
        throw error; // Re-throw our structured errors
      }
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to update user profile',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw this.responseHandler.createError(
        ApiStatusCodes.NOT_FOUND,
        'User not found',
        'NOT_FOUND'
      );
    }

    try {
      const deleted = await this.userRepository.delete(id);
      if (!deleted) {
        throw this.responseHandler.createError(
          ApiStatusCodes.NOT_FOUND,
          'User not found',
          'NOT_FOUND'
        );
      }
    } catch (error) {
      if (error.code && error.code.includes('10')) {
        throw error; // Re-throw our structured errors
      }
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to delete user',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<AdminUserResponseDto> {
    return await this.updateUser(id, { isActive });
  }

  async updateUserPassword(userId: string, oldPass: string, newPass: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordMatching = await user.comparePassword(oldPass);
    if (!isPasswordMatching) {
      throw new Error('Invalid old password');
    }

    user.password = newPass;
    await this.userRepository.save(user);

    return true;
  }

  private toAdminUserResponse(user: User): AdminUserResponseDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      isActive: user.isActive,
      role: UserRole.USER, // TODO: Get role from UserRole entity
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: user.profile ? {
        id: user.profile.id,
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
        phoneNumber: user.profile.phoneNumber,
        dateOfBirth: user.profile.dateOfBirth,
        avatar: user.profile.avatar,
        bio: user.profile.bio,
        address: user.profile.address,
        city: user.profile.city,
        country: user.profile.country,
        postalCode: user.profile.postalCode,
      } : undefined,
    };
  }
} 